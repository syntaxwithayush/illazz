# Illazz Telemedicine Platform

> **Healthcare from anywhere.**  
> AI-assisted preliminary health triage guidance and connected doctor consultations.

---

## 🏥 Features

1. **Landing Page**: Modern healthcare presentation with brand aesthetics (`#1677ff`), hero illustration, benefit metrics, 6 feature cards, live PostgreSQL doctor showcase, and clinical disclaimers.
2. **AI Symptom Checker**: Interactive symptom triage engine identifying low, moderate, and urgent emergency conditions (e.g. chest pain, shortness of breath) with emergency guidance and specialist recommendations.
3. **Doctor Directory**: Search by name or filter by clinical specialization (Cardiology, Dermatology, General Medicine, etc.) with fees in ₹, qualifications, and verified status.
4. **Appointment Booking**: Real-time consultation scheduling with physician selection, future date/time pickers, and reason for visit.
5. **Patient Portal & Dashboard**: Aggregated statistics for upcoming appointments, completed consults, prescriptions, and triage logs.
6. **Digital Prescriptions**: Prescriptions view with medications, dosage schedules, duration, and doctor instructions.
7. **Medical Records Vault**: Health reports list with an interactive modal to add and persist new laboratory reports.
8. **Account Settings & Security**: Profile management, bcrypt password hashing, and JWT session handling.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons
- **Backend**: Node.js, Express, PostgreSQL (`pg` pool), `bcryptjs`, `jsonwebtoken`
- **Database**: PostgreSQL (`illazz_db`) with parameterized SQL queries

---

## 🚀 Quick Start Guide

### 1. Database Setup & Seeding

Ensure PostgreSQL is running locally on port `5432` with database `illazz_db`.

Run the idempotent database seed script (populates fictional demo doctors, patient, appointments, records, and prescriptions without duplicates):

```bash
cd backend
npm install
npm run seed
```

### 2. Start the Backend Server

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 3. Start the Frontend Development Server

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔑 Demo Test Accounts

Both demo patient and doctor accounts are pre-configured for instant testing:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient.demo@illazz.test` | `password123` | Alex Morgan (Patient Demo) |
| **Doctor** | `ananya.demo@illazz.test` | `password123` | Dr. Ananya Sharma (Cardiologist) |
| **Doctor** | `rahul.demo@illazz.test` | `password123` | Dr. Rahul Verma (Dermatologist) |
| **Doctor** | `priya.demo@illazz.test` | `password123` | Dr. Priya Mehta (General Physician) |

*You can also click the 1-click Quick Fill buttons on the Sign In page for immediate testing.*

---

## 🧪 Automated Testing

Run the automated test suites from the root repository:

```bash
# 1. Backend REST API Test Suite (12 endpoints)
npm run test:backend

# 2. Complete End-to-End User Flow Test
npm run test:e2e
```

---

## 🛡️ Medical Disclaimer
Illazz provides AI-assisted preliminary health triage guidance for educational and scheduling purposes only. It is not a replacement for professional medical judgment, clinical diagnosis, or emergency intervention. In severe symptoms or medical emergencies, contact national emergency services (112 / 911 / 102) immediately.
