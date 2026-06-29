-- Add banned_at timestamp column to users table
-- Required for the Ban User feature added in AdminController
ALTER TABLE users
    ADD COLUMN banned_at DATETIME NULL DEFAULT NULL AFTER suspension_reason;
