require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT
});

async function seedDatabase() {
    console.log("Starting enhanced Illazz database seed (Patient + Doctor)...");
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const defaultHash = await bcrypt.hash("password123", 10);

        // 1. Ensure demo doctors exist with valid passwords and extended practice info
        const doctorsData = [
            {
                name: "Dr. Ananya Sharma",
                email: "ananya.demo@illazz.test",
                specialization: "Cardiologist",
                qualifications: "MD, DM Cardiology (AIIMS)",
                experience_years: 12,
                consultation_fee: 800.00,
                languages: ["English", "Hindi"],
                verified: true,
                rating: 4.9,
                review_count: 28,
                about: "Senior Consultant Cardiologist specializing in preventive cardiology, hypertension, arrhythmia management, and remote cardiovascular wellness."
            },
            {
                name: "Dr. Rahul Verma",
                email: "rahul.demo@illazz.test",
                specialization: "Dermatologist",
                qualifications: "MD Dermatology, DNB",
                experience_years: 8,
                consultation_fee: 600.00,
                languages: ["English", "Hindi"],
                verified: true,
                rating: 4.8,
                review_count: 19,
                about: "Consultant Dermatologist focusing on clinical dermatology, allergic disorders, and virtual skin consultations."
            },
            {
                name: "Dr. Priya Mehta",
                email: "priya.demo@illazz.test",
                specialization: "General Physician",
                qualifications: "MBBS, MD Internal Medicine",
                experience_years: 6,
                consultation_fee: 400.00,
                languages: ["English", "Hindi"],
                verified: true,
                rating: 4.7,
                review_count: 15,
                about: "Family Physician experienced in primary healthcare, lifestyle medicine, and continuous patient care management."
            }
        ];

        const doctorIds = [];

        for (const doc of doctorsData) {
            let uRes = await client.query("SELECT id FROM users WHERE email = $1", [doc.email]);
            let uId;
            if (uRes.rows.length === 0) {
                const newU = await client.query(
                    `INSERT INTO users (full_name, email, password_hash, role)
                     VALUES ($1, $2, $3, 'doctor')
                     RETURNING id`,
                    [doc.name, doc.email, defaultHash]
                );
                uId = newU.rows[0].id;
            } else {
                uId = uRes.rows[0].id;
                await client.query(
                    "UPDATE users SET password_hash = $1, full_name = $2 WHERE id = $3",
                    [defaultHash, doc.name, uId]
                );
            }

            let dRes = await client.query("SELECT id FROM doctors WHERE user_id = $1", [uId]);
            let dId;
            if (dRes.rows.length === 0) {
                const newD = await client.query(
                    `INSERT INTO doctors (user_id, specialization, qualifications, experience_years, consultation_fee, languages, verified, rating, review_count, about)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING id`,
                    [uId, doc.specialization, doc.qualifications, doc.experience_years, doc.consultation_fee, doc.languages, doc.verified, doc.rating, doc.review_count, doc.about]
                );
                dId = newD.rows[0].id;
            } else {
                dId = dRes.rows[0].id;
                await client.query(
                    `UPDATE doctors SET 
                     specialization = $1, qualifications = $2, experience_years = $3, 
                     consultation_fee = $4, languages = $5, verified = $6, rating = $7, 
                     review_count = $8, about = $9 
                     WHERE id = $10`,
                    [doc.specialization, doc.qualifications, doc.experience_years, doc.consultation_fee, doc.languages, doc.verified, doc.rating, doc.review_count, doc.about, dId]
                );
            }
            doctorIds.push({ docId: dId, userId: uId, spec: doc.specialization, fee: doc.consultation_fee });
        }

        // 2. Ensure demo patients exist
        const patientsData = [
            { name: "Alex Morgan (Demo Patient)", email: "patient.demo@illazz.test" },
            { name: "Rohit Sharma", email: "rohit.sharma@demo.illazz.test" },
            { name: "Priya Verma", email: "priya.verma@demo.illazz.test" },
            { name: "Vikram Singh", email: "vikram.singh@demo.illazz.test" },
            { name: "Kavita Patel", email: "kavita.patel@demo.illazz.test" }
        ];

        const patientIds = [];

        for (const p of patientsData) {
            let pRes = await client.query("SELECT id FROM users WHERE email = $1", [p.email]);
            let pId;
            if (pRes.rows.length === 0) {
                const newP = await client.query(
                    `INSERT INTO users (full_name, email, password_hash, role)
                     VALUES ($1, $2, $3, 'patient')
                     RETURNING id`,
                    [p.name, p.email, defaultHash]
                );
                pId = newP.rows[0].id;
            } else {
                pId = pRes.rows[0].id;
                await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [defaultHash, pId]);
            }
            patientIds.push({ id: pId, name: p.name, email: p.email });
        }

        const ananyaDoctorId = doctorIds[0].docId; // Dr. Ananya Sharma

        // 3. Seed appointments for Dr. Ananya Sharma across Today, Upcoming, and Completed (for earnings)
        const existingAppts = await client.query(
            "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1",
            [ananyaDoctorId]
        );

        const now = new Date();

        // If fewer than 5 appointments for Dr. Ananya, seed a realistic set
        if (parseInt(existingAppts.rows[0].count, 10) < 5) {
            // Today's appointments
            const today1 = new Date(now);
            today1.setHours(10, 0, 0, 0);

            const today2 = new Date(now);
            today2.setHours(11, 30, 0, 0);

            const today3 = new Date(now);
            today3.setHours(15, 0, 0, 0);

            // Upcoming later this week
            const upcoming1 = new Date(now);
            upcoming1.setDate(upcoming1.getDate() + 2);
            upcoming1.setHours(14, 0, 0, 0);

            const upcoming2 = new Date(now);
            upcoming2.setDate(upcoming2.getDate() + 4);
            upcoming2.setHours(16, 30, 0, 0);

            // Completed visits in this current month (generates real monthly earnings)
            const completed1 = new Date(now);
            completed1.setDate(completed1.getDate() - 3);
            completed1.setHours(10, 0, 0, 0);

            const completed2 = new Date(now);
            completed2.setDate(completed2.getDate() - 7);
            completed2.setHours(11, 0, 0, 0);

            const completed3 = new Date(now);
            completed3.setDate(completed3.getDate() - 12);
            completed3.setHours(16, 0, 0, 0);

            const completed4 = new Date(now);
            completed4.setDate(completed4.getDate() - 18);
            completed4.setHours(14, 30, 0, 0);

            const sampleAppts = [
                {
                    patient_id: patientIds[0].id,
                    doctor_id: ananyaDoctorId,
                    at: today1,
                    status: 'scheduled',
                    reason: 'Palpitations review & resting ECG follow-up',
                    type: 'video',
                    pay_status: 'paid'
                },
                {
                    patient_id: patientIds[1].id,
                    doctor_id: ananyaDoctorId,
                    at: today2,
                    status: 'scheduled',
                    reason: 'Blood pressure check & mild chest tightness inquiry',
                    type: 'in-person',
                    pay_status: 'paid'
                },
                {
                    patient_id: patientIds[2].id,
                    doctor_id: ananyaDoctorId,
                    at: today3,
                    status: 'scheduled',
                    reason: 'Lipid panel results and cholesterol management plan',
                    type: 'video',
                    pay_status: 'paid'
                },
                {
                    patient_id: patientIds[3].id,
                    doctor_id: ananyaDoctorId,
                    at: upcoming1,
                    status: 'scheduled',
                    reason: 'Follow-up on antihypertensive prescription efficacy',
                    type: 'video',
                    pay_status: 'paid'
                },
                {
                    patient_id: patientIds[4].id,
                    doctor_id: ananyaDoctorId,
                    at: upcoming2,
                    status: 'scheduled',
                    reason: 'General cardiovascular wellness checkup',
                    type: 'in-person',
                    pay_status: 'pending'
                },
                {
                    patient_id: patientIds[1].id,
                    doctor_id: ananyaDoctorId,
                    at: completed1,
                    status: 'completed',
                    reason: 'Initial consultation for intermittent fatigue',
                    type: 'video',
                    pay_status: 'paid',
                    notes: 'Patient advised to monitor BP daily and reduce caffeine intake.'
                },
                {
                    patient_id: patientIds[2].id,
                    doctor_id: ananyaDoctorId,
                    at: completed2,
                    status: 'completed',
                    reason: 'Cardiac risk assessment and treadmill test review',
                    type: 'in-person',
                    pay_status: 'paid',
                    notes: 'Normal sinus rhythm confirmed on 12-lead ECG.'
                },
                {
                    patient_id: patientIds[3].id,
                    doctor_id: ananyaDoctorId,
                    at: completed3,
                    status: 'completed',
                    reason: 'Evaluation of family history of coronary artery disease',
                    type: 'video',
                    pay_status: 'paid',
                    notes: 'Started on lifestyle modification and low-sodium diet.'
                },
                {
                    patient_id: patientIds[0].id,
                    doctor_id: ananyaDoctorId,
                    at: completed4,
                    status: 'completed',
                    reason: 'Annual heart health consultation',
                    type: 'video',
                    pay_status: 'paid',
                    notes: 'All cardiac parameters within normal healthy range.'
                }
            ];

            for (const appt of sampleAppts) {
                await client.query(
                    `INSERT INTO appointments (patient_id, doctor_id, appointment_at, status, reason, consultation_type, payment_status, clinical_notes)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [appt.patient_id, appt.doctor_id, appt.at, appt.status, appt.reason, appt.type, appt.pay_status, appt.notes || null]
                );
            }
            console.log("Seeded practice appointments for Dr. Ananya Sharma.");
        }

        // 4. Seed sample doctor announcements
        const annCheck = await client.query(
            "SELECT COUNT(*) FROM doctor_announcements WHERE doctor_id = $1",
            [ananyaDoctorId]
        );

        if (parseInt(annCheck.rows[0].count, 10) === 0) {
            await client.query(
                `INSERT INTO doctor_announcements (doctor_id, title, content, tag)
                 VALUES 
                 ($1, 'Holiday Clinic Hours Notice', 'Please note that online video consultations will be available between 10:00 AM and 02:00 PM during the upcoming national holiday weekend.', 'Schedule Update'),
                 ($1, 'Winter Cardiovascular Health Advisory', 'Cold weather can elevate blood pressure. Patients with existing hypertension are encouraged to maintain indoor physical activity, stay hydrated, and monitor daily BP readings.', 'Health Tip'),
                 ($1, 'New Digital ECG Upload Feature', 'Patients can now upload high-resolution ECG PDF reports directly before their scheduled appointment for faster review during video calls.', 'Practice News')`,
                [ananyaDoctorId]
            );
            console.log("Seeded sample practice announcements.");
        }

        // 5. Seed sample doctor reviews & ratings
        const revCheck = await client.query(
            "SELECT COUNT(*) FROM doctor_reviews WHERE doctor_id = $1",
            [ananyaDoctorId]
        );

        if (parseInt(revCheck.rows[0].count, 10) === 0) {
            await client.query(
                `INSERT INTO doctor_reviews (doctor_id, patient_id, patient_name, rating, comment)
                 VALUES 
                 ($1, $2, 'Rohit Sharma', 5, 'Dr. Ananya is extraordinarily thorough. She explained my ECG report in detail and answered all my questions calmly during our video visit.'),
                 ($1, $3, 'Priya Verma', 5, 'Very punctual and empathetic doctor. The digital prescription and lifestyle tips provided after our call were very clear and easy to follow.'),
                 ($1, $4, 'Vikram Singh', 5, 'Excellent consultation experience on Illazz. Highly recommend Dr. Ananya for any cardiac checkups and hypertension guidance.'),
                 ($1, $5, 'Alex Morgan', 4, 'Very knowledgeable and attentive physician. Prescribed effective medications with detailed timing instructions.')`,
                [ananyaDoctorId, patientIds[1].id, patientIds[2].id, patientIds[3].id, patientIds[0].id]
            );
            console.log("Seeded sample reviews for Dr. Ananya Sharma.");
        }

        await client.query("COMMIT");
        console.log("Database seeded successfully with complete Doctor Dashboard practice data!");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error during seed:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedDatabase();
