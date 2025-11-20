<div align="center">

# SMS API - Microservices Architecture

A production-ready school management system built with **NestJS**, using **event-driven microservices architecture** with **Apache Kafka** for inter-service communication and **Prisma** for database management.

</div>

## Architecture Overview

```
┌─────────────────┐
│   API Gateway   │ ← HTTP/REST (Port 3000)
│   (Gateway)     │
└────────┬────────┘
         │ Kafka RPC
         ├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
         ▼             ▼             ▼             ▼             ▼             ▼
    ┌────────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐
    │  Auth  │   │ Student │   │ Teacher │   │Academics │   │ Activity │   │ Email │
    └────────┘   └─────────┘   └─────────┘   └──────────┘   └──────────┘   └───────┘
        │            │             │              │              │              │
        ▼            ▼             ▼              ▼              ▼              ▼
     [DB]         [DB]          [DB]           [DB]           [DB]          [SMTP]
```

## Microservices

| Service | Description | Port | Database |
|---------|-------------|------|----------|
| **Gateway** | API Gateway, routing, authentication | 3000 | - |
| **Auth** | User authentication, JWT tokens, password management | - | PostgreSQL |
| **Student** | Student profile, enrollment, records | - | PostgreSQL |
| **Teacher** | Teacher profile, assignments | - | PostgreSQL |
| **Academics** | School, classes, subjects, curriculum | - | PostgreSQL |
| **Activity** | School activities, events, attendance | - | PostgreSQL |
| **Email** | Email notifications (SMTP) | - | - |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Kafka Cluster
```bash
docker-compose up -d
```

This starts:
- 3 Kafka brokers (ports 9094, 9095, 9096)
- Kafka UI (http://localhost:8080)

### 3. Configure Environment Variables
Create `.env` files for each service with database URLs:
```env
# Example for academics service
ACADEMICS_DATABASE_URL="postgresql://user:pass@localhost:5432/academics"

# JWT secrets
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Kafka brokers
KAFKA_BROKERS="localhost:9094,localhost:9095,localhost:9096"
```

### 4. Run Database Migrations
```bash
# For each service with a database
npx prisma migrate deploy --schema=apps/academics/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/student/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/teacher/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/activity/prisma/schema.prisma
```

### 5. Seed Database (Optional)
```bash
npm run seed:academics
```

### 6. Start All Services
```bash
# Development mode (all services in parallel)
npm run dev

# Or start individually
npm run start:gateway
npm run start:auth
npm run start:student
npm run start:teacher
npm run start:academics
npm run start:activity
npm run start:email
```

### 7. Access API Documentation
- Swagger UI: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

## Development

### Run Individual Services
```bash
npm run start:auth        # Auth service
npm run start:student     # Student service
npm run start:teacher     # Teacher service
npm run start:academics   # Academics service
npm run start:activity    # Activity service
npm run start:email       # Email service
npm run start:gateway     # API Gateway
```

### Generate Prisma Client
```bash
npx prisma generate --schema=apps/<service>/prisma/schema.prisma
```

### Run Tests
```bash
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage
npm run test:e2e          # E2E tests
```

## Key Features

### Robust Exception Handling
- Centralized error handling with custom exception filters
- Prisma error mapping to HTTP status codes
- Structured error responses with timestamps and context
- See [EXCEPTION_HANDLING.md](docs/EXCEPTION_HANDLING.md)

### Comprehensive Health Checks
- `/health` - Full system health (memory, disk, Kafka)
- `/health/ready` - Readiness probe for Kubernetes
- `/health/live` - Liveness probe
- See [HEALTH_CHECKS.md](docs/HEALTH_CHECKS.md)

### Structured Logging
- NestJS Logger for services
- Context-aware logging with service names
- Production-ready log formatting
- See [LOGGING.md](docs/LOGGING.md)

### Password Security
- Bcrypt hashing (12 rounds)
- Password validation rules
- Secure token management
- See [PASSWORD_SECURITY.md](docs/PASSWORD_SECURITY.md)

### Database Transaction Management
- Prisma interactive transactions
- Rollback on failure
- See [TRANSACTION_MANAGEMENT.md](docs/TRANSACTION_MANAGEMENT.md)

## Docker Deployment

### Build Image
```bash
docker build -t sms-gateway:latest .
```

### Run Container
```bash
docker run -p 3000:3000 \
  -e KAFKA_BROKERS="kafka1:9092,kafka2:9092,kafka3:9092" \
  -e JWT_ACCESS_SECRET="secret" \
  sms-gateway:latest
```

## Kubernetes Deployment

```bash
kubectl apply -f k8s-deployment.yaml
```

Includes:
- Deployment with 3 replicas
- Health checks (liveness & readiness probes)
- LoadBalancer service
- Environment configuration

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [Exception Handling](docs/EXCEPTION_HANDLING.md) - Error management patterns
- [Health Checks](docs/HEALTH_CHECKS.md) - Monitoring and readiness probes
- [Logging](docs/LOGGING.md) - Structured logging implementation
- [Password Security](docs/PASSWORD_SECURITY.md) - Authentication best practices
- [Transaction Management](docs/TRANSACTION_MANAGEMENT.md) - Database consistency

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Message Broker**: Apache Kafka (KRaft mode)
- **Database**: PostgreSQL (via Prisma 6)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Authentication**: JWT, bcrypt
- **Testing**: Jest
- **Containerization**: Docker, Kubernetes

## Scripts

```bash
npm run dev              # Start all services in development
npm run build            # Build production bundle
npm run start:prod       # Start production server
npm run lint             # Lint code
npm run format           # Format code with Prettier
npm run seed:academics   # Seed academics database
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Gateway HTTP port | 3000 |
| `JWT_ACCESS_SECRET` | Access token secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_ACCESS_EXPIRE` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry | 7d |
| `KAFKA_BROKERS` | Kafka broker addresses | localhost:9094,... |
| `*_DATABASE_URL` | Service database URLs | - |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

masabinhok
