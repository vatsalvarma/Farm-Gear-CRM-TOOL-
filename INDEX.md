# 📚 Farm Gear Connect - Documentation Index

Welcome to the Farm Gear Connect documentation! This index will help you find the right document for your needs.

## 🎯 Start Here

### New to the Project?

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** ⭐ **START HERE!**
   - Quick 5-minute setup
   - First-time installation
   - Basic testing guide

2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** 📌
   - Quick commands
   - Common tasks
   - Troubleshooting tips

3. **[README.md](README.md)** 📖
   - Project overview
   - Features list
   - API reference

## 📖 Detailed Guides

### Setup & Configuration

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** 🔧
  - Detailed installation steps
  - Manual setup instructions
  - Environment configuration
  - Service setup (MySQL, Redis, MinIO)
  - Troubleshooting guide

- **[COMPLETE_SETUP_SUMMARY.md](COMPLETE_SETUP_SUMMARY.md)** ✅
  - What has been set up
  - Verification checklist
  - Success criteria
  - Next steps

### Architecture & Design

- **[ARCHITECTURE.md](ARCHITECTURE.md)** 🏗️
  - System architecture diagrams
  - Component interactions
  - Data flow diagrams
  - Security architecture
  - Deployment architecture

- **[CONNECTION_GUIDE.md](CONNECTION_GUIDE.md)** 🔌
  - Frontend-Backend connection
  - Backend-Database connection
  - Authentication flow
  - Data flow examples
  - Real-time features

- **[CONNECTION_SUMMARY.md](CONNECTION_SUMMARY.md)** 📊
  - Connection status
  - Configuration files
  - Testing procedures
  - What works now

### Project Information

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** 📋
  - Project overview
  - Technology stack
  - Features summary
  - Development status

- **[QUICKSTART.md](QUICKSTART.md)** ⚡
  - Quick start commands
  - Basic usage
  - Common workflows

## 🛠️ Setup Scripts

### Windows

- **start-dev.ps1** - Automated startup script
  ```powershell
  .\start-dev.ps1 -Docker    # Start with Docker
  .\start-dev.ps1 -Manual    # Start manually
  ```

- **verify-setup.ps1** - Verify all connections
  ```powershell
  .\verify-setup.ps1
  ```

### Linux/Mac

- **verify-setup.sh** - Verify all connections
  ```bash
  bash verify-setup.sh
  ```

## 📂 Configuration Files

### Backend

- `backend/src/main/resources/application.yml` - Main configuration
- `backend/pom.xml` - Maven dependencies
- `backend/Dockerfile` - Docker image

### Frontend

- `frontend/.env.local` - Environment variables
- `frontend/next.config.ts` - Next.js configuration
- `frontend/package.json` - NPM dependencies
- `frontend/Dockerfile` - Docker image

### Infrastructure

- `docker-compose.yml` - All services configuration
- `.env.example` - Environment template

## 🎓 By Use Case

### I want to...

#### Get Started Quickly
→ [GETTING_STARTED.md](GETTING_STARTED.md)  
→ Run: `docker-compose up -d`

#### Understand the Architecture
→ [ARCHITECTURE.md](ARCHITECTURE.md)  
→ [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md)

#### Set Up Manually
→ [SETUP_GUIDE.md](SETUP_GUIDE.md)  
→ Follow step-by-step instructions

#### Troubleshoot Issues
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Troubleshooting section  
→ [SETUP_GUIDE.md](SETUP_GUIDE.md) - Troubleshooting section  
→ Run: `.\verify-setup.ps1`

#### Understand Data Flow
→ [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md)  
→ [ARCHITECTURE.md](ARCHITECTURE.md) - Request Flow section

#### Deploy to Production
→ [SETUP_GUIDE.md](SETUP_GUIDE.md) - Production section  
→ [ARCHITECTURE.md](ARCHITECTURE.md) - Deployment section

#### Learn the API
→ [README.md](README.md) - API Endpoints section  
→ http://localhost:8080/api/swagger-ui.html (when running)

#### Verify Setup
→ [CONNECTION_SUMMARY.md](CONNECTION_SUMMARY.md)  
→ Run: `.\verify-setup.ps1`

## 🔍 By Topic

