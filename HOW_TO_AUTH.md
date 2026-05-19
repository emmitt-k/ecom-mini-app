# Frontend Authentication Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js)                         │
├─────────────────────────────────────────────────────────────────────┤
│  Memory (Access Token)          │  HttpOnly Cookie (Refresh Token) │
│  - Short-lived (15 min)         │  - Managed by browser            │
│  - Cleared on page refresh      │  - Sent automatically with req   │
│  - Never in localStorage        │  - 30 min inactivity timeout     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Backend (NestJS)                           │
├─────────────────────────────────────────────────────────────────────┤
│  POST /auth/login    → Access Token + Set-Cookie (Refresh Token)   │
│  POST /auth/refresh  → Access Token + Set-Cookie (new Refresh)     │
│  POST /auth/logout   → Clear cookie + invalidate tokens            │
└─────────────────────────────────────────────────────────────────────┘
```

## Token Storage Strategy

### Why NOT localStorage?
- Vulnerable to XSS attacks
- Any malicious script can read tokens
- Access tokens should be short-lived and in memory only

### Why HttpOnly Cookie for Refresh Token?
- JavaScript cannot access it (XSS protection)
- Automatically sent with requests via `credentials: 'include'`
- Backend can rotate it securely

### Storage Implementation

```typescript
// lib/auth/store.ts
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string } | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setAccessToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    user: null,
    isLoading: true,
  });

  // On mount, try to refresh token (user might have active session)
  useEffect(() => {
    refreshAccessToken().finally(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    });
  }, []);

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('http://localhost:3001/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Send httpOnly cookie
      });

      if (!response.ok) {
        setState({ accessToken: null, user: null, isLoading: false });
        return null;
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        accessToken: data.accessToken,
        user: data.user,
      }));
      return data.accessToken;
    } catch {
      setState({ accessToken: null, user: null, isLoading: false });
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    setState({
      accessToken: data.accessToken,
      user: data.user,
      isLoading: false,
    });
  };

  const logout = async () => {
    await fetch('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setState({ accessToken: null, user: null, isLoading: false });
  };

  const setAccessToken = (token: string) => {
    setState(prev => ({ ...prev, accessToken: token }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshAccessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Authenticated Fetch Wrapper

```typescript
// lib/auth/fetch-with-auth.ts
import { useAuth } from './store';

export function useAuthenticatedFetch() {
  const { accessToken, refreshAccessToken, setAccessToken } = useAuth();

  return async (url: string, options: RequestInit = {}) => {
    // Try request with current token
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: 'include',
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
          credentials: 'include',
        });
      }
    }

    return response;
  };
}
```

## Proactive Token Refresh (Optional but Recommended)

Instead of waiting for 401, proactively refresh before token expires:

```typescript
// lib/auth/token-refresher.ts
import { useEffect, useRef } from 'react';
import { useAuth } from './store';

// Access token expires in 15 minutes
// Refresh 1 minute before expiry
const REFRESH_BEFORE_EXPIRY_MS = 14 * 60 * 1000; // 14 minutes

export function useTokenRefresher() {
  const { accessToken, refreshAccessToken } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!accessToken) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule refresh
    timeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, REFRESH_BEFORE_EXPIRY_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [accessToken, refreshAccessToken]);
}
```

## Protected Route Component

```tsx
// components/auth/protected-route.tsx
import { useAuth } from '@/lib/auth/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

## Login Page Example

```tsx
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## Logout Component

```tsx
// components/auth/logout-button.tsx
'use client';

import { useAuth } from '@/lib/auth/store';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Layout with AuthProvider

```tsx
// app/layout.tsx
import { AuthProvider } from '@/lib/auth/store';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Inactivity Timeout Flow

```
User Action          │ Token State                    │ Result
─────────────────────┼────────────────────────────────┼─────────────────
Login                │ New Access (15m) + Refresh(30m)│ Authenticated
... 10 min pass ...  │ Access (5m left) + Refresh(20m)│ Still valid
Refresh (auto)       │ New Access (15m) + Refresh(30m)│ Session extended
... 31 min inactive..│ Refresh expired                │ Must re-login
```

## CORS Configuration (Backend Required)

Ensure backend allows credentials:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies
});
```

## Security Checklist

- [x] Access token stored in memory (never localStorage)
- [x] Refresh token in httpOnly cookie (JS cannot access)
- [x] Credentials included in all auth requests
- [x] Automatic token refresh on 401 or proactive refresh
- [x] Logout clears both tokens
- [x] CORS configured for credentials
- [x] HTTPS required in production (set `secure: true` for cookie)

## Testing Credentials

```
Email: admin@example.com
Password: password123
```
