<div align="center">

# SMS API - Microservices Architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Kafka](https://img.shields.io/badge/Kafka-KRaft-black.svg)](https://kafka.apache.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748.svg)](https://www.prisma.io/)

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
- Docker & Docker Compose (for Kafka cluster)
- PostgreSQL 14+ (separate installation required - **not included in docker-compose.yml**)
  - Can be installed locally or run in a separate Docker container
  - Required for all microservices except Email service

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

> **Security Warning**: Never commit `.env` files to version control. Use the provided `.env.example` as a template.

Create `.env` file in the root directory:
```env
# Copy from .env.example and fill in your values
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

## Troubleshooting

### Kafka Connection Issues
**Problem**: Services fail to connect to Kafka brokers
```bash
Error: Failed to connect to kafka broker
```
**Solution**:
1. Verify Kafka containers are running: `docker-compose ps`
2. Check Kafka broker ports are accessible: `localhost:9094,9095,9096`
3. Restart Kafka cluster: `docker-compose restart`
4. Check Kafka UI at http://localhost:8080 to verify cluster health

### Database Migration Errors
**Problem**: Prisma migration fails
```bash
Error: P1001: Can't reach database server
```
**Solution**:
1. Verify PostgreSQL is running and accessible
2. Check database URL in `.env` file
3. Ensure database exists: `CREATE DATABASE academics;`
4. Test connection: `npx prisma db pull --schema=apps/academics/prisma/schema.prisma`

### Port Already in Use
**Problem**: Gateway fails to start on port 3000
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**:
1. Find process using port: `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess`
2. Kill the process or change `PORT` in `.env`

### Prisma Client Generation Issues
**Problem**: Module not found errors for Prisma client
```bash
Error: Cannot find module '@prisma/client'
```
**Solution**:
```bash
# Regenerate Prisma clients for all services
npx prisma generate --schema=apps/auth/prisma/schema.prisma
npx prisma generate --schema=apps/student/prisma/schema.prisma
npx prisma generate --schema=apps/teacher/prisma/schema.prisma
npx prisma generate --schema=apps/academics/prisma/schema.prisma
npx prisma generate --schema=apps/activity/prisma/schema.prisma
```

### Service Not Responding
**Problem**: Microservice doesn't respond to requests
**Solution**:
1. Check service logs for errors
2. Verify Kafka consumer group is active (check Kafka UI)
3. Ensure service is registered with correct topic name
4. Restart the specific service

## API Usage Examples

### Authentication
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "SecurePass123!",
    "role": "ADMIN"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "SecurePass123!"
  }'

# Response includes access_token and refresh_token
```

### Health Check
```bash
# Full health check
curl http://localhost:3000/health

# Readiness probe
curl http://localhost:3000/health/ready

# Liveness probe
curl http://localhost:3000/health/live
```

### Using Swagger UI
For interactive API testing, visit:
- **Swagger Documentation**: http://localhost:3000/api/docs
- All endpoints with request/response schemas
- Built-in "Try it out" functionality

## Security Best Practices

### Environment Variables
- **Never commit** `.env` files to version control
- Use `.env.example` as a template
- Rotate JWT secrets regularly in production
- Use strong, unique passwords for databases

### Production Deployment
- Enable HTTPS/TLS for all services
- Use managed secrets (AWS Secrets Manager, Azure Key Vault, etc.)
- Implement rate limiting on API Gateway
- Enable Kafka authentication and encryption
- Use read-only database replicas for read operations
- Implement audit logging for sensitive operations

### Database Security
- Use least-privilege database users per service
- Enable SSL for database connections
- Regular backups with encryption
- Implement row-level security where applicable

## Contributing

### Development Workflow
1. **Fork the repository** and clone locally
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Install dependencies**: `npm install`
4. **Make your changes** and test thoroughly
5. **Run linting**: `npm run lint`
6. **Run tests**: `npm run test`
7. **Commit with conventional commits**:
   - `feat: add new feature`
   - `fix: resolve bug`
   - `docs: update documentation`
   - `refactor: restructure code`
8. **Push and create a Pull Request**

### Code Standards
- Follow existing code style (ESLint + Prettier configured)
- Write unit tests for new features
- Update documentation for API changes
- Keep commits atomic and well-described

### Pull Request Guidelines
- Provide clear description of changes
- Reference related issues: `Closes #123`
- Ensure CI checks pass
- Request review from maintainers

## CI/CD Pipeline

### Continuous Integration
The project uses GitHub Actions for automated testing and validation:

- **Linting**: ESLint checks on every commit
- **Testing**: Jest unit and e2e tests
- **Build**: TypeScript compilation validation
- **Prisma**: Schema validation and migration checks

### Continuous Deployment
- **Development**: Auto-deploy to dev environment on `main` branch
- **Staging**: Manual approval required
- **Production**: Tagged releases only (`v*.*.*`)

### Deployment Platforms
- **Render**: Current hosting platform (see `render.yaml`)
- **Kubernetes**: Production-ready manifests in `k8s-deployment.yaml`
- **Docker**: Multi-stage Dockerfile for optimized builds

## Monitoring & Observability

### Health Monitoring
- **Health Endpoints**: `/health`, `/health/ready`, `/health/live`
- **Kubernetes Probes**: Configured in deployment manifests
- **Uptime Monitoring**: Configure external monitoring (e.g., UptimeRobot)

### Logging
- **Structured Logging**: NestJS Logger with context
- **Log Levels**: Configurable via environment variables
- **Production Logs**: Centralized logging recommended (ELK, CloudWatch, etc.)
- See [LOGGING.md](docs/LOGGING.md) for implementation details

### Metrics & Tracing
Recommended implementations:
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Jaeger/Zipkin**: Distributed tracing for microservices
- **Kafka Monitoring**: Use Kafka UI (http://localhost:8080) in development

### Error Tracking
- Implement error tracking service (Sentry, Rollbar, etc.)
- All exceptions are structured and logged
- See [EXCEPTION_HANDLING.md](docs/EXCEPTION_HANDLING.md)

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

**Sabin Shrestha** ([@masabinhok](https://github.com/masabinhok))

- 📧 Email: [sabin.shrestha.er@gmail.com](mailto:sabin.shrestha.er@gmail.com)
- 🌐 Website: [sabinshrestha69.com.np](https://sabinshrestha69.com.np)
- 💻 GitHub: [@masabinhok](https://github.com/masabinhok)

## Support

For support, email sabin.shrestha.er@gmail.com or open an issue in the GitHub repository.

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by Sabin Shrestha

</div>
