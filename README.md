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
- **Frontend**: Next.js 14+ with App Router, React Query, Tailwind CSS
- **Backend**: NestJS with TypeORM, JWT authentication
- **Database**: PostgreSQL
- **Testing**: Jest (unit & integration tests)
- **CI/CD**: GitHub Actions
- **Deployment**: Docker, Docker Compose, AWS CDK

## Project Structure

```
ecom-mini-app/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities and configurations
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── tests/               # Frontend tests
│
├── backend/                  # NestJS application
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── products/        # Products module
│   │   ├── users/           # Users module
│   │   ├── common/          # Shared utilities
│   │   └── config/          # Configuration
│   └── test/                # Backend tests
│
├── database/                 # Database scripts and migrations
├── .github/                  # GitHub Actions workflows
├── docker/                   # Docker configurations
└── docs/                     # Additional documentation
```

## Key Features & Implementation

### 1. Authentication & Session Management

#### Secure Login
- **Throttling**: Rate limiting using `@nestjs/throttler` to prevent brute-force attacks
- **Implementation**: 
  - Global throttle guard (5 attempts per minute)
  - Redis-backed throttling for distributed systems
  - Account lockout after repeated failures

#### Persistent Sessions
- **JWT Strategy**: Access token (15min) + Refresh token (30min inactivity)
- **Implementation**:
  - Access tokens stored in memory
  - Refresh tokens stored in HTTP-only cookies
  - Automatic token refresh via interceptors
  - Session persistence across browser restarts

#### Inactivity Timeout
- **Mechanism**: Refresh token invalidation after 30 minutes of inactivity
- **Implementation**:
  - Last activity timestamp tracking
  - Automatic logout on timeout
  - Client-side activity monitoring

### 2. Product Catalog & Infinite Scroll

#### Virtualization
- **Library**: `@tanstack/react-virtual` for efficient list rendering
- **Benefits**: 
  - Only visible items rendered in DOM
  - Smooth scrolling with large datasets
  - Memory efficient

#### Configurable Pagination
- **Page Size**: User-configurable (5-50 items)
- **Implementation**:
  - URL query params for state persistence
  - Debounced page size changes
  - Seamless infinite scroll integration

#### Performance Optimizations
- React Query for caching and background refetching
- Optimistic updates for better UX
- Image lazy loading with Next.js Image component
- Skeleton loaders during data fetching

### 3. CI/CD Pipeline

#### GitHub Actions Workflows
- **CI Pipeline** (on PR):
  - Linting & type checking
  - Unit tests
  - Integration tests
  - Build verification

- **CD Pipeline** (on main branch):
  - Run all tests
  - Build Docker images
  - Push to container registry
  - Deploy to staging/production

### 4. Testing Strategy

#### Unit Tests
- Frontend: Component tests with React Testing Library
- Backend: Service and controller tests
- Coverage target: 80%

#### Integration Tests
- API endpoint tests with supertest
- Database integration tests
- Authentication flow tests

### 5. Deployment

#### Docker Strategy
- Multi-stage builds for optimized images
- Docker Compose for local development
- Production-ready configurations

#### AWS CDK Infrastructure
- VPC with public/private subnets
- RDS PostgreSQL instance
- ECS Fargate for containers
- Application Load Balancer
- CloudWatch for logging

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### Products
- `GET /products` - List products (paginated)
- `GET /products/:id` - Get product details

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecom-mini-app
```

2. **Environment Setup**
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

3. **Run with Docker Compose** (Recommended)
```bash
docker-compose up -d
```

4. **Run Locally (Development)**
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Install dependencies
npm install

# Run migrations
npm run migration:run

# Start backend
cd backend && npm run start:dev

# Start frontend (new terminal)
cd frontend && npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api

## Scripts

### Backend
```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run lint           # Run linter
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run test           # Run tests
npm run lint           # Run linter
```

## Architectural Decisions

### Why This Stack?
1. **Next.js**: App Router provides modern SSR/SSG capabilities, excellent DX
2. **NestJS**: Structured, scalable architecture with built-in dependency injection
3. **PostgreSQL**: ACID compliance, excellent for e-commerce data integrity
4. **JWT + Refresh Tokens**: Industry-standard secure authentication pattern
5. **Virtualization**: Essential for performance with large product catalogs

### Security Considerations
1. **Rate Limiting**: Prevents brute-force attacks on login
2. **HTTP-Only Cookies**: Protects refresh tokens from XSS
3. **CORS Configuration**: Restricts API access to known origins
4. **Input Validation**: DTOs with class-validator on all endpoints
5. **Password Hashing**: bcrypt with salt rounds for secure storage

### Performance Optimizations
1. **Database Indexing**: Indexes on frequently queried fields
2. **Connection Pooling**: Efficient database connections
3. **Caching**: React Query caching on frontend
4. **Code Splitting**: Next.js automatic code splitting
5. **Image Optimization**: Next.js Image component with lazy loading

## Future Enhancements
- Shopping cart functionality
- Order management
- Payment integration
- Product search and filtering
- Admin dashboard
- Email notifications
- Multi-language support

## License
MIT
