require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken, optionalAuth, JWT_SECRET } = require("./middleware/auth");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to sanitize user object (never expose password_hash)
function sanitizeUser(user) {
    const { password_hash, ...safeUser } = user;
    return safeUser;
}

// -------------------------------------------------------------
// 1. BASE & HEALTH CHECK ROUTES
// -------------------------------------------------------------

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Illazz backend is running",
        status: "success",
        version: "2.0.0"
    });
});

// Database test route
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            success: true,
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("DB Test Error:", error);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// -------------------------------------------------------------
// 2. AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Register
app.post("/api/auth/register", async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            full_name,
            email,
            password,
            role = "patient",
            specialization,
            qualifications,
            experience_years,
            consultation_fee,
            languages
        } = req.body;

        if (!full_name || full_name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Full name must be at least 2 characters long."
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const validRole = ["patient", "doctor"].includes(role) ? role : "patient";

        // Check if email already registered
        const existing = await client.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email.trim()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists. Please log in."
            });
        }

        await client.query("BEGIN");

        const password_hash = await bcrypt.hash(password, 10);
        const userInsert = await client.query(
            `INSERT INTO users (full_name, email, password_hash, role)
             VALUES ($1, LOWER($2), $3, $4)
             RETURNING id, full_name, email, role, created_at`,
            [full_name.trim(), email.trim(), password_hash, validRole]
        );

        const newUser = userInsert.rows[0];
        let doctorProfile = null;

        if (validRole === "doctor") {
            const docInsert = await client.query(
                `INSERT INTO doctors (user_id, specialization, qualifications, experience_years, consultation_fee, languages, verified)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, specialization, qualifications, experience_years, consultation_fee, languages, verified`,
                [
                    newUser.id,
                    specialization || "General Physician",
                    qualifications || "MBBS (Demo)",
                    experience_years ? parseInt(experience_years, 10) : 3,
                    consultation_fee ? parseFloat(consultation_fee) : 500.00,
                    Array.isArray(languages) ? languages : ["English", "Hindi"],
                    true
                ]
            );
            doctorProfile = docInsert.rows[0];
        }

        await client.query("COMMIT");

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role, full_name: newUser.full_name },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "Account registered successfully.",
            token,
            user: {
                ...newUser,
                doctor: doctorProfile
            }
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Register Error:", err);
        res.status(500).json({
            success: false,
            message: "Registration failed due to a server error."
        });
    } finally {
        client.release();
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.created_at,
                    d.id AS doctor_id, d.specialization, d.qualifications, d.experience_years, d.consultation_fee, d.languages, d.verified
             FROM users u
             LEFT JOIN doctors d ON u.id = d.user_id
             WHERE LOWER(u.email) = LOWER($1)`,
            [email.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const userRow = result.rows[0];
        const match = await bcrypt.compare(password, userRow.password_hash);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: userRow.id, email: userRow.email, role: userRow.role, full_name: userRow.full_name },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const safeUser = sanitizeUser(userRow);
        if (safeUser.role === "doctor" && safeUser.doctor_id) {
            safeUser.doctor = {
                id: safeUser.doctor_id,
                specialization: safeUser.specialization,
                qualifications: safeUser.qualifications,
                experience_years: safeUser.experience_years,
                consultation_fee: safeUser.consultation_fee,
                languages: safeUser.languages,
                verified: safeUser.verified
            };
        }
        delete safeUser.doctor_id;

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: safeUser
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({
            success: false,
            message: "Login failed due to a server error."
        });
    }
});

// Current User Profile (Me)
app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.role, u.created_at,
                    d.id AS doctor_id, d.specialization, d.qualifications, d.experience_years, d.consultation_fee, d.languages, d.verified
             FROM users u
             LEFT JOIN doctors d ON u.id = d.user_id
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const safeUser = sanitizeUser(result.rows[0]);
        if (safeUser.role === "doctor" && safeUser.doctor_id) {
            safeUser.doctor = {
                id: safeUser.doctor_id,
                specialization: safeUser.specialization,
                qualifications: safeUser.qualifications,
                experience_years: safeUser.experience_years,
                consultation_fee: safeUser.consultation_fee,
                languages: safeUser.languages,
                verified: safeUser.verified
            };
        }
        delete safeUser.doctor_id;

        res.json({
            success: true,
            user: safeUser
        });
    } catch (err) {
        console.error("Auth Me Error:", err);
        res.status(500).json({
            success: false,
            message: "Could not fetch user profile."
        });
    }
});

// Update Profile
app.put("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
        const { full_name } = req.body;
        if (!full_name || full_name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Full name must be at least 2 characters long."
            });
        }

        const updated = await pool.query(
            `UPDATE users 
             SET full_name = $1 
             WHERE id = $2 
             RETURNING id, full_name, email, role, created_at`,
            [full_name.trim(), req.user.id]
        );

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: updated.rows[0]
        });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({
            success: false,
            message: "Could not update profile."
        });
    }
});

// -------------------------------------------------------------
// 3. DASHBOARD STATISTICS
// -------------------------------------------------------------

app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (role === "patient") {
            const upcomingRes = await pool.query(
                `SELECT COUNT(*) FROM appointments 
                 WHERE patient_id = $1 AND status = 'scheduled' AND appointment_at >= NOW()`,
                [userId]
            );

            const completedRes = await pool.query(
                `SELECT COUNT(*) FROM appointments 
                 WHERE patient_id = $1 AND status = 'completed'`,
                [userId]
            );

            const rxRes = await pool.query(
                `SELECT COUNT(*) FROM prescriptions WHERE patient_id = $1`,
                [userId]
            );

            const assessRes = await pool.query(
                `SELECT COUNT(*) FROM symptom_assessments WHERE patient_id = $1`,
                [userId]
            );

            // Recent activity: appointments
            const recentAppts = await pool.query(
                `SELECT a.id, a.appointment_at, a.status, a.reason,
                        u.full_name AS doctor_name, d.specialization
                 FROM appointments a
                 JOIN doctors d ON a.doctor_id = d.id
                 JOIN users u ON d.user_id = u.id
                 WHERE a.patient_id = $1
                 ORDER BY a.appointment_at DESC
                 LIMIT 3`,
                [userId]
            );

            // Recent activity: assessments
            const recentAssessments = await pool.query(
                `SELECT id, symptoms, risk_level, recommendation, created_at
                 FROM symptom_assessments
                 WHERE patient_id = $1
                 ORDER BY created_at DESC
                 LIMIT 3`,
                [userId]
            );

            return res.json({
                success: true,
                stats: {
                    upcoming_appointments: parseInt(upcomingRes.rows[0].count, 10),
                    completed_consultations: parseInt(completedRes.rows[0].count, 10),
                    prescriptions_count: parseInt(rxRes.rows[0].count, 10),
                    assessments_count: parseInt(assessRes.rows[0].count, 10)
                },
                recent_appointments: recentAppts.rows,
                recent_assessments: recentAssessments.rows
            });
        } else {
            // Doctor view
            const docRes = await pool.query("SELECT id FROM doctors WHERE user_id = $1", [userId]);
            const doctorId = docRes.rows[0]?.id || 0;

            const upcomingRes = await pool.query(
                `SELECT COUNT(*) FROM appointments 
                 WHERE doctor_id = $1 AND status = 'scheduled' AND appointment_at >= NOW()`,
                [doctorId]
            );

            const totalConsults = await pool.query(
                `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'completed'`,
                [doctorId]
            );

            const rxCount = await pool.query(
                `SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1`,
                [doctorId]
            );

            const recentAppts = await pool.query(
                `SELECT a.id, a.appointment_at, a.status, a.reason,
                        u.full_name AS patient_name, u.email AS patient_email
                 FROM appointments a
                 JOIN users u ON a.patient_id = u.id
                 WHERE a.doctor_id = $1
                 ORDER BY a.appointment_at DESC
                 LIMIT 5`,
                [doctorId]
            );

            return res.json({
                success: true,
                stats: {
                    upcoming_appointments: parseInt(upcomingRes.rows[0].count, 10),
                    completed_consultations: parseInt(totalConsults.rows[0].count, 10),
                    prescriptions_count: parseInt(rxCount.rows[0].count, 10),
                    assessments_count: 0
                },
                recent_appointments: recentAppts.rows,
                recent_assessments: []
            });
        }
    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({
            success: false,
            message: "Could not retrieve dashboard statistics."
        });
    }
});

// -------------------------------------------------------------
// 4. DOCTORS DIRECTORY ROUTES
// -------------------------------------------------------------

app.get("/api/doctors", async (req, res) => {
    try {
        const { search, specialization } = req.query;

        let query = `
            SELECT
                d.id,
                u.full_name AS name,
                d.specialization,
                d.qualifications,
                d.experience_years,
                d.consultation_fee,
                d.languages,
                d.verified
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE u.role = 'doctor'
        `;
        const params = [];

        if (specialization && specialization !== "All") {
            params.push(specialization);
            query += ` AND d.specialization = $${params.length}`;
        }

        if (search && search.trim().length > 0) {
            params.push(`%${search.trim().toLowerCase()}%`);
            query += ` AND (LOWER(u.full_name) LIKE $${params.length} OR LOWER(d.specialization) LIKE $${params.length} OR LOWER(d.qualifications) LIKE $${params.length})`;
        }

        query += ` ORDER BY d.id`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            doctors: result.rows
        });
    } catch (error) {
        console.error("DOCTORS API ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not retrieve doctors"
        });
    }
});

app.get("/api/doctors/:id", async (req, res) => {
    try {
        const docId = parseInt(req.params.id, 10);
        if (isNaN(docId)) {
            return res.status(400).json({ success: false, message: "Invalid doctor ID." });
        }

        const result = await pool.query(
            `SELECT
                d.id,
                u.full_name AS name,
                u.email,
                d.specialization,
                d.qualifications,
                d.experience_years,
                d.consultation_fee,
                d.languages,
                d.verified
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = $1`,
            [docId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        res.json({
            success: true,
            doctor: result.rows[0]
        });
    } catch (error) {
        console.error("GET DOCTOR BY ID ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not retrieve doctor details."
        });
    }
});

// Specializations list
app.get("/api/specializations", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT specialization FROM doctors ORDER BY specialization`
        );
        const specializations = result.rows.map(r => r.specialization);
        res.json({
            success: true,
            specializations
        });
    } catch (error) {
        console.error("SPECIALIZATIONS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Could not retrieve specializations."
        });
    }
});

