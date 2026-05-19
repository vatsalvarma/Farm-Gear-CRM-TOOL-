# 🏗️ Farm Gear Connect - System Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Frontend (Next.js + React)                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │   Pages    │  │ Components │  │   Stores   │        │  │
│  │  │  (Routes)  │  │    (UI)    │  │  (Zustand) │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  │         │               │                │               │  │
│  │         └───────────────┴────────────────┘               │  │
│  │                         │                                │  │
│  │                  ┌──────▼──────┐                         │  │
│  │                  │ API Client  │                         │  │
│  │                  │   (Axios)   │                         │  │
│  │                  └──────┬──────┘                         │  │
│  └─────────────────────────┼────────────────────────────────┘  │
│                            │                                   │
│                    HTTP/REST + WebSocket                       │
│                            │                                   │
└────────────────────────────┼───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Backend (Spring Boot + Java)                     │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │              Security Layer                        │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │  │
│  │  │  │   JWT    │  │  CORS    │  │   Rate   │        │ │  │
│  │  │  │  Filter  │  │  Config  │  │  Limit   │        │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘        │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                         │                               │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │              Controller Layer                      │ │  │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │ │  │
│  │  │  │ Auth │ │ User │ │Equip │ │Booking│ │Admin │   │ │  │
│  │  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                         │                               │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │               Service Layer                        │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │  │
│  │  │  │ Business │  │Validation│  │  Logic   │        │ │  │
│  │  │  │  Logic   │  │  Rules   │  │Processing│        │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘        │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                         │                               │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │             Repository Layer                       │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │  │
│  │  │  │   JPA    │  │Hibernate │  │  JDBC    │        │ │  │
│  │  │  │Interface │  │  ORM     │  │ Driver   │        │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘        │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                   │
└────────────────────────────┼───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                       DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    MySQL     │  │    Redis     │  │    MinIO     │        │
│  │  (Database)  │  │   (Cache)    │  │  (Storage)   │        │
│  │              │  │              │  │              │        │
│  │  • users     │  │  • sessions  │  │  • images    │        │
│  │  • equipment │  │  • tokens    │  │  • documents │        │
│  │  • bookings  │  │  • cache     │  │  • files     │        │
│  │  • messages  │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### 1. User Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Fill registration form
     ▼
┌─────────────────┐
│   Frontend      │
│  (React Form)   │
└────┬────────────┘
     │ 2. POST /api/auth/register
     │    { fullName, email, password, role }
     ▼
┌─────────────────┐
│  API Client     │
│   (Axios)       │
└────┬────────────┘
     │ 3. HTTP Request with JSON body
     ▼
┌─────────────────────────────────────────┐
│           Backend                       │
│  ┌─────────────────────────────────┐   │
│  │  AuthController                 │   │
│  │  @PostMapping("/auth/register") │   │
│  └────┬────────────────────────────┘   │
│       │ 4. Validate request             │
│       ▼                                 │
│  ┌─────────────────────────────────┐   │
│  │  AuthService                    │   │
│  │  • Check if email exists        │   │
│  │  • Hash password (BCrypt)       │   │
│  │  • Create User entity           │   │
│  └────┬────────────────────────────┘   │
│       │ 5. Save user                    │
│       ▼                                 │
│  ┌─────────────────────────────────┐   │
│  │  UserRepository                 │   │
│  │  (JPA Interface)                │   │
│  └────┬────────────────────────────┘   │
│       │ 6. Generate SQL                 │
│       ▼                                 │
│  ┌─────────────────────────────────┐   │
│  │  Hibernate                      │   │
│  │  INSERT INTO users (...)        │   │
│  └────┬────────────────────────────┘   │
└───────┼─────────────────────────────────┘
        │ 7. Execute SQL
        ▼
┌─────────────────┐
│     MySQL       │
│   Database      │
│                 │
│  users table:   │
│  ┌───────────┐  │
│  │ id        │  │
│  │ full_name │  │
│  │ email     │  │
│  │ password  │  │
│  │ role      │  │
│  │ ...       │  │
│  └───────────┘  │
└────┬────────────┘
     │ 8. Return saved user
     ▼
┌─────────────────────────────────────────┐
│           Backend                       │
│  ┌─────────────────────────────────┐   │
│  │  AuthService                    │   │
│  │  • Generate JWT tokens          │   │
│  │  • Save refresh token to DB     │   │
│  └────┬────────────────────────────┘   │
│       │ 9. Return response              │
│       ▼                                 │
│  ┌─────────────────────────────────┐   │
│  │  AuthController                 │   │
│  │  return ResponseEntity.ok(...)  │   │
│  └────┬────────────────────────────┘   │
└───────┼─────────────────────────────────┘
        │ 10. HTTP Response
        │     { accessToken, refreshToken, user }
        ▼
