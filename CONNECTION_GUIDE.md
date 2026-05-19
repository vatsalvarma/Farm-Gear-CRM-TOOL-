# 🔌 Frontend-Backend-Database Connection Guide

## Overview

This document explains how the Farm Gear Connect application components are connected and how data flows through the system.

## 🏗️ System Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js (Port 3000)
│   (React)       │  - UI Components
└────────┬────────┘  - API Client (Axios)
         │           - State Management (Zustand)
         │
         │ HTTP/REST API
         │ WebSocket (Chat)
         ▼
┌─────────────────┐
│   Backend       │  Spring Boot (Port 8080)
│   (Java)        │  - REST Controllers
└────────┬────────┘  - Business Logic
         │           - Security (JWT)
         │           - Validation
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │ MySQL  │    │ Redis  │    │ MinIO  │    │ Email  │
    │   DB   │    │ Cache  │    │Storage │    │ SMTP   │
    └────────┘    └────────┘    └────────┘    └────────┘
```

## 📡 Connection Details

### 1. Frontend → Backend Connection

**Configuration File**: `frontend/src/lib/api/client.ts`

```typescript
// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// Axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})
```

**Environment Variable**: `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**How it works**:
1. Frontend makes HTTP requests using Axios
2. Requests include JWT token in Authorization header
3. Backend validates token and processes request
4. Response is returned to frontend

**Example API Call**:
```typescript
// Login request
const response = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
})

// Get equipment list
const equipment = await apiClient.get('/equipment')

// Create booking
const booking = await apiClient.post('/bookings', bookingData)
```

### 2. Backend → Database Connection

**Configuration File**: `backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/farmgearconnect?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: ${DB_USERNAME:farmgear}
    password: ${DB_PASSWORD:farmgear1234}
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  jpa:
    hibernate:
      ddl-auto: none  # Schema managed by Flyway
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
```

**How it works**:
1. Spring Boot connects to MySQL on startup
2. Flyway runs database migrations (creates tables)
3. JPA/Hibernate manages entity-to-table mapping
4. Repositories provide CRUD operations

**Example Data Flow**:
```java
// Controller receives request
@PostMapping("/equipment")
public ResponseEntity<Equipment> createEquipment(@RequestBody EquipmentRequest request) {
    // Service layer processes business logic
    Equipment equipment = equipmentService.create(request);
    return ResponseEntity.ok(equipment);
}

// Service layer
public Equipment create(EquipmentRequest request) {
    Equipment equipment = new Equipment();
    equipment.setTitle(request.getTitle());
    // ... set other fields
    
    // Repository saves to database
    return equipmentRepository.save(equipment);  // ← Data saved to MySQL
}

// Repository (JPA)
public interface EquipmentRepository extends JpaRepository<Equipment, String> {
    // Hibernate generates SQL: INSERT INTO equipment (...)
}
```

### 3. Database Schema Management

**Flyway Migrations**: `backend/src/main/resources/db/migration/`

```
V1__init_schema.sql       → Creates all tables
V2__seed_data.sql         → Inserts initial data
V3__fix_passwords.sql     → Updates password hashes
V4__profile_photo_longtext.sql → Alters column type
```

**Migration Process**:
1. Backend starts
2. Flyway checks `flyway_schema_history` table
3. Runs any pending migrations in order
4. Updates schema version

**Tables Created**:
- `users` - User accounts
- `equipment` - Equipment listings
- `equipment_images` - Equipment photos
- `bookings` - Rental bookings
- `messages` - Chat messages
- `notifications` - User notifications
- `reviews` - Equipment reviews
- `subscriptions` - Owner subscriptions
- `coupons` - Discount coupons
- `refresh_tokens` - JWT refresh tokens
- `otp_verifications` - OTP codes
- `audit_logs` - System audit trail

## 🔐 Authentication Flow

```
1. User enters credentials in frontend
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials against users table
   ↓
4. Backend generates JWT tokens (access + refresh)
   ↓
5. Backend saves refresh token to refresh_tokens table
   ↓
6. Frontend receives tokens and stores in localStorage
   ↓
7. Frontend includes access token in all subsequent requests
   ↓
8. Backend validates token on each request
   ↓
9. If token expired, frontend uses refresh token to get new access token
```

