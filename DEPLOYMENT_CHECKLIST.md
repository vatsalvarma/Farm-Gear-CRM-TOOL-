# FarmGearConnect - Production Deployment Checklist

## 🚀 Pre-Deployment Checklist

### 1. Environment Setup

#### Backend Environment Variables
```bash
# Database
✅ DB_URL=jdbc:mysql://production-host:3306/farmgearconnect
✅ DB_USERNAME=<production-user>
✅ DB_PASSWORD=<strong-password>

# JWT Security
✅ JWT_SECRET=<generate-strong-secret-min-64-chars>
✅ JWT_ACCESS_EXPIRY=3600000
✅ JWT_REFRESH_EXPIRY=2592000000

# Storage (MinIO/S3)
✅ MINIO_ENDPOINT=https://s3.your-domain.com
✅ MINIO_ACCESS_KEY=<access-key>
✅ MINIO_SECRET_KEY=<secret-key>
✅ MINIO_BUCKET=farmgearconnect-prod

# Redis
✅ REDIS_HOST=<redis-host>
✅ REDIS_PORT=6379
✅ REDIS_PASSWORD=<redis-password>

# Email (SMTP)
✅ MAIL_HOST=smtp.gmail.com
✅ MAIL_PORT=587
✅ MAIL_USERNAME=<email>
✅ MAIL_PASSWORD=<app-password>

# SMS (Twilio)
✅ SMS_ENABLED=true
✅ TWILIO_ACCOUNT_SID=<account-sid>
✅ TWILIO_AUTH_TOKEN=<auth-token>
✅ TWILIO_FROM_NUMBER=<phone-number>

# Calling (Exotel)
✅ CALLING_ENABLED=true
✅ EXOTEL_API_KEY=<api-key>
✅ EXOTEL_API_TOKEN=<api-token>
✅ EXOTEL_SID=<sid>
✅ EXOTEL_VIRTUAL_NUMBER=<virtual-number>

# Payment (Razorpay)
✅ PAYMENT_ENABLED=true
✅ RAZORPAY_KEY_ID=<key-id>
✅ RAZORPAY_KEY_SECRET=<key-secret>

# CORS
✅ CORS_ORIGINS=https://farmgearconnect.com,https://www.farmgearconnect.com

# Frontend URL
✅ FRONTEND_URL=https://farmgearconnect.com
```

#### Frontend Environment Variables
```bash
✅ NEXT_PUBLIC_API_URL=https://api.farmgearconnect.com
✅ NEXT_PUBLIC_APP_URL=https://farmgearconnect.com
✅ NODE_ENV=production
```

### 2. Database Setup

```bash
# Create production database
✅ Create database with UTF8MB4 charset
✅ Create database user with limited privileges
✅ Grant only necessary permissions
✅ Test database connection
✅ Run Flyway migrations
✅ Verify all tables created
✅ Create database backup schedule
✅ Set up point-in-time recovery
```

### 3. Security Configuration

```bash
# SSL/TLS
✅ Obtain SSL certificate (Let's Encrypt)
✅ Configure HTTPS on web server
✅ Force HTTPS redirect
✅ Set up HSTS headers
✅ Configure SSL for database connections

# Firewall Rules
✅ Allow only necessary ports (80, 443, 3306, 6379)
✅ Restrict database access to backend only
✅ Restrict Redis access to backend only
✅ Block direct MinIO access (use CDN)

# Application Security
✅ Change default admin password
✅ Enable rate limiting
✅ Configure CORS properly
✅ Set secure cookie flags
✅ Enable CSRF protection
✅ Configure security headers
```

### 4. External Services Setup

```bash
# Razorpay
✅ Create production account
✅ Complete KYC verification
✅ Get production API keys
✅ Set up webhook URL
✅ Test payment flow
✅ Configure refund policy

# Exotel/Twilio
✅ Create production account
✅ Purchase virtual numbers
✅ Configure call forwarding
✅ Set up call recording (if needed)
✅ Test masked calling
✅ Configure billing alerts

# SMS Provider
✅ Create production account
✅ Get sender ID approved
✅ Configure templates
✅ Test SMS delivery
✅ Set up delivery reports

# Email Service
✅ Configure SPF records
✅ Configure DKIM
✅ Configure DMARC
✅ Verify domain
✅ Test email delivery
✅ Set up bounce handling
```

### 5. Storage & CDN

