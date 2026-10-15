async function testDoctorApi() {
    console.log("=================================================");
    console.log("   DOCTOR DASHBOARD BACKEND API TEST SUITE       ");
    console.log("=================================================");

    const baseUrl = "http://localhost:5000";

    async function req(path, method = "GET", body = null, token = null) {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${baseUrl}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, ok: res.ok, data };
    }

    try {
        // 1. Login as Dr. Ananya Sharma
        console.log("1. Authenticating as Dr. Ananya Sharma...");
        const docLogin = await req("/api/auth/login", "POST", {
            email: "ananya.demo@illazz.test",
            password: "password123"
        });
        if (!docLogin.ok || !docLogin.data.token) {
            throw new Error(`Doctor login failed: ${JSON.stringify(docLogin.data)}`);
        }
        const docToken = docLogin.data.token;
        console.log(`  ✓ Authenticated as: ${docLogin.data.user.full_name} (${docLogin.data.user.role})`);

        // 2. Security Test: Patient token should be REJECTED with 403
        console.log("\n2. Testing Role Security Barrier (Patient trying to access Doctor API)...");
        const patientLogin = await req("/api/auth/login", "POST", {
            email: "patient.demo@illazz.test",
            password: "password123"
        });
        const patientToken = patientLogin.data.token;

        const secRes = await req("/api/doctor/dashboard-stats", "GET", null, patientToken);
        if (secRes.status !== 403) {
            throw new Error(`Security failed! Patient got status ${secRes.status} instead of 403 Forbidden.`);
        }
        console.log("  ✓ Access correctly blocked with 403 Forbidden for patient!");

        // 3. Test Doctor Dashboard Stats
        console.log("\n3. Testing GET /api/doctor/dashboard-stats...");
        const statsRes = await req("/api/doctor/dashboard-stats", "GET", null, docToken);
        if (!statsRes.ok || !statsRes.data.stats) {
            throw new Error(`Dashboard stats failed: ${JSON.stringify(statsRes.data)}`);
        }
        console.log("  ✓ Stats loaded:", statsRes.data.stats);
        console.log("    Today's Appointments:", statsRes.data.stats.today_appointments);
        console.log("    Total Patients:", statsRes.data.stats.total_patients);
        console.log("    This Month Earnings:", statsRes.data.stats.this_month_earnings);

        // 4. Test Doctor Appointments List
        console.log("\n4. Testing GET /api/doctor/appointments...");
        const apptsRes = await req("/api/doctor/appointments", "GET", null, docToken);
        if (!apptsRes.ok || !apptsRes.data.appointments) {
            throw new Error("Appointments fetch failed");
        }
        console.log(`  ✓ Retrieved ${apptsRes.data.count} practice appointments.`);
        const firstAppt = apptsRes.data.appointments[0];

        // 5. Test Update Appointment (Clinical notes)
        console.log(`\n5. Testing PATCH /api/doctor/appointments/${firstAppt.id}...`);
        const updateApptRes = await req(`/api/doctor/appointments/${firstAppt.id}`, "PATCH", {
            clinical_notes: "Automated test: Patient in stable condition. Regular follow-up advised."
        }, docToken);
        if (!updateApptRes.ok) {
            throw new Error(`Update appointment failed: ${JSON.stringify(updateApptRes.data)}`);
        }
        console.log("  ✓ Appointment clinical notes saved successfully!");

        // 6. Test Doctor Patients Directory
        console.log("\n6. Testing GET /api/doctor/patients...");
        const patientsRes = await req("/api/doctor/patients", "GET", null, docToken);
        if (!patientsRes.ok) throw new Error("Patients fetch failed");
        console.log(`  ✓ Retrieved ${patientsRes.data.count} authorized patients.`);
        const firstPatient = patientsRes.data.patients[0];

        // 7. Test Patient Clinical History
        console.log(`\n7. Testing GET /api/doctor/patients/${firstPatient.id}...`);
        const patientHistRes = await req(`/api/doctor/patients/${firstPatient.id}`, "GET", null, docToken);
        if (!patientHistRes.ok) throw new Error("Patient details failed");
        console.log(`  ✓ Loaded clinical history for ${patientHistRes.data.patient.full_name} (${patientHistRes.data.appointments.length} consultations, ${patientHistRes.data.prescriptions.length} prescriptions).`);

        // 8. Test Doctor Prescriptions
        console.log("\n8. Testing Prescriptions (GET and POST)...");
        const newRxRes = await req("/api/doctor/prescriptions", "POST", {
            appointment_id: firstAppt.id,
            patient_id: firstPatient.id,
            medicines: [
                { name: "Metoprolol Succinate 25mg", dosage: "1 tablet once daily morning", duration: "14 days" },
                { name: "Atorvastatin 10mg", dosage: "1 tablet once daily at night", duration: "30 days" }
            ],
            instructions: "Take with water. Do not miss doses. Monitor resting pulse."
        }, docToken);
        if (newRxRes.status !== 201) {
            throw new Error(`Prescription creation failed: ${JSON.stringify(newRxRes.data)}`);
        }
        console.log(`  ✓ Prescription #${newRxRes.data.prescription.id} issued successfully!`);

        // 9. Test Doctor Earnings Analytics
        console.log("\n9. Testing GET /api/doctor/earnings...");
        const earnRes = await req("/api/doctor/earnings", "GET", null, docToken);
        if (!earnRes.ok) throw new Error("Earnings fetch failed");
        console.log("  ✓ Earnings Metrics:", earnRes.data.metrics);
        console.log(`    Recent Payments Count: ${earnRes.data.recent_payments.length}`);

        // 10. Test Doctor Availability Settings
        console.log("\n10. Testing Doctor Availability (GET and PUT)...");
        const availRes = await req("/api/doctor/availability", "PUT", {
            working_hours: "09:30 AM - 05:30 PM",
            slot_duration_mins: 30
        }, docToken);
        if (!availRes.ok) throw new Error("Availability update failed");
        console.log("  ✓ Updated availability hours:", availRes.data.availability.working_hours);

        // 11. Test Doctor Reviews
        console.log("\n11. Testing GET /api/doctor/reviews...");
        const revRes = await req("/api/doctor/reviews", "GET", null, docToken);
        if (!revRes.ok) throw new Error("Reviews fetch failed");
        console.log(`  ✓ Loaded ${revRes.data.count} patient reviews (Avg: ${revRes.data.average_rating} ★).`);

        // 12. Test Practice Announcements (Create and Delete)
        console.log("\n12. Testing Practice Announcements (POST and DELETE)...");
        const annRes = await req("/api/doctor/announcements", "POST", {
            title: "Test Clinic Update",
            content: "Routine practice maintenance notice.",
            tag: "Notice"
        }, docToken);
        if (annRes.status !== 201) throw new Error("Announcement create failed");
        const newAnnId = annRes.data.announcement.id;

        const delAnnRes = await req(`/api/doctor/announcements/${newAnnId}`, "DELETE", null, docToken);
        if (!delAnnRes.ok) throw new Error("Announcement delete failed");
        console.log("  ✓ Announcement created and cleaned up successfully!");

        // 13. Test Doctor Consultation Messages
        console.log("\n13. Testing GET /api/doctor/messages...");
        const msgRes = await req("/api/doctor/messages", "GET", null, docToken);
        if (!msgRes.ok) throw new Error("Messages fetch failed");
        console.log(`  ✓ Loaded ${msgRes.data.count} consultation inquiry threads.`);

        console.log("\n=================================================");
        console.log("   🎉 ALL 13 DOCTOR API TESTS PASSED!            ");
        console.log("=================================================\n");

    } catch (err) {
        console.error("\n❌ DOCTOR API TEST FAILED:", err.message);
        process.exit(1);
    }
}

testDoctorApi();
