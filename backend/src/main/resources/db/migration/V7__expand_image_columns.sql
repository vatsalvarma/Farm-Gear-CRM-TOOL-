-- ============================================================
-- Farm Gear Connect - V7: Expand image columns for Base64 storage
-- Flyway Migration V7 (MySQL 8.0+)
-- ============================================================

-- equipment_images.image_url was TEXT (65 KB max).
-- Base64-encoded images can be several MB, so upgrade to MEDIUMTEXT (16 MB).
ALTER TABLE equipment_images
    MODIFY COLUMN image_url     MEDIUMTEXT NOT NULL,
    MODIFY COLUMN thumbnail_url MEDIUMTEXT NULL;

-- users.profile_photo_url is already LONGTEXT from V4 — no change needed.
