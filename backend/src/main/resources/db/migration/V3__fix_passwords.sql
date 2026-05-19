-- ============================================================
-- V3 – Fix seed user passwords  (password for all = 'password')
-- BCrypt hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================

UPDATE users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email IN (
    'admin@farmgearconnect.com',
    'ravi@demo.farmgearconnect.com',
    'suresh@demo.farmgearconnect.com'
);