// -------------------------------------------------------------
// 5. SYMPTOM ASSESSMENT & TRIAGE ROUTES
// -------------------------------------------------------------

app.post("/api/symptoms", optionalAuth, async (req, res) => {
    try {
        const { symptoms, notes } = req.body;

        // Validate input
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one symptom."
            });
        }

        // Clean & normalize symptoms
        const normalizedSymptoms = symptoms.map(s => String(s).toLowerCase().trim()).filter(Boolean);

        if (normalizedSymptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid symptom strings."
            });
        }

        // Comprehensive Triage Classification
        const urgentEmergencyKeywords = [
            "chest pain", "difficulty breathing", "shortness of breath",
            "loss of consciousness", "severe bleeding", "sudden numbness",
            "paralysis", "coughing blood", "seizure", "unresponsive", "anaphylaxis"
        ];

        const moderateKeywords = [
            "fever", "cough", "headache", "abdominal pain", "persistent vomiting",
            "dizziness", "throat pain", "body ache", "nausea", "rash", "joint pain", "earache"
        ];

        let risk = "low";
        let isEmergency = false;

        const hasEmergency = normalizedSymptoms.some(s =>
            urgentEmergencyKeywords.some(keyword => s.includes(keyword))
        );

        const hasModerate = normalizedSymptoms.some(s =>
            moderateKeywords.some(keyword => s.includes(keyword))
        );

        if (hasEmergency) {
            risk = "high";
            isEmergency = true;
        } else if (hasModerate) {
            risk = "moderate";
        }

        let recommendation = "";
        let emergency_guidance = null;

        if (risk === "high") {
            recommendation = "Seek immediate emergency medical attention or go to the nearest emergency room without delay.";
            emergency_guidance = "Call national emergency services (112 / 911 / 102) immediately. Do not drive yourself if experiencing chest pain, severe shortness of breath, or sudden weakness.";
        } else if (risk === "moderate") {
            recommendation = "Please book a consultation with an affiliated doctor for a comprehensive medical evaluation and clinical diagnosis.";
        } else {
            recommendation = "Monitor your symptoms, maintain hydration, and rest. If symptoms worsen or persist for more than 48 hours, schedule a doctor consultation.";
        }

        const disclaimer = "Illazz AI Symptom Checker provides preliminary health guidance for educational purposes only. It does NOT constitute medical advice, diagnosis, or treatment. Always consult a licensed physician for medical concerns.";

        // Persist to PostgreSQL if authenticated user
        let savedAssessmentId = null;
        if (req.user && req.user.id) {
            try {
                const insertRes = await pool.query(
                    `INSERT INTO symptom_assessments (patient_id, symptoms, risk_level, recommendation, disclaimer)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [req.user.id, normalizedSymptoms, risk, recommendation, disclaimer]
                );
                savedAssessmentId = insertRes.rows[0].id;
            } catch (saveErr) {
                console.error("Could not save assessment:", saveErr.message);
            }
        }

        res.json({
            success: true,
            type: "preliminary_assessment",
            assessment_id: savedAssessmentId,
            symptoms: normalizedSymptoms,
            risk,
            isEmergency,
            recommendation,
            emergency_guidance,
            disclaimer,
            created_at: new Date().toISOString()
        });
    } catch (err) {
        console.error("SYMPTOMS API ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Symptom assessment failed due to a server error."
        });
    }
});

// Assessment History
app.get("/api/symptoms/history", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, symptoms, risk_level, recommendation, disclaimer, created_at
             FROM symptom_assessments
             WHERE patient_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            assessments: result.rows
        });
    } catch (err) {
        console.error("Assessment History Error:", err);
        res.status(500).json({
            success: false,
            message: "Could not retrieve assessment history."
        });
    }
});

// -------------------------------------------------------------
// 6. APPOINTMENTS ROUTES
// -------------------------------------------------------------

// List appointments
app.get("/api/appointments", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = "";
        let params = [];

        if (role === "patient") {
            query = `
                SELECT 
                    a.id,
                    a.patient_id,
                    a.doctor_id,
                    a.appointment_at,
                    a.status,
                    a.reason,
                    a.created_at,
                    u.full_name AS doctor_name,
                    d.specialization,
                    d.qualifications,
                    d.consultation_fee,
                    d.languages,
                    d.verified
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                JOIN users u ON d.user_id = u.id
                WHERE a.patient_id = $1
                ORDER BY a.appointment_at DESC
            `;
            params = [userId];
        } else {
            // Doctor view
            query = `
                SELECT 
                    a.id,
                    a.patient_id,
                    a.doctor_id,
                    a.appointment_at,
                    a.status,
                    a.reason,
                    a.created_at,
                    u.full_name AS patient_name,
                    u.email AS patient_email
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                JOIN users u ON a.patient_id = u.id
                WHERE d.user_id = $1
                ORDER BY a.appointment_at DESC
            `;
            params = [userId];
        }

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            appointments: result.rows
        });
    } catch (err) {
        console.error("APPOINTMENTS GET ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Could not retrieve appointments."
        });
    }
});

// Book appointment
app.post("/api/appointments", authenticateToken, async (req, res) => {
    try {
        const { doctor_id, appointment_at, reason } = req.body;
        const patient_id = req.user.id;

        if (!doctor_id) {
            return res.status(400).json({
                success: false,
                message: "Please select a doctor."
            });
        }

        if (!appointment_at) {
            return res.status(400).json({
                success: false,
                message: "Please select a date and time for your appointment."
            });
        }

        const apptDate = new Date(appointment_at);
        if (isNaN(apptDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date format."
            });
        }

        if (!reason || reason.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please provide a reason or symptoms description (min 3 characters)."
            });
        }

        // Verify doctor exists
        const docCheck = await pool.query("SELECT id FROM doctors WHERE id = $1", [doctor_id]);
        if (docCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Selected doctor profile was not found."
            });
        }

        const insertRes = await pool.query(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_at, status, reason)
             VALUES ($1, $2, $3, 'scheduled', $4)
             RETURNING id, patient_id, doctor_id, appointment_at, status, reason, created_at`,
            [patient_id, doctor_id, apptDate, reason.trim()]
        );

        // Fetch full appointment with doctor info to return directly
        const fullAppt = await pool.query(
            `SELECT 
                a.id,
                a.patient_id,
                a.doctor_id,
                a.appointment_at,
                a.status,
                a.reason,
                a.created_at,
                u.full_name AS doctor_name,
                d.specialization,
                d.consultation_fee
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             JOIN users u ON d.user_id = u.id
             WHERE a.id = $1`,
            [insertRes.rows[0].id]
        );

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            appointment: fullAppt.rows[0]
        });
    } catch (err) {
        console.error("APPOINTMENT BOOKING ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to book appointment due to a database error."
        });
    }
});

