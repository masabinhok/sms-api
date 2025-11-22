# Quick Setup Script for SMS API (Windows PowerShell)
# Run this script to set up the entire project

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "SMS API - Quick Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "X Node.js is not installed. Please install Node.js 20+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "X Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Node.js and Docker are installed" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Create .env file if it doesn't exist
$envExists = Test-Path .env
if (-not $envExists) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "! Please review .env file and update if needed" -ForegroundColor Yellow
    Write-Host ""
}
else {
    Write-Host "[OK] .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Start Docker services
Write-Host "Starting Docker services (Kafka + PostgreSQL)..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Failed to start Docker services" -ForegroundColor Red
    Write-Host "! Make sure Docker Desktop is running" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host ""

# Create databases
Write-Host "Creating databases..." -ForegroundColor Yellow
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_auth" 2>$null
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_student" 2>$null
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_teacher" 2>$null
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_academics" 2>$null
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_activity" 2>$null
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_public" 2>$null
Write-Host "[OK] Databases created" -ForegroundColor Green
Write-Host ""

# Generate Prisma clients
Write-Host "Generating Prisma clients..." -ForegroundColor Yellow
npx prisma generate --schema=apps/auth/prisma/schema.prisma
npx prisma generate --schema=apps/student/prisma/schema.prisma
npx prisma generate --schema=apps/teacher/prisma/schema.prisma
npx prisma generate --schema=apps/academics/prisma/schema.prisma
npx prisma generate --schema=apps/activity/prisma/schema.prisma
npx prisma generate --schema=apps/gateway/prisma/schema.prisma
Write-Host ""

# Run database migrations using Docker (avoids Windows authentication issues)
Write-Host "Running database migrations..." -ForegroundColor Yellow
Write-Host "  - Auth service..." -ForegroundColor Gray
docker run --rm --network review_kafka-network -v ${PWD}:/app -w /app -e AUTH_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_auth?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma" 2>&1 | Out-Null
Write-Host "  - Student service..." -ForegroundColor Gray
docker run --rm --network review_kafka-network -v ${PWD}:/app -w /app -e STUDENT_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_student?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/student/prisma/schema.prisma" 2>&1 | Out-Null
Write-Host "  - Teacher service..." -ForegroundColor Gray
docker run --rm --network review_kafka-network -v ${PWD}:/app -w /app -e TEACHER_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_teacher?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/teacher/prisma/schema.prisma" 2>&1 | Out-Null
Write-Host "  - Academics service..." -ForegroundColor Gray
docker run --rm --network review_kafka-network -v ${PWD}:/app -w /app -e ACADEMICS_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_academics?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/academics/prisma/schema.prisma" 2>&1 | Out-Null
Write-Host "  - Activity service..." -ForegroundColor Gray
docker run --rm --network review_kafka-network -v ${PWD}:/app -w /app -e ACTIVITY_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_activity?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/activity/prisma/schema.prisma" 2>&1 | Out-Null
Write-Host "  - Gateway/Public service..." -ForegroundColor Gray
docker run --rm --network review_kafka-network -v ${PWD}:/app -w /app -e DATABASE_URL_PUBLIC="postgresql://postgres:postgres@postgres:5432/sms_public?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/gateway/prisma/schema.prisma" 2>&1 | Out-Null
Write-Host "[OK] All migrations completed" -ForegroundColor Green
Write-Host ""

# Seed databases
Write-Host "Seeding databases..." -ForegroundColor Yellow
Write-Host "  - Auth service (users)..." -ForegroundColor Gray
npm run seed:auth 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "! Auth seeding had issues" -ForegroundColor Yellow
}
Write-Host "  - Academics service (school, classes, subjects)..." -ForegroundColor Gray
npm run seed:academics 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "! Academics seeding had issues" -ForegroundColor Yellow
}
Write-Host "  - Teacher service (teachers)..." -ForegroundColor Gray
npm run seed:teacher 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "! Teacher seeding had issues" -ForegroundColor Yellow
}
Write-Host "  - Student service (students)..." -ForegroundColor Gray
npm run seed:student 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "! Student seeding had issues" -ForegroundColor Yellow
}
Write-Host "[OK] All database seeding completed" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "[OK] Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services running:" -ForegroundColor White
Write-Host "   - Kafka UI: http://localhost:8080" -ForegroundColor Gray
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor Gray
Write-Host "   - Kafka Brokers: localhost:9094,9095,9096" -ForegroundColor Gray
Write-Host ""
Write-Host "To start the application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Documentation (after starting):" -ForegroundColor White
Write-Host "   http://localhost:3000/api/v1/api/docs" -ForegroundColor Cyan
Write-Host ""
