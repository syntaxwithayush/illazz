import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/client';
import {
  FileText,
  Plus,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  FileCheck,
  FolderOpen
} from 'lucide-react';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('Lab Report');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.records.getAll();
      if (res.success) {
        setRecords(res.records || []);
      } else {
        setError('Could not retrieve medical records.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const res = await api.records.create({
        title: title.trim(),
        record_type: recordType,
        notes: notes.trim()
      });

      if (res.success) {
        setSuccessMsg('Medical record saved successfully!');
        setShowModal(false);
        setTitle('');
        setNotes('');
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchRecords();
      } else {
        alert(res.message || 'Failed to save record.');
      }
    } catch (err) {
      alert(err.message || 'Error saving medical record.');
    } finally {
      setSaving(false);
    }
  };

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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1677ff] text-xs font-bold mb-2 border border-blue-100">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Patient Health Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              Medical Records
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Store and manage your laboratory results, diagnostic summaries, and clinical reports.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1677ff] text-white text-sm font-bold shadow-md shadow-blue-500/15 hover:bg-blue-600 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medical Record</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Records List */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#1677ff] animate-spin mb-3" />
            <p className="text-gray-500 font-medium">Loading health records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#e5edf5] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center mx-auto text-2xl">
              📁
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Medical Records Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Keep your health history safe and organized. Add your lab reports, radiology notes, or diagnostic documents here.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1677ff] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Record</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5edf5] shadow-[0_5px_20px_#17365d08] hover:border-blue-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#172033] line-clamp-1">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Recorded on {formatDate(rec.created_at)}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#1677ff] border border-blue-100 shrink-0">
                      {rec.record_type}
                    </span>
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                      {rec.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Author: {rec.uploaded_by_name || 'Patient'}</span>
                  <span className="text-emerald-600 font-semibold">✓ Verified Record</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Record Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#172033]">
                  Add Medical Record
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Save a medical report or clinical consultation note to your profile.
                </p>
              </div>

              <form onSubmit={handleCreateRecord} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Record Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC) or ECG Report"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Record Category
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff]"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Cardiology Report">Cardiology Report</option>
                    <option value="Dermatology Check">Dermatology Check</option>
                    <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                    <option value="Doctor Clinical Note">Doctor Clinical Note</option>
                    <option value="Vaccination Record">Vaccination Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Clinical Summary & Findings
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter diagnostic summary, key biomarker numbers, or physician observations..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-700 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 py-3 bg-[#1677ff] hover:bg-blue-600 font-bold text-xs text-white rounded-xl shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Record</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