┌─────────────────┐
│   Frontend      │
│  • Store tokens │
│  • Redirect     │
└─────────────────┘
```

### 2. Equipment Listing Flow

```
Owner → Frontend → Backend → Database

1. Owner fills equipment form
2. Frontend: POST /api/owner/equipment
3. Backend validates ownership
4. Backend: INSERT INTO equipment
5. Owner uploads images
6. Backend stores in MinIO
7. Backend: INSERT INTO equipment_images
8. Database stores all data
9. Response returned to frontend
```

### 3. Booking Flow

```
Farmer → Frontend → Backend → Database → Notification

1. Farmer selects equipment and dates
2. Frontend: POST /api/farmer/bookings
3. Backend checks availability:
   SELECT * FROM bookings WHERE equipment_id = ? AND ...
4. If available:
   INSERT INTO bookings (...)
5. Create notification for owner:
   INSERT INTO notifications (...)
6. Return booking details
7. Frontend shows success
8. Owner receives notification
```

## 🗄️ Database Schema

### Entity Relationships

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       │ 1:N (owner)
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  equipment   │   │ subscriptions│
└──────┬───────┘   └──────────────┘
       │
       │ 1:N
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│equipment_    │   │   bookings   │
│  images      │   └──────┬───────┘
└──────────────┘          │
                          │ 1:1
                          ▼
                   ┌──────────────┐
                   │   reviews    │
                   └──────────────┘

┌──────────────┐
│    users     │
└──────┬───────┘
       │
       │ 1:N (sender/receiver)
       ▼
┌──────────────┐
│   messages   │
└──────────────┘

┌──────────────┐
│    users     │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│notifications │
└──────────────┘
```

### Key Tables

```sql
-- Users (Farmers, Owners, Admins)
users
├── id (PK)
├── full_name
├── email (UNIQUE)
├── password (BCrypt)
├── role (FARMER/OWNER/ADMIN)
├── phone
├── location (state, district, village)
├── coordinates (latitude, longitude)
└── timestamps

-- Equipment Listings
equipment
├── id (PK)
├── owner_id (FK → users)
├── title
├── description
├── category
├── pricing (per_hour, per_day)
├── location
├── status (DRAFT/PENDING/APPROVED/REJECTED)
└── timestamps

-- Equipment Images
equipment_images
├── id (PK)
├── equipment_id (FK → equipment)
├── image_url (MinIO URL)
├── is_primary
└── sort_order

-- Bookings
bookings
├── id (PK)
├── equipment_id (FK → equipment)
├── farmer_id (FK → users)
├── owner_id (FK → users)
├── dates (start_date, end_date)
├── amounts (total, deposit)
├── status (PENDING/APPROVED/REJECTED/COMPLETED)
└── timestamps

-- Messages (Chat)
messages
├── id (PK)
├── sender_id (FK → users)
├── receiver_id (FK → users)
├── booking_id (FK → bookings, optional)
├── content
├── message_type (TEXT/IMAGE/VOICE)
├── is_read
└── timestamps

-- Notifications
notifications
├── id (PK)
├── user_id (FK → users)
├── title
├── body
├── type
├── reference_id
├── is_read
└── timestamps
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CORS Protection                                     │
│     ┌─────────────────────────────────────────────┐    │
│     │ Allowed Origins: http://localhost:3000      │    │
│     │ Allowed Methods: GET, POST, PUT, DELETE     │    │
│     │ Allowed Headers: Authorization, Content-Type│    │
│     └─────────────────────────────────────────────┘    │
│                                                         │
│  2. JWT Authentication                                  │
│     ┌─────────────────────────────────────────────┐    │
│     │ • Access Token (1 hour)                     │    │
│     │ • Refresh Token (30 days)                   │    │
│     │ • Stored in database                        │    │
│     │ • Validated on each request                 │    │
│     └─────────────────────────────────────────────┘    │
│                                                         │
│  3. Password Security                                   │
│     ┌─────────────────────────────────────────────┐    │
│     │ • BCrypt hashing (strength 12)              │    │
│     │ • Never stored in plain text                │    │
│     │ • Validated on login                        │    │
│     └─────────────────────────────────────────────┘    │
│                                                         │
│  4. Rate Limiting                                       │
│     ┌─────────────────────────────────────────────┐    │
│     │ • Auth endpoints: 10 req/min                │    │
│     │ • API endpoints: 100 req/min                │    │
│     │ • Prevents brute force attacks              │    │
│     └─────────────────────────────────────────────┘    │
│                                                         │
│  5. Input Validation                                    │
│     ┌─────────────────────────────────────────────┐    │
│     │ • @Valid annotations                        │    │
│     │ • Zod schemas (frontend)                    │    │
│     │ • SQL injection prevention (JPA)            │    │
│     │ • XSS protection                            │    │
│     └─────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Real-time Communication (WebSocket)

```
┌─────────────┐                           ┌─────────────┐
│  Frontend   │                           │  Frontend   │
│   User A    │                           │   User B    │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │ 1. Connect WebSocket                    │
       ├────────────────┐                        │
       │                │                        │
       │                ▼                        │
       │         ┌──────────────┐                │
       │         │   Backend    │                │
       │         │  WebSocket   │                │
       │         │   Server     │                │
       │         └──────┬───────┘                │
       │                │                        │
       │ 2. Subscribe   │                        │
       │ /topic/messages/{userId}                │
       ├───────────────>│                        │
       │                │                        │
       │                │ 3. Connect & Subscribe │
       │                │<───────────────────────┤
       │                │                        │
       │ 4. Send message│                        │
       │ /app/chat.send │                        │
       ├───────────────>│                        │
       │                │                        │
       │                │ 5. Save to database    │
       │                ├──────────────────┐     │
       │                │                  │     │
       │                │  INSERT INTO     │     │
       │                │  messages (...)  │     │
       │                │                  │     │
       │                │<─────────────────┘     │
       │                │                        │
       │                │ 6. Broadcast           │
       │                │ /topic/messages/{B}    │
       │                ├───────────────────────>│
       │                │                        │
       │                │ 7. User B receives     │
       │                │                        │
       │                │ 8. Mark as delivered   │
       │                │<───────────────────────┤
       │                │                        │
       │                │ 9. Update database     │
       │                ├──────────────────┐     │
       │                │  UPDATE messages │     │
       │                │  SET is_read=1   │     │
       │                │<─────────────────┘     │
       │                │                        │
