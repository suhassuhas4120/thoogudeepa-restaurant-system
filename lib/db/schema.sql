-- ============================================================================
-- THOOGUDEEPA DONNE BIRYANI MANE - RESTAURANT OPERATING SYSTEM
-- PostgreSQL / Supabase Relational Database Schema
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SECTIONS & FLOOR TABLES
CREATE TABLE IF NOT EXISTS floor_sections (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant_tables (
    id VARCHAR(32) PRIMARY KEY,
    number VARCHAR(16) NOT NULL UNIQUE,
    section VARCHAR(32) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(24) NOT NULL DEFAULT 'VACANT' CHECK (status IN ('VACANT', 'OCCUPIED', 'BILLING', 'CLEANING')),
    guest_count INT NOT NULL DEFAULT 0,
    seated_time VARCHAR(32),
    current_bill NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    server_name VARCHAR(64) DEFAULT 'Staff Captain',
    kot_count INT NOT NULL DEFAULT 0,
    kot_notes TEXT,
    merged_with VARCHAR(16) REFERENCES restaurant_tables(number) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MENU ITEMS & 86 INVENTORY CONTROLS
CREATE TABLE IF NOT EXISTS menu_categories (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_dishes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    is_veg BOOLEAN DEFAULT FALSE,
    badge VARCHAR(64),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_86_controls (
    dish_id VARCHAR(64) PRIMARY KEY REFERENCES menu_dishes(id) ON DELETE CASCADE,
    is_86 BOOLEAN NOT NULL DEFAULT FALSE,
    prep_delay_minutes INT NOT NULL DEFAULT 0,
    marked_by VARCHAR(64),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. KOT (KITCHEN ORDER TICKETS) & ACTIVE ORDERS
CREATE SEQUENCE IF NOT EXISTS kot_number_seq START WITH 101 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS kot_tickets (
    id VARCHAR(64) PRIMARY KEY,
    kot_number INT NOT NULL DEFAULT nextval('kot_number_seq'),
    table_number VARCHAR(16) NOT NULL,
    server_name VARCHAR(64) NOT NULL,
    timestamp VARCHAR(32) NOT NULL,
    source VARCHAR(24) NOT NULL DEFAULT 'WAITER' CHECK (source IN ('WAITER', 'CUSTOMER', 'POS')),
    status VARCHAR(24) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'PREP', 'READY', 'COMPLETED')),
    elapsed_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kot_ticket_items (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) NOT NULL REFERENCES kot_tickets(id) ON DELETE CASCADE,
    dish_id VARCHAR(64),
    dish_name VARCHAR(128) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    line_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stage VARCHAR(24) NOT NULL DEFAULT 'Pending' CHECK (stage IN ('Pending', 'Preparing', 'Ready', 'Served')),
    prep_mode VARCHAR(64) DEFAULT 'Standard',
    options TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BILLING, TAX INVOICES & PAYMENTS
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1001 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS tax_invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    table_number VARCHAR(16) NOT NULL,
    server_name VARCHAR(64) NOT NULL,
    food_subtotal NUMERIC(10, 2) NOT NULL,
    cgst NUMERIC(10, 2) NOT NULL,
    sgst NUMERIC(10, 2) NOT NULL,
    total_tax NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(24) NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'POS', 'SPLIT')),
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR(64) PRIMARY KEY,
    invoice_id VARCHAR(64) NOT NULL REFERENCES tax_invoices(id) ON DELETE CASCADE,
    dish_name VARCHAR(128) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL
);

-- 6. SERVICE PINGS & FLOOR ALERTS
CREATE TABLE IF NOT EXISTS customer_service_pings (
    id VARCHAR(64) PRIMARY KEY,
    table_number VARCHAR(16) NOT NULL,
    request_type VARCHAR(32) NOT NULL CHECK (request_type IN ('CALL_WAITER', 'REQUEST_BILL', 'WATER', 'CLEANING', 'CUSTOM')),
    custom_message TEXT,
    timestamp VARCHAR(32) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'RESOLVED')),
    resolved_by VARCHAR(64),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AUDIT LOGS & WAITER SHIFT SETTLEMENT
CREATE TABLE IF NOT EXISTS shift_settlements (
    id VARCHAR(64) PRIMARY KEY,
    captain_name VARCHAR(64) NOT NULL,
    shift_name VARCHAR(32) NOT NULL,
    tables_serviced INT NOT NULL DEFAULT 0,
    total_orders_count INT NOT NULL DEFAULT 0,
    total_revenue NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cash_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    upi_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    pos_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tips_accrued NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tables_status ON restaurant_tables(status);
CREATE INDEX IF NOT EXISTS idx_kot_tickets_table ON kot_tickets(table_number);
CREATE INDEX IF NOT EXISTS idx_kot_tickets_status ON kot_tickets(status);
CREATE INDEX IF NOT EXISTS idx_invoices_table ON tax_invoices(table_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON tax_invoices(settled_at);
CREATE INDEX IF NOT EXISTS idx_pings_status ON customer_service_pings(status);