```bash
# MinIO/S3
✅ Create production bucket
✅ Configure bucket policies
✅ Enable versioning
✅ Set up lifecycle rules
✅ Configure CORS
✅ Test file upload/download

# CDN (Optional but Recommended)
✅ Set up CloudFlare/AWS CloudFront
✅ Configure caching rules
✅ Set up image optimization
✅ Configure SSL
✅ Test CDN delivery
```

### 6. Monitoring & Logging

```bash
# Application Monitoring
✅ Set up application monitoring (New Relic/DataDog)
✅ Configure error tracking (Sentry)
✅ Set up uptime monitoring (UptimeRobot)
✅ Configure performance monitoring
✅ Set up alerts for critical errors

# Logging
✅ Configure centralized logging (ELK/Splunk)
✅ Set up log rotation
✅ Configure log retention policy
✅ Set up log alerts
✅ Test log aggregation

# Database Monitoring
✅ Enable slow query log
✅ Set up query performance monitoring
✅ Configure connection pool monitoring
✅ Set up disk space alerts
```

### 7. Backup & Recovery

```bash
# Database Backups
✅ Set up automated daily backups
✅ Configure backup retention (30 days)
✅ Test backup restoration
✅ Set up off-site backup storage
✅ Document recovery procedures

# File Storage Backups
✅ Enable S3 versioning
✅ Configure cross-region replication
✅ Test file recovery
✅ Document recovery procedures

# Application Backups
✅ Version control (Git)
✅ Tag production releases
✅ Document deployment process
✅ Create rollback plan
```

### 8. Performance Optimization

```bash
# Backend
✅ Enable database connection pooling
✅ Configure Redis caching
✅ Enable GZIP compression
✅ Optimize database queries
✅ Add database indexes
✅ Configure JVM heap size
✅ Enable HTTP/2

# Frontend
✅ Enable Next.js production build
✅ Configure image optimization
✅ Enable code splitting
✅ Minify CSS/JS
✅ Enable browser caching
✅ Configure CDN
✅ Optimize bundle size
```

### 9. Testing

```bash
# Functional Testing
✅ Test user registration flow
✅ Test login/logout
✅ Test equipment listing creation
✅ Test booking workflow
✅ Test payment flow
✅ Test notifications
✅ Test chat functionality
✅ Test admin approval workflow

# Security Testing
✅ Run security scan (OWASP ZAP)
✅ Test SQL injection prevention
✅ Test XSS prevention
✅ Test CSRF protection
✅ Test authentication bypass
✅ Test authorization checks
✅ Test rate limiting

# Performance Testing
✅ Load test with 100 concurrent users
✅ Load test with 1000 concurrent users
✅ Test database performance
✅ Test API response times
✅ Test file upload performance
✅ Identify bottlenecks

# Integration Testing
✅ Test payment gateway
✅ Test SMS delivery
✅ Test email delivery
✅ Test masked calling
✅ Test file storage
✅ Test WebSocket connections
```

### 10. Documentation

```bash
✅ API documentation (Swagger)
✅ User manual
✅ Admin guide
✅ Deployment guide
✅ Troubleshooting guide
✅ Runbook for operations
✅ Incident response plan
✅ Contact information
```

## 📋 Deployment Steps

### Step 1: Prepare Infrastructure

```bash
# 1. Provision servers
✅ Web server (2 vCPU, 4GB RAM minimum)
✅ Database server (4 vCPU, 8GB RAM minimum)
✅ Redis server (2 vCPU, 2GB RAM minimum)
✅ Load balancer (if multiple instances)

# 2. Install dependencies
✅ Java 17
✅ MySQL 8.0
✅ Redis 6.0+
✅ Nginx/Apache
✅ Node.js 18+ (for frontend)

# 3. Configure networking
✅ Set up DNS records
✅ Configure firewall
✅ Set up load balancer
✅ Configure SSL certificates
```

### Step 2: Deploy Database

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE farmgearconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. Create user
CREATE USER 'farmgear'@'%' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON farmgearconnect.* TO 'farmgear'@'%';
FLUSH PRIVILEGES;

# 3. Run migrations
cd backend
mvn flyway:migrate

# 4. Verify tables
mysql -u farmgear -p farmgearconnect
SHOW TABLES;