// Cancel appointment
app.patch("/api/appointments/:id/cancel", authenticateToken, async (req, res) => {
    try {
        const apptId = parseInt(req.params.id, 10);
        if (isNaN(apptId)) {
            return res.status(400).json({ success: false, message: "Invalid appointment ID." });
        }

        // Verify ownership
        const apptCheck = await pool.query(
            `SELECT a.id, a.patient_id, d.user_id AS doctor_user_id
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.id = $1`,
            [apptId]
        );

        if (apptCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        const appt = apptCheck.rows[0];
        if (appt.patient_id !== req.user.id && appt.doctor_user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this appointment."
            });
        }

        await pool.query(
            `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
            [apptId]
        );

        res.json({
            success: true,
            message: "Appointment cancelled successfully."
        });
    } catch (err) {
        console.error("CANCEL APPOINTMENT ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Could not cancel appointment."
        });
    }
});

// -------------------------------------------------------------
// 7. PRESCRIPTIONS & MEDICAL RECORDS ROUTES
// -------------------------------------------------------------

// Prescriptions
app.get("/api/prescriptions", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = "";
        let params = [userId];

        if (role === "patient") {
            query = `
                SELECT 
                    p.id,
                    p.appointment_id,
                    p.patient_id,
                    p.doctor_id,
                    p.medicines,
                    p.instructions,
                    p.issued_at,
                    u.full_name AS doctor_name,
                    d.specialization
                FROM prescriptions p
                JOIN doctors d ON p.doctor_id = d.id
                JOIN users u ON d.user_id = u.id
                WHERE p.patient_id = $1
                ORDER BY p.issued_at DESC
            `;
        } else {
            query = `
                SELECT 
                    p.id,
                    p.appointment_id,
                    p.patient_id,
                    p.doctor_id,
                    p.medicines,
                    p.instructions,
                    p.issued_at,
                    u.full_name AS patient_name,
                    u.email AS patient_email
                FROM prescriptions p
                JOIN doctors d ON p.doctor_id = d.id
                JOIN users u ON p.patient_id = u.id
                WHERE d.user_id = $1
                ORDER BY p.issued_at DESC
            `;
        }

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            prescriptions: result.rows
        });
    } catch (err) {
        console.error("PRESCRIPTIONS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Could not retrieve prescriptions."
        });
    }
});

// Medical Records - List
app.get("/api/medical-records", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                r.id,
                r.patient_id,
                r.uploaded_by,
                r.title,
                r.record_type,
                r.file_url,
                r.notes,
                r.created_at,
                u.full_name AS uploaded_by_name
             FROM medical_records r
             LEFT JOIN users u ON r.uploaded_by = u.id
             WHERE r.patient_id = $1
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            count: result.rows.length,
            records: result.rows
        });
    } catch (err) {
        console.error("MEDICAL RECORDS GET ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Could not retrieve medical records."
        });
    }
});

// Medical Records - Add new record
app.post("/api/medical-records", authenticateToken, async (req, res) => {
    try {
        const { title, record_type, notes, file_url } = req.body;

        if (!title || title.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Record title must be at least 2 characters."
            });
        }

        if (!record_type) {
            return res.status(400).json({
                success: false,
                message: "Record type is required (e.g. Lab Report, Doctor Note, Prescription)."
            });
        }

        const insertRes = await pool.query(
            `INSERT INTO medical_records (patient_id, uploaded_by, title, record_type, notes, file_url)
             VALUES ($1, $1, $2, $3, $4, $5)
             RETURNING id, patient_id, uploaded_by, title, record_type, notes, file_url, created_at`,
            [req.user.id, title.trim(), record_type.trim(), notes ? notes.trim() : null, file_url || null]
        );

        res.status(201).json({
            success: true,
            message: "Medical record saved successfully.",
            record: insertRes.rows[0]
        });
    } catch (err) {
        console.error("ADD MEDICAL RECORD ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Could not save medical record."
        });
    }
});

// -------------------------------------------------------------
// 8. DOCTOR DASHBOARD & PRACTICE MANAGEMENT ROUTES
// -------------------------------------------------------------

// Helper middleware: Ensure user is a verified doctor and attach doctor record to req.doctor
async function requireDoctor(req, res, next) {
    if (!req.user || req.user.role !== "doctor") {
        return res.status(403).json({
            success: false,
            message: "Access restricted to medical doctors only."
        });
    }

    try {
        const docRes = await pool.query(
            `SELECT d.*, u.full_name, u.email 
             FROM doctors d 
             JOIN users u ON d.user_id = u.id 
             WHERE d.user_id = $1`,
            [req.user.id]
        );

        if (docRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found for this account."
            });
        }

        req.doctor = docRes.rows[0];
        next();
    } catch (err) {
        console.error("Require Doctor Middleware Error:", err);
        res.status(500).json({ success: false, message: "Error verifying doctor profile." });
    }
}

// 8.1. Doctor Dashboard Analytics & Overview
app.get("/api/doctor/dashboard-stats", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        // Today's appointments count
        const todayCountRes = await pool.query(
            `SELECT COUNT(*) FROM appointments 
             WHERE doctor_id = $1 AND appointment_at::date = CURRENT_DATE AND status != 'cancelled'`,
            [doctorId]
        );

        // Total distinct patients treated or scheduled
        const totalPatientsRes = await pool.query(
            `SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1`,
            [doctorId]
        );

        // This month's earnings (completed consultations in current month)
        const fee = parseFloat(req.doctor.consultation_fee) || 800;
        const monthCompletedRes = await pool.query(
            `SELECT COUNT(*) FROM appointments 
             WHERE doctor_id = $1 AND status = 'completed' AND appointment_at >= date_trunc('month', CURRENT_DATE)`,
            [doctorId]
        );
        const thisMonthEarnings = parseInt(monthCompletedRes.rows[0].count, 10) * fee;

        // Average rating & review count
        const ratingRes = await pool.query(
            `SELECT COALESCE(AVG(rating), $2) AS avg_rating, COUNT(*) AS count 
             FROM doctor_reviews 
             WHERE doctor_id = $1`,
            [doctorId, req.doctor.rating || 4.9]
        );

        const avgRating = parseFloat(ratingRes.rows[0].avg_rating).toFixed(1);
        const reviewCount = parseInt(ratingRes.rows[0].count, 10) || req.doctor.review_count || 24;

        // Today's appointments timeline
        const todayApptsRes = await pool.query(
            `SELECT a.id, a.patient_id, a.appointment_at, a.status, a.reason,
                    a.consultation_type, a.payment_status,
                    u.full_name AS patient_name, u.email AS patient_email
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             WHERE a.doctor_id = $1 AND a.appointment_at::date = CURRENT_DATE
             ORDER BY a.appointment_at ASC`,
            [doctorId]
        );

        // Upcoming appointments (future days)
        const upcomingApptsRes = await pool.query(
            `SELECT a.id, a.patient_id, a.appointment_at, a.status, a.reason,
                    a.consultation_type, a.payment_status,
                    u.full_name AS patient_name, u.email AS patient_email
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             WHERE a.doctor_id = $1 AND a.appointment_at > NOW() AND a.status = 'scheduled'
             ORDER BY a.appointment_at ASC
             LIMIT 6`,
            [doctorId]
        );

        // Recent completed appointments
        const recentCompletedRes = await pool.query(
            `SELECT a.id, a.patient_id, a.appointment_at, a.status, a.reason,
                    u.full_name AS patient_name
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             WHERE a.doctor_id = $1 AND a.status = 'completed'
             ORDER BY a.appointment_at DESC
             LIMIT 4`,
            [doctorId]
        );

        res.json({
            success: true,
            doctor: {
                id: req.doctor.id,
                name: req.doctor.full_name,
                email: req.doctor.email,
                specialization: req.doctor.specialization,
                qualifications: req.doctor.qualifications,
                consultation_fee: req.doctor.consultation_fee,
                verified: req.doctor.verified,
                rating: avgRating,
                review_count: reviewCount
            },
            stats: {
                today_appointments: parseInt(todayCountRes.rows[0].count, 10),
                total_patients: parseInt(totalPatientsRes.rows[0].count, 10),
                this_month_earnings: thisMonthEarnings,
                completed_consultations: parseInt(monthCompletedRes.rows[0].count, 10),
                average_rating: avgRating,
                review_count: reviewCount
            },
            today_appointments: todayApptsRes.rows,
            upcoming_appointments: upcomingApptsRes.rows,
            recent_completed: recentCompletedRes.rows
        });
    } catch (err) {
        console.error("Doctor Dashboard Stats Error:", err);
        res.status(500).json({ success: false, message: "Could not load doctor dashboard statistics." });
    }
});

// 8.2. Doctor Appointments List & Filters
app.get("/api/doctor/appointments", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const { status = "all", search = "" } = req.query;

        let query = `
            SELECT a.id, a.patient_id, a.appointment_at, a.status, a.reason,
                   a.consultation_type, a.payment_status, a.clinical_notes, a.created_at,
                   u.full_name AS patient_name, u.email AS patient_email
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = $1
        `;
        const params = [doctorId];

        if (status === "today") {
            query += " AND a.appointment_at::date = CURRENT_DATE";
        } else if (status === "upcoming") {
            query += " AND a.appointment_at >= NOW() AND a.status = 'scheduled'";
        } else if (status === "completed") {
            query += " AND a.status = 'completed'";
        } else if (status === "cancelled") {
            query += " AND a.status = 'cancelled'";
        }

        if (search && search.trim().length > 0) {
            params.push(`%${search.trim().toLowerCase()}%`);
            query += ` AND (LOWER(u.full_name) LIKE $${params.length} OR LOWER(a.reason) LIKE $${params.length})`;
        }

        query += " ORDER BY a.appointment_at DESC";

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            appointments: result.rows
        });
    } catch (err) {
        console.error("Doctor Appointments Error:", err);
        res.status(500).json({ success: false, message: "Could not retrieve doctor appointments." });
    }
});

// 8.3. Update Appointment (Complete, Cancel, Reschedule, Clinical Notes)
app.patch("/api/doctor/appointments/:id", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const apptId = parseInt(req.params.id, 10);
        const doctorId = req.doctor.id;
        const { status, appointment_at, clinical_notes, payment_status } = req.body;

        const checkRes = await pool.query(
            "SELECT id FROM appointments WHERE id = $1 AND doctor_id = $2",
            [apptId, doctorId]
        );

        if (checkRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Appointment not found for this doctor." });
        }

        const updates = [];
        const params = [apptId, doctorId];

        if (status && ["scheduled", "completed", "cancelled"].includes(status)) {
            params.push(status);
            updates.push(`status = $${params.length}`);
        }

        if (appointment_at) {
            const dateObj = new Date(appointment_at);
            if (!isNaN(dateObj.getTime())) {
                params.push(dateObj);
                updates.push(`appointment_at = $${params.length}`);
            }
        }

        if (clinical_notes !== undefined) {
            params.push(clinical_notes);
            updates.push(`clinical_notes = $${params.length}`);
        }

        if (payment_status && ["paid", "pending", "refunded"].includes(payment_status)) {
            params.push(payment_status);
            updates.push(`payment_status = $${params.length}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields provided to update." });
        }

        const query = `
            UPDATE appointments 
            SET ${updates.join(", ")}
            WHERE id = $1 AND doctor_id = $2
            RETURNING *
        `;

        const updateRes = await pool.query(query, params);

        res.json({
            success: true,
            message: "Appointment updated successfully.",
            appointment: updateRes.rows[0]
        });
    } catch (err) {
        console.error("Update Appointment Error:", err);
        res.status(500).json({ success: false, message: "Failed to update appointment." });
    }
});

