# Farm Gear Connect - Complete Setup Guide

This guide will help you connect the frontend to the backend and ensure all data is stored in the database.

## 🏗️ Architecture Overview

```
Frontend (Next.js) → Backend (Spring Boot) → MySQL Database
                                          ↓
                                    Redis Cache
                                          ↓
                                    MinIO Storage
```

## 📋 Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL 8.0+** (database)
- **Docker & Docker Compose** (recommended for easy setup)
- **Maven** (for building backend)

## 🚀 Quick Start with Docker (Recommended)

### 1. Start All Services

```bash
# Start all services (MySQL, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 2. Verify Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api/swagger-ui.html
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin123)
- **MySQL**: localhost:3306

### 3. Stop Services

```bash
docker-compose down

# To remove volumes (database data)
docker-compose down -v
```

## 🔧 Manual Setup (Without Docker)

### Step 1: Setup MySQL Database

#### 1.1 Install MySQL 8.0+

```bash
# Windows: Download from https://dev.mysql.com/downloads/mysql/
# Mac: brew install mysql
# Linux: sudo apt-get install mysql-server
```

#### 1.2 Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE farmgearconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional but recommended)
CREATE USER 'farmgear'@'localhost' IDENTIFIED BY 'farmgear1234';
GRANT ALL PRIVILEGES ON farmgearconnect.* TO 'farmgear'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### Step 2: Setup Backend

#### 2.1 Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_USERNAME=farmgear
DB_PASSWORD=farmgear1234

# JWT Secret (generate a secure random string)
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters

# MinIO (if running locally)
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# Email Configuration (optional for now)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

#### 2.2 Update application.yml (if needed)

The backend configuration is in `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/farmgearconnect?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: ${DB_USERNAME:farmgear}
    password: ${DB_PASSWORD:farmgear1234}
```

#### 2.3 Build and Run Backend

```bash
# Navigate to backend directory
cd backend

# Build the project (this will download dependencies)
mvn clean install -DskipTests

# Run the application
mvn spring-boot:run

# Or run the JAR file
java -jar target/farm-gear-connect-1.0.0.jar
```

The backend will:
1. ✅ Connect to MySQL database
2. ✅ Run Flyway migrations (create all tables)
3. ✅ Seed initial data
4. ✅ Start on http://localhost:8080

#### 2.4 Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:8080/api/actuator/health

# Expected response:
# {"status":"UP"}
```

### Step 3: Setup Frontend

#### 3.1 Configure Environment Variables

Create `.env.local` in the frontend directory:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# App Configuration
NEXT_PUBLIC_APP_NAME=FarmGearConnect
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3.2 Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will start on http://localhost:3000

### Step 4: Setup MinIO (Optional - for file uploads)

#### 4.1 Install MinIO

```bash
# Windows: Download from https://min.io/download
# Mac: brew install minio/stable/minio
# Linux: wget https://dl.min.io/server/minio/release/linux-amd64/minio
```

#### 4.2 Run MinIO

```bash
# Create data directory
mkdir -p ~/minio/data

# Start MinIO
minio server ~/minio/data --console-address ":9001"
```

Access MinIO Console at http://localhost:9001 (minioadmin / minioadmin)

#### 4.3 Create Bucket

1. Login to MinIO Console
2. Create bucket named `farmgearconnect`
3. Set bucket policy to public (for images)

### Step 5: Setup Redis (Optional - for caching)

```bash
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server

# Start Redis
redis-server
```

## 🗄️ Database Schema

The database schema is automatically created by Flyway migrations when the backend starts. The following tables are created:

### Core Tables
- **users** - User accounts (farmers, owners, admins)
- **equipment** - Equipment listings
- **equipment_images** - Equipment photos
- **bookings** - Rental bookings
- **reviews** - Equipment reviews

### Communication Tables
- **messages** - Chat messages between users
- **notifications** - User notifications

### Payment & Subscription Tables
- **subscriptions** - Owner subscription plans
- **coupons** - Discount coupons

### Security Tables
- **refresh_tokens** - JWT refresh tokens
- **otp_verifications** - OTP for email/phone verification
- **audit_logs** - System audit trail

## 🔌 API Connection Flow

### 1. Frontend API Client

The frontend uses Axios to connect to the backend. Configuration is in `frontend/src/lib/api/client.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})
```

### 2. Authentication Flow

```
1. User logs in → POST /api/auth/login
2. Backend validates credentials from database
3. Backend returns JWT tokens (access + refresh)
4. Frontend stores tokens in localStorage
5. Frontend adds token to all subsequent requests
6. Backend validates token and processes request
7. Data is fetched/stored in MySQL database
```

### 3. Data Storage Flow

All data operations follow this pattern:

```
Frontend → API Request → Backend Controller → Service Layer → Repository → MySQL Database
                                                                              ↓
                                                                         Data Persisted
```