# 5. Create admin user
INSERT INTO users (id, full_name, email, password, role, email_verified, active, preferred_language, created_at, updated_at)
VALUES (UUID(), 'Admin', 'admin@farmgearconnect.com', '$2a$12$...', 'ADMIN', 1, 1, 'ENGLISH', NOW(), NOW());
```

### Step 3: Deploy Backend

```bash
# 1. Build application
cd backend
mvn clean package -DskipTests

# 2. Copy JAR to server
scp target/farm-gear-connect-1.0.0.jar user@server:/opt/farmgearconnect/

# 3. Create systemd service
sudo nano /etc/systemd/system/farmgearconnect.service

[Unit]
Description=FarmGearConnect Backend
After=network.target

[Service]
Type=simple
User=farmgear
WorkingDirectory=/opt/farmgearconnect
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod farm-gear-connect-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# 4. Start service
sudo systemctl daemon-reload
sudo systemctl enable farmgearconnect
sudo systemctl start farmgearconnect

# 5. Verify
sudo systemctl status farmgearconnect
curl http://localhost:8080/api/actuator/health
```

### Step 4: Deploy Frontend

```bash
# Option 1: Vercel (Recommended)
cd frontend
vercel --prod

# Option 2: Self-hosted
cd frontend
npm run build
npm start

# Option 3: Static export + Nginx
npm run build
# Copy .next/static to Nginx
```

### Step 5: Configure Web Server (Nginx)

```nginx
# /etc/nginx/sites-available/farmgearconnect

# Backend API
server {
    listen 80;
    server_name api.farmgearconnect.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.farmgearconnect.com;

    ssl_certificate /etc/letsencrypt/live/api.farmgearconnect.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.farmgearconnect.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Frontend
server {
    listen 80;
    server_name farmgearconnect.com www.farmgearconnect.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name farmgearconnect.com www.farmgearconnect.com;

    ssl_certificate /etc/letsencrypt/live/farmgearconnect.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/farmgearconnect.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 6: Post-Deployment Verification

```bash
# 1. Health checks
✅ curl https://api.farmgearconnect.com/api/actuator/health
✅ curl https://farmgearconnect.com

# 2. Test critical flows
✅ User registration
✅ Login
✅ Equipment listing
✅ Booking creation
✅ Payment flow
✅ Notifications

# 3. Monitor logs
✅ tail -f /opt/farmgearconnect/logs/application.log
✅ Check error logs
✅ Monitor database connections

# 4. Performance check
✅ Check API response times
✅ Check page load times
✅ Monitor server resources
```

## 🔄 Post-Deployment Tasks

### Immediate (Day 1)
- ✅ Monitor error logs
- ✅ Check all critical flows
- ✅ Verify external integrations
- ✅ Test payment processing
- ✅ Monitor server resources

### Week 1
- ✅ Analyze user feedback
- ✅ Fix critical bugs
- ✅ Optimize slow queries
- ✅ Review security logs
- ✅ Update documentation

### Month 1
- ✅ Review analytics
- ✅ Optimize performance
- ✅ Plan feature releases
- ✅ Conduct security audit
- ✅ Review backup/recovery

## 🚨 Rollback Plan

If deployment fails:

```bash
# 1. Stop new version
sudo systemctl stop farmgearconnect

# 2. Restore previous version
sudo cp /opt/farmgearconnect/backup/farm-gear-connect-previous.jar /opt/farmgearconnect/farm-gear-connect-1.0.0.jar

# 3. Restore database (if needed)
mysql -u root -p farmgearconnect < backup.sql

# 4. Start service
sudo systemctl start farmgearconnect

# 5. Verify
curl http://localhost:8080/api/actuator/health
```

## 📞 Emergency Contacts

```
DevOps Lead: +91-XXXXXXXXXX
Backend Lead: +91-XXXXXXXXXX
Frontend Lead: +91-XXXXXXXXXX
Database Admin: +91-XXXXXXXXXX
Security Team: security@farmgearconnect.com
```

## ✅ Final Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] External services tested
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained
- [ ] Rollback plan tested
- [ ] Emergency contacts updated
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Legal compliance verified
- [ ] Terms & Privacy policy published
- [ ] Support channels ready

## 🎉 Go Live!

Once all items are checked:

1. ✅ Announce maintenance window
2. ✅ Deploy to production
3. ✅ Run smoke tests
4. ✅ Monitor for 24 hours
5. ✅ Announce launch
6. ✅ Celebrate! 🎊

---

**Remember**: Always have a rollback plan and monitor closely after deployment!
