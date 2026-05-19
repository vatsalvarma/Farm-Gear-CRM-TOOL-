-- ============================================================
-- Farm Gear Connect – Initial Database Schema
-- Flyway Migration V1  (MySQL 8.0+)
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            CHAR(36)     NOT NULL PRIMARY KEY DEFAULT (UUID()),
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    profile_photo_url TEXT,
    email_verified    TINYINT(1) NOT NULL DEFAULT 0,
    phone_verified    TINYINT(1) NOT NULL DEFAULT 0,
    active            TINYINT(1) NOT NULL DEFAULT 1,
    suspended         TINYINT(1) NOT NULL DEFAULT 0,
    suspension_reason TEXT,
    state         VARCHAR(100),
    district      VARCHAR(100),
    village       VARCHAR(100),
    latitude      DOUBLE,
    longitude     DOUBLE,
    preferred_language VARCHAR(20) NOT NULL DEFAULT 'ENGLISH',
    last_login_at  DATETIME,
    last_login_ip  VARCHAR(50),
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at     DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_district ON users(district);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id                       CHAR(36)      NOT NULL PRIMARY KEY DEFAULT (UUID()),
    owner_id                 CHAR(36)      NOT NULL,
    title                    VARCHAR(200)  NOT NULL,
    description              TEXT,
    category                 VARCHAR(50)   NOT NULL,
    brand                    VARCHAR(100),
    fuel_type                VARCHAR(20),
    model_number             VARCHAR(100),
    price_per_hour           DECIMAL(10,2) NOT NULL,
    price_per_day            DECIMAL(10,2) NOT NULL,
    deposit_amount           DECIMAL(10,2),
    min_rental_duration_hours INT,
    state                    VARCHAR(100)  NOT NULL,
    district                 VARCHAR(100)  NOT NULL,
    village                  VARCHAR(100),
    latitude                 DOUBLE,
    longitude                DOUBLE,
    address                  TEXT          NOT NULL,
    status                   VARCHAR(30)   NOT NULL DEFAULT 'DRAFT',
    admin_note               TEXT,
    available_from           DATE,
    available_to             DATE,
    specifications           TEXT,
    featured                 TINYINT(1)    NOT NULL DEFAULT 0,
    average_rating           DOUBLE        DEFAULT 0.0,
    total_reviews            INT           DEFAULT 0,
    total_bookings           INT           DEFAULT 0,
    created_at               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               DATETIME,
    CONSTRAINT fk_equipment_owner FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_equipment_owner    ON equipment(owner_id);
CREATE INDEX idx_equipment_status   ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_district ON equipment(district);
CREATE INDEX idx_equipment_location ON equipment(latitude, longitude);

