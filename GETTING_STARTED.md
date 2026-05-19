# 🚀 Getting Started with Farm Gear Connect

Welcome! This guide will help you get the Farm Gear Connect application up and running with the frontend connected to the backend and all data stored in the database.

## 📚 Documentation Overview

We've created several guides to help you:

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** (this file) - Start here!
2. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
3. **[CONNECTION_GUIDE.md](CONNECTION_GUIDE.md)** - How components connect
4. **[README.md](README.md)** - Project overview and features

## ⚡ Quick Start (5 Minutes)

### Prerequisites Check

Before starting, ensure you have:

- [ ] **Docker Desktop** installed and running
- [ ] **Git** installed
- [ ] At least **4GB RAM** available
- [ ] Ports **3000, 8080, 3306, 6379, 9000** available

### Start Everything with Docker

```bash
# 1. Clone the repository (if not already done)
git clone <repository-url>
cd farmgearconnect

# 2. Start all services
docker-compose up -d

# 3. Wait for services to start (about 1-2 minutes)
# Watch the logs
docker-compose logs -f backend

# 4. Open the application
# Frontend: http://localhost:3000
# Backend API Docs: http://localhost:8080/api/swagger-ui.html
```

That's it! 🎉 Your application is now running with:
- ✅ Frontend connected to Backend
- ✅ Backend connected to MySQL Database
- ✅ All data being stored in the database
- ✅ Redis cache ready
- ✅ MinIO storage ready

### Verify Everything is Working

```bash
# Run verification script
# Windows:
.\verify-setup.ps1

# Linux/Mac:
bash verify-setup.sh
```

## 🖥️ Windows Users

We've created a convenient PowerShell script for you:

```powershell
# Start with Docker (recommended)
.\start-dev.ps1 -Docker

# Or start manually (if you have MySQL, etc. installed)
.\start-dev.ps1 -Manual

# Get help
.\start-dev.ps1 -Help
```

## 🧪 Test the Application

### 1. Register a New User

1. Open http://localhost:3000
2. Click "Register"
3. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: Test@1234
   - Phone: 1234567890
   - Role: Farmer
4. Click "Register"

### 2. Verify Data in Database

```bash
# Connect to MySQL (in Docker)
docker exec -it farmgearconnect-mysql mysql -u farmgear -pfarmgear1234 farmgearconnect

# Or if MySQL is local
mysql -u farmgear -pfarmgear1234 farmgearconnect

# Check the user was created
SELECT id, full_name, email, role, created_at FROM users;

# You should see your test user!
```

### 3. Login and Explore

1. Login with your test credentials
2. Browse equipment listings
3. Create a booking
4. Check the database again to see the booking data

```sql
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;
```

## 🔍 Understanding the Connection

### Data Flow

```
User Action (Frontend)
    ↓
HTTP Request (Axios)
    ↓
Backend API (Spring Boot)
    ↓
Service Layer (Business Logic)
    ↓
Repository (JPA/Hibernate)
    ↓
MySQL Database (Data Stored)
```

### Example: Creating a Booking

1. **Frontend**: User fills booking form and clicks "Book"
2. **API Call**: `POST http://localhost:8080/api/farmer/bookings`
3. **Backend**: Validates request, checks availability
4. **Database**: Inserts row into `bookings` table
5. **Response**: Returns booking details to frontend
6. **Frontend**: Shows success message

**Verify in Database**:
```sql
SELECT 
    b.id,
    b.booking_reference,
    b.status,
    e.title as equipment_name,
    u.full_name as farmer_name
FROM bookings b
JOIN equipment e ON b.equipment_id = e.id
JOIN users u ON b.farmer_id = u.id
ORDER BY b.created_at DESC;
```

## 📊 Database Tables

All data is stored in MySQL. Here are the main tables:

| Table | Purpose | Example Data |
|-------|---------|--------------|
| `users` | User accounts | Farmers, Owners, Admins |
| `equipment` | Equipment listings | Tractors, Harvesters, etc. |
| `bookings` | Rental bookings | Booking details, dates, status |
| `messages` | Chat messages | User conversations |
| `notifications` | User notifications | Booking updates, approvals |
| `reviews` | Equipment reviews | Ratings and comments |
| `subscriptions` | Owner subscriptions | Payment and plan details |

### View All Tables

```sql
-- Show all tables
SHOW TABLES;

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
```

## 🎯 Common Tasks

### View Backend Logs

```bash
# Docker
docker-compose logs -f backend

# Local
tail -f backend/logs/farm-gear-connect.log
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v
```

### Access Database

