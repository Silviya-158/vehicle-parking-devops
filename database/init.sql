-- ============================================================
-- Vehicle Parking Slot Management System - Database Schema
-- Compatible with PostgreSQL 15+
-- ============================================================

-- Drop tables if they already exist (in reverse foreign-key order)
DROP TABLE IF EXISTS parking_records CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS parking_slots CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PARKING SLOTS TABLE
CREATE TABLE parking_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
    slot_type VARCHAR(20) NOT NULL DEFAULT 'CAR' CHECK (slot_type IN ('CAR', 'BIKE', 'EV', 'TRUCK')),
    floor VARCHAR(30) NOT NULL DEFAULT 'Ground Floor',
    zone VARCHAR(30) NOT NULL DEFAULT 'Zone A',
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. RESERVATIONS TABLE
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES parking_slots(id) ON DELETE RESTRICT,
    vehicle_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'CAR' CHECK (vehicle_type IN ('CAR', 'BIKE', 'EV', 'TRUCK')),
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED')),
    notes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PARKING RECORDS TABLE
CREATE TABLE parking_records (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES parking_slots(id) ON DELETE RESTRICT,
    reservation_id BIGINT REFERENCES reservations(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'CAR' CHECK (vehicle_type IN ('CAR', 'BIKE', 'EV', 'TRUCK')),
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP WITH TIME ZONE,
    duration_minutes BIGINT DEFAULT 0,
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    total_fee NUMERIC(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(30) DEFAULT 'CASH',
    status VARCHAR(20) NOT NULL DEFAULT 'PARKED' CHECK (status IN ('PARKED', 'COMPLETED', 'CANCELLED')),
    notes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_parking_slots_status ON parking_slots(status);
CREATE INDEX idx_parking_slots_type ON parking_slots(slot_type);
CREATE INDEX idx_parking_records_vehicle ON parking_records(vehicle_number);
CREATE INDEX idx_parking_records_status ON parking_records(status);
CREATE INDEX idx_parking_records_entry_time ON parking_records(entry_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_start_end ON reservations(start_time, end_time);

-- ============================================================
-- SEED DATA
-- Passwords:
-- 'admin123' -> $2a$10$WLXc4N0urYuo/g.olioLuexGi9r.hmLllY4nXtFtdr2kES42c2xcO (BCrypt)
-- 'staff123' -> $2a$10$5ZxwcH/ZLX9Z5U5aZpk8WeiEhIW6cwlG8opEjXYBGHc1nP274M0kK (BCrypt)
-- Note: Spring Boot DataInitializer also ensures BCrypt hashes match system encoder
-- ============================================================

-- Users: 1 Admin, 1 Staff
INSERT INTO users (username, password, full_name, email, role, active)
VALUES 
('admin', '$2a$10$WLXc4N0urYuo/g.olioLuexGi9r.hmLllY4nXtFtdr2kES42c2xcO', 'System Administrator', 'admin@parkflow.io', 'ADMIN', TRUE),
('staff', '$2a$10$5ZxwcH/ZLX9Z5U5aZpk8WeiEhIW6cwlG8opEjXYBGHc1nP274M0kK', 'Sarah Jenkins', 'sarah.staff@parkflow.io', 'STAFF', TRUE);

-- Parking Slots: Diverse zones, floors, types
INSERT INTO parking_slots (slot_number, status, slot_type, floor, zone, hourly_rate)
VALUES 
-- Ground Floor - Zone A (Cars)
('A-01', 'OCCUPIED', 'CAR', 'Ground Floor', 'Zone A', 5.00),
('A-02', 'AVAILABLE', 'CAR', 'Ground Floor', 'Zone A', 5.00),
('A-03', 'AVAILABLE', 'CAR', 'Ground Floor', 'Zone A', 5.00),
('A-04', 'RESERVED', 'CAR', 'Ground Floor', 'Zone A', 5.00),
('A-05', 'OCCUPIED', 'CAR', 'Ground Floor', 'Zone A', 5.00),
('A-06', 'AVAILABLE', 'CAR', 'Ground Floor', 'Zone A', 5.00),

-- Ground Floor - Zone B (Bikes & Two-Wheelers)
('B-01', 'OCCUPIED', 'BIKE', 'Ground Floor', 'Zone B', 2.50),
('B-02', 'AVAILABLE', 'BIKE', 'Ground Floor', 'Zone B', 2.50),
('B-03', 'AVAILABLE', 'BIKE', 'Ground Floor', 'Zone B', 2.50),
('B-04', 'AVAILABLE', 'BIKE', 'Ground Floor', 'Zone B', 2.50),

-- Level 1 - Zone C (Cars & EV Charging)
('C-01', 'OCCUPIED', 'EV', 'Level 1', 'Zone C (EV)', 7.50),
('C-02', 'AVAILABLE', 'EV', 'Level 1', 'Zone C (EV)', 7.50),
('C-03', 'RESERVED', 'EV', 'Level 1', 'Zone C (EV)', 7.50),
('C-04', 'AVAILABLE', 'CAR', 'Level 1', 'Zone C', 5.00),
('C-05', 'AVAILABLE', 'CAR', 'Level 1', 'Zone C', 5.00),
('C-06', 'AVAILABLE', 'CAR', 'Level 1', 'Zone C', 5.00),

-- Basement - VIP / Executive Zone
('V-01', 'OCCUPIED', 'CAR', 'Basement', 'VIP Zone', 10.00),
('V-02', 'AVAILABLE', 'CAR', 'Basement', 'VIP Zone', 10.00);

-- Active Reservations
INSERT INTO reservations (slot_id, vehicle_number, vehicle_type, driver_name, phone_number, start_time, end_time, status, notes)
VALUES 
(4, 'KA-05-MJ-4412', 'CAR', 'Robert Langdon', '+1-555-0192', CURRENT_TIMESTAMP + INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '5 hours', 'CONFIRMED', 'Client meeting at HQ'),
(13, 'DL-01-EV-9820', 'EV', 'Dr. Evelyn Reed', '+1-555-0144', CURRENT_TIMESTAMP + INTERVAL '30 minutes', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'CONFIRMED', 'Requires fast charging');

-- Active Currently Parked Vehicles
INSERT INTO parking_records (slot_id, vehicle_number, vehicle_type, driver_name, phone_number, entry_time, hourly_rate, status, notes)
VALUES 
(1, 'MH-02-CB-1029', 'CAR', 'David Miller', '+1-555-0101', CURRENT_TIMESTAMP - INTERVAL '3 hours 15 minutes', 5.00, 'PARKED', 'Visitor Pass #A01'),
(5, 'KA-01-EQ-7788', 'CAR', 'Priya Sharma', '+1-555-0102', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes', 5.00, 'PARKED', 'Staff regular slot'),
(7, 'MH-12-BK-5521', 'BIKE', 'Alex Morgan', '+1-555-0103', CURRENT_TIMESTAMP - INTERVAL '4 hours 20 minutes', 2.50, 'PARKED', 'Courier delivery'),
(11, 'KA-03-EV-3301', 'EV', 'Michael Chang', '+1-555-0104', CURRENT_TIMESTAMP - INTERVAL '2 hours 10 minutes', 7.50, 'PARKED', 'EV Slot 1 active charging'),
(17, 'MH-01-VP-0007', 'CAR', 'Sophia Loren', '+1-555-0105', CURRENT_TIMESTAMP - INTERVAL '5 hours 50 minutes', 10.00, 'PARKED', 'Executive VIP parking');

-- Completed Historical Parking Records (for realistic history and dashboard charts)
INSERT INTO parking_records (slot_id, vehicle_number, vehicle_type, driver_name, phone_number, entry_time, exit_time, duration_minutes, hourly_rate, total_fee, payment_method, status)
VALUES 
(2, 'KA-04-TR-1199', 'CAR', 'James Wilson', '+1-555-0201', CURRENT_TIMESTAMP - INTERVAL '1 day 4 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour', 180, 5.00, 15.00, 'CARD', 'COMPLETED'),
(3, 'DL-03-XY-8844', 'CAR', 'Anita Desai', '+1-555-0202', CURRENT_TIMESTAMP - INTERVAL '1 day 6 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 3 hours', 180, 5.00, 15.00, 'UPI', 'COMPLETED'),
(8, 'MH-04-BK-4422', 'BIKE', 'Kevin Peterson', '+1-555-0203', CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 1 hour', 120, 2.50, 5.00, 'CASH', 'COMPLETED'),
(12, 'KA-02-EV-9090', 'EV', 'Vikram Seth', '+1-555-0204', CURRENT_TIMESTAMP - INTERVAL '2 days 7 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 4 hours', 180, 7.50, 22.50, 'CARD', 'COMPLETED'),
(1, 'MH-02-AA-9988', 'CAR', 'Lisa Kudrow', '+1-555-0205', CURRENT_TIMESTAMP - INTERVAL '3 days 5 hours', CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours', 180, 5.00, 15.00, 'CARD', 'COMPLETED'),
(6, 'KA-01-BB-3322', 'CAR', 'Carlos Santana', '+1-555-0206', CURRENT_TIMESTAMP - INTERVAL '4 days 8 hours', CURRENT_TIMESTAMP - INTERVAL '4 days 3 hours', 300, 5.00, 25.00, 'CASH', 'COMPLETED'),
(10, 'MH-14-BK-8811', 'BIKE', 'Rohan Mehta', '+1-555-0207', CURRENT_TIMESTAMP - INTERVAL '5 days 4 hours', CURRENT_TIMESTAMP - INTERVAL '5 days 2 hours', 120, 2.50, 5.00, 'UPI', 'COMPLETED');
