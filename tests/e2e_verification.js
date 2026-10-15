async function runE2E() {
    console.log("=================================================");
    console.log("   ILLAZZ END-TO-END SYSTEM INTEGRATION TEST     ");
    console.log("=================================================");

    const backendUrl = "http://localhost:5000";
    const frontendUrl = "http://localhost:3000";

    const timestamp = Date.now();
    const testEmail = `patient_e2e_${timestamp}@illazz.test`;
    const testPassword = "Password123!";
    const testName = `Elena Rostova (${timestamp})`;

    // Helper request
    async function apiCall(path, method = "GET", body = null, token = null) {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        const res = await fetch(`${backendUrl}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, ok: res.ok, data };
    }

    try {
        // Step 1: Verify Frontend Dev Server is up
        console.log("\n[Step 1] Checking Frontend Dev Server (http://localhost:3000)...");
        const fRes = await fetch(frontendUrl);
        if (!fRes.ok) throw new Error(`Frontend server error: ${fRes.status}`);
        const html = await fRes.text();
        if (!html.includes("Illazz") && !html.includes("root")) {
            throw new Error("Frontend did not return expected Illazz index.html");
        }
        console.log("  ✓ Frontend is up and serving HTML correctly!");

        // Step 2: Verify Backend API Doctors on Landing
        console.log("\n[Step 2] Testing Landing Page Doctor Showcase (GET /api/doctors)...");
        const docRes = await apiCall("/api/doctors");
        if (!docRes.ok || !docRes.data.doctors || docRes.data.doctors.length === 0) {
            throw new Error("Doctors list empty or unreachable");
        }
        console.log(`  ✓ Retrieved ${docRes.data.count} affiliated doctors from PostgreSQL!`);
        const targetDoctor = docRes.data.doctors[0];
        console.log(`    Selected Doctor: ${targetDoctor.name} (${targetDoctor.specialization}, ₹${targetDoctor.consultation_fee})`);

        // Step 3: Register a New Patient
        console.log(`\n[Step 3] Registering New Patient (${testEmail})...`);
        const regRes = await apiCall("/api/auth/register", "POST", {
            full_name: testName,
            email: testEmail,
            password: testPassword,
            role: "patient"
        });
        if (regRes.status !== 201 || !regRes.data.token) {
            throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
        }
        console.log(`  ✓ Patient registered successfully! User ID: ${regRes.data.user.id}`);
        let token = regRes.data.token;

        // Step 4: Login Verification
        console.log("\n[Step 4] Verifying Authentication Login (POST /api/auth/login)...");
        const loginRes = await apiCall("/api/auth/login", "POST", {
            email: testEmail,
            password: testPassword
        });
        if (!loginRes.ok || !loginRes.data.token) {
            throw new Error("Login failed");
        }
        token = loginRes.data.token;
        console.log(`  ✓ Logged in successfully as: ${loginRes.data.user.full_name}`);

        // Step 5: Check Initial Dashboard Stats
        console.log("\n[Step 5] Checking Initial Dashboard Stats (GET /api/dashboard/stats)...");
        const initStats = await apiCall("/api/dashboard/stats", "GET", null, token);
        if (!initStats.ok) throw new Error("Dashboard stats failed");
        console.log(`  ✓ Initial Stats: Upcoming: ${initStats.data.stats.upcoming_appointments}, Completed: ${initStats.data.stats.completed_consultations}`);
        if (initStats.data.stats.upcoming_appointments !== 0) {
            throw new Error("Expected 0 upcoming appointments for brand new user");
        }

        // Step 6: Perform Symptom Assessment (Moderate)
        console.log("\n[Step 6] Submitting Symptom Assessment (POST /api/symptoms)...");
        const sympRes = await apiCall("/api/symptoms", "POST", {
            symptoms: ["severe headache", "mild fever", "fatigue"]
        }, token);
        if (!sympRes.ok) throw new Error("Symptom assessment failed");
        console.log(`  ✓ Triage Result: Risk Level = [${sympRes.data.risk.toUpperCase()}]`);
        console.log(`    Recommendation: ${sympRes.data.recommendation}`);
        console.log(`    Assessment Saved with DB ID: ${sympRes.data.assessment_id}`);

        // Step 7: Verify Assessment appears in history
        console.log("\n[Step 7] Checking Assessment History (GET /api/symptoms/history)...");
        const histRes = await apiCall("/api/symptoms/history", "GET", null, token);
        if (!histRes.ok || histRes.data.assessments.length === 0) {
            throw new Error("Assessment did not persist to database history");
        }
        console.log(`  ✓ Verified: 1 assessment persisted in PostgreSQL for this user!`);

        // Step 8: Book an Appointment with target doctor
        console.log(`\n[Step 8] Booking Appointment with Doctor #${targetDoctor.id} (${targetDoctor.name})...`);
        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + 3);
        apptDate.setHours(11, 30, 0, 0);

        const bookRes = await apiCall("/api/appointments", "POST", {
            doctor_id: targetDoctor.id,
            appointment_at: apptDate.toISOString(),
            reason: "Follow-up consultation for persistent headache and fever"
        }, token);
        if (bookRes.status !== 201) {
            throw new Error(`Booking failed: ${JSON.stringify(bookRes.data)}`);
        }
        const bookedAppt = bookRes.data.appointment;
        console.log(`  ✓ Appointment #${bookedAppt.id} successfully booked for ${bookedAppt.appointment_at}!`);

        // Step 9: Verify Appointment Appears on Dashboard Stats
        console.log("\n[Step 9] Verifying Updated Dashboard Stats (GET /api/dashboard/stats)...");
        const updatedStats = await apiCall("/api/dashboard/stats", "GET", null, token);
        if (!updatedStats.ok) throw new Error("Updated stats failed");
        console.log(`  ✓ Updated Stats: Upcoming: ${updatedStats.data.stats.upcoming_appointments}, Assessments: ${updatedStats.data.stats.assessments_count}`);
        if (updatedStats.data.stats.upcoming_appointments !== 1) {
            throw new Error(`Expected 1 upcoming appointment, got ${updatedStats.data.stats.upcoming_appointments}`);
        }
        console.log(`  ✓ Recent Appointment on Dashboard: Dr. ${updatedStats.data.recent_appointments[0].doctor_name}`);

        // Step 10: Test Medical Record Upload
        console.log("\n[Step 10] Uploading Medical Record (POST /api/medical-records)...");
        const recordRes = await apiCall("/api/medical-records", "POST", {
            title: "Baseline Hemogram & Metabolic Panel",
            record_type: "Lab Report",
            notes: "Routine baseline blood panel. Fasting glucose and HbA1c optimal."
        }, token);
        if (recordRes.status !== 201) throw new Error("Record upload failed");
        console.log(`  ✓ Medical Record #${recordRes.data.record.id} created successfully!`);

        // Step 11: Emergency Triage Logic Check
        console.log("\n[Step 11] Testing High-Risk Emergency Triage (chest pain + shortness of breath)...");
        const emergRes = await apiCall("/api/symptoms", "POST", {
            symptoms: ["severe crushing chest pain", "difficulty breathing"]
        }, token);
        if (emergRes.data.risk !== "high" || !emergRes.data.isEmergency) {
            throw new Error("Emergency triage failed to classify chest pain as high risk");
        }
        console.log(`  ✓ Emergency Classification verified!`);
        console.log(`    Guidance: "${emergRes.data.emergency_guidance}"`);

        console.log("\n=================================================");
        console.log("   🎉 ALL 11 END-TO-END FLOW CHECKS PASSED!      ");
        console.log("=================================================\n");

    } catch (err) {
        console.error("\n❌ E2E VERIFICATION FAILED:", err.message);
        process.exit(1);
    }
}

runE2E();
