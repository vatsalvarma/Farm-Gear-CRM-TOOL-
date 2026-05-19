-- ============================================================
-- Farm Gear Connect – Seed Data  (MySQL 8.0+)
-- Admin account + sample coupons
-- ============================================================

-- Admin user (password: password)
INSERT IGNORE INTO users (id, full_name, email, phone, password, role, email_verified, active, state, district, preferred_language)
VALUES (
    UUID(),
    'System Admin',
    'admin@farmgearconnect.com',
    '9000000000',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'ADMIN',
    1,
    1,
    'Telangana',
    'Hyderabad',
    'ENGLISH'
);

-- Sample demo owner (password: password)
INSERT IGNORE INTO users (id, full_name, email, phone, password, role, email_verified, active, state, district, village, preferred_language)
VALUES (
    UUID(),
    'Ravi Kumar',
    'ravi@demo.farmgearconnect.com',
    '9100000001',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'OWNER',
    1,
    1,
    'Telangana',
    'Warangal',
    'Hanamkonda',
    'TELUGU'
);

-- Sample demo farmer (password: password)
INSERT IGNORE INTO users (id, full_name, email, phone, password, role, email_verified, active, state, district, village, preferred_language)
VALUES (
    UUID(),
    'Suresh Reddy',
    'suresh@demo.farmgearconnect.com',
    '9100000002',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'FARMER',
    1,
    1,
    'Telangana',
    'Karimnagar',
    'Sircilla',
    'TELUGU'
);

-- Sample coupons
INSERT IGNORE INTO coupons (id, code, description, discount_type, discount_value, max_uses, expiry_date, active, system_generated)
VALUES
    (UUID(), 'LAUNCH50', 'Launch offer: 50% off first subscription', 'PERCENTAGE',   50.00, 100, '2025-12-31', 1, 1),
    (UUID(), 'FREEYEAR', 'Free annual subscription',                  'FREE_TRIAL',  100.00,  30, '2025-06-30', 1, 1),
    (UUID(), 'KISAN500', 'Flat Rs.500 off annual plan',               'FIXED_AMOUNT', 500.00, 200, '2025-12-31', 1, 0);
