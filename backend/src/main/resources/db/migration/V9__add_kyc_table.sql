-- ============================================================
-- V9: KYC / Profile Completion Table
-- ============================================================

CREATE TABLE IF NOT EXISTS user_kyc (
    id                       CHAR(36)     NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id                  CHAR(36)     NOT NULL UNIQUE,

    -- Personal / Address
    address                  TEXT,
    pincode                  VARCHAR(10),
    mandal                   VARCHAR(100),

    -- Identity
    aadhaar_number           VARCHAR(20),
    pan_number               VARCHAR(20),

    -- Bank Details
    bank_account_holder_name VARCHAR(200),
    bank_account_number      VARCHAR(50),
    ifsc_code                VARCHAR(20),
    bank_name                VARCHAR(200),

    -- Owner-only extras
    company_name             VARCHAR(200),
    gst_number               VARCHAR(30),
    business_address         TEXT,

    -- Document images (Base64 data URIs stored in DB)
    aadhaar_front_url        LONGTEXT,
    aadhaar_back_url         LONGTEXT,
    pan_card_url             LONGTEXT,
    passbook_url             LONGTEXT,
    company_doc_url          LONGTEXT,

    -- KYC status
    kyc_status               VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    rejection_reason         TEXT,
    submitted_at             DATETIME,
    reviewed_at              DATETIME,
    reviewed_by              CHAR(36),

    created_at               DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_kyc_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_kyc_user   ON user_kyc(user_id);
CREATE INDEX idx_kyc_status ON user_kyc(kyc_status);

-- Add kyc_completed flag to users table for quick checks
ALTER TABLE users ADD COLUMN kyc_completed TINYINT(1) NOT NULL DEFAULT 0 AFTER banned_at;
