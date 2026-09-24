-- ==============================================================================
-- THOOGUDEEPA DONNE BIRYANI MANE - PRODUCTION SUPABASE DATABASE SCHEMA
-- Phase 1: Real-time Restaurant Floor, KDS, & Settlement Engine
-- ==============================================================================

-- 1. Tables Table (Floor Occupancy & Billing Matrix)
CREATE TABLE IF NOT EXISTS public.tables (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    section TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'VACANT', -- 'VACANT', 'OCCUPIED', 'BILLING', 'CLEANING'
    guest_count INT NOT NULL DEFAULT 0,
    current_bill NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    server_name TEXT NOT NULL DEFAULT 'Floor Captain',
    kot_count INT NOT NULL DEFAULT 0,
    merged_with TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Orders Table (Customer & Waiter Order Master)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL,
    guest_name TEXT NOT NULL DEFAULT 'Guest',
    guest_count INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 5% GST (2.5% CGST + 2.5% SGST)
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'NEW', -- 'NEW', 'COOKING', 'READY', 'SERVED', 'SETTLED'
    source TEXT NOT NULL DEFAULT 'CUSTOMER', -- 'CUSTOMER' or 'WAITER'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Order Items Table (Dish Line Items & Preparation Stages)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    stage TEXT NOT NULL DEFAULT 'PLACED', -- 'PLACED', 'PREP', 'PLATED', 'SERVED'
    prep_mode TEXT NOT NULL DEFAULT 'Handi',
    selected_option TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. KDS Tickets Table (Kitchen Display Tickets & Bump Bar)
CREATE TABLE IF NOT EXISTS public.kds_tickets (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    server_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW', -- 'NEW', 'PREP', 'READY', 'COMPLETED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Payments Table (Settlement & GST Invoices)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL,
    payment_method TEXT NOT NULL, -- 'UPI', 'CASH', 'POS'
    subtotal NUMERIC(10, 2) NOT NULL,
    cgst NUMERIC(10, 2) NOT NULL, -- 2.5%
    sgst NUMERIC(10, 2) NOT NULL, -- 2.5%
    total_amount NUMERIC(10, 2) NOT NULL,
    transaction_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Menu 86 Inventory Table (Live Stock-Out Toggles)
CREATE TABLE IF NOT EXISTS public.menu_86 (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_86 BOOLEAN NOT NULL DEFAULT FALSE,
    prep_delay_minutes INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INITIAL SEED DATA FOR 8 CORE DINING TABLES
-- ==============================================================================
INSERT INTO public.tables (id, number, section, capacity, status, server_name)
VALUES
    ('t-1', 'A-01', 'SECTION A', 4, 'VACANT', 'Captain Ramesh'),
    ('t-2', 'A-02', 'SECTION A', 2, 'VACANT', 'Captain Ramesh'),
    ('t-3', 'A-03', 'SECTION A', 6, 'VACANT', 'Captain Ramesh'),
    ('t-4', 'A-04', 'SECTION A', 4, 'VACANT', 'Captain Ramesh'),
    ('t-5', 'B-01', 'SECTION B', 4, 'VACANT', 'Captain Suresh'),
    ('t-6', 'B-02', 'SECTION B', 2, 'VACANT', 'Captain Suresh'),
    ('t-7', 'B-03', 'SECTION B', 6, 'VACANT', 'Captain Suresh'),
    ('t-8', 'C-01', 'SECTION C', 8, 'VACANT', 'Captain Vijay')
ON CONFLICT (number) DO NOTHING;

-- ==============================================================================
-- ENABLE SUPABASE REALTIME WEBSOCKET REPLICATION (BROADCAST TO ALL DEVICES)
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kds_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_86;
