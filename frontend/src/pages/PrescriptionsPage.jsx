import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/client';
import {
  Pill,
  Clock,
  User,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Download
} from 'lucide-react';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        setLoading(true);
        const res = await api.prescriptions.getAll();
        if (res.success) {
          setPrescriptions(res.prescriptions || []);
        } else {
          setError('Could not retrieve prescriptions.');
        }
      } catch (err) {
        setError(err.message || 'Unable to connect to server.');
      } finally {
        setLoading(false);
      }
    }
    loadPrescriptions();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1677ff] text-xs font-bold mb-2 border border-blue-100">
            <Pill className="w-3.5 h-3.5" />
            <span>Digital Prescriptions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Prescriptions & Medications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Access certified digital prescriptions and medication regimens issued by your doctors.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#1677ff] animate-spin mb-3" />
            <p className="text-gray-500 font-medium">Loading digital prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#e5edf5] space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
              💊
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Prescriptions Issued</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              You currently do not have any active digital prescriptions. Prescriptions appear here following a completed consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((rx) => {
              const meds = Array.isArray(rx.medicines) ? rx.medicines : [];
              return (
                <div
                  key={rx.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5edf5] shadow-[0_5px_20px_#17365d08] space-y-6"
                >
                  {/* Rx Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
                        ℞
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#172033]">
                          Prescription #{rx.id}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Issued by <span className="font-semibold text-gray-900">{rx.doctor_name || 'Dr. Specialist'}</span> ({rx.specialization || 'Clinical Review'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Calendar className="w-4 h-4 text-[#1677ff]" />
                      <span>Issued: {formatDate(rx.issued_at)}</span>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Prescribed Medications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {meds.map((med, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-gray-100 bg-[#fbfdff] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-[#172033]">
                              {med.name}
                            </h5>
                            {med.duration && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                                {med.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 font-medium">
                            {med.dosage}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor instructions */}
                  {rx.instructions && (
                    <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100/60 text-xs text-gray-700">
                      <span className="font-bold text-[#1677ff] block mb-1">
                        Physician Instructions:
                      </span>
                      <p className="leading-relaxed">{rx.instructions}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Digitally Verified by Doctor
                    </span>
                    <span>Illazz E-Prescription Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
