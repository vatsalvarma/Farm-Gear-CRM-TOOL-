# FarmGearConnect - Agricultural Equipment Rental Platform

A comprehensive SaaS marketplace platform connecting farmers with agricultural equipment owners across India. Built with Spring Boot backend and Next.js frontend.
<img width="1916" height="868" alt="image" src="https://github.com/user-attachments/assets/4520c081-3490-487b-b313-684e3dc79eef" />


## 🚀 Features

### Core Features
- ✅ **Multilingual Support** - English & Telugu
- ✅ **Role-Based Access** - Farmer, Equipment Owner, Admin
- ✅ **Equipment Marketplace** - Browse, search, and filter equipment
- ✅ **GPS-Based Search** - Find nearby equipment
- ✅ **Booking System** - Complete booking workflow with approval
- ✅ **Secure Communication** - In-app chat with voice notes
- ✅ **Masked Calling** - Call without exposing phone numbers (Exotel/Twilio)
- ✅ **Payment Integration** - Razorpay for subscriptions and deposits
- ✅ **Admin Approval System** - Quality control for listings
- ✅ **Ratings & Reviews** - Community feedback system
- ✅ **Real-time Notifications** - WebSocket-based notifications
- ✅ **Subscription Management** - Annual/Monthly plans with coupon support
- ✅ **SMS Notifications** - Twilio/MSG91 integration
- ✅ **Image Upload** - MinIO S3-compatible storage
- ✅ **Email Verification** - OTP-based verification
- ✅ **Audit Logging** - Complete activity tracking

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.3
- **Language**: Java 17
- **Database**: MySQL 8.0+
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket + STOMP
- **API Documentation**: Swagger/OpenAPI

### Frontend (Next.js)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## 📋 Prerequisites

- **Java**: JDK 17 or higher
- **Node.js**: v18 or higher
- **MySQL**: 8.0 or higher
- **Redis**: 6.0 or higher (optional but recommended)
- **MinIO**: Latest version (or AWS S3)
- **Maven**: 3.9 or higher

## 🔌 Quick Start

### Option 1: Docker (Recommended)

The fastest way to get everything running:

```bash
# Start all services (MySQL, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
# API Docs: http://localhost:8080/api/swagger-ui.html
```

### Option 2: Windows Quick Start

```powershell
# Run the automated setup script
.\start-dev.ps1 -Docker

# Or for manual setup
.\start-dev.ps1 -Manual
```

### Option 3: Verify Setup

```bash
# Linux/Mac
bash verify-setup.sh

# Windows
.\verify-setup.ps1
```

📖 **For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**  
🔌 **For connection details, see [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md)**

## 🛠️ Manual Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd farmgearconnect
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE farmgearconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, etc.

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

**Backend Environment Variables** (`.env` or `application.yml`):

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/farmgearconnect
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_ACCESS_EXPIRY=3600000
JWT_REFRESH_EXPIRY=2592000000

# MinIO/S3
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=farmgearconnect

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# SMS (Twilio)
SMS_ENABLED=false
SMS_PROVIDER=TWILIO
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890

# Calling (Exotel)
CALLING_ENABLED=false
CALLING_PROVIDER=EXOTEL
EXOTEL_API_KEY=your-api-key
EXOTEL_API_TOKEN=your-api-token
EXOTEL_SID=your-sid
EXOTEL_VIRTUAL_NUMBER=your-virtual-number

# Payment (Razorpay)
PAYMENT_ENABLED=false
PAYMENT_PROVIDER=RAZORPAY
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Run development server
npm run dev
```

### 5. MinIO Setup (Local Development)

```bash
# Using Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# Access MinIO Console: http://localhost:9001
# Create bucket: farmgearconnect
```

### 6. Redis Setup (Optional)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
# Ubuntu: sudo apt-get install redis-server
# macOS: brew install redis
```

## 🚀 Running the Application

### Development Mode

