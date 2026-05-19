# Agent Instructions

This document provides guidance for AI agents working on this e-commerce mini-app codebase.

## Project Overview

E-commerce product catalog application with:
- **Frontend**: Next.js 14+ (App Router) with React Query, Tailwind CSS
- **Backend**: NestJS with TypeORM, JWT authentication
- **Database**: PostgreSQL

## Commands

### Root Level
```bash
npm install                    # Install all dependencies
npm run lint                   # Lint all packages
npm run test                   # Run all tests
```

### Backend (`/backend`)
```bash
npm run start:dev              # Start development server (port 3001)
npm run build                  # Build for production
npm run test                   # Run unit tests
npm run test:e2e               # Run e2e/integration tests
npm run lint                   # Run ESLint
npm run migration:run          # Run database migrations
npm run migration:generate     # Generate new migration
```

### Frontend (`/frontend`)
```bash
npm run dev                    # Start development server (port 3000)
npm run build                  # Build for production
npm run start                  # Start production server
npm run test                   # Run tests
npm run lint                   # Run ESLint
```

## Development Setup

1. Start PostgreSQL: `docker-compose up -d postgres`
2. Install dependencies: `npm install`
3. Run migrations: `cd backend && npm run migration:run`
4. Start backend: `cd backend && npm run start:dev`
5. Start frontend: `cd frontend && npm run dev`

## Architecture Patterns

### Backend (NestJS)
- Modules are organized by domain (`auth`, `products`, `users`)
- Use DTOs with `class-validator` for input validation
- Services handle business logic, controllers handle HTTP
- Use guards for authentication/authorization
- Use interceptors for response transformation

### Frontend (Next.js)
- App Router with server/client components
- React Query for data fetching and caching
- Virtualization with `@tanstack/react-virtual` for lists
- Components in `src/components/`, hooks in `src/hooks/`

## Key Implementation Details

### Authentication
- JWT access tokens (15 min expiry)
- Refresh tokens in HTTP-only cookies (30 min inactivity timeout)
- Rate limiting via `@nestjs/throttler` (5 attempts/min)

### Product Catalog
- Infinite scroll with virtualization
- Configurable page size (5-50 items)
- URL query params for state persistence

## Testing Requirements

- Unit tests for services and components
- Integration tests for API endpoints
- Coverage target: 80%

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- No comments unless explicitly requested
- Follow existing patterns in each module

## Before Committing

Run these commands and ensure they pass:
```bash
cd backend && npm run lint && npm run test
cd frontend && npm run lint && npm run test
```
