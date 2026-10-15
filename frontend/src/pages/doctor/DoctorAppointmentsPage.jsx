import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import {
  Calendar,
  Clock,
  Video,
  User,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Pill,
  Send,
  Loader2,
  Stethoscope,
  X,
  Plus,
  RefreshCw,
  PhoneCall,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function DoctorAppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Active consultation modal
  const [consultModalAppt, setConsultModalAppt] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [showPrescriptionFields, setShowPrescriptionFields] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [savingAction, setSavingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Reschedule modal
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDateTime, setNewDateTime] = useState('');

  const fetchAppointments = async (tab = activeTab, search = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getAppointments({
        status: tab,
        search: search.trim()
      });
      if (res.success) {
        setAppointments(res.appointments || []);
      } else {
        setError('Failed to fetch appointments.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(activeTab, searchQuery);
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments(activeTab, searchQuery);
  };

  const handleOpenConsultModal = (appt) => {
    setConsultModalAppt(appt);
    setClinicalNotes(appt.clinical_notes || '');
    setShowPrescriptionFields(false);
    setMedicineName('');
    setDosage('');
    setDuration('');
    setActionSuccessMsg(null);
  };

  const handleCompleteConsultation = async () => {
    if (!consultModalAppt) return;
    try {
      setSavingAction(true);
      // 1. Update appointment status to completed and save clinical notes
      await api.doctor.updateAppointment(consultModalAppt.id, {
        status: 'completed',
        clinical_notes: clinicalNotes
      });

      // 2. If prescription was filled, save it to the database
      if (medicineName.trim()) {
        await api.doctor.createPrescription({
          appointment_id: consultModalAppt.id,
          patient_id: consultModalAppt.patient_id,
          medicines: [
            {
              name: medicineName.trim(),
              dosage: dosage.trim() || '1 tablet daily',
              duration: duration.trim() || '5 days'
            }
          ],
          instructions: clinicalNotes || 'Take medications as directed.'
        });
      }

      setActionSuccessMsg('Consultation marked completed and record saved to database!');
      setTimeout(() => {
        setConsultModalAppt(null);
        fetchAppointments(activeTab, searchQuery);
      }, 1200);
    } catch (err) {
      alert('Error updating consultation: ' + (err.message || 'Server error'));
    } finally {
      setSavingAction(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setSavingAction(true);
      await api.doctor.updateAppointment(id, { status });
      fetchAppointments(activeTab, searchQuery);
    } catch (err) {
      alert('Error changing status: ' + (err.message || 'Server error'));
    } finally {
      setSavingAction(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleAppt || !newDateTime) return;
    try {
      setSavingAction(true);
      await api.doctor.updateAppointment(rescheduleAppt.id, {
        appointment_at: new Date(newDateTime).toISOString()
      });
      setRescheduleAppt(null);
      setNewDateTime('');
      fetchAppointments(activeTab, searchQuery);
    } catch (err) {
      alert('Failed to reschedule: ' + (err.message || 'Server error'));
    } finally {
      setSavingAction(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              View, consult, reschedule, or review all patient appointments booked with your clinic.
            </p>
          </div>
          <button
            onClick={() => fetchAppointments(activeTab, searchQuery)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-[#1677ff] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh List
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Appointments' },
              { id: 'today', label: "Today's" },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs md:text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1677ff] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient name, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff] transition-all"
            />
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
            <p className="text-sm font-medium">Loading appointments schedule...</p>
          </div>
        ) : appointments.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              There are no {activeTab !== 'all' ? activeTab : ''} appointments matching your criteria.
            </p>
          </div>
        ) : (
          /* Appointments List */
          <div className="bg-white rounded-2xl border border-[#e8eef5] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#e8eef5] text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-4 px-6">Patient</th>
                    <th className="py-4 px-6">Date & Time</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Reason / Notes</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eef5] text-sm">
                  {appointments.map((appt) => {
                    const isVideo = (appt.consultation_type || 'video_call') === 'video_call';
                    const isScheduled = appt.status === 'scheduled';
                    const isCompleted = appt.status === 'completed';

                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Patient info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-[#1677ff] font-bold flex items-center justify-center flex-shrink-0">
                              {appt.patient_name ? appt.patient_name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{appt.patient_name || 'Patient'}</p>
                              <p className="text-xs text-slate-500">{appt.patient_email || 'No email'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{formatDate(appt.appointment_at)}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {formatTime(appt.appointment_at)}
                          </p>
                        </td>

                        {/* Consultation Type */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            isVideo ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'
                          }`}>
                            {isVideo ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                            {isVideo ? 'Video Consultation' : 'In-Person Clinic'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getStatusBadge(appt.status)}
                        </td>

                        {/* Payment */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            appt.payment_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {appt.payment_status === 'paid' ? '₹ Paid' : '₹ Pending'}
                          </span>
                        </td>

                        {/* Reason / Notes */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-slate-800 font-medium truncate" title={appt.reason}>
                            {appt.reason || 'General Health Consultation'}
                          </p>
                          {appt.clinical_notes && (
                            <p className="text-xs text-slate-500 truncate mt-0.5 italic" title={appt.clinical_notes}>
                              Notes: {appt.clinical_notes}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {isScheduled && (
                              <button
                                onClick={() => handleOpenConsultModal(appt)}
                                className="px-3 py-1.5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                              >
                                <Stethoscope className="w-3.5 h-3.5" /> Start Consult
                              </button>
                            )}

                            {isScheduled && (
                              <button
                                onClick={() => {
                                  setRescheduleAppt(appt);
                                  setNewDateTime('');
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                              >
                                Reschedule
                              </button>
                            )}

                            {isScheduled && (
                              <button
                                onClick={() => {
                                  if (confirm(`Cancel appointment for ${appt.patient_name}?`)) {
                                    handleStatusChange(appt.id, 'cancelled');
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Cancel Appointment"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            {isCompleted && (
                              <button
                                onClick={() => handleOpenConsultModal(appt)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" /> View Notes
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE CONSULTATION SESSION MODAL */}
        {/* ------------------------------------------------------------- */}
        {consultModalAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center font-bold text-lg">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Telemedicine Consultation Session
                    </h2>
                    <p className="text-xs text-slate-500">
                      Patient: <span className="font-semibold text-slate-800">{consultModalAppt.patient_name}</span> &bull; {formatDate(consultModalAppt.appointment_at)} at {formatTime(consultModalAppt.appointment_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConsultModalAppt(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {actionSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  {actionSuccessMsg}
                </div>
              )}

              {/* Consultation Video / Audio Simulation Panel */}
              <div className="bg-slate-950 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] shadow-inner">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3 border border-slate-700">
                  <User className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-base">{consultModalAppt.patient_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Encrypted WebRTC Telemedicine Call Ready</p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Channel Secure
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                    Audio & Video Active
                  </span>
                </div>
              </div>

              {/* Patient Chief Complaint */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Patient Chief Complaint / Reason</p>
                <p className="text-sm font-medium text-slate-800 mt-1">
                  {consultModalAppt.reason || 'Routine follow-up consultation.'}
                </p>
              </div>

              {/* Clinical Notes & Observations */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">
                  Clinical Diagnosis & Doctor Observations
                </label>
                <textarea
                  rows={4}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record symptoms observed, vitals, primary diagnosis, and advice given during consultation..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff] transition-all"
                />
              </div>

              {/* Prescription Toggle */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-[#1677ff]" />
                    <span className="text-sm font-bold text-slate-800">Prescribe Medication (Optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionFields(!showPrescriptionFields)}
                    className="text-xs font-semibold text-[#1677ff] hover:underline"
                  >
                    {showPrescriptionFields ? 'Hide Medication Fields' : '+ Add Medication to Rx'}
                  </button>
                </div>

                {showPrescriptionFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Medicine Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Atorvastatin 10mg"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Dosage & Frequency</label>
                      <input
                        type="text"
                        placeholder="e.g., 1 tablet after dinner"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g., 14 days"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConsultModalAppt(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Close Session
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={savingAction}
                    onClick={handleCompleteConsultation}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1677ff] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingAction ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving records...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Complete Consultation & Save
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* RESCHEDULE MODAL */}
        {/* ------------------------------------------------------------- */}
        {rescheduleAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Reschedule Appointment</h3>
                <button
                  onClick={() => setRescheduleAppt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Rescheduling appointment for <span className="font-semibold text-slate-900">{rescheduleAppt.patient_name}</span>. Currently set for {formatDate(rescheduleAppt.appointment_at)} at {formatTime(rescheduleAppt.appointment_at)}.
              </p>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select New Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleAppt(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAction || !newDateTime}
                    className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Confirm Reschedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
