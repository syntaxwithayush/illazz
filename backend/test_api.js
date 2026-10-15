require("dotenv").config();
const http = require("http");

// We'll test against the running server or launch an in-process server
const { app, server, pool } = require("./server");

async function runTests() {
    console.log("Starting Backend API test suite...");
    const baseUrl = `http://localhost:${process.env.PORT || 5000}`;

    async function req(path, options = {}) {
        const url = `${baseUrl}${path}`;
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, ok: res.ok, data };
    }

    try {
        // 1. Health check
        console.log("1. Testing GET / ...");
        const r1 = await req("/");
        console.log("Status:", r1.status, r1.data.message);
        if (r1.status !== 200) throw new Error("Health check failed");

        // 2. Doctors list
        console.log("2. Testing GET /api/doctors ...");
        const r2 = await req("/api/doctors");
        console.log("Doctors count:", r2.data.count);
        if (!r2.data.doctors || r2.data.doctors.length === 0) throw new Error("No doctors returned");

        // 3. Login as demo patient
        console.log("3. Testing POST /api/auth/login (demo patient)...");
        const r3 = await req("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: "patient.demo@illazz.test",
                password: "password123"
            })
        });
        console.log("Login status:", r3.status, "User:", r3.data.user?.full_name);
        if (!r3.data.token) throw new Error("Login failed, no token");
        const token = r3.data.token;
        const authHeader = { Authorization: `Bearer ${token}` };

        // 4. Auth Me
        console.log("4. Testing GET /api/auth/me ...");
        const r4 = await req("/api/auth/me", { headers: authHeader });
        console.log("Auth Me status:", r4.status, "Email:", r4.data.user?.email);
        if (r4.data.user?.email !== "patient.demo@illazz.test") throw new Error("Auth me returned wrong user");

        // 5. Dashboard Stats
        console.log("5. Testing GET /api/dashboard/stats ...");
        const r5 = await req("/api/dashboard/stats", { headers: authHeader });
        console.log("Stats:", r5.data.stats);
        if (!r5.data.stats) throw new Error("Stats not returned");

        // 6. Symptom Assessment - High Risk Emergency
        console.log("6. Testing POST /api/symptoms (urgent emergency check)...");
        const r6 = await req("/api/symptoms", {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({
                symptoms: ["severe chest pain", "difficulty breathing"]
            })
        });
        console.log("Triage risk:", r6.data.risk, "Emergency:", r6.data.isEmergency);
        if (r6.data.risk !== "high" || !r6.data.isEmergency) throw new Error("Urgent triage check failed");

        // 7. Symptom Assessment - Moderate
        console.log("7. Testing POST /api/symptoms (moderate check)...");
        const r7 = await req("/api/symptoms", {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({
                symptoms: ["fever", "cough"]
            })
        });
        console.log("Triage risk:", r7.data.risk);
        if (r7.data.risk !== "moderate") throw new Error("Moderate triage check failed");

        // 8. List Appointments
        console.log("8. Testing GET /api/appointments ...");
        const r8 = await req("/api/appointments", { headers: authHeader });
        console.log("Appointments count:", r8.data.count);
        if (r8.status !== 200) throw new Error("Appointments fetch failed");

        // 9. Book an Appointment
        console.log("9. Testing POST /api/appointments ...");
        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + 7);
        const r9 = await req("/api/appointments", {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({
                doctor_id: 1,
                appointment_at: apptDate.toISOString(),
                reason: "Automated test consultation for routine checkup"
            })
        });
        console.log("Book status:", r9.status, "Appointment ID:", r9.data.appointment?.id);
        if (r9.status !== 201) throw new Error("Booking failed: " + JSON.stringify(r9.data));
        const newApptId = r9.data.appointment?.id;

        // 10. Cancel the test appointment
        console.log("10. Testing PATCH /api/appointments/:id/cancel ...");
        const r10 = await req(`/api/appointments/${newApptId}/cancel`, {
            method: "PATCH",
            headers: authHeader
        });
        console.log("Cancel status:", r10.status, r10.data.message);
        if (r10.status !== 200) throw new Error("Cancel failed");

        // 11. Prescriptions
        console.log("11. Testing GET /api/prescriptions ...");
        const r11 = await req("/api/prescriptions", { headers: authHeader });
        console.log("Prescriptions count:", r11.data.count);

        // 12. Medical Records
        console.log("12. Testing GET /api/medical-records ...");
        const r12 = await req("/api/medical-records", { headers: authHeader });
        console.log("Records count:", r12.data.count);

        console.log("\nALL 12 BACKEND API TESTS PASSED SUCCESSFULLY! ✅");
    } catch (err) {
        console.error("Test failed with error:", err.message);
        process.exitCode = 1;
    } finally {
        server.close();
        await pool.end();
        process.exit();
    }
}

// Give server 500ms to listen
setTimeout(runTests, 500);
