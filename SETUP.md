# Setup Guide for Reviewers

This guide will help you quickly set up and run the SMS API project for review.

## Prerequisites

You only need:
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)

Everything else (Kafka, PostgreSQL, databases) is included in the Docker setup!

## One-Command Setup

### Windows Users
Open PowerShell in the project directory and run:
```powershell
.\scripts\setup.ps1
```

### Linux/Mac Users
Open terminal in the project directory and run:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The script will automatically:
1. Install all dependencies
2. Create configuration file
3. Start Kafka and PostgreSQL containers
4. Create all required databases
5. Run database migrations
6. Seed sample data

## Start the Application

After setup completes, start all microservices:
```bash
npm run dev
```

This will start 7 services:
- API Gateway (port 3000)
- Auth Service
- Student Service
- Teacher Service
- Academics Service
- Activity Service
- Email Service

## Verify Everything is Running

### 1. Check Docker Containers
```bash
docker-compose ps
```

You should see:
- kafka1, kafka2, kafka3 (running)
- kafka-ui (running)
- sms-postgres (running)

### 2. Test API Gateway
Open browser to: http://localhost:3000/health

Expected response:
```json
{
  "status": "ok",
  "info": {
    "memory_heap": { "status": "up" },
    "disk": { "status": "up" },
    "kafka": { "status": "up" }
  }
}
```

### 3. Explore API Documentation
Open browser to: http://localhost:3000/api/docs

Interactive Swagger UI with all endpoints.

### 4. Check Kafka Cluster
Open browser to: http://localhost:8080

Kafka UI showing all topics and consumer groups.

## Quick API Test

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reviewer@test.com",
    "password": "Test123!@#",
    "role": "ADMIN"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reviewer@test.com",
    "password": "Test123!@#"
  }'
```

## Project Structure

```
sms-api/
├── apps/
│   ├── gateway/          # API Gateway (HTTP → Kafka)
│   ├── auth/             # Authentication service
│   ├── student/          # Student management
│   ├── teacher/          # Teacher management
│   ├── academics/        # School/Classes/Subjects
│   ├── activity/         # Activities/Events
│   └── email/            # Email notifications
├── apps/libs/            # Shared libraries
├── docs/                 # Architecture documentation
└── docker-compose.yml    # Infrastructure setup
```

## Architecture Highlights

### Microservices Communication
- **Client** → **API Gateway** (HTTP/REST)
- **Gateway** ↔ **Services** (Kafka RPC)
- **Services** ↔ **PostgreSQL** (Prisma ORM)

### Key Features to Review
1. **Exception Handling** - See `docs/EXCEPTION_HANDLING.md`
2. **Health Checks** - See `docs/HEALTH_CHECKS.md`
3. **Structured Logging** - See `docs/LOGGING.md`
4. **Security** - JWT auth, bcrypt passwords
5. **Transaction Management** - See `docs/TRANSACTION_MANAGEMENT.md`

## Stopping the Application

### Stop Services
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### Stop Docker Containers
```bash
docker-compose down
```

### Clean Everything (including data)
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If port 3000, 5432, or 8080 is already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml` and `.env`

### Services Not Connecting to Kafka
```bash
# Restart Kafka cluster
docker-compose restart kafka1 kafka2 kafka3
```

### Database Connection Errors
```bash
# Check PostgreSQL is running
docker-compose ps sms-postgres

# View PostgreSQL logs
docker-compose logs sms-postgres
```

### Need Fresh Start
```bash
# Complete reset
docker-compose down -v
rm -rf node_modules
npm install
docker-compose up -d
# Wait 10 seconds
# Run migrations again
```

## Environment Details

### Default Credentials
- **PostgreSQL**: postgres/postgres
- **Databases**: sms_auth, sms_student, sms_teacher, sms_academics, sms_activity
- **Kafka Brokers**: localhost:9094, localhost:9095, localhost:9096

### Services Configuration
All configuration is in `.env` file (auto-created from `.env.example`)

## Documentation

Comprehensive documentation available in `/docs`:
- `ARCHITECTURE.md` - System design
- `EXCEPTION_HANDLING.md` - Error management
- `HEALTH_CHECKS.md` - Monitoring
- `LOGGING.md` - Logging strategy
- `PASSWORD_SECURITY.md` - Auth implementation
- `TRANSACTION_MANAGEMENT.md` - Database transactions

## Support

If you encounter any issues:
- Check the Troubleshooting section above
- Review README.md for detailed information
- Contact: sabin.shrestha.er@gmail.com

---

**Thank you for reviewing this project!** ⭐