-- Equipment Images
CREATE TABLE IF NOT EXISTS equipment_images (
    id            CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
    equipment_id  CHAR(36)   NOT NULL,
    image_url     TEXT       NOT NULL,
    thumbnail_url TEXT,
    sort_order    INT        NOT NULL DEFAULT 0,
    is_primary    TINYINT(1) NOT NULL DEFAULT 0,
    file_size_bytes BIGINT,
    created_at    DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_images_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_equipment_images_equipment ON equipment_images(equipment_id);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id                CHAR(36)      NOT NULL PRIMARY KEY DEFAULT (UUID()),
    equipment_id      CHAR(36)      NOT NULL,
    farmer_id         CHAR(36)      NOT NULL,
    owner_id          CHAR(36)      NOT NULL,
    start_date        DATE          NOT NULL,
    end_date          DATE          NOT NULL,
    total_amount      DECIMAL(10,2) NOT NULL,
    deposit_amount    DECIMAL(10,2),
    status            VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    farmer_note       TEXT,
    owner_note        TEXT,
    rejection_reason  TEXT,
    booking_reference VARCHAR(50)   UNIQUE,
    approved_at       DATETIME,
    rejected_at       DATETIME,
    completed_at      DATETIME,
    cancelled_at      DATETIME,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT fk_bookings_farmer   FOREIGN KEY (farmer_id)    REFERENCES users(id),
    CONSTRAINT fk_bookings_owner    FOREIGN KEY (owner_id)     REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bookings_farmer    ON bookings(farmer_id);
CREATE INDEX idx_bookings_owner     ON bookings(owner_id);
CREATE INDEX idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX idx_bookings_status    ON bookings(status);
CREATE INDEX idx_bookings_dates     ON bookings(start_date, end_date);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id                     CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
    sender_id              CHAR(36)   NOT NULL,
    receiver_id            CHAR(36)   NOT NULL,
    booking_id             CHAR(36),
    content                TEXT,
    message_type           VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    media_url              TEXT,
    media_duration_seconds BIGINT,
    is_read                TINYINT(1) NOT NULL DEFAULT 0,
    read_at                DATETIME,
    deleted                TINYINT(1) NOT NULL DEFAULT 0,
    created_at             DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_sender   FOREIGN KEY (sender_id)   REFERENCES users(id),
    CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
    CONSTRAINT fk_messages_booking  FOREIGN KEY (booking_id)  REFERENCES bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_messages_sender       ON messages(sender_id);
CREATE INDEX idx_messages_receiver     ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id           CHAR(36)     NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id      CHAR(36)     NOT NULL,
    title        VARCHAR(255) NOT NULL,
    body         TEXT         NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    reference_id VARCHAR(255),
    is_read      TINYINT(1)   NOT NULL DEFAULT 0,
    read_at      DATETIME,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id                  CHAR(36)      NOT NULL PRIMARY KEY DEFAULT (UUID()),
    code                VARCHAR(50)   NOT NULL UNIQUE,
    description         TEXT,
    discount_type       VARCHAR(20)   NOT NULL,
    discount_value      DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    max_uses            INT           NOT NULL DEFAULT 1,
    used_count          INT           NOT NULL DEFAULT 0,
    expiry_date         DATE,
    active              TINYINT(1)    NOT NULL DEFAULT 1,
    system_generated    TINYINT(1)    NOT NULL DEFAULT 0,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id               CHAR(36)      NOT NULL PRIMARY KEY DEFAULT (UUID()),
    owner_id         CHAR(36)      NOT NULL,
    plan             VARCHAR(20)   NOT NULL DEFAULT 'ANNUAL',
    start_date       DATE          NOT NULL,
    expiry_date      DATE          NOT NULL,
    active           TINYINT(1)    NOT NULL DEFAULT 1,
    amount_paid      DECIMAL(10,2),
    transaction_id   VARCHAR(255),
    coupon_id        CHAR(36),
    discount_applied DECIMAL(5,2),
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_owner  FOREIGN KEY (owner_id)  REFERENCES users(id),
    CONSTRAINT fk_subscriptions_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_subscriptions_owner  ON subscriptions(owner_id);
CREATE INDEX idx_subscriptions_expiry ON subscriptions(expiry_date);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id           CHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
    equipment_id CHAR(36)  NOT NULL,
    farmer_id    CHAR(36)  NOT NULL,
    booking_id   CHAR(36)  NOT NULL UNIQUE,
    rating       INT       NOT NULL,
    comment      TEXT,
    approved     TINYINT(1) NOT NULL DEFAULT 0,
    reported     TINYINT(1) NOT NULL DEFAULT 0,
    report_reason TEXT,
    created_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT fk_reviews_farmer    FOREIGN KEY (farmer_id)    REFERENCES users(id),
    CONSTRAINT fk_reviews_booking   FOREIGN KEY (booking_id)   REFERENCES bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reviews_equipment ON reviews(equipment_id);
CREATE INDEX idx_reviews_farmer    ON reviews(farmer_id);

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          CHAR(36)     NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id     CHAR(36)     NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  DATETIME     NOT NULL,
    revoked     TINYINT(1)   NOT NULL DEFAULT 0,
    device_info VARCHAR(255),
    ip_address  VARCHAR(50),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user  ON refresh_tokens(user_id);

-- OTP Verifications
CREATE TABLE IF NOT EXISTS otp_verifications (
    id         CHAR(36)     NOT NULL PRIMARY KEY DEFAULT (UUID()),
    email      VARCHAR(255) NOT NULL,
    otp        VARCHAR(255) NOT NULL,
    purpose    VARCHAR(30)  NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   NOT NULL DEFAULT 0,
    attempts   INT          DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_otp_email   ON otp_verifications(email);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id          CHAR(36)     NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id     CHAR(36),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   VARCHAR(255),
    details     TEXT,
    ip_address  VARCHAR(50),
    user_agent  TEXT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_logs_user       ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
