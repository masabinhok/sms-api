# Setup Guide for Reviewers

Welcome! This guide will walk you through setting up and running the SMS API project step-by-step. Don't worry, it's easier than you think! 🚀

## Step 1: Install Prerequisites

Before we begin, you need two things installed on your computer:

### 1.1 Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (20.x or higher)
3. Run the installer and follow the instructions
4. Verify installation by opening a terminal and typing:
   ```bash
   node --version
   ```
   You should see something like `v20.x.x`

### 1.2 Install Docker Desktop
1. Go to [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download the version for your operating system (Windows/Mac/Linux)
3. Run the installer and follow the instructions
4. **Important**: Start Docker Desktop application
5. Verify it's running - you should see the Docker icon in your system tray

> **Note**: Everything else (Kafka, PostgreSQL, databases) is included in the Docker setup!

## Step 2: Get the Project Code

Now let's download the project to your computer:

### 2.1 Clone the Repository

**Option A: Using Git (Recommended)**

If you have Git installed:
```bash
# Open your terminal or command prompt
# Navigate to where you want the project
cd C:\projects  # (Windows) or cd ~/projects (Mac/Linux)

# Clone the repository
git clone https://github.com/masabinhok/sms-api.git

# Go into the project folder
cd sms-api
```

**Option B: Download ZIP**

If you don't have Git:
1. Go to [https://github.com/masabinhok/sms-api](https://github.com/masabinhok/sms-api)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to a folder
5. Open terminal/command prompt and navigate to that folder:
   ```bash
   cd path/to/extracted/sms-api
   ```

### 2.2 Verify You're in the Right Folder

Make sure you're in the project directory:
```bash
# You should see files like package.json, README.md, etc.
ls        # Mac/Linux
dir       # Windows
```

## Step 3: Run the Automated Setup

Now for the magic! We have a script that does everything for you.

### 3.1 For Windows Users

1. **Make sure you're in the project folder** (`cd sms-api`)

2. **Open PowerShell as Administrator**:
   - Press `Windows + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"
   - Navigate to the project: `cd C:\path\to\sms-api`

3. **Enable script execution** (if needed - only first time):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   Type `Y` and press Enter

4. **Run the setup script**:
   ```powershell
   .\scripts\setup.ps1
   ```

5. **Wait 2-3 minutes** while the script does its magic ✨

> **Note**: If you get a "cannot be loaded because running scripts is disabled" error, you need step 3 above.

### 3.2 For Mac/Linux Users

1. **Make sure you're in the project folder** (`cd sms-api`)
2. **Open your terminal**
3. **Make the script executable** (only needed once):
   ```bash
   chmod +x scripts/setup.sh
   ```
4. **Run the script**:
   ```bash
   ./scripts/setup.sh
   ```
5. **Wait 2-3 minutes** while the script does its magic ✨

### 3.3 What the Script Does Automatically

The setup script will:
1. ✅ Install all npm dependencies (packages the app needs)
2. ✅ Create a `.env` configuration file
3. ✅ Start Kafka cluster (message broker for microservices)
4. ✅ Start PostgreSQL database
5. ✅ Create all 5 databases automatically
6. ✅ Generate database clients
7. ✅ Run database migrations (create tables)
8. ✅ Seed sample data (add test data)

You'll see colorful output showing progress. Don't worry if you see some warnings - that's normal!

## Step 4: Start the Application

After the setup script finishes successfully, start all microservices:

```bash
npm run dev
```

### What You'll See

Your terminal will start showing logs from 7 different services starting up:
- 🚪 **API Gateway** (port 3000) - The main entry point
- 🔐 **Auth Service** - Handles login and authentication
- 👨‍🎓 **Student Service** - Manages student data
- 👨‍🏫 **Teacher Service** - Manages teacher data
- 📚 **Academics Service** - Handles classes and subjects
- 🎯 **Activity Service** - Manages school activities
- 📧 **Email Service** - Sends email notifications

**Wait about 30-60 seconds** for all services to fully start. You'll see messages like:
- "Microservice is listening"
- "Nest application successfully started"

> **Tip**: Keep this terminal window open while using the application. Press `Ctrl+C` when you want to stop all services.

## Step 5: Verify Everything is Working

Let's make sure everything is running correctly!

### 5.1 Check Docker Containers

Open a **new terminal** (keep the other one running) and type:
```bash
docker-compose ps
```

You should see 5 containers running:
- ✅ `sms-postgres` (healthy)
- ✅ `kafka1` (running)
- ✅ `kafka2` (running)
- ✅ `kafka3` (running)
- ✅ `kafka-ui` (running)

If any say "Exit" or "Unhealthy", try: `docker-compose restart`

### 5.2 Test the API Gateway

Open your web browser and go to:
```
http://localhost:3000/api/v1/health
```

You should see a response like this:
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

**If you see this, congratulations! 🎉 Everything is working!**

### 5.3 Explore the API Documentation

This is where it gets fun! Open your browser to:
```
http://localhost:3000/api/v1/api/docs
```

You'll see a beautiful interactive API documentation (Swagger UI) where you can:
- 📖 See all available endpoints
- 🧪 Test API calls directly in your browser
- 📝 View request/response schemas
- 🔍 Understand what each endpoint does

### 5.4 Check the Kafka Dashboard (Optional)

Want to see the message broker in action? Open:
```
http://localhost:8080
```

This shows you:
- Kafka topics (message channels)
- Consumer groups (which services are listening)
- Message flow between microservices
- Cluster health

### 5.5 Connect to PostgreSQL (Optional)

If you have a database client (like DBeaver, pgAdmin, or TablePlus):
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Databases**: sms_auth, sms_student, sms_teacher, sms_academics, sms_activity

## Step 6: Try the API (Your First Request!)

Let's test the authentication system with a real request.

### 6.1 Using Swagger UI (Easiest - No Code!)

1. Go to [http://localhost:3000/api/v1/api/docs](http://localhost:3000/api/v1/api/docs)
2. Find **"Auth"** section and click to expand
3. Click on **POST /api/auth/register**
4. Click the **"Try it out"** button
5. Edit the example JSON:
   ```json
   {
     "email": "reviewer@test.com",
     "password": "Test123!@#",
     "role": "ADMIN"
   }
   ```
6. Click **"Execute"**
7. Scroll down to see the response!

You've just created a user! 🎉

### 6.2 Now Try Logging In

1. Still in Swagger, find **POST /api/auth/login**
2. Click **"Try it out"**
3. Use the same credentials:
   ```json
   {
     "email": "reviewer@test.com",
     "password": "Test123!@#"
   }
   ```
4. Click **"Execute"**
5. You'll get back `access_token` and `refresh_token` - these are your session keys!

### 6.3 Using Command Line (For Advanced Users)

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/v1/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reviewer@test.com",
    "password": "Test123!@#",
    "role": "ADMIN"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reviewer@test.com",
    "password": "Test123!@#"
  }'
```

### 6.4 Explore More Endpoints

Try out these other endpoints in Swagger:
- 👨‍🎓 **Students**: Create, list, update student records
- 👨‍🏫 **Teachers**: Manage teacher information
- 📚 **Academics**: Create schools, classes, subjects
- 🎯 **Activities**: Add school activities and events
- ❤️ **Health**: Check system health

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

## Step 7: When You're Done (Stopping Everything)

### 7.1 Stop the Services

In the terminal where `npm run dev` is running:
1. Press `Ctrl+C` (hold Ctrl and press C)
2. Wait a few seconds for all services to shut down gracefully

### 7.2 Stop Docker Containers

```bash
docker-compose down
```

This stops and removes:
- Kafka brokers
- Kafka UI
- PostgreSQL container

**Note**: Your data is preserved in a Docker volume!

### 7.3 Complete Clean Up (Removes ALL Data)

If you want to start fresh next time:
```bash
docker-compose down -v
```

⚠️ **Warning**: This deletes all databases and data! You'll need to run migrations again next time.

## Troubleshooting Common Issues

Don't panic! Here are solutions to common problems:

### ❌ Problem: "Port 3000 is already in use"

**What it means**: Another program is using port 3000

**Solution**:
1. Find what's using it:
   - **Windows**: `netstat -ano | findstr :3000`
   - **Mac/Linux**: `lsof -i :3000`
2. Stop that program
3. Or change the port in `.env`: `PORT=3001`

### ❌ Problem: "Cannot connect to Docker"

**What it means**: Docker Desktop isn't running

**Solution**:
1. Start Docker Desktop application
2. Wait for it to fully start (Docker icon in system tray should be stable)
3. Run your command again

### ❌ Problem: "npm: command not found"

**What it means**: Node.js isn't installed or not in PATH

**Solution**:
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Restart your terminal
3. Verify: `node --version`

### ❌ Problem: Services won't start / Kafka errors

**What it means**: Kafka containers might be unhealthy

**Solution**:
```bash
# Restart Kafka cluster
docker-compose restart kafka1 kafka2 kafka3

# Wait 30 seconds
# Try starting services again
npm run dev
```

### ❌ Problem: "Database connection refused" or "Authentication failed"

**What it means**: Either PostgreSQL container isn't ready, or databases weren't created

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps | grep sms-postgres

# If not running, start it
docker-compose up -d postgres

# Wait 15 seconds for it to be ready
# Then create databases manually:
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_auth"
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_student"
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_teacher"
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_academics"
docker exec sms-postgres psql -U postgres -c "CREATE DATABASE sms_activity"

# Now re-run the setup script
```

**Note**: The automated setup script should handle this automatically. If you're seeing this error, it means the database creation step was skipped or failed.

### ❌ Problem: "Module not found" errors

**What it means**: Dependencies or Prisma clients missing

**Solution**:
```bash
# Reinstall dependencies
npm install

# Regenerate Prisma clients
npx prisma generate --schema=apps/auth/prisma/schema.prisma
npx prisma generate --schema=apps/student/prisma/schema.prisma
npx prisma generate --schema=apps/teacher/prisma/schema.prisma
npx prisma generate --schema=apps/academics/prisma/schema.prisma
npx prisma generate --schema=apps/activity/prisma/schema.prisma
```

### 🔄 Nuclear Option: Complete Fresh Start

If nothing works, start completely fresh:

```bash
# 1. Stop everything
docker-compose down -v

# 2. Delete node_modules (this might take a minute)
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules

# Mac/Linux:
rm -rf node_modules

# 3. Clean npm cache
npm cache clean --force

# 4. Start fresh
npm install
docker-compose up -d

# 5. Wait 30 seconds, then run setup script again
.\scripts\setup.ps1    # Windows
./scripts/setup.sh     # Mac/Linux
```

### Still Having Issues?

1. Check the main README.md for more details
2. Look at Docker logs: `docker-compose logs`
3. Make sure you have enough disk space (at least 5GB free)
4. Contact: sabin.shrestha.er@gmail.com

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

## Next Steps & Resources

### 📚 Learn More About the Architecture

Want to understand how everything works? Check out these docs:

1. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and microservices flow
2. **[EXCEPTION_HANDLING.md](docs/EXCEPTION_HANDLING.md)** - How errors are handled
3. **[HEALTH_CHECKS.md](docs/HEALTH_CHECKS.md)** - Monitoring and health endpoints
4. **[LOGGING.md](docs/LOGGING.md)** - Structured logging implementation
5. **[PASSWORD_SECURITY.md](docs/PASSWORD_SECURITY.md)** - Authentication security
6. **[TRANSACTION_MANAGEMENT.md](docs/TRANSACTION_MANAGEMENT.md)** - Database transactions

### 🎯 Key Technologies Used

- **NestJS** - Modern Node.js framework
- **Apache Kafka** - Event-driven microservices messaging
- **PostgreSQL** - Relational database
- **Prisma** - Type-safe database ORM
- **Docker** - Containerization
- **Swagger/OpenAPI** - API documentation

### 📊 What to Review

When evaluating this project, check out:
1. **Code Quality** - Clean, well-documented TypeScript
2. **Architecture** - Microservices with event-driven communication
3. **Error Handling** - Comprehensive exception management
4. **Testing** - Unit and E2E tests (run `npm test`)
5. **Documentation** - Extensive docs and inline comments
6. **Security** - JWT auth, password hashing, input validation
7. **Scalability** - Kafka cluster, database per service pattern
8. **DevOps** - Docker, health checks, structured logging

### 💡 Pro Tips

- Use Swagger UI for the easiest API testing
- Check Kafka UI to see microservices messaging in action
- Review the logs in terminal to understand service communication
- All code is in `apps/` folder - each microservice is independent
- Shared code is in `apps/libs/` - reusable across services

## Quick Reference

### Useful URLs
| Service | URL |
|---------|-----|
| API Gateway | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/v1/api/docs |
| Health Check | http://localhost:3000/api/v1/health |
| Kafka UI | http://localhost:8080 |

### Useful Commands
```bash
# Start all services
npm run dev

# Start individual service
npm run start:auth
npm run start:gateway

# Run tests
npm test

# Check code style
npm run lint

# Format code
npm run format

# View Docker status
docker-compose ps

# View service logs
docker-compose logs -f
```

### Environment
- **PostgreSQL**: localhost:5432 (postgres/postgres)
- **Kafka**: localhost:9094,9095,9096
- **Databases**: sms_auth, sms_student, sms_teacher, sms_academics, sms_activity

## Need Help?

- **📧 Email**: sabin.shrestha.er@gmail.com
- **🌐 Website**: [sabinshrestha69.com.np](https://sabinshrestha69.com.np)
- **💻 GitHub**: [@masabinhok](https://github.com/masabinhok)

---

<div align="center">

### Thank You for Reviewing This Project! 🙏

**If you find this project helpful, please ⭐ star the repository!**

Made with ❤️ by Sabin Shrestha

</div>
