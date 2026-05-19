# 🚀 Quick Reference Card - Farm Gear Connect

## ⚡ Quick Start

```bash
# Start everything with Docker
docker-compose up -d

# Or use Windows script
.\start-dev.ps1 -Docker

# Verify setup
.\verify-setup.ps1
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Register new account |
| Backend API | http://localhost:8080/api | - |
| API Docs | http://localhost:8080/api/swagger-ui.html | - |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin123 |
| MySQL | localhost:3306 | farmgear / farmgear1234 |

## 📊 Database Quick Access

```bash
# Connect to MySQL
docker exec -it farmgearconnect-mysql mysql -u farmgear -pfarmgear1234 farmgearconnect

# Or local
mysql -u farmgear -pfarmgear1234 farmgearconnect
```

### Useful Queries

```sql
-- View all tables
SHOW TABLES;

-- Count records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings;

-- Recent users
SELECT id, full_name, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent bookings
SELECT b.booking_reference, b.status, e.title, u.full_name
FROM bookings b
JOIN equipment e ON b.equipment_id = e.id
JOIN users u ON b.farmer_id = u.id
ORDER BY b.created_at DESC
LIMIT 10;
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Check status
docker-compose ps

# Remove everything (including data!)
docker-compose down -v
```

## 🔧 Development Commands

### Backend

```bash
cd backend

# Run
mvn spring-boot:run

# Build
mvn clean package

# Test
mvn test
```

### Frontend

```bash
cd frontend

# Install
npm install

# Run dev
npm run dev

# Build
npm run build

# Run prod
npm start
```

## 🧪 Test API Endpoints

### Register User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test@1234",
    "phone": "1234567890",
    "role": "FARMER"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### Get Equipment (with auth)

```bash
TOKEN="your-access-token"

curl -X GET http://localhost:8080/api/marketplace \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 Troubleshooting

### Port in use

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <pid> /F

# Linux/Mac
lsof -i :8080
kill -9 <pid>
```

### Backend not starting

```bash
# Check logs
docker-compose logs backend

# Or local
tail -f backend/logs/farm-gear-connect.log
```

### Database connection failed

```bash
# Restart MySQL
docker-compose restart mysql

# Check MySQL logs
docker-compose logs mysql

# Test connection
mysql -u farmgear -pfarmgear1234 -h localhost -P 3306
```

### Frontend can't connect

1. Check backend: `curl http://localhost:8080/api/actuator/health`
2. Check `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
3. Clear browser cache
4. Check browser console for errors

## 📁 Important Files

### Configuration

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Docker services |
| `backend/src/main/resources/application.yml` | Backend config |
| `frontend/.env.local` | Frontend config |
| `.env.example` | Environment template |

### Documentation

| File | Purpose |
|------|---------|
| `GETTING_STARTED.md` | Start here! |
| `SETUP_GUIDE.md` | Detailed setup |
| `CONNECTION_GUIDE.md` | Architecture |
| `QUICK_REFERENCE.md` | This file |

### Scripts

| File | Purpose |
|------|---------|
| `start-dev.ps1` | Windows startup |
| `verify-setup.ps1` | Windows verification |
| `verify-setup.sh` | Linux/Mac verification |

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| equipment | Equipment listings |
| equipment_images | Equipment photos |
| bookings | Rental bookings |
| messages | Chat messages |
| notifications | User notifications |
| reviews | Equipment reviews |
| subscriptions | Owner subscriptions |
| coupons | Discount coupons |
| refresh_tokens | JWT tokens |
| otp_verifications | OTP codes |
| audit_logs | System logs |

## 🔐 Default Credentials

### Admin Account

```
Email: admin@farmgearconnect.com
Password: Admin@123
```

### MinIO

```
Username: minioadmin
Password: minioadmin123
```

### MySQL

```
Username: farmgear
Password: farmgear1234
Database: farmgearconnect
```

## 📊 Connection Flow

```
User Action (Frontend)
    ↓
HTTP Request (Axios)
    ↓
Backend API (Spring Boot)
    ↓
Service Layer
    ↓
Repository (JPA)
    ↓
MySQL Database
```

## 🎯 Common Tasks

### View Backend Logs

```bash
# Docker
docker-compose logs -f backend

# Local
tail -f backend/logs/farm-gear-connect.log
```

### Restart Backend

```bash
# Docker
docker-compose restart backend

# Local
# Ctrl+C and run: mvn spring-boot:run
```

### Clear Database

```bash
# WARNING: Deletes all data!
docker-compose down -v
docker-compose up -d
```

### Backup Database

```bash
# Backup
docker exec farmgearconnect-mysql mysqldump -u farmgear -pfarmgear1234 farmgearconnect > backup.sql

# Restore
docker exec -i farmgearconnect-mysql mysql -u farmgear -pfarmgear1234 farmgearconnect < backup.sql
```

## 🚨 Emergency Commands

### Everything is broken

```bash
# Nuclear option: Reset everything
docker-compose down -v
docker-compose up -d

# Wait 2 minutes for services to start
```

### Backend won't start

```bash
# Check Java version
java -version  # Should be 17+

# Clean and rebuild
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Frontend won't start

```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📞 Getting Help

1. **Check logs first**: `docker-compose logs -f`
2. **Run verification**: `.\verify-setup.ps1`
3. **Read docs**: [GETTING_STARTED.md](GETTING_STARTED.md)
4. **Check API docs**: http://localhost:8080/api/swagger-ui.html
5. **Verify database**: `mysql -u farmgear -p farmgearconnect`

## ✅ Health Checks

```bash
# Backend health
curl http://localhost:8080/api/actuator/health

# Frontend
curl http://localhost:3000

# MySQL
mysql -u farmgear -pfarmgear1234 -e "SELECT 1"

# Redis
redis-cli ping

# MinIO
curl http://localhost:9000/minio/health/live
```

## 🎓 Learning Resources

- **Spring Boot**: https://spring.io/projects/spring-boot
- **Next.js**: https://nextjs.org/docs
- **MySQL**: https://dev.mysql.com/doc/
- **Docker**: https://docs.docker.com/

---

**Keep this file handy for quick reference!** 📌
