-- ============================================================
-- Farm Gear Connect - V6: Add OAuth columns to users table
-- Flyway Migration V6 (MySQL 8.0+)
-- ============================================================

-- Add OAuth provider fields required by the User entity.
-- These were present in the entity but missing from the initial schema,
-- causing 'Unknown column oauth_provider' errors on every login query.

ALTER TABLE users
    ADD COLUMN oauth_provider     VARCHAR(50)  NULL AFTER password,
    ADD COLUMN oauth_provider_id  VARCHAR(255) NULL AFTER oauth_provider;

CREATE INDEX idx_users_oauth_provider
    ON users(oauth_provider, oauth_provider_id);
