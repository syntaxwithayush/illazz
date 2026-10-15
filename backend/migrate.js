require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT
});

async function runMigration() {
    console.log("Applying doctor dashboard database migration...");
    const sqlPath = path.join(__dirname, '..', 'database', 'migration_doctor_dashboard.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log("Migration applied successfully!");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