// 8.4. Patients Directory (Only patients linked to this doctor)
app.get("/api/doctor/patients", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const { search } = req.query;

        let query = `
            SELECT 
                u.id, 
                u.full_name, 
                u.email, 
                u.created_at AS registered_at,
                COUNT(a.id) AS total_visits,
                MAX(a.appointment_at) AS last_visit,
                (
                    SELECT reason FROM appointments 
                    WHERE patient_id = u.id AND doctor_id = $1 
                    ORDER BY appointment_at DESC LIMIT 1
                ) AS primary_condition
            FROM users u
            JOIN appointments a ON u.id = a.patient_id
            WHERE a.doctor_id = $1
        `;
        const params = [doctorId];

        if (search && search.trim().length > 0) {
            params.push(`%${search.trim().toLowerCase()}%`);
            query += ` AND (LOWER(u.full_name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
        }

        query += ` GROUP BY u.id, u.full_name, u.email, u.created_at ORDER BY last_visit DESC`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            patients: result.rows
        });
    } catch (err) {
        console.error("Doctor Patients Error:", err);
        res.status(500).json({ success: false, message: "Could not retrieve patient directory." });
    }
});

// 8.5. Patient Clinical History (Authorized doctor access only)
app.get("/api/doctor/patients/:id", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const patientId = parseInt(req.params.id, 10);

        // Verify doctor has at least one appointment with this patient
        const authCheck = await pool.query(
            "SELECT id FROM appointments WHERE doctor_id = $1 AND patient_id = $2",
            [doctorId, patientId]
        );

        if (authCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access restricted: You may only view records of patients with active or past appointments in your practice."
            });
        }

        const patientRes = await pool.query(
            "SELECT id, full_name, email, created_at FROM users WHERE id = $1",
            [patientId]
        );

        const apptsRes = await pool.query(
            `SELECT id, appointment_at, status, reason, consultation_type, clinical_notes 
             FROM appointments 
             WHERE doctor_id = $1 AND patient_id = $2 
             ORDER BY appointment_at DESC`,
            [doctorId, patientId]
        );

        const prescriptionsRes = await pool.query(
            `SELECT id, medicines, instructions, issued_at 
             FROM prescriptions 
             WHERE doctor_id = $1 AND patient_id = $2 
             ORDER BY issued_at DESC`,
            [doctorId, patientId]
        );

        const recordsRes = await pool.query(
            `SELECT id, title, record_type, notes, created_at 
             FROM medical_records 
             WHERE patient_id = $1 
             ORDER BY created_at DESC`,
            [patientId]
        );

        res.json({
            success: true,
            patient: patientRes.rows[0],
            appointments: apptsRes.rows,
            prescriptions: prescriptionsRes.rows,
            medical_records: recordsRes.rows
        });
    } catch (err) {
        console.error("Patient Details Error:", err);
        res.status(500).json({ success: false, message: "Could not retrieve patient history." });
    }
});

// 8.6. Doctor Prescriptions (List & Create)
app.get("/api/doctor/prescriptions", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        const result = await pool.query(
            `SELECT p.id, p.appointment_id, p.patient_id, p.medicines, p.instructions, p.issued_at,
                    u.full_name AS patient_name, u.email AS patient_email
             FROM prescriptions p
             JOIN users u ON p.patient_id = u.id
             WHERE p.doctor_id = $1
             ORDER BY p.issued_at DESC`,
            [doctorId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            prescriptions: result.rows
        });
    } catch (err) {
        console.error("Doctor Prescriptions Error:", err);
        res.status(500).json({ success: false, message: "Could not retrieve doctor prescriptions." });
    }
});

app.post("/api/doctor/prescriptions", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const { appointment_id, patient_id, medicines, instructions } = req.body;

        if (!patient_id) {
            return res.status(400).json({ success: false, message: "Patient ID is required." });
        }

        if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({ success: false, message: "At least one medication is required." });
        }

        const insertRes = await pool.query(
            `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, medicines, instructions)
             VALUES ($1, $2, $3, $4::jsonb, $5)
             RETURNING id, appointment_id, patient_id, doctor_id, medicines, instructions, issued_at`,
            [appointment_id || null, patient_id, doctorId, JSON.stringify(medicines), instructions || "Take as directed by doctor."]
        );

        const patientRes = await pool.query("SELECT full_name FROM users WHERE id = $1", [patient_id]);

        res.status(201).json({
            success: true,
            message: "Prescription issued successfully.",
            prescription: {
                ...insertRes.rows[0],
                patient_name: patientRes.rows[0]?.full_name
            }
        });
    } catch (err) {
        console.error("Create Prescription Error:", err);
        res.status(500).json({ success: false, message: "Could not issue prescription." });
    }
});

// 8.7. Doctor Earnings & Business Analytics
app.get("/api/doctor/earnings", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const fee = parseFloat(req.doctor.consultation_fee) || 800;

        // Today's earnings
        const todayRes = await pool.query(
            `SELECT COUNT(*) FROM appointments 
             WHERE doctor_id = $1 AND status = 'completed' AND appointment_at::date = CURRENT_DATE`,
            [doctorId]
        );
        const todayEarnings = parseInt(todayRes.rows[0].count, 10) * fee;

        // This week's earnings
        const weekRes = await pool.query(
            `SELECT COUNT(*) FROM appointments 
             WHERE doctor_id = $1 AND status = 'completed' AND appointment_at >= date_trunc('week', CURRENT_DATE)`,
            [doctorId]
        );
        const weekEarnings = parseInt(weekRes.rows[0].count, 10) * fee;

        // This month's earnings
        const monthRes = await pool.query(
            `SELECT COUNT(*) FROM appointments 
             WHERE doctor_id = $1 AND status = 'completed' AND appointment_at >= date_trunc('month', CURRENT_DATE)`,
            [doctorId]
        );
        const monthCompleted = parseInt(monthRes.rows[0].count, 10);
        const monthEarnings = monthCompleted * fee;

        // Total lifetime earnings
        const totalRes = await pool.query(
            `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'completed'`,
            [doctorId]
        );
        const totalCompleted = parseInt(totalRes.rows[0].count, 10);
        const totalEarnings = totalCompleted * fee;

        // Pending appointments fee
        const pendingRes = await pool.query(
            `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'scheduled'`,
            [doctorId]
        );
        const pendingCount = parseInt(pendingRes.rows[0].count, 10);
        const pendingAmount = pendingCount * fee;

        // Platform fee (10% standard healthcare telemedicine processing)
        const platformFeePercentage = 10;
        const netMonthEarnings = monthEarnings * 0.90;

        // Recent Payments ledger
        const ledgerRes = await pool.query(
            `SELECT a.id, a.appointment_at, a.status, a.consultation_type,
                    COALESCE(a.payment_status, 'paid') AS payment_status,
                    COALESCE(a.payment_method, 'UPI / Card (Demo)') AS payment_method,
                    u.full_name AS patient_name
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             WHERE a.doctor_id = $1 AND (a.status = 'completed' OR a.payment_status = 'paid')
             ORDER BY a.appointment_at DESC
             LIMIT 10`,
            [doctorId]
        );

        const recentPayments = ledgerRes.rows.map(row => ({
            id: `PAY-${row.id}`,
            date: row.appointment_at,
            patient_name: row.patient_name,
            amount: fee,
            status: row.payment_status,
            method: row.payment_method
        }));

        res.json({
            success: true,
            currency: "INR",
            currencySymbol: "₹",
            fee_per_consultation: fee,
            metrics: {
                today_earnings: todayEarnings,
                week_earnings: weekEarnings,
                month_earnings: monthEarnings,
                net_month_earnings: netMonthEarnings,
                total_earnings: totalEarnings,
                completed_consultations: totalCompleted,
                pending_consultations: pendingCount,
                pending_amount: pendingAmount,
                platform_fee_percent: platformFeePercentage
            },
            recent_payments: recentPayments
        });
    } catch (err) {
        console.error("Doctor Earnings Error:", err);
        res.status(500).json({ success: false, message: "Could not calculate doctor earnings." });
    }
});

// 8.8. Doctor Availability Management
app.get("/api/doctor/availability", authenticateToken, requireDoctor, async (req, res) => {
    try {
        res.json({
            success: true,
            availability: {
                available_days: req.doctor.available_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                working_hours: req.doctor.working_hours || "09:00 AM - 05:00 PM",
                slot_duration_mins: req.doctor.slot_duration_mins || 30,
                consultation_fee: req.doctor.consultation_fee || 800.00
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not retrieve doctor availability." });
    }
});

app.put("/api/doctor/availability", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const { available_days, working_hours, slot_duration_mins, consultation_fee } = req.body;

        const updateRes = await pool.query(
            `UPDATE doctors 
             SET available_days = COALESCE($1, available_days),
                 working_hours = COALESCE($2, working_hours),
                 slot_duration_mins = COALESCE($3, slot_duration_mins),
                 consultation_fee = COALESCE($4, consultation_fee)
             WHERE id = $5
             RETURNING available_days, working_hours, slot_duration_mins, consultation_fee`,
            [available_days || null, working_hours || null, slot_duration_mins ? parseInt(slot_duration_mins, 10) : null, consultation_fee ? parseFloat(consultation_fee) : null, doctorId]
        );

        res.json({
            success: true,
            message: "Doctor schedule and availability updated successfully.",
            availability: updateRes.rows[0]
        });
    } catch (err) {
        console.error("Update Availability Error:", err);
        res.status(500).json({ success: false, message: "Could not update availability." });
    }
});

// 8.9. Doctor Profile (Get & Update)
app.get("/api/doctor/profile", authenticateToken, requireDoctor, async (req, res) => {
    try {
        res.json({
            success: true,
            profile: {
                id: req.doctor.id,
                full_name: req.doctor.full_name,
                email: req.doctor.email,
                specialization: req.doctor.specialization,
                qualifications: req.doctor.qualifications,
                experience_years: req.doctor.experience_years,
                consultation_fee: req.doctor.consultation_fee,
                languages: req.doctor.languages,
                verified: req.doctor.verified,
                about: req.doctor.about,
                rating: req.doctor.rating,
                review_count: req.doctor.review_count
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not retrieve doctor profile." });
    }
});

app.put("/api/doctor/profile", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const userId = req.user.id;
        const {
            full_name,
            specialization,
            qualifications,
            experience_years,
            consultation_fee,
            languages,
            about
        } = req.body;

        if (full_name && full_name.trim().length >= 2) {
            await pool.query("UPDATE users SET full_name = $1 WHERE id = $2", [full_name.trim(), userId]);
        }

        const updateRes = await pool.query(
            `UPDATE doctors
             SET specialization = COALESCE($1, specialization),
                 qualifications = COALESCE($2, qualifications),
                 experience_years = COALESCE($3, experience_years),
                 consultation_fee = COALESCE($4, consultation_fee),
                 languages = COALESCE($5, languages),
                 about = COALESCE($6, about)
             WHERE id = $7
             RETURNING *`,
            [
                specialization || null,
                qualifications || null,
                experience_years ? parseInt(experience_years, 10) : null,
                consultation_fee ? parseFloat(consultation_fee) : null,
                Array.isArray(languages) ? languages : null,
                about || null,
                doctorId
            ]
        );

        res.json({
            success: true,
            message: "Doctor profile updated successfully.",
            profile: {
                ...updateRes.rows[0],
                full_name: full_name ? full_name.trim() : req.doctor.full_name
            }
        });
    } catch (err) {
        console.error("Update Doctor Profile Error:", err);
        res.status(500).json({ success: false, message: "Could not update doctor profile." });
    }
});

// 8.10. Doctor Reviews
app.get("/api/doctor/reviews", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        const result = await pool.query(
            `SELECT id, patient_name, rating, comment, created_at 
             FROM doctor_reviews 
             WHERE doctor_id = $1 
             ORDER BY created_at DESC`,
            [doctorId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            average_rating: req.doctor.rating || 4.9,
            reviews: result.rows
        });
    } catch (err) {
        console.error("Doctor Reviews Error:", err);
        res.status(500).json({ success: false, message: "Could not retrieve doctor reviews." });
    }
});

// 8.11. Practice Announcements (Get, Create, Delete)
app.get("/api/doctor/announcements", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        const result = await pool.query(
            `SELECT id, title, content, tag, created_at 
             FROM doctor_announcements 
             WHERE doctor_id = $1 
             ORDER BY created_at DESC`,
            [doctorId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            announcements: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not retrieve announcements." });
    }
});

app.post("/api/doctor/announcements", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const { title, content, tag = "General" } = req.body;

        if (!title || title.trim().length < 3) {
            return res.status(400).json({ success: false, message: "Title must be at least 3 characters." });
        }
        if (!content || content.trim().length < 5) {
            return res.status(400).json({ success: false, message: "Announcement content must be at least 5 characters." });
        }

        const insertRes = await pool.query(
            `INSERT INTO doctor_announcements (doctor_id, title, content, tag)
             VALUES ($1, $2, $3, $4)
             RETURNING id, doctor_id, title, content, tag, created_at`,
            [doctorId, title.trim(), content.trim(), tag.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Announcement published successfully.",
            announcement: insertRes.rows[0]
        });
    } catch (err) {
        console.error("Publish Announcement Error:", err);
        res.status(500).json({ success: false, message: "Could not publish announcement." });
    }
});

app.delete("/api/doctor/announcements/:id", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const annId = parseInt(req.params.id, 10);

        await pool.query(
            "DELETE FROM doctor_announcements WHERE id = $1 AND doctor_id = $2",
            [annId, doctorId]
        );

        res.json({
            success: true,
            message: "Announcement deleted successfully."
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not delete announcement." });
    }
});

// 8.12. Doctor Messages & Consultation Inquiries
app.get("/api/doctor/messages", authenticateToken, requireDoctor, async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        // Sample real consultation inquiry threads linked to patients of this doctor
        const patientsRes = await pool.query(
            `SELECT DISTINCT u.id, u.full_name 
             FROM users u 
             JOIN appointments a ON u.id = a.patient_id 
             WHERE a.doctor_id = $1 LIMIT 4`,
            [doctorId]
        );

        const sampleMessages = [
            {
                id: "MSG-1",
                patient_name: patientsRes.rows[0]?.full_name || "Alex Morgan",
                subject: "Question about morning dosage timing",
                last_message: "Hello Dr. Ananya, should I take the blood pressure tablet before or after breakfast?",
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                unread: true
            },
            {
                id: "MSG-2",
                patient_name: patientsRes.rows[1]?.full_name || "Rohit Sharma",
                subject: "Resting ECG report uploaded",
                last_message: "I have uploaded my recent test report to the records section for our call.",
                timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
                unread: false
            },
            {
                id: "MSG-3",
                patient_name: patientsRes.rows[2]?.full_name || "Priya Verma",
                subject: "Follow-up consultation query",
                last_message: "Thank you for the guidance during yesterday's video session!",
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
                unread: false
            }
        ];

        res.json({
            success: true,
            count: sampleMessages.length,
            messages: sampleMessages
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not retrieve messages." });
    }
});

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
const server = app.listen(PORT, () => {
    console.log(`Illazz backend running on http://localhost:${PORT}`);
});

module.exports = { app, server, pool };