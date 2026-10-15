
-- 1. Users: patients, doctors and administrators
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'patient'
        CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctor profiles
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL,
    qualifications TEXT,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    consultation_fee NUMERIC(10, 2) DEFAULT 0 CHECK (consultation_fee >= 0),
    languages TEXT[] DEFAULT ARRAY['English'],
    verified BOOLEAN DEFAULT FALSE
);

-- 3. Patient appointments
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    appointment_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Preliminary symptom assessments
CREATE TABLE IF NOT EXISTS symptom_assessments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    symptoms TEXT[] NOT NULL,
    risk_level VARCHAR(20) NOT NULL
        CHECK (risk_level IN ('low', 'moderate', 'high')),
    recommendation TEXT NOT NULL,
    disclaimer TEXT NOT NULL DEFAULT
        'Preliminary guidance only; not a medical diagnosis.',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    patient_id INTEGER NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions TEXT,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Medical records and lab reports
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    uploaded_by INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient
    ON appointments(patient_id);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor
    ON appointments(doctor_id);

CREATE INDEX IF NOT EXISTS idx_assessments_patient
    ON symptom_assessments(patient_id);

CREATE INDEX IF NOT EXISTS idx_records_patient
    ON medical_records(patient_id);
