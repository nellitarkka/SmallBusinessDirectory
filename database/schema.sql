-- USERS: all authenticated accounts
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
    first_name      TEXT,
    last_name       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VENDORS: vendor profiles (1:1 with users)
CREATE TABLE vendors (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name   TEXT NOT NULL,
    vat_number      TEXT,
    city            TEXT,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES: listing categories/tags
CREATE TABLE categories (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- LISTINGS: vendor listings visible in the directory
CREATE TABLE listings (
    id              BIGSERIAL PRIMARY KEY,
    vendor_id       BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    city            TEXT NOT NULL,
    contact_email   TEXT,
    contact_phone   TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'submitted', 'active', 'rejected')),
    opening_hours   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LISTING_CATEGORIES: many-to-many between listings and categories
CREATE TABLE listing_categories (
    listing_id      BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    category_id     BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, category_id)
);

-- FAVORITES: which customer favorited which listing
CREATE TABLE favorites (
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id      BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

-- MESSAGES: inquiries + replies between users about a listing
CREATE TABLE messages (
    id               BIGSERIAL PRIMARY KEY,
    listing_id       BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    sender_user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject          TEXT,
    body             TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read          BOOLEAN NOT NULL DEFAULT FALSE
);

-- REPORTS: user-submitted abuse/problem reports
CREATE TABLE reports (
    id               BIGSERIAL PRIMARY KEY,
    listing_id       BIGINT REFERENCES listings(id) ON DELETE CASCADE,
    reporter_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason           TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'in_review', 'resolved')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADMIN_ACTIONS: audit log of moderation actions
CREATE TABLE admin_actions (
    id              BIGSERIAL PRIMARY KEY,
    admin_user_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action_type     TEXT NOT NULL,
    listing_id      BIGINT REFERENCES listings(id) ON DELETE SET NULL,
    target_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EMAIL_VERIFICATION_TOKENS
CREATE TABLE email_verification_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    used            BOOLEAN NOT NULL DEFAULT FALSE
);

-- PASSWORD_RESET_TOKENS
CREATE TABLE password_reset_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           TEXT NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    used            BOOLEAN NOT NULL DEFAULT FALSE
);

-- Helpful indexes (for search & filters)
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_title_trgm ON listings USING GIN (title gin_trgm_ops);