```

## 📦 Deployment Architecture

### Development

```
┌─────────────────────────────────────────────────────┐
│              Docker Compose                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  MySQL   │  │  Redis   │  │  MinIO   │        │
│  │  :3306   │  │  :6379   │  │  :9000   │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │            Backend                           │  │
│  │            :8080                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │            Frontend                          │  │
│  │            :3000                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Production (Recommended)

```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer                      │
│                  (Nginx/AWS ALB)                    │
└────────────┬────────────────────────┬───────────────┘
             │                        │
             ▼                        ▼
┌─────────────────────┐    ┌─────────────────────┐
│   Frontend          │    │   Backend           │
│   (Vercel/Netlify)  │    │   (AWS EC2/ECS)     │
│   CDN Cached        │    │   Auto-scaling      │
└─────────────────────┘    └──────────┬──────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
           ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
           │   MySQL     │   │   Redis     │  │   S3/MinIO  │
           │   (RDS)     │   │ (ElastiCache│  │  (Storage)  │
           │  Replicated │   │   Cluster)  │  │             │
           └─────────────┘   └─────────────┘  └─────────────┘
```

## 🎯 Key Design Decisions

### 1. Why JPA/Hibernate?
- **Automatic SQL generation**
- **Type-safe queries**
- **Relationship management**
- **Caching support**

### 2. Why Flyway?
- **Version control for database**
- **Automatic migrations**
- **Rollback support**
- **Team collaboration**

### 3. Why JWT?
- **Stateless authentication**
- **Scalable**
- **Mobile-friendly**
- **Secure**

### 4. Why Next.js?
- **Server-side rendering**
- **SEO-friendly**
- **Fast page loads**
- **Built-in routing**

### 5. Why Docker?
- **Consistent environments**
- **Easy deployment**
- **Isolated services**
- **Scalable**

## 📊 Performance Considerations

### Database Optimization
- **Indexes** on frequently queried columns
- **Connection pooling** (HikariCP)
- **Query optimization** (JPA criteria)
- **Caching** with Redis

### API Optimization
- **Pagination** for large datasets
- **Lazy loading** for relationships
- **Compression** for responses
- **Rate limiting** to prevent abuse

### Frontend Optimization
- **Code splitting** (Next.js automatic)
- **Image optimization** (Next.js Image)
- **Caching** (SWR/React Query)
- **Lazy loading** components

---

This architecture ensures:
- ✅ **Scalability** - Can handle growing user base
- ✅ **Maintainability** - Clean separation of concerns
- ✅ **Security** - Multiple layers of protection
- ✅ **Performance** - Optimized at every layer
- ✅ **Reliability** - Fault-tolerant design
