-- Migration: Doctor Dashboard enhancements
-- Non-destructive, adds columns and tables if they do not exist

-- 1. Extend doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS working_hours VARCHAR(50) DEFAULT '09:00 AM - 05:00 PM';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slot_duration_mins INTEGER DEFAULT 30;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS about TEXT DEFAULT 'Certified medical specialist dedicated to evidence-based compassionate patient care and digital health consultations.';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 4.90;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 24;

-- 2. Extend appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS consultation_type VARCHAR(20) DEFAULT 'video';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'paid';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'UPI / Card (Demo)';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinical_notes TEXT;

-- 3. Doctor Announcements Table
CREATE TABLE IF NOT EXISTS doctor_announcements (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    tag VARCHAR(50) DEFAULT 'Practice Update',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Doctor Reviews Table
CREATE TABLE IF NOT EXISTS doctor_reviews (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES users(id),
    patient_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_doctor ON doctor_announcements(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON doctor_reviews(doctor_id);