**Backend:**
```bash
cd backend
mvn spring-boot:run
```
Backend will run on: http://localhost:8080

**Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

### Production Build

**Backend:**
```bash
cd backend
mvn clean package
java -jar target/farm-gear-connect-1.0.0.jar
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📱 Default Admin Account

After first run, create an admin account via database:

```sql
INSERT INTO users (id, full_name, email, password, role, email_verified, active, created_at, updated_at)
VALUES (
  UUID(),
  'Admin User',
  'admin@farmgearconnect.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIR.yvrcky', -- password: admin123
  'ADMIN',
  1,
  1,
  NOW(),
  NOW()
);
```

## 🔧 Configuration

### Application Ports
- Backend API: `8080`
- Frontend: `3000`
- MySQL: `3306`
- Redis: `6379`
- MinIO: `9000` (API), `9001` (Console)

### API Documentation
Once backend is running, access Swagger UI:
- http://localhost:8080/api/swagger-ui.html

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/refresh` - Refresh access token

### Equipment
- `GET /api/marketplace` - Search equipment
- `GET /api/marketplace/nearby` - Find nearby equipment
- `GET /api/equipment/{id}` - Get equipment details
- `POST /api/owner/equipment` - Create listing (OWNER)
- `PUT /api/owner/equipment/{id}` - Update listing (OWNER)
- `POST /api/owner/equipment/{id}/images` - Upload images (OWNER)
- `POST /api/owner/equipment/{id}/submit` - Submit for approval (OWNER)

### Bookings
- `POST /api/farmer/bookings` - Create booking (FARMER)
- `GET /api/farmer/bookings` - Get farmer bookings (FARMER)
- `GET /api/owner/bookings` - Get owner bookings (OWNER)
- `POST /api/owner/bookings/{id}/approve` - Approve booking (OWNER)
- `POST /api/owner/bookings/{id}/reject` - Reject booking (OWNER)
- `POST /api/bookings/{id}/cancel` - Cancel booking

### Admin
- `GET /api/admin/equipment/pending` - Pending approvals
- `POST /api/admin/equipment/{id}/approve` - Approve listing
- `POST /api/admin/equipment/{id}/reject` - Reject listing
- `GET /api/admin/users` - List users
- `GET /api/admin/analytics` - Platform analytics

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 Database Migrations

Flyway migrations are located in `backend/src/main/resources/db/migration/`

Migrations run automatically on application startup.

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- BCrypt password hashing (strength 12)
- CORS protection
- Rate limiting (10 auth requests/min, 100 API requests/min)
- SQL injection prevention (JPA/Hibernate)
- XSS protection headers
- CSRF protection for stateful endpoints
- Secure file upload validation

## 🌍 Internationalization

Supported languages:
- English (ENGLISH)
- Telugu (TELUGU)

Language files: `frontend/src/lib/i18n/translations.ts`

## 📈 Monitoring & Logging

- Application logs: `backend/logs/`
- Log rotation: 10MB max, 30-day retention
- Audit logs stored in database
- Spring Boot Actuator endpoints: `/actuator/health`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support, email support@farmgearconnect.com

## 🗺️ Roadmap

### Phase 1 (Current - MVP)
- ✅ Core marketplace functionality
- ✅ Booking system
- ✅ Admin approval workflow
- ✅ Basic payment integration

### Phase 2 (Upcoming)
- ⏳ Advanced analytics dashboard
- ⏳ Mobile app (React Native)
- ⏳ Equipment insurance integration
- ⏳ Maintenance tracking
- ⏳ Multi-state expansion

### Phase 3 (Future)
- ⏳ GPS live tracking
- ⏳ Delivery/logistics integration
- ⏳ AI-based equipment recommendations
- ⏳ Blockchain-based contracts
- ⏳ IoT equipment monitoring

## 🏆 Credits

Developed by the FarmGearConnect Team

---

**Version**: 1.0.0  
**Last Updated**: 2024
