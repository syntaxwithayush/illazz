import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Patient Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorsPage from './pages/DoctorsPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import DashboardPage from './pages/DashboardPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import SettingsPage from './pages/SettingsPage';

// Doctor Pages
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage';
import DoctorPrescriptionsPage from './pages/doctor/DoctorPrescriptionsPage';
import DoctorRecordsPage from './pages/doctor/DoctorRecordsPage';
import DoctorEarningsPage from './pages/doctor/DoctorEarningsPage';
import DoctorAvailabilityPage from './pages/doctor/DoctorAvailabilityPage';
import DoctorReviewsPage from './pages/doctor/DoctorReviewsPage';
import DoctorAnnouncementsPage from './pages/doctor/DoctorAnnouncementsPage';
import DoctorMessagesPage from './pages/doctor/DoctorMessagesPage';
import DoctorSettingsPage from './pages/doctor/DoctorSettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/symptom-checker" element={<SymptomCheckerPage />} />

      {/* Protected Patient Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PrescriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-records"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <MedicalRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorPatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorPrescriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/records"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/earnings"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorEarningsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAvailabilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/reviews"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorReviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/announcements"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAnnouncementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/messages"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorMessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/settings"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
