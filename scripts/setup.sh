#!/bin/bash
# Quick Setup Script for SMS API
# Run this script to set up the entire project

set -e

echo "======================================"
echo "SMS API - Quick Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Node.js and Docker are installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your actual values before running the app"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Start Docker services
echo "🐳 Starting Docker services (Kafka + PostgreSQL)..."
docker-compose up -d
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

# Create databases
echo "🗄️  Creating databases..."
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_auth" 2>/dev/null || true
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_student" 2>/dev/null || true
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_teacher" 2>/dev/null || true
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_academics" 2>/dev/null || true
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_activity" 2>/dev/null || true
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_public" 2>/dev/null || true
echo "✅ Databases created"
echo ""

# Generate Prisma clients
echo "🔧 Generating Prisma clients..."
npx prisma generate --schema=apps/auth/prisma/schema.prisma
npx prisma generate --schema=apps/student/prisma/schema.prisma
npx prisma generate --schema=apps/teacher/prisma/schema.prisma
npx prisma generate --schema=apps/academics/prisma/schema.prisma
npx prisma generate --schema=apps/activity/prisma/schema.prisma
npx prisma generate --schema=apps/gateway/prisma/schema.prisma
echo ""

# Run database migrations using Docker (avoids authentication issues)
echo "🗄️  Running database migrations..."
echo "  - Auth service..."
docker run --rm --network review_kafka-network -v "$(pwd)":/app -w /app -e AUTH_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_auth?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma" >/dev/null 2>&1
echo "  - Student service..."
docker run --rm --network review_kafka-network -v "$(pwd)":/app -w /app -e STUDENT_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_student?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/student/prisma/schema.prisma" >/dev/null 2>&1
echo "  - Teacher service..."
docker run --rm --network review_kafka-network -v "$(pwd)":/app -w /app -e TEACHER_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_teacher?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/teacher/prisma/schema.prisma" >/dev/null 2>&1
echo "  - Academics service..."
docker run --rm --network review_kafka-network -v "$(pwd)":/app -w /app -e ACADEMICS_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_academics?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/academics/prisma/schema.prisma" >/dev/null 2>&1
echo "  - Activity service..."
docker run --rm --network review_kafka-network -v "$(pwd)":/app -w /app -e ACTIVITY_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/sms_activity?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/activity/prisma/schema.prisma" >/dev/null 2>&1
echo "  - Gateway/Public service..."
docker run --rm --network review_kafka-network -v "$(pwd)":/app -w /app -e DATABASE_URL_PUBLIC="postgresql://postgres:postgres@postgres:5432/sms_public?schema=public" node:20-alpine sh -c "npx prisma migrate deploy --schema=apps/gateway/prisma/schema.prisma" >/dev/null 2>&1
echo "✅ All migrations completed"
echo ""

# Seed databases
echo "🌱 Seeding databases..."
echo "  - Auth service (users)..."
npm run seed:auth >/dev/null 2>&1 || echo "⚠️  Auth seeding had issues"
echo "  - Academics service (school, classes, subjects)..."
npm run seed:academics >/dev/null 2>&1 || echo "⚠️  Academics seeding had issues"
echo "  - Teacher service (teachers)..."
npm run seed:teacher >/dev/null 2>&1 || echo "⚠️  Teacher seeding had issues"
echo "  - Student service (students)..."
npm run seed:student >/dev/null 2>&1 || echo "⚠️  Student seeding had issues"
echo "✅ All database seeding completed"
echo ""

echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "📌 Services running:"
echo "   - Kafka UI: http://localhost:8080"
echo "   - PostgreSQL: localhost:5432"
echo "   - Kafka Brokers: localhost:9094,9095,9096"
echo ""
echo "🚀 Start the application:"
echo "   npm run dev"
echo ""
echo "📚 API Documentation (after starting):"
echo "   http://localhost:3000/api/v1/api/docs"
echo ""
