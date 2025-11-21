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
sleep 10

# Generate Prisma clients
echo "🔧 Generating Prisma clients..."
npx prisma generate --schema=apps/auth/prisma/schema.prisma
npx prisma generate --schema=apps/student/prisma/schema.prisma
npx prisma generate --schema=apps/teacher/prisma/schema.prisma
npx prisma generate --schema=apps/academics/prisma/schema.prisma
npx prisma generate --schema=apps/activity/prisma/schema.prisma
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy --schema=apps/auth/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/student/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/teacher/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/academics/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/activity/prisma/schema.prisma
echo ""

# Seed database (optional)
echo "🌱 Seeding database..."
npm run seed:academics || echo "⚠️  Seeding failed, but setup can continue"
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
echo "   http://localhost:3000/api/docs"
echo ""
