-- ============================================================
-- Farm Gear Connect - V5: Add availability_status to equipment
-- Flyway Migration V5 (MySQL 8.0+)
-- ============================================================

-- Add operational availability status column.
-- Separate from admin-approval "status" column.
-- Note: No IF NOT EXISTS - Flyway guarantees this runs exactly once.
ALTER TABLE equipment
    ADD COLUMN availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE'
    AFTER status;

CREATE INDEX idx_equipment_availability
    ON equipment(availability_status);
