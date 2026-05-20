# Agent Instructions

This document provides guidance for AI agents working on this e-commerce mini-app codebase.

## Current Project State

### Backend (`/backend`)
- **Framework**: NestJS 11+ with TypeORM
- **Database**: PostgreSQL 15
- **Authentication**: JWT (access token: 15min, refresh token: 30min with sliding window)
- **API**: REST with cursor-based pagination

**Implemented Modules**:
- `AuthModule`: Login, register, logout, token refresh (all refresh tokens invalidated on logout)
- `UsersModule`: User registration, profile (GET/PATCH /me), soft delete (no self-delete)
- `ProductsModule`: Product listing with cursor pagination, search, price filters, detail view
- `SharedModule`: Global JWT auth guard, @CurrentUser() decorator

**Key Features**:
- Access token stored in memory (not localStorage), refresh token in httpOnly cookie
- Rate limiting: 5 login attempts/min, 30 product requests/min
- All UUID primary keys
- TypeScript migrations (not raw SQL)
- Custom seed script with faker (100 products, 11 users)

### Frontend (`/frontend`)
- **Framework**: Next.js 16+ with App Router
- **UI**: shadcn/ui components + Tailwind CSS v4
- **State**: React Query (TanStack Query) with axios
- **Auth**: JWT with auto-refresh on 401

**Implemented Pages**:
- `/` - Landing page (marketing layout with navbar)
- `/login` - Login form
- `/register` - Registration form

**Key Features**:
- Access token in memory, refresh token in httpOnly cookie
- Axios interceptors for automatic token refresh
- Auth context with login/register/logout
- Navbar shows auth state

### Infrastructure
- **Docker Compose**: PostgreSQL + Backend services
- **Makefile**: `make up`, `make migrate`, `make seed`, `make down`

## Commands

### Root Level
```bash
make up                        # Start all Docker services
make migrate                   # Run database migrations
make seed                      # Seed database with test data
make down                      # Stop all services
make logs                      # View backend logs
```

### Backend (`/backend`)
```bash
npm run start:dev              # Start development server (port 3001)
npm run build                  # Build for production
npm run migration:run          # Run TypeORM migrations
npm run migration:generate     # Generate migration from entities
npm run seed                   # Run database seeder
```

### Frontend (`/frontend`)
```bash
npm run dev                    # Start development server (port 3000)
npm run build                  # Build for production
```

## Development Setup

1. Start services: `make up`
2. Run migrations: `make migrate`
3. Seed data: `make seed`
4. Frontend: `cd frontend && npm run dev`

Test user: `admin@example.com` / `password123`

## Architecture Patterns

### Backend (NestJS)
- Domain-based modules (`auth/`, `products/`, `users/`, `shared/`)
- DTOs with `class-validator` for input validation
- Services handle business logic, controllers handle HTTP
- Guards for authentication (`JwtAuthGuard` in SharedModule)
- TypeORM repositories injected via `TypeOrmModule.forFeature()`
- Database files in `/backend/database/` (migrations, seeds, data-source.ts)

### Frontend (Next.js)
- App Router with Route Groups: `(marketing)/`, `(auth)/`
- React Query for server state (caching, infinite scroll)
- Axios with interceptors for auth token management
- shadcn/ui components in `components/ui/`
- Auth context in `hooks/use-auth.tsx`

## API Endpoints

### Auth
- `POST /auth/login` - Login, sets refresh cookie
- `POST /auth/register` - Register via UsersModule
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout, clears all refresh tokens

### Users
- `POST /users` - Register new user
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile

### Products
- `GET /products?limit=&cursor=&search=&minPrice=&maxPrice` - List with cursor pagination
- `GET /products/:id` - Product detail

## Authentication Flow

1. User logs in → backend returns `{ accessToken, user }` + sets refreshToken cookie
2. Frontend stores access token in memory (variable)
3. Axios adds `Authorization: Bearer {token}` header to requests
4. On 401, axios interceptor calls `/auth/refresh` automatically
5. Refresh endpoint validates httpOnly cookie, returns new access token
6. Logout clears all refresh tokens for user (all devices logged out)

## Environment Variables

### Backend (`.env`)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Key Implementation Details

### Products Pagination
- Cursor-based using `createdAt` + `id` for stable ordering
- Base64url encoded cursor: `{ id, createdAt }`
- Returns `meta.nextCursor` and `meta.hasMore` for infinite scroll

### Auth Security
- No Passport library - direct `@nestjs/jwt` usage
- Hash refresh tokens in database
- Rate limiting on auth endpoints
- CORS configured for frontend origin

## Code Style

- TypeScript strict mode
- No comments unless explicitly requested
- Follow existing patterns in each module
- Backend: NestJS patterns (DI, decorators, modules)
- Frontend: App Router patterns (Server Components default, 'use client' when needed)

## Docker Services

- `ecom-postgres`: PostgreSQL on port 5432
- `ecom-backend`: NestJS on port 3001 with hot reload
- Frontend runs separately via `npm run dev` on port 3000

## Notes for Agents

- Always check `AGENTS.md` for current project state before making changes
- Backend API base URL: `http://localhost:3001`
- Frontend dev server: `http://localhost:3000`
- Database migrations must be run manually: `make migrate`
- Test data available after `make seed` (100 products, 11 users)
