# E-commerce Mini-App

A production-ready e-commerce product catalog built with Next.js, NestJS, and PostgreSQL.

## Architecture Overview

### System Architecture
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Next.js App   │─────▶│   NestJS API    │─────▶│   PostgreSQL    │
│   (Frontend)    │◀─────│   (Backend)     │◀─────│   (Database)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 16+ with App Router, React Query, Tailwind CSS v4, shadcn/ui
- **Backend**: NestJS 11+ with TypeORM, JWT authentication
- **Database**: PostgreSQL 15
- **Authentication**: JWT (access token: 15min, refresh token: 30min with sliding window)

## Project Structure

```
ecom-mini-app/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable components
│   ├── hooks/               # Custom hooks
│   └── lib/                 # Utilities and configurations
│
├── backend/                  # NestJS application
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── products/        # Products module
│   │   ├── users/           # Users module
│   │   └── shared/          # Shared utilities (guards, decorators)
│   └── database/            # Migrations and seeds
│
├── .env                      # Environment variables (gitignored)
├── .env.example             # Example environment file
├── docker-compose.yml       # Docker Compose configuration
├── Makefile                 # Development commands
└── README.md                # This file
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Option 1: Local Development (Manual)

Best for **development, debugging, and fast iteration** with hot reload.

#### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

#### 2. Start PostgreSQL

```bash
# From project root
docker-compose up -d postgres

# Or with Makefile
make up  # This will fail for backend/frontend but postgres will start
```

#### 3. Configure Environment Variables

Edit `.env` file for local development:

```bash
# Change DB_HOST from 'postgres' to 'localhost' for local dev
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret
```

#### 4. Run Backend

```bash
cd backend

# Run migrations
npm run migration:run

# Seed database (optional)
npm run seed

# Start development server with hot reload
npm run start:dev
```

Backend runs at: http://localhost:3001

#### 5. Run Frontend

```bash
cd frontend

# Start development server with hot reload
npm run dev
```

Frontend runs at: http://localhost:3000

#### 6. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Test user: `admin@example.com` / `password123`

---

### Option 2: Production Simulation (Docker Compose)

Best for **testing production builds, CI/CD validation, and staging**.

This runs everything in Docker containers with production-optimized builds (no hot reload).

#### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit if needed (defaults work for local Docker)
```

#### 2. Start All Services

```bash
# Using Make (recommended)
make up

# Or using Docker Compose directly
docker-compose up -d
```

#### 3. Run Migrations and Seed

```bash
# Run database migrations
make migrate

# Seed with test data
make seed
```

#### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432 (if exposed)

#### 5. Useful Commands

```bash
# View all logs
make logs

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Rebuild after code changes (no hot reload in Docker)
make rebuild

# Stop all services
make down

# Stop and remove all data (including database)
make clean

# Build images without starting
make build
```

---

## CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration and deployment.

### Pipeline Overview

```
PR to main ────► CI (lint, test, build) ────► Merge ────► Deploy to Staging ────► Manual ────► Deploy to Production
```

### Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **CI** | PR to `main`, push to `main` | Lint, unit tests, integration tests, build validation |
| **Deploy Staging** | Push to `main` | Build & push Docker images to ECR, deploy to ECS staging |
| **Deploy Production** | Manual trigger | Promote staging images to production, deploy to ECS |
| **Database Migration** | Manual trigger | Run TypeORM migrations on selected environment |

### Key Features

- **OIDC Authentication**: Secure AWS access without long-lived credentials
- **Separate Environments**: Staging (auto-deploy) and Production (manual)
- **Image Promotion**: Production uses the same images tested in staging
- **Rolling Deployments**: Zero-downtime updates with ECS
- **Manual Migrations**: Database changes run manually for safety

### Setup

See [docs/CICD_SETUP.md](docs/CICD_SETUP.md) for detailed setup instructions including:
- AWS resources (ECR, ECS, IAM)
- GitHub Secrets configuration
- OIDC provider setup
- Secrets Manager configuration

### Required GitHub Secrets

```
AWS_ACCOUNT_ID    # Your AWS account ID
AWS_ROLE_ARN      # ARN of the IAM role for GitHub Actions
```

## Makefile Commands

```bash
make up         # Start all Docker services
make down       # Stop all Docker services
make build      # Build all Docker images
make rebuild    # Stop, rebuild, and start all services
make migrate    # Run database migrations
make seed       # Seed database with test data
make logs       # View all service logs
make clean      # Stop services and remove volumes (wipes database)
```

---

## Key Features & Implementation

### Authentication & Session Management

#### Secure Login
- **Throttling**: Rate limiting using `@nestjs/throttler`
  - 5 login attempts per minute
  - 30 product requests per minute

#### Persistent Sessions
- **JWT Strategy**: Access token (15min) + Refresh token (30min)
- **Implementation**:
  - Access tokens stored in memory (never localStorage)
  - Refresh tokens stored in HTTP-only cookies
  - Automatic token refresh via axios interceptors
  - All refresh tokens invalidated on logout

### Product Catalog

#### Pagination
- **Cursor-based pagination** using `createdAt` + `id`
- Base64url encoded cursor: `{ id, createdAt }`
- Returns `meta.nextCursor` and `meta.hasMore` for infinite scroll

#### Search & Filters
- Text search on product name and description
- Price range filters (minPrice, maxPrice)

## API Endpoints

### Authentication
- `POST /auth/login` - Login, sets refresh cookie
- `POST /auth/register` - Register new user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout, clears all refresh tokens

### Users
- `POST /users` - Register new user
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile

### Products
- `GET /products?limit=&cursor=&search=&minPrice=&maxPrice` - List with cursor pagination
- `GET /products/:id` - Product detail
## License

MIT