```bash
# Using Docker
docker exec -it farmgearconnect-mysql mysql -u farmgear -pfarmgear1234 farmgearconnect

# Using local MySQL
mysql -u farmgear -pfarmgear1234 farmgearconnect
```

### Access MinIO Console

1. Open http://localhost:9001
2. Login: `minioadmin` / `minioadmin123`
3. View uploaded images in `farmgearconnect` bucket

### View API Documentation

Open http://localhost:8080/api/swagger-ui.html

This provides:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication testing

## 🐛 Troubleshooting

### "Port already in use"

```bash
# Check what's using the port
# Windows:
netstat -ano | findstr :8080

# Linux/Mac:
lsof -i :8080

# Stop the process or change the port in docker-compose.yml
```

### "Cannot connect to database"

```bash
# Check if MySQL is running
docker-compose ps

# Check MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### "Frontend can't connect to backend"

1. Check backend is running: `curl http://localhost:8080/api/actuator/health`
2. Check `frontend/.env.local` has correct API URL
3. Check browser console for CORS errors
4. Verify CORS settings in `backend/src/main/resources/application.yml`

### "Flyway migration failed"

```bash
# Check migration status
docker exec -it farmgearconnect-mysql mysql -u farmgear -pfarmgear1234 farmgearconnect -e "SELECT * FROM flyway_schema_history;"

# If needed, drop and recreate database (DEVELOPMENT ONLY!)
docker-compose down -v
docker-compose up -d
```

## 📖 Next Steps

### For Developers

1. **Explore the Code**
   - Backend: `backend/src/main/java/com/farmgearconnect/`
   - Frontend: `frontend/src/`
   - Database: `backend/src/main/resources/db/migration/`

2. **Read the Documentation**
   - [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
   - [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Architecture details
   - [README.md](README.md) - Features and API reference

3. **Make Changes**
   - Backend changes: Edit Java files, restart backend
   - Frontend changes: Edit TypeScript files, hot reload automatic
   - Database changes: Create new Flyway migration

### For Testing

1. **Test User Registration**
   - Register as Farmer
   - Register as Equipment Owner
   - Verify in database

2. **Test Equipment Listing**
   - Login as Owner
   - Create equipment listing
   - Upload images
   - Submit for approval

3. **Test Booking Flow**
   - Login as Farmer
   - Browse equipment
   - Create booking
   - Login as Owner
   - Approve booking

4. **Test Chat**
   - Send messages between users
   - Check messages table in database

### For Production

1. **Security**
   - Change default passwords
   - Generate secure JWT secret
   - Configure SSL/TLS
   - Setup firewall rules

2. **Database**
   - Use managed database (AWS RDS, etc.)
   - Setup backups
   - Configure replication

3. **Deployment**
   - Build production images
   - Setup CI/CD pipeline
   - Configure monitoring
   - Setup logging aggregation

## 🎓 Learning Resources

### Spring Boot (Backend)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)

### Next.js (Frontend)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Flyway Documentation](https://flywaydb.org/documentation/)

## 💡 Tips

1. **Use Docker for Development** - It's the easiest way to get started
2. **Check Logs First** - Most issues can be diagnosed from logs
3. **Use Swagger UI** - Test API endpoints before writing frontend code
4. **Verify in Database** - Always check if data is actually being stored
5. **Read Error Messages** - They usually tell you exactly what's wrong

## ✅ Success Checklist

- [ ] Docker services running
- [ ] Backend accessible at http://localhost:8080
- [ ] Frontend accessible at http://localhost:3000
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] User data visible in MySQL database
- [ ] Can create equipment listing (as Owner)
- [ ] Can create booking (as Farmer)
- [ ] Booking data visible in database
- [ ] No errors in browser console
- [ ] No errors in backend logs

## 🆘 Getting Help

If you're stuck:

1. **Check the logs** - Backend and database logs
2. **Run verification script** - `verify-setup.ps1` or `verify-setup.sh`
3. **Read the guides** - SETUP_GUIDE.md and CONNECTION_GUIDE.md
4. **Check Swagger UI** - Test API endpoints directly
5. **Verify database** - Check if data is being stored

## 🎉 You're Ready!

Congratulations! You now have:

✅ **Frontend** - Running on http://localhost:3000  
✅ **Backend** - Running on http://localhost:8080  
✅ **Database** - MySQL with all tables created  
✅ **Connection** - Frontend ↔ Backend ↔ Database  
✅ **Data Storage** - All operations persist to database  

Start building amazing features! 🚀

---

**Need more details?** Check out:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Architecture and data flow
- [README.md](README.md) - Project overview and API reference
