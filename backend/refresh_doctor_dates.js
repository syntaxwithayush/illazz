const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT
});

async function refreshDates() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const appts = await client.query(
            "SELECT id FROM appointments WHERE doctor_id = 1 ORDER BY id LIMIT 6"
        );

        if (appts.rows.length >= 3) {
            const now = new Date();
            
            // Today 10:30 AM
            const today1 = new Date(now);
            today1.setHours(10, 30, 0, 0);

            // Today 02:00 PM
            const today2 = new Date(now);
            today2.setHours(14, 0, 0, 0);

            // Completed 2 days ago
            const completed = new Date(now);
            completed.setDate(completed.getDate() - 2);
            completed.setHours(16, 0, 0, 0);

            await client.query(
                `UPDATE appointments 
                 SET appointment_at = $1, status = 'scheduled', consultation_type = 'video',
                     reason = 'Routine palpitations review & resting ECG follow-up', payment_status = 'paid'
                 WHERE id = $2`,
                [today1, appts.rows[0].id]
            );

            await client.query(
                `UPDATE appointments 
                 SET appointment_at = $1, status = 'scheduled', consultation_type = 'in-person',
                     reason = 'Blood pressure check & mild chest tightness inquiry', payment_status = 'paid'
                 WHERE id = $2`,
                [today2, appts.rows[1].id]
            );

            await client.query(
                `UPDATE appointments 
                 SET appointment_at = $1, status = 'completed', consultation_type = 'video',
                     reason = 'Evaluation of family history of coronary artery disease', payment_status = 'paid',
                     clinical_notes = 'Patient advised to continue low-sodium diet. Resting pulse stable.'
                 WHERE id = $2`,
                [completed, appts.rows[2].id]
            );

            if (appts.rows[3]) {
                const completed2 = new Date(now);
                completed2.setDate(completed2.getDate() - 5);
                await client.query(
                    `UPDATE appointments 
                     SET appointment_at = $1, status = 'completed', payment_status = 'paid', consultation_type = 'video'
                     WHERE id = $2`,
                    [completed2, appts.rows[3].id]
                );
            }
        }

        await client.query("COMMIT");
        console.log("Successfully ensured Dr. Ananya has today's appointments and completed visits!");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error updating dates:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

refreshDates();
