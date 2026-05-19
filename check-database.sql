-- Check Database Setup
-- Copy and paste these queries into MySQL Workbench

-- 1. Use the database
USE farmgearconnect;

-- 2. Show all tables
SHOW TABLES;

-- 3. Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens
UNION ALL
SELECT 'otp_verifications', COUNT(*) FROM otp_verifications
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'equipment_images', COUNT(*) FROM equipment_images;

-- 4. View all users
SELECT id, full_name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 5. View equipment listings
SELECT id, title, category, status, owner_id 
FROM equipment 
ORDER BY created_at DESC 
LIMIT 10;
