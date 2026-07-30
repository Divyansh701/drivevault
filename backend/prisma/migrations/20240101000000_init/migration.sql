-- =============================================================================
-- Migration: 20240101000000_init
-- Description: Initial schema — create users and vehicles tables
--
-- IMPORTANT: This migration is applied EXACTLY ONCE by `prisma migrate deploy`
-- or `prisma migrate dev`. It is NOT idempotent — do not run it manually
-- against a database that already has these tables.
--
-- To apply:
--   npx prisma migrate dev --name init   (first local setup)
--   npx prisma migrate deploy            (CI / production)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS
-- Must be created before any table that references them.
-- -----------------------------------------------------------------------------

-- Permission level of a user account
CREATE TYPE "Role" AS ENUM (
    'ADMIN',
    'STAFF',
    'VIEWER'
);

-- Body-style classification — Fix ISSUE-04: ELECTRIC and HYBRID removed.
-- They are powertrains, not body styles. See PowertrainType below.
CREATE TYPE "VehicleCategory" AS ENUM (
    'SEDAN',
    'SUV',
    'TRUCK',
    'HATCHBACK',
    'CONVERTIBLE',
    'COUPE',
    'VAN',
    'MOTORCYCLE'
);

-- Fix ISSUE-04: New enum for fuel/drive system, orthogonal to body style.
-- Allows independent filtering: category=SUV AND powertrain=ELECTRIC.
CREATE TYPE "PowertrainType" AS ENUM (
    'PETROL',
    'DIESEL',
    'ELECTRIC',
    'HYBRID',
    'PHEV',
    'HYDROGEN',
    'OTHER'
);

-- Lifecycle state of a vehicle listing
CREATE TYPE "VehicleStatus" AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'SOLD',
    'MAINTENANCE'
);

-- -----------------------------------------------------------------------------
-- TABLE: users
-- -----------------------------------------------------------------------------
CREATE TABLE "users" (
    -- CUID primary key — URL-safe, globally unique, no coordination needed
    "id"        TEXT            NOT NULL,

    -- Full display name (e.g. "Jane Smith")
    "name"      TEXT            NOT NULL,

    -- Login identifier — unique across all users
    "email"     TEXT            NOT NULL,

    -- bcrypt hash of the password (cost factor >= 10)
    "password"  TEXT            NOT NULL,

    -- Permission level — minimum privilege by default
    "role"      "Role"          NOT NULL DEFAULT 'VIEWER',

    -- Soft enable/disable — false prevents login without deleting the row
    "isActive"  BOOLEAN         NOT NULL DEFAULT true,

    -- Row creation timestamp — set once, never updated
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Fix ISSUE-06: DEFAULT added — Prisma requires this for updatedAt columns.
    -- Without it, any raw SQL INSERT omitting this column fails the NOT NULL
    -- constraint. Prisma always supplies the value on writes, but the DEFAULT
    -- ensures raw SQL tooling (DBA scripts, test fixtures) also works correctly.
    "updatedAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Soft-delete marker: NULL = active, non-NULL = logically deleted
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on email (this index also serves lookup — no second index needed)
-- Fix ISSUE-09: only ONE index on email. The UNIQUE INDEX is itself a B-tree
-- index; adding a second non-unique @@index([email]) is redundant and wasteful.
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Index: filter users by role in admin panel
CREATE INDEX "users_role_idx"      ON "users"("role");

-- Index: efficient "WHERE deletedAt IS NULL" soft-delete filter
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- -----------------------------------------------------------------------------
-- TABLE: vehicles
-- -----------------------------------------------------------------------------
CREATE TABLE "vehicles" (
    -- CUID primary key
    "id"          TEXT                NOT NULL,

    -- Manufacturer brand name (e.g. "Toyota", "BMW", "Ford")
    "make"        TEXT                NOT NULL,

    -- Specific model within the brand (e.g. "Camry", "3 Series", "F-150")
    "model"       TEXT                NOT NULL,

    -- 4-digit model year (e.g. 2024)
    "year"        INTEGER             NOT NULL,

    -- Body-style classification (Fix ISSUE-04: powertrain types removed)
    "category"    "VehicleCategory"   NOT NULL,

    -- Fix ISSUE-04: powertrain stored separately from body style.
    -- Defaults to PETROL for backwards-compatible bulk imports.
    "powertrain"  "PowertrainType"    NOT NULL DEFAULT 'PETROL',

    -- Asking price — DECIMAL(12,2) avoids floating-point rounding errors
    "price"       DECIMAL(12,2)       NOT NULL,

    -- Units in stock — defaults to 1; CHECK prevents negative stock
    "quantity"    INTEGER             NOT NULL DEFAULT 1,

    -- 17-character Vehicle Identification Number (nullable for bulk imports)
    "vin"         TEXT,

    -- Exterior paint colour
    "color"       TEXT,

    -- Odometer reading in kilometres — 0 for new vehicles
    "mileage"     INTEGER             NOT NULL DEFAULT 0,

    -- Free-text marketing description
    "description" TEXT,

    -- Listing lifecycle state
    "status"      "VehicleStatus"     NOT NULL DEFAULT 'AVAILABLE',

    -- Array of CDN image URLs
    "imageUrls"   TEXT[]              NOT NULL DEFAULT ARRAY[]::TEXT[],

    -- Audit timestamps
    "createdAt"   TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Fix ISSUE-06: DEFAULT added (same rationale as users.updatedAt above)
    "updatedAt"   TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "deletedAt"   TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey"              PRIMARY KEY ("id"),
    CONSTRAINT "vehicles_quantity_positive" CHECK ("quantity" >= 0)
);

-- Unique constraint on VIN (partial — NULL values are excluded, so multiple
-- rows may have NULL vin during bulk import without violating uniqueness)
CREATE UNIQUE INDEX "vehicles_vin_key"      ON "vehicles"("vin") WHERE "vin" IS NOT NULL;

CREATE INDEX "vehicles_make_idx"            ON "vehicles"("make");
CREATE INDEX "vehicles_category_idx"        ON "vehicles"("category");
CREATE INDEX "vehicles_powertrain_idx"      ON "vehicles"("powertrain");
CREATE INDEX "vehicles_status_idx"          ON "vehicles"("status");
CREATE INDEX "vehicles_year_idx"            ON "vehicles"("year");
CREATE INDEX "vehicles_price_idx"           ON "vehicles"("price");
CREATE INDEX "vehicles_deletedAt_idx"       ON "vehicles"("deletedAt");