## 🧪 Testing the Connection

### 1. Test Backend Health

```bash
curl http://localhost:8080/api/actuator/health
```

### 2. Test Database Connection

```bash
# Check if tables were created
mysql -u farmgear -p farmgearconnect -e "SHOW TABLES;"

# Expected output: List of all tables (users, equipment, bookings, etc.)
```

### 3. Test API Endpoints

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test@1234",
    "phone": "1234567890",
    "role": "FARMER"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### 4. Test Frontend Connection

1. Open http://localhost:3000
2. Try to register/login
3. Check browser console for API calls
4. Check backend logs for incoming requests

## 📊 Verify Data is Being Stored

### Check User Registration

```sql
-- Login to MySQL
mysql -u farmgear -p farmgearconnect

-- Check users table
SELECT id, full_name, email, role, created_at FROM users;

-- Check if data is being stored
SELECT COUNT(*) as total_users FROM users;
```

### Check Equipment Listings

```sql
SELECT id, title, category, status, owner_id FROM equipment;
```

### Check Bookings

```sql
SELECT id, booking_reference, status, farmer_id, owner_id FROM bookings;
```

## 🔍 Troubleshooting

### Backend won't start

**Error: "Access denied for user"**
```bash
# Check MySQL credentials in application.yml
# Make sure user has proper permissions
GRANT ALL PRIVILEGES ON farmgearconnect.* TO 'farmgear'@'localhost';
```

**Error: "Table doesn't exist"**
```bash
# Flyway migrations didn't run
# Check backend logs for migration errors
# Manually run migrations:
cd backend
mvn flyway:migrate
```

### Frontend can't connect to backend

**Error: "Network Error" or "CORS Error"**
```bash
# 1. Check if backend is running
curl http://localhost:8080/api/actuator/health

# 2. Check CORS configuration in application.yml
app:
  cors:
    allowed-origins: http://localhost:3000

# 3. Check frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Database connection issues

```bash
# Test MySQL connection
mysql -u farmgear -p -h localhost -P 3306

# Check if MySQL is running
# Windows: services.msc → MySQL
# Mac/Linux: sudo systemctl status mysql
```

### Port already in use

```bash
# Backend (8080)
# Windows: netstat -ano | findstr :8080
# Mac/Linux: lsof -i :8080

# Frontend (3000)
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Kill process or change port in configuration
```

## 🎯 Next Steps

1. ✅ **Backend Connected to Database** - All data is stored in MySQL
2. ✅ **Frontend Connected to Backend** - API calls working
3. ✅ **Authentication Working** - JWT tokens, login/register
4. ✅ **Data Persistence** - All CRUD operations save to database

### Optional Enhancements

- Setup email service (Gmail SMTP) for OTP verification
- Setup payment gateway (Razorpay) for subscriptions
- Setup SMS service (Twilio/MSG91) for phone verification
- Configure production database (AWS RDS, etc.)
- Setup CI/CD pipeline

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:

**Swagger UI**: http://localhost:8080/api/swagger-ui.html

This provides:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication testing

## 🔐 Default Admin Account

After running migrations, a default admin account is created:

```
Email: admin@farmgearconnect.com
Password: Admin@123
```

**⚠️ Change this password immediately in production!**

## 📝 Environment Variables Reference

### Backend (.env or application.yml)

| Variable | Description | Default |
|----------|-------------|---------|
| DB_USERNAME | MySQL username | farmgear |
| DB_PASSWORD | MySQL password | farmgear1234 |
| JWT_SECRET | JWT signing key | (generate secure key) |
| MINIO_ACCESS_KEY | MinIO access key | minioadmin |
| MINIO_SECRET_KEY | MinIO secret key | minioadmin123 |
| MAIL_USERNAME | SMTP email | - |
| MAIL_PASSWORD | SMTP password | - |
| REDIS_HOST | Redis host | localhost |
| CORS_ORIGINS | Allowed origins | http://localhost:3000 |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:8080/api |
| NEXT_PUBLIC_APP_URL | Frontend URL | http://localhost:3000 |

## 🎉 Success Checklist

- [ ] MySQL database created and running
- [ ] Backend application started successfully
- [ ] Flyway migrations completed (all tables created)
- [ ] Frontend application running
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] User data visible in MySQL database
- [ ] API calls working (check browser network tab)
- [ ] No CORS errors in browser console

## 🆘 Need Help?

1. Check backend logs: `backend/logs/farm-gear-connect.log`
2. Check browser console for frontend errors
3. Check MySQL error logs
4. Review API documentation at `/swagger-ui.html`
5. Verify all environment variables are set correctly

---

**Your application is now fully connected!** 🎊

Frontend ↔️ Backend ↔️ Database - All data is being persisted to MySQL.
