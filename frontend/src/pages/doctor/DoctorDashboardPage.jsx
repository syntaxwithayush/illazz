import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  IndianRupee,
  Star,
  Video,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Pill,
  Sparkles,
  Loader2,
  X,
  Stethoscope,
  Send,
  Plus
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Consultation Session Modal
  const [activeSessionAppt, setActiveSessionAppt] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [prescribing, setPrescribing] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getStats();
      if (res.success) {
        setDashboardData(res);
      } else {
        setError('Could not load practice statistics.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStartConsultation = (appt) => {
    setActiveSessionAppt(appt);
    setSessionNotes(appt.clinical_notes || '');
    setSessionSuccess(null);
  };

  const handleCompleteConsultation = async () => {
    if (!activeSessionAppt) return;
    try {
      await api.doctor.updateAppointment(activeSessionAppt.id, {
        status: 'completed',
        clinical_notes: sessionNotes
      });

      // If prescription medicine was entered, save it
      if (medicineName.trim()) {
        await api.doctor.createPrescription({
          appointment_id: activeSessionAppt.id,
          patient_id: activeSessionAppt.patient_id,
          medicines: [
            {
              name: medicineName.trim(),
              dosage: dosage.trim() || '1 tablet daily',
              duration: duration.trim() || '7 days'
            }
          ],
          instructions: sessionNotes || 'Follow doctor directions.'
        });
      }

      setSessionSuccess('Consultation marked completed and records saved to database!');
      setTimeout(() => {
        setActiveSessionAppt(null);
        setMedicineName('');
        setDosage('');
        setDuration('');
        fetchDashboard();
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to complete consultation.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const doctorName = user?.full_name || dashboardData?.doctor?.name || 'Dr. Ananya Sharma';
  const specialization = dashboardData?.doctor?.specialization || 'Cardiologist';

  const stats = dashboardData?.stats || {
    today_appointments: 2,
    total_patients: 5,
    this_month_earnings: 1600,
    average_rating: '4.9',
    review_count: 24
  };

  return (
    <DoctorLayout>
      <div className="space-y-7">
        
        {/* 1. Welcome Practice Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-[#1677ff] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>Verified Clinical Practice • {specialization}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good Morning, {doctorName}! 👋
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Here is your practice overview for today. You have <strong className="text-white underline">{stats.today_appointments} appointments</strong> scheduled on your calendar.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 z-10">
            <Link
              to="/doctor/appointments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1677ff] text-xs sm:text-sm font-bold shadow-md hover:bg-blue-50 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>View Schedule</span>
            </Link>

            <Link
              to="/doctor/prescriptions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700/70 border border-white/20 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition-all"
            >
              <Pill className="w-4 h-4" />
              <span>Issue Prescription</span>
            </Link>
          </div>

          {/* Decorative medical background circle */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between text-red-700 text-xs">
            <span>{error}</span>
            <button onClick={fetchDashboard} className="font-bold underline">Retry</button>
          </div>
        )}

        {/* 2. Four Main Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Today's Appointments */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Today's Appointments</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1">
                {loading ? '...' : stats.today_appointments}
              </p>
            </div>
            <Link
              to="/doctor/appointments?status=today"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>View Today's List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Total Patients */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Total Patients</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1">
                {loading ? '...' : stats.total_patients}
              </p>
            </div>
            <Link
              to="/doctor/patients"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>Patient Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: This Month's Earnings */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
                <IndianRupee className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500">This Month's Earnings</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1">
                {loading ? '...' : `₹${stats.this_month_earnings}`}
              </p>
            </div>
            <Link
              to="/doctor/earnings"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>Earnings Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Average Rating & Review Count */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold mb-3">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Average Rating</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
                  {stats.average_rating}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  ({stats.review_count} reviews)
                </span>
              </div>
            </div>
            <Link
              to="/doctor/reviews"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>Patient Feedback</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* 3. Upcoming Appointments & Today's Schedule Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          
          {/* Left: Upcoming Appointments Panel (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e5edf5] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#1677ff]" />
                <h3 className="text-base font-bold text-[#172033]">
                  Upcoming Consultations
                </h3>
              </div>
              <Link
                to="/doctor/appointments"
                className="text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
              >
                <span>View All ({dashboardData?.upcoming_appointments?.length || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1677ff]" />
                <span className="text-xs">Loading appointments...</span>
              </div>
            ) : !dashboardData?.upcoming_appointments || dashboardData.upcoming_appointments.length === 0 ? (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 font-medium">No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {dashboardData.upcoming_appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-[#fbfdff] hover:bg-white hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#172033] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {appt.patient_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">
                            {appt.patient_name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              appt.consultation_type === 'video'
                                ? 'bg-blue-50 text-[#1677ff] border border-blue-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                          >
                            {appt.consultation_type === 'video' ? '📹 Video Call' : '🏥 In-Person'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatFullDate(appt.appointment_at)}</span>
                        </p>

                        {appt.reason && (
                          <p className="text-xs text-gray-600 mt-1 italic line-clamp-1">
                            "{appt.reason}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleStartConsultation(appt)}
                        className="px-3.5 py-2 rounded-xl bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Start Consult</span>
                      </button>

                      <Link
                        to={`/doctor/patients/${appt.patient_id}`}
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                      >
                        Records
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Today's Schedule Timeline (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e5edf5] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1677ff]" />
                <h3 className="text-base font-bold text-[#172033]">
                  Today's Timeline
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1677ff]">
                Today
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-xs">Loading schedule...</div>
            ) : !dashboardData?.today_appointments || dashboardData.today_appointments.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400">
                No appointments for today.
              </div>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {dashboardData.today_appointments.map((slot) => (
                  <div key={slot.id} className="relative group">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#1677ff] ring-4 ring-blue-50" />
                    
                    <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100/60 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#1677ff]">
                          {formatDate(slot.appointment_at)}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500 capitalize">
                          {slot.consultation_type}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 mt-1">
                        {slot.patient_name}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {slot.reason || 'General Follow-up'}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Blocked Research Slot */}
                <div className="relative">
                  <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-gray-300 ring-4 ring-gray-100" />
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 text-xs">
                    <span className="font-bold">04:30 PM</span>
                    <p className="font-medium mt-0.5">Clinical Case Notes & Research</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 4. Consultation Room / Session Modal */}
        {activeSessionAppt && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => setActiveSessionAppt(null)}
                className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-3.5 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold text-2xl">
                  🩺
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Telemedicine Session Placeholder</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#172033]">
                    Consultation with {activeSessionAppt.patient_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Reason: {activeSessionAppt.reason}
                  </p>
                </div>
              </div>

              {sessionSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{sessionSuccess}</span>
                </div>
              )}

              {/* Consultation Workspace Form */}
              <div className="space-y-5">
                
                {/* Clinical Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Doctor Clinical Notes & Observations
                  </label>
                  <textarea
                    rows={4}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Enter diagnostic observations, vitals review, lifestyle recommendations, and diagnosis..."
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all"
                  />
                </div>

                {/* Quick Prescription Writer */}
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                      <Pill className="w-4 h-4 text-purple-600" />
                      <span>Issue Digital Prescription (Optional)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        placeholder="Medicine name (e.g. Atorvastatin 10mg)"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="Dosage (e.g. 1 tab at night)"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Duration (e.g. 30 days)"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSessionAppt(null)}
                    className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-700 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteConsultation}
                    className="w-2/3 py-3 bg-[#1677ff] hover:bg-blue-600 font-bold text-xs text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation & Save Records</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
