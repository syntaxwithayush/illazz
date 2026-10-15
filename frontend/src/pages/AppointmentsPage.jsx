import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/client';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarPlus,
  ShieldCheck,
  Ban
} from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'scheduled', 'completed', 'cancelled'
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.appointments.getAll();
      if (res.success) {
        setAppointments(res.appointments || []);
      } else {
        setError('Could not retrieve appointments.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled appointment?')) {
      return;
    }

    try {
      setCancellingId(id);
      const res = await api.appointments.cancel(id);
      if (res.success) {
        setActionMessage('Appointment cancelled successfully.');
        setTimeout(() => setActionMessage(null), 4000);
        fetchAppointments();
      } else {
        alert(res.message || 'Failed to cancel appointment.');
      }
    } catch (err) {
      alert(err.message || 'Could not cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === 'all') return true;
    return appt.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1677ff] text-xs font-bold mb-2 border border-blue-100">
              <Calendar className="w-3.5 h-3.5" />
              <span>Consultation Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              My Appointments
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View your upcoming consultations, past visit logs, or cancel bookings.
            </p>
          </div>

          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1677ff] text-white text-sm font-bold shadow-md shadow-blue-500/15 hover:bg-blue-600 transition-all self-start sm:self-auto"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* Action / Error Banner */}
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#e5edf5] rounded-2xl w-fit">
          {['all', 'scheduled', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-[#1677ff] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab === 'all' ? 'All Bookings' : tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#1677ff] animate-spin mb-3" />
            <p className="text-gray-500 font-medium">Loading saved appointments from PostgreSQL...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#e5edf5] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center mx-auto text-2xl">
              📅
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Appointments Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              You do not have any appointments under "{filter}" status.
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1677ff] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-600 transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule a Consultation</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5edf5] shadow-[0_5px_20px_#17365d08] hover:border-blue-200 transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold text-xl">
                        👨‍⚕️
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#172033]">
                          {appt.doctor_name || appt.patient_name}
                        </h3>
                        <p className="text-xs font-bold text-[#1677ff]">
                          {appt.specialization || 'General Consultation'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        appt.status === 'scheduled'
                          ? 'bg-blue-50 text-[#1677ff] border border-blue-200'
                          : appt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2 text-xs text-gray-700">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <Clock className="w-4 h-4 text-[#1677ff]" />
                      <span>{formatDate(appt.appointment_at)}</span>
                    </div>

                    {appt.consultation_fee && (
                      <div className="flex justify-between text-gray-500 pt-1">
                        <span>Consultation Fee:</span>
                        <span className="font-bold text-gray-900">₹{appt.consultation_fee}</span>
                      </div>
                    )}
                  </div>

                  {appt.reason && (
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Reason for Visit
                      </span>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
                        "{appt.reason}"
                      </p>
                    </div>
                  )}
                </div>

                {appt.status === 'scheduled' && (
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Confirmed
                    </span>

                    <button
                      type="button"
                      disabled={cancellingId === appt.id}
                      onClick={() => handleCancel(appt.id)}
                      className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      {cancellingId === appt.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel Booking</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
