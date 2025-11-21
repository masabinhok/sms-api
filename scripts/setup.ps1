# Quick Setup Script for SMS API (Windows PowerShell)
# Run this script to set up the entire project

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "SMS API - Quick Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 20+ first." -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and Docker are installed" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please update .env file with your actual values before running the app" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Start Docker services
Write-Host "🐳 Starting Docker services (Kafka + PostgreSQL)..." -ForegroundColor Yellow
docker-compose up -d
Write-Host ""

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Generate Prisma clients
Write-Host "🔧 Generating Prisma clients..." -ForegroundColor Yellow
npx prisma generate --schema=apps/auth/prisma/schema.prisma
npx prisma generate --schema=apps/student/prisma/schema.prisma
npx prisma generate --schema=apps/teacher/prisma/schema.prisma
npx prisma generate --schema=apps/academics/prisma/schema.prisma
npx prisma generate --schema=apps/activity/prisma/schema.prisma
Write-Host ""

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/student/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/teacher/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/academics/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/activity/prisma/schema.prisma
Write-Host ""

# Seed database (optional)
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
try {
    npm run seed:academics
} catch {
    Write-Host "⚠️  Seeding failed, but setup can continue" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Services running:" -ForegroundColor White
Write-Host "   - Kafka UI: http://localhost:8080" -ForegroundColor Gray
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor Gray
Write-Host "   - Kafka Brokers: localhost:9094,9095,9096" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Start the application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 API Documentation (after starting):" -ForegroundColor White
Write-Host "   http://localhost:3000/api/docs" -ForegroundColor Gray
Write-Host ""