**Token Storage**:
- **Frontend**: `localStorage.setItem('accessToken', token)`
- **Backend**: `refresh_tokens` table in MySQL

## 📊 Data Flow Examples

### Example 1: User Registration

```
Frontend                Backend                 Database
   │                       │                       │
   │  POST /auth/register  │                       │
   ├──────────────────────>│                       │
   │                       │  Check if email exists│
   │                       ├──────────────────────>│
   │                       │  SELECT * FROM users  │
   │                       │<──────────────────────┤
   │                       │                       │
   │                       │  Hash password        │
   │                       │  Create user entity   │
   │                       │                       │
   │                       │  INSERT INTO users    │
   │                       ├──────────────────────>│
   │                       │  User saved           │
   │                       │<──────────────────────┤
   │                       │                       │
   │  Response with tokens │                       │
   │<──────────────────────┤                       │
   │                       │                       │
```

### Example 2: Creating Equipment Listing

```
Frontend                Backend                 Database
   │                       │                       │
   │  POST /equipment      │                       │
   │  (with auth token)    │                       │
   ├──────────────────────>│                       │
   │                       │  Validate JWT token   │
   │                       │  Extract user ID      │
   │                       │                       │
   │                       │  Validate request     │
   │                       │  Check user is OWNER  │
   │                       │                       │
   │                       │  INSERT INTO equipment│
   │                       ├──────────────────────>│
   │                       │  Equipment saved      │
   │                       │<──────────────────────┤
   │                       │                       │
   │  Upload images        │                       │
   ├──────────────────────>│                       │
   │                       │  Upload to MinIO      │
   │                       │  INSERT INTO          │
   │                       │  equipment_images     │
   │                       ├──────────────────────>│
   │                       │<──────────────────────┤
   │                       │                       │
   │  Response with        │                       │
   │  equipment data       │                       │
   │<──────────────────────┤                       │
   │                       │                       │
```

### Example 3: Booking Equipment

```
Frontend                Backend                 Database
   │                       │                       │
   │  POST /bookings       │                       │
   ├──────────────────────>│                       │
   │                       │  Validate token       │
   │                       │  Get user (farmer)    │
   │                       │                       │
   │                       │  Check availability   │
   │                       ├──────────────────────>│
   │                       │  SELECT * FROM        │
   │                       │  bookings WHERE...    │
   │                       │<──────────────────────┤
   │                       │                       │
   │                       │  Calculate total      │
   │                       │  Create booking       │
   │                       │                       │
   │                       │  INSERT INTO bookings │
   │                       ├──────────────────────>│
   │                       │<──────────────────────┤
   │                       │                       │
   │                       │  Create notification  │
   │                       │  for owner            │
   │                       ├──────────────────────>│
   │                       │  INSERT INTO          │
   │                       │  notifications        │
   │                       │<──────────────────────┤
   │                       │                       │
   │  Response with        │                       │
   │  booking details      │                       │
   │<──────────────────────┤                       │
   │                       │                       │
```

## 🔄 Real-time Features (WebSocket)

**Chat Messages**:

```
Frontend                Backend                 Database
   │                       │                       │
   │  Connect WebSocket    │                       │
   │  /ws                  │                       │
   ├──────────────────────>│                       │
   │  Connected            │                       │
   │<──────────────────────┤                       │
   │                       │                       │
   │  Send message         │                       │
   │  /app/chat.send       │                       │
   ├──────────────────────>│                       │
   │                       │  Save message         │
   │                       ├──────────────────────>│
   │                       │  INSERT INTO messages │
   │                       │<──────────────────────┤
   │                       │                       │
   │                       │  Broadcast to receiver│
   │  Receive message      │  /topic/messages/{id} │
   │<──────────────────────┤                       │
   │                       │                       │
```

## 🗄️ Database Queries

### Common Queries Generated by JPA

