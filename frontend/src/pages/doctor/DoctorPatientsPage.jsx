import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import {
  Users,
  Search,
  User,
  Calendar,
  FileText,
  Pill,
  Clock,
  Activity,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Stethoscope,
  Heart,
  FilePlus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Patient Details Modal
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const fetchPatients = async (query = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getPatients(query);
      if (res.success) {
        setPatients(res.patients || []);
      } else {
        setError('Failed to retrieve patient directory.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const handleViewPatient = async (id) => {
    setSelectedPatientId(id);
    try {
      setLoadingDetails(true);
      setDetailsError(null);
      const res = await api.doctor.getPatientDetails(id);
      if (res.success) {
        setPatientDetails(res);
      } else {
        setDetailsError(res.message || 'Could not load clinical history.');
      }
    } catch (err) {
      setDetailsError(err.message || 'Error loading clinical records.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalPatientsCount = patients.length;
  const returningPatientsCount = patients.filter((p) => parseInt(p.total_visits, 10) > 1).length;

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory & Clinical History</h1>
            <p className="text-sm text-slate-500 mt-1">
              Authorized clinical profiles and consultation history of all patients registered under your care.
            </p>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e8eef5] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Active Patients</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalPatientsCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8eef5] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Returning Patients</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{returningPatientsCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8eef5] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Data Privacy Protected</p>
              <h3 className="text-xs font-semibold text-indigo-700 mt-1">HIPAA / Consent Compliant</h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8eef5] shadow-sm">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff] transition-all"
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
            <p className="text-sm font-medium">Loading patient directory...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No patients found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              No patients match your search term. Ensure patients have appointments booked with your clinic.
            </p>
          </div>
        ) : (
          /* Patients Table */
          <div className="bg-white rounded-2xl border border-[#e8eef5] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#e8eef5] text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-4 px-6">Patient Name</th>
                    <th className="py-4 px-6">Contact / Email</th>
                    <th className="py-4 px-6">Total Visits</th>
                    <th className="py-4 px-6">Last Visit</th>
                    <th className="py-4 px-6">Primary Condition</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eef5] text-sm">
                  {patients.map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-100 to-blue-200 text-[#1677ff] font-bold flex items-center justify-center flex-shrink-0">
                            {pat.full_name ? pat.full_name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{pat.full_name}</p>
                            <p className="text-xs text-slate-500">Member since {formatDate(pat.registered_at)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-slate-600">
                        {pat.email}
                      </td>

                      {/* Total Visits */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1677ff]">
                          {pat.total_visits} {parseInt(pat.total_visits, 10) === 1 ? 'visit' : 'visits'}
                        </span>
                      </td>

                      {/* Last Visit */}
                      <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                        {formatDate(pat.last_visit)}
                      </td>

                      {/* Primary Condition */}
                      <td className="py-4 px-6 max-w-xs truncate text-slate-600 font-medium">
                        {pat.primary_condition || 'General Consultation'}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleViewPatient(pat.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> Clinical History
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
        {/* PATIENT CLINICAL HISTORY MODAL */}
        {/* ------------------------------------------------------------- */}
        {selectedPatientId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center font-bold text-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {loadingDetails ? 'Loading Patient Record...' : patientDetails?.patient?.full_name || 'Patient Clinical Dossier'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {patientDetails?.patient?.email} &bull; Clinical Profile & Medical Timeline
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatientId(null);
                    setPatientDetails(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingDetails ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
                  <p className="text-sm">Fetching verified medical history...</p>
                </div>
              ) : detailsError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
                  {detailsError}
                </div>
              ) : patientDetails ? (
                <div className="space-y-6">
                  
                  {/* Appointments Timeline */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1677ff]" /> Consultation History ({patientDetails.appointments?.length || 0})
                    </h3>
                    
                    {patientDetails.appointments?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">No past consultations recorded.</p>
                    ) : (
                      <div className="space-y-3">
                        {patientDetails.appointments.map((appt) => (
                          <div key={appt.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                {formatDate(appt.appointment_at)} &bull; {new Date(appt.appointment_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                                appt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-medium">
                              <span className="text-slate-500 font-normal">Reason:</span> {appt.reason || 'General Health Consultation'}
                            </p>
                            {appt.clinical_notes && (
                              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800">
                                <span className="font-semibold text-[#1677ff]">Doctor Notes:</span> {appt.clinical_notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Issued Prescriptions */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-600" /> Prescriptions Issued ({patientDetails.prescriptions?.length || 0})
                    </h3>

                    {patientDetails.prescriptions?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">No prescriptions issued yet for this patient.</p>
                    ) : (
                      <div className="space-y-3">
                        {patientDetails.prescriptions.map((rx) => {
                          const meds = Array.isArray(rx.medicines) ? rx.medicines : [];
                          return (
                            <div key={rx.id} className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-900">Rx #{rx.id} &bull; Issued {formatDate(rx.issued_at)}</span>
                              </div>
                              <div className="space-y-1">
                                {meds.map((m, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-emerald-100">
                                    <span className="font-semibold text-slate-800">{m.name}</span>
                                    <span className="text-slate-500">{m.dosage} &bull; {m.duration}</span>
                                  </div>
                                ))}
                              </div>
                              {rx.instructions && (
                                <p className="text-xs text-slate-600 italic">Directions: {rx.instructions}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Medical Records / Diagnostic Reports */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-600" /> Diagnostic Documents & Reports ({patientDetails.medical_records?.length || 0})
                    </h3>

                    {patientDetails.medical_records?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">No external diagnostic files uploaded.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {patientDetails.medical_records.map((rec) => (
                          <div key={rec.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {rec.record_type || 'Report'}
                            </span>
                            <p className="font-semibold text-xs text-slate-900 mt-1">{rec.title}</p>
                            <p className="text-[11px] text-slate-500">{formatDate(rec.created_at)}</p>
                            {rec.notes && <p className="text-xs text-slate-600 pt-1">{rec.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : null}

              {/* Modal Footer */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(null);
                    setPatientDetails(null);
                  }}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close Record
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