### Frontend

- **Setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Step 3
- **Configuration**: [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Frontend Configuration
- **API Client**: [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Frontend → Backend Connection

### Backend

- **Setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Step 2
- **Configuration**: [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Backend Configuration
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) - Application Layer

### Database

- **Setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Step 1
- **Schema**: [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Database Schema
- **Queries**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Database Quick Access
- **Tables**: [CONNECTION_SUMMARY.md](CONNECTION_SUMMARY.md) - Database Schema Overview

### Docker

- **Setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Quick Start with Docker
- **Commands**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Docker Commands
- **Configuration**: `docker-compose.yml`

### Authentication

- **Flow**: [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Authentication Flow
- **Security**: [ARCHITECTURE.md](ARCHITECTURE.md) - Security Architecture
- **JWT**: [CONNECTION_SUMMARY.md](CONNECTION_SUMMARY.md) - Authentication Flow

### API

- **Endpoints**: [README.md](README.md) - API Endpoints
- **Testing**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Test API Endpoints
- **Documentation**: http://localhost:8080/api/swagger-ui.html

## 📊 Document Comparison

| Document | Length | Audience | Purpose |
|----------|--------|----------|---------|
| GETTING_STARTED.md | Medium | Beginners | Quick start guide |
| SETUP_GUIDE.md | Long | All | Detailed setup |
| CONNECTION_GUIDE.md | Long | Developers | Technical details |
| ARCHITECTURE.md | Long | Architects | System design |
| QUICK_REFERENCE.md | Short | All | Quick lookup |
| CONNECTION_SUMMARY.md | Medium | All | Status check |
| README.md | Long | All | Project overview |

## 🎯 Recommended Reading Order

### For Beginners

1. [GETTING_STARTED.md](GETTING_STARTED.md) - Understand the basics
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Learn common commands
3. [README.md](README.md) - Explore features
4. [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Understand connections

### For Developers

1. [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the design
2. [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Learn data flow
3. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed configuration
4. [README.md](README.md) - API reference

### For DevOps

1. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Deployment options
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Infrastructure design
3. `docker-compose.yml` - Service configuration
4. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Operations commands

## 🚀 Quick Actions

### Start the Application

```bash
# Docker (recommended)
docker-compose up -d

# Windows script
.\start-dev.ps1 -Docker

# Manual
cd backend && mvn spring-boot:run
cd frontend && npm run dev
```

### Verify Everything Works

```bash
# Run verification
.\verify-setup.ps1

# Or manually check
curl http://localhost:8080/api/actuator/health
curl http://localhost:3000
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Docs**: http://localhost:8080/api/swagger-ui.html
- **MinIO Console**: http://localhost:9001

### Get Help

1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Troubleshooting
2. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) - Troubleshooting
3. Run `.\verify-setup.ps1`
4. Check logs: `docker-compose logs -f`

## 📞 Support Resources

### Documentation

- All guides in this repository
- Inline code comments
- API documentation (Swagger UI)

### External Resources

- **Spring Boot**: https://spring.io/guides
- **Next.js**: https://nextjs.org/docs
- **MySQL**: https://dev.mysql.com/doc/
- **Docker**: https://docs.docker.com/

## ✅ Checklist

Before you start development:

- [ ] Read [GETTING_STARTED.md](GETTING_STARTED.md)
- [ ] Run `docker-compose up -d` or `.\start-dev.ps1 -Docker`
- [ ] Verify with `.\verify-setup.ps1`
- [ ] Access http://localhost:3000
- [ ] Register a test user
- [ ] Check database for user data
- [ ] Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- [ ] Bookmark this INDEX.md

## 🎉 You're Ready!

All documentation is available. Choose the guide that fits your needs and start building!

---

**Quick Links**:
- 🚀 [Get Started](GETTING_STARTED.md)
- 📌 [Quick Reference](QUICK_REFERENCE.md)
- 🔧 [Setup Guide](SETUP_GUIDE.md)
- 🏗️ [Architecture](ARCHITECTURE.md)
- 🔌 [Connections](CONNECTION_GUIDE.md)
- 📖 [README](README.md)

**Need help?** Start with [GETTING_STARTED.md](GETTING_STARTED.md)!
