import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import {
  FileText,
  Search,
  Calendar,
  User,
  Activity,
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  X,
  Stethoscope,
  Pill,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function DoctorRecordsPage() {
  const [appointmentsWithNotes, setAppointmentsWithNotes] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Preview record modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch completed appointments and prescriptions
      const [apptsRes, rxRes] = await Promise.all([
        api.doctor.getAppointments({ status: 'completed' }),
        api.doctor.getPrescriptions()
      ]);

      if (apptsRes.success) {
        setAppointmentsWithNotes(apptsRes.appointments || []);
      }
      if (rxRes.success) {
        setPrescriptions(rxRes.prescriptions || []);
      }
    } catch (err) {
      setError(err.message || 'Error loading records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Merge into a single timeline
  const combinedRecords = [
    ...appointmentsWithNotes.map((a) => ({
      type: 'clinical_notes',
      id: `NOTE-${a.id}`,
      patient_name: a.patient_name,
      patient_email: a.patient_email,
      date: a.appointment_at,
      title: `Consultation Notes & Diagnosis`,
      summary: a.clinical_notes || a.reason || 'Routine telemedicine follow-up.',
      details: a.clinical_notes,
      raw: a
    })),
    ...prescriptions.map((p) => ({
      type: 'prescription',
      id: `RX-${p.id}`,
      patient_name: p.patient_name,
      patient_email: p.patient_email,
      date: p.issued_at,
      title: `Prescription #${p.id}`,
      summary: Array.isArray(p.medicines)
        ? p.medicines.map((m) => m.name).join(', ')
        : 'Prescribed medications',
      details: p.instructions,
      raw: p
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredRecords = combinedRecords.filter((rec) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (rec.patient_name || '').toLowerCase().includes(q) ||
      (rec.title || '').toLowerCase().includes(q) ||
      (rec.summary || '').toLowerCase().includes(q);

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'notes') return matchesSearch && rec.type === 'clinical_notes';
    if (filterType === 'prescription') return matchesSearch && rec.type === 'prescription';
    return matchesSearch;
  });

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Medical Records</h1>
            <p className="text-sm text-slate-500 mt-1">
              Centralized repository of clinical notes, consultation summaries, and medical histories.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8eef5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'notes', label: 'Clinical Notes' },
              { id: 'prescription', label: 'Prescriptions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  filterType === tab.id
                    ? 'bg-[#1677ff] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records by patient or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Records List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
            <p className="text-sm font-medium">Loading clinical records archive...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No clinical records found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Records will appear as you complete patient consultations and issue prescriptions.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e8eef5] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#e8eef5] text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-4 px-6">Record Type</th>
                    <th className="py-4 px-6">Patient</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Summary / Notes</th>
                    <th className="py-4 px-6 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eef5] text-sm">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          rec.type === 'prescription'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {rec.type === 'prescription' ? <Pill className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                          {rec.type === 'prescription' ? 'Prescription' : 'Consult Notes'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{rec.patient_name || 'Patient'}</p>
                        <p className="text-xs text-slate-500">{rec.patient_email}</p>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-slate-600 text-xs">
                        {formatDate(rec.date)}
                      </td>

                      <td className="py-4 px-6 max-w-sm truncate text-slate-700 font-medium">
                        {rec.summary}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* RECORD DETAIL MODAL */}
        {/* ------------------------------------------------------------- */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">{selectedRecord.title}</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-2">
                <p><span className="font-semibold text-slate-600">Patient:</span> {selectedRecord.patient_name} ({selectedRecord.patient_email})</p>
                <p><span className="font-semibold text-slate-600">Date:</span> {formatDate(selectedRecord.date)}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedRecord.details || selectedRecord.summary || 'No further notes provided.'}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