**Find User by Email**:
```sql
SELECT * FROM users WHERE email = ? AND deleted_at IS NULL
```

**Get Available Equipment**:
```sql
SELECT * FROM equipment 
WHERE status = 'APPROVED' 
  AND deleted_at IS NULL 
  AND district = ?
ORDER BY created_at DESC
```

**Check Booking Conflicts**:
```sql
SELECT COUNT(*) FROM bookings 
WHERE equipment_id = ? 
  AND status IN ('PENDING', 'APPROVED', 'ACTIVE')
  AND (
    (start_date <= ? AND end_date >= ?) OR
    (start_date <= ? AND end_date >= ?)
  )
```

**Get User's Bookings**:
```sql
SELECT b.*, e.title, e.category, u.full_name as owner_name
FROM bookings b
JOIN equipment e ON b.equipment_id = e.id
JOIN users u ON b.owner_id = u.id
WHERE b.farmer_id = ?
ORDER BY b.created_at DESC
```

## 🔍 Verifying Connections

### 1. Check Backend-Database Connection

```bash
# Check backend logs
tail -f backend/logs/farm-gear-connect.log

# Look for:
# ✓ "HikariPool-1 - Start completed"
# ✓ "Flyway migration completed successfully"
# ✓ "Started FarmGearConnectApplication"
```

### 2. Check Frontend-Backend Connection

```bash
# Open browser console (F12)
# Look for API calls in Network tab

# Should see:
# ✓ POST http://localhost:8080/api/auth/login
# ✓ GET http://localhost:8080/api/equipment
# ✓ Status: 200 OK
```

### 3. Verify Data in Database

```sql
-- Connect to MySQL
mysql -u farmgear -p farmgearconnect

-- Check tables exist
SHOW TABLES;

-- Check data is being stored
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM equipment;
SELECT COUNT(*) FROM bookings;

-- View recent data
SELECT id, full_name, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🛠️ Troubleshooting

### Frontend can't connect to Backend

**Symptom**: Network errors, CORS errors

**Solutions**:
1. Check backend is running: `curl http://localhost:8080/api/actuator/health`
2. Verify NEXT_PUBLIC_API_URL in `frontend/.env.local`
3. Check CORS settings in `backend/src/main/resources/application.yml`
4. Clear browser cache and localStorage

### Backend can't connect to Database

**Symptom**: "Access denied", "Unknown database"

**Solutions**:
1. Check MySQL is running: `mysql -u farmgear -p`
2. Verify database exists: `SHOW DATABASES;`
3. Check credentials in `application.yml`
4. Grant permissions: `GRANT ALL PRIVILEGES ON farmgearconnect.* TO 'farmgear'@'localhost';`

### Data not being saved

**Symptom**: API returns success but data not in database

**Solutions**:
1. Check backend logs for errors
2. Verify transaction is committed (not rolled back)
3. Check database constraints (foreign keys, unique constraints)
4. Verify entity annotations (@Entity, @Table, @Column)

### Flyway migration failed

**Symptom**: "Migration failed", "Table already exists"

**Solutions**:
1. Check `flyway_schema_history` table
2. Fix failed migration
3. Repair: `mvn flyway:repair`
4. Or drop database and recreate (development only!)

## 📝 Configuration Checklist

- [ ] MySQL database created: `farmgearconnect`
- [ ] MySQL user created with permissions
- [ ] Backend `application.yml` configured
- [ ] Frontend `.env.local` configured
- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] Flyway migrations completed
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] User data visible in database
- [ ] API calls working (check browser network tab)
- [ ] No CORS errors

## 🎯 Testing the Full Stack

### 1. Register a User

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

### 2. Verify in Database

```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

### 3. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### 4. Use Token to Access Protected Endpoint

```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🎉 Success!

If all the above works, your application is fully connected:

✅ Frontend communicates with Backend  
✅ Backend connects to Database  
✅ Data is persisted in MySQL  
✅ Authentication works end-to-end  
✅ All CRUD operations save to database  

---

**Next Steps**: Deploy to production, configure SSL, setup monitoring, and add more features!
