import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { WavingPatientIllustration } from '../components/Illustrations';
import {
  Calendar,
  FileText,
  Users,
  FlaskConical,
  Bot,
  UserCheck,
  CalendarPlus,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.dashboard.getStats();
        if (res.success) {
          setStatsData(res);
        }
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = statsData?.stats || {
    upcoming_appointments: 1,
    completed_consultations: 1,
    prescriptions_count: 2,
    assessments_count: 1
  };

  const displayName = user?.full_name?.split(' ')[0] || 'Ayush';

  // Format activity date
  const formatActivityDate = (dateStr) => {
    if (!dateStr) return 'Sep 15, 2026';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* 1. GREETING HERO CARD matching Wireframe 3 */}
        <div className="bg-[#f1f6fb] rounded-3xl p-6 sm:p-8 flex items-center justify-between border border-[#e5edf5]">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              Good Morning, {displayName}!
            </h1>
            <p className="text-sm text-gray-500">
              Take charge of your health today.
            </p>
          </div>
          <WavingPatientIllustration />
        </div>

        {/* 2. 4 METRIC CARDS matching Wireframe 3 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Upcoming Appointments */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Upcoming Appointments</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1">
                {loading ? '...' : (stats.upcoming_appointments || 1)}
              </p>
            </div>
            <Link
              to="/appointments"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Prescriptions */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Prescriptions</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1">
                {loading ? '...' : (stats.prescriptions_count || 2)}
              </p>
            </div>
            <Link
              to="/prescriptions"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Family Members */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Family Members</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1">
                1
              </p>
            </div>
            <Link
              to="/settings"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Lab Reports */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5edf5] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold mb-3">
                <FlaskConical className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Lab Reports</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] mt-1">
                3
              </p>
            </div>
            <Link
              to="/medical-records"
              className="mt-4 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* 3. AI SYMPTOM CHECKER BANNER CARD matching Wireframe 3 */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5edf5] shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center text-3xl shrink-0 shadow-md">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#172033]">
                AI Symptom Checker
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Not feeling well? Get an AI-powered preliminary assessment based on your symptoms.
              </p>
            </div>
          </div>

          <Link
            to="/symptom-checker"
            className="shrink-0 px-6 py-3 bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <span>Check Symptoms</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4. TWO ACTION CARDS matching Wireframe 3 (Find Doctor & Book Appointment) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Action 1: Find a Doctor */}
          <div className="bg-white rounded-2xl p-6 border border-[#e5edf5] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">
                Find a Doctor
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Search and connect with verified doctors across specializations.
              </p>
            </div>

            <div>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-[#1677ff] text-xs font-bold transition-colors"
              >
                <span>Find Doctors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Action 2: Book Appointment */}
          <div className="bg-white rounded-2xl p-6 border border-[#e5edf5] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">
                Book Appointment
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Schedule a consultation at your convenience.
              </p>
            </div>

            <div>
              <Link
                to="/book"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-800 text-xs font-bold transition-colors"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* 5. RECENT ACTIVITY TABLE matching Wireframe 3 */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5edf5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#172033]">
              Recent Activity
            </h3>
            <Link
              to="/appointments"
              className="text-xs font-bold text-[#1677ff] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Activity</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                
                {/* Row 1 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 text-gray-500">
                    {statsData?.recent_appointments?.[0]?.appointment_at 
                      ? formatActivityDate(statsData.recent_appointments[0].appointment_at)
                      : 'Sep 15, 2026'}
                  </td>
                  <td className="py-3 font-semibold text-[#172033]">
                    {statsData?.recent_appointments?.[0]?.reason 
                      ? `${statsData.recent_appointments[0].doctor_name || 'General Physician'} Consultation`
                      : 'General Physician Consultation'}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Completed
                    </span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 text-gray-500">Sep 10, 2026</td>
                  <td className="py-3 font-semibold text-[#172033]">
                    Blood Test Report Uploaded
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#1677ff]">
                      Done
                    </span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 text-gray-500">Sep 05, 2026</td>
                  <td className="py-3 font-semibold text-[#172033]">
                    Prescription Added
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#1677ff]">
                      Done
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
