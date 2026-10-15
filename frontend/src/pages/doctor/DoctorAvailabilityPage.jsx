import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import {
  Clock,
  Calendar,
  IndianRupee,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorAvailabilityPage() {
  const [availableDays, setAvailableDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [consultationFee, setConsultationFee] = useState(800);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getAvailability();
      if (res.success && res.availability) {
        const a = res.availability;
        if (Array.isArray(a.available_days) && a.available_days.length > 0) {
          setAvailableDays(a.available_days);
        }
        if (a.working_hours) {
          // Parse "09:00 AM - 05:00 PM" if needed or keep default
          const parts = a.working_hours.split('-');
          if (parts.length === 2) {
            // Keep user friendly or default
          }
        }
        if (a.slot_duration_mins) {
          setSlotDuration(a.slot_duration_mins);
        }
        if (a.consultation_fee) {
          setConsultationFee(parseFloat(a.consultation_fee));
        }
      }
    } catch (err) {
      setError(err.message || 'Error loading availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      if (availableDays.length === 1) {
        alert('You must have at least one working day.');
        return;
      }
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setError(null);

      // Convert 24hr to readable string e.g. "09:00 AM - 05:00 PM"
      const formatTimeStr = (t) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${String(formattedHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      };

      const workingHoursStr = `${formatTimeStr(startTime)} - ${formatTimeStr(endTime)}`;

      const res = await api.doctor.updateAvailability({
        available_days: availableDays,
        working_hours: workingHoursStr,
        slot_duration_mins: parseInt(slotDuration, 10),
        consultation_fee: parseFloat(consultationFee)
      });

      if (res.success) {
        setSuccessMsg('Clinic availability and schedule saved to PostgreSQL database!');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError('Failed to update availability.');
      }
    } catch (err) {
      setError(err.message || 'Server error updating availability.');
    } finally {
      setSaving(false);
    }
  };

  // Generate sample visual slots for demonstration
  const generatePreviewSlots = () => {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let curMin = startH * 60 + startM;
    const endTotalMin = endH * 60 + endM;

    while (curMin + slotDuration <= endTotalMin && slots.length < 8) {
      const h = Math.floor(curMin / 60);
      const m = curMin % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 || 12;
      const slotStr = `${String(formattedHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      slots.push(slotStr);
      curMin += slotDuration;
    }
    return slots;
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Availability & Clinic Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure consultation days, working hours, appointment slot durations, and consultation fees.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
            <p className="text-sm font-medium">Loading schedule preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Working Days */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1677ff]" /> Active Consultation Days
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which days patients can book telemedicine or in-clinic slots with you.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
                {ALL_DAYS.map((day) => {
                  const isSelected = availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`p-3.5 rounded-xl text-center border transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#1677ff] text-[#1677ff] font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#1677ff]" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="text-xs">{day.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Working Hours & Slot Duration */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1677ff]" /> Working Hours & Slot Duration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define your daily consultation timeframe and appointment interval.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slot Duration (Minutes)
                  </label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes (Recommended)</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Consultation Fee */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#1677ff]" /> Standard Consultation Fee
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fee charged to patients per telemedicine video consultation session.
                </p>
              </div>

              <div className="max-w-xs pt-2">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="50"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Platform fee of 10% applies upon settlement.</p>
              </div>
            </div>

            {/* Visual Slot Preview */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Generated Slot Window Preview
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {generatePreviewSlots().map((slot, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-50 text-[#1677ff] rounded-xl text-xs font-semibold border border-blue-200"
                  >
                    {slot}
                  </span>
                ))}
                <span className="px-3 py-1.5 text-xs text-slate-400 font-medium">
                  + more depending on schedule
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#1677ff] hover:bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Schedule & Availability
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </DoctorLayout>
  );
}
