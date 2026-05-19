# FarmGearConnect - Quick Start Guide

Get the FarmGearConnect platform running in under 10 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Java 17+ installed (`java -version`)
- ✅ Node.js 18+ installed (`node -v`)
- ✅ MySQL 8.0+ running
- ✅ Maven 3.9+ installed (`mvn -v`)

## 🚀 Quick Setup (Development)

### Step 1: Database Setup (2 minutes)

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE farmgearconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional)
CREATE USER 'farmgear'@'localhost' IDENTIFIED BY 'farmgear1234';
GRANT ALL PRIVILEGES ON farmgearconnect.* TO 'farmgear'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Backend Setup (3 minutes)

```bash
cd backend

# Create .env file (or edit application.yml)
cat > .env << EOF
DB_URL=jdbc:mysql://localhost:3306/farmgearconnect
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=8e8e6a2d3f4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=farmgearconnect
CORS_ORIGINS=http://localhost:3000
EOF

# Run backend
mvn spring-boot:run
```

Backend will start on: **http://localhost:8080**

### Step 3: Frontend Setup (2 minutes)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# Run frontend
npm run dev
```

Frontend will start on: **http://localhost:3000**

### Step 4: MinIO Setup (Optional - 2 minutes)

For image uploads, run MinIO:

```bash
# Using Docker
docker run -d -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# Access MinIO Console: http://localhost:9001
# Login: minioadmin / minioadmin
# Create bucket: farmgearconnect
```

## ✅ Verify Installation

1. **Backend Health Check**
   ```bash
   curl http://localhost:8080/api/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **Frontend**
   - Open: http://localhost:3000
   - You should see the FarmGearConnect landing page

3. **API Documentation**
   - Open: http://localhost:8080/api/swagger-ui.html
   - Browse available endpoints

## 🎯 First Steps

### 1. Create Admin Account

```sql
-- Connect to MySQL
mysql -u root -p farmgearconnect

-- Create admin user
INSERT INTO users (id, full_name, email, password, role, email_verified, active, preferred_language, created_at, updated_at)
VALUES (
  UUID(),
  'Admin User',
  'admin@farmgearconnect.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIR.yvrcky',
  'ADMIN',
  1,
  1,
  'ENGLISH',
  NOW(),
  NOW()
);
```

**Admin Credentials:**
- Email: `admin@farmgearconnect.com`
- Password: `admin123`

### 2. Register as Equipment Owner

1. Go to: http://localhost:3000/register?role=OWNER
2. Fill in the registration form
3. Verify email (check console logs for OTP if email not configured)
4. Login and add equipment

### 3. Register as Farmer

1. Go to: http://localhost:3000/register?role=FARMER
2. Complete registration
3. Browse marketplace
4. Create booking requests

## 🔧 Common Issues & Solutions

### Issue: Backend won't start

**Solution 1: Database connection**
```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Test connection
mysql -u root -p -e "SELECT 1"
```

**Solution 2: Port already in use**
```bash
# Check what's using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or change port in application.yml
```

### Issue: Frontend API calls fail

**Solution: CORS configuration**
```yaml
# In backend/src/main/resources/application.yml
app:
  cors:
    allowed-origins: http://localhost:3000,http://localhost:3001
```

### Issue: Images won't upload

**Solution: MinIO not running**
```bash
# Start MinIO
docker start <minio-container-id>

# Or disable image upload temporarily
# Set MINIO_ENABLED=false in application.yml
```

### Issue: Email verification not working

**Solution: Use console OTP**
```bash
# Check backend console logs for OTP
# Look for: "OTP for email verification: 123456"

# Or configure SMTP in application.yml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
```

## 🐳 Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MinIO Console: http://localhost:9001
- MySQL: localhost:3306

## 📱 Test the Application

### Test Flow 1: Equipment Owner Journey

1. Register as OWNER
2. Login
3. Go to Dashboard
4. Click "Add Equipment"
5. Fill equipment details
6. Upload 5 images
7. Submit for approval
8. Login as Admin
9. Approve the listing
10. Equipment appears in marketplace

### Test Flow 2: Farmer Journey

1. Register as FARMER
2. Login
3. Browse Marketplace
4. Click on equipment
5. Create booking request
6. Owner receives notification
7. Owner approves booking
8. Farmer can chat with owner

## 🎓 Next Steps

1. **Configure External Services**
   - Set up Twilio for SMS
   - Configure Exotel for masked calling
   - Add Razorpay for payments

2. **Customize**
   - Update branding in frontend
   - Modify email templates
   - Add custom equipment categories

3. **Deploy**
   - See README.md for production deployment
   - Configure environment variables
   - Set up SSL certificates

## 📚 Useful Commands

```bash
# Backend
mvn clean install          # Build
mvn spring-boot:run       # Run
mvn test                  # Test
mvn package               # Package JAR

# Frontend
npm install               # Install dependencies
npm run dev              # Development server
npm run build            # Production build
npm run lint             # Lint code

# Database
mysql -u root -p farmgearconnect  # Connect to DB
mysqldump -u root -p farmgearconnect > backup.sql  # Backup
mysql -u root -p farmgearconnect < backup.sql      # Restore

# Docker
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
docker-compose ps         # List services
```

## 🆘 Need Help?

- **API Documentation**: http://localhost:8080/api/swagger-ui.html
- **Check Logs**: 
  - Backend: `backend/logs/application.log`
  - Frontend: Browser console
- **Database**: Use MySQL Workbench or DBeaver to inspect data

## 🎉 Success!

If you can:
- ✅ Access the landing page
- ✅ Register and login
- ✅ See equipment in marketplace
- ✅ Create bookings

**Congratulations! Your FarmGearConnect platform is running!** 🚀

---

**Quick Links:**
- Landing Page: http://localhost:3000
- Admin Panel: http://localhost:3000/admin/dashboard
- API Docs: http://localhost:8080/api/swagger-ui.html
- MinIO Console: http://localhost:9001
