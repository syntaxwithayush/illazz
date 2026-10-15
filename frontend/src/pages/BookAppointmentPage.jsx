import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/client';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const prefillDoctorId = searchParams.get('doctorId') || '';
  const prefillReason = searchParams.get('reason') || '';

  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(prefillDoctorId);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [reason, setReason] = useState(prefillReason);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '17:00'
  ];

  // Set tomorrow as default date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoadingDoctors(true);
        const res = await api.doctors.getAll();
        if (res.success) {
          setDoctors(res.doctors || []);
          if (!selectedDoctorId && res.doctors.length > 0) {
            setSelectedDoctorId(String(res.doctors[0].id));
          }
        }
      } catch (err) {
        setError('Could not load doctors list.');
      } finally {
        setLoadingDoctors(false);
      }
    }
    loadDoctors();
  }, [prefillDoctorId]);

  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }

    if (!date || !timeSlot) {
      setError('Please choose appointment date and time.');
      return;
    }

    if (!reason || reason.trim().length < 3) {
      setError('Please provide a reason or summary of symptoms for your visit.');
      return;
    }

    try {
      setSubmitting(true);
      const appointmentDateTime = new Date(`${date}T${timeSlot}:00`);

      const res = await api.appointments.book({
        doctor_id: parseInt(selectedDoctorId, 10),
        appointment_at: appointmentDateTime.toISOString(),
        reason: reason.trim()
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/appointments');
        }, 1500);
      } else {
        setError(res.message || 'Booking failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1677ff] text-xs font-bold mb-2 border border-blue-100">
            <Calendar className="w-3.5 h-3.5" />
            <span>Telemedicine Scheduling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Book a Medical Consultation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose your doctor, select a convenient date & time, and schedule your online appointment.
          </p>
        </div>

        {success && (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center gap-4 text-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-base">Appointment Booked Successfully!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Saved directly to your records. Redirecting to your appointments list...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Booking Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e5edf5] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Doctor selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Physician
                </label>
                {loadingDoctors ? (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1677ff]" />
                    <span>Loading doctors...</span>
                  </div>
                ) : (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    required
                    className="w-full p-3.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#1677ff] focus:bg-white"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialization} (₹{doc.consultation_fee})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date & Time selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#1677ff] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Preferred Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#1677ff] focus:bg-white"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts} hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason for visit */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Reason for Visit / Reported Symptoms
                </label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your health concern, symptoms duration, or current medications..."
                  className="w-full p-3.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white bg-[#1677ff] hover:bg-blue-600 disabled:opacity-60 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming Appointment in Database...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Confirm Consultation Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Selected Doctor Summary Card */}
          <div className="lg:col-span-5 space-y-5">
            {selectedDoctor ? (
              <div className="bg-white rounded-3xl p-6 border border-[#e5edf5] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1677ff] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Selected Specialist Details</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#172033]">{selectedDoctor.name}</h3>
                    <p className="text-xs font-bold text-[#1677ff]">{selectedDoctor.specialization}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedDoctor.qualifications}</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clinical Experience:</span>
                    <span className="font-semibold text-gray-800">{selectedDoctor.experience_years} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Consultation Fee:</span>
                    <span className="font-bold text-gray-900 text-sm">₹{selectedDoctor.consultation_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Languages:</span>
                    <span className="font-medium text-gray-800">
                      {(selectedDoctor.languages || []).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-[#1677ff] font-medium leading-relaxed">
                  ✓ Verified telemedicine practitioner. Once scheduled, this appointment will immediately reflect in your portal calendar.
                </div>
              </div>
            ) : null}

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 leading-relaxed">
              <strong>Need to cancel or reschedule?</strong> You can cancel your scheduled visit at any time from your Appointments page without penalties.
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
