import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Pill,
  Search,
  Plus,
  Printer,
  FileText,
  Calendar,
  User,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Trash2,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export default function DoctorPrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // "Issue New Prescription" Modal
  const [newRxModalOpen, setNewRxModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [medicinesList, setMedicinesList] = useState([
    { name: '', dosage: '1 tablet daily', duration: '7 days' }
  ]);
  const [instructions, setInstructions] = useState('');
  const [submittingRx, setSubmittingRx] = useState(false);
  const [rxSuccessMsg, setRxSuccessMsg] = useState(null);

  // "View / Print Prescription Slip" Modal
  const [printRx, setPrintRx] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getPrescriptions();
      if (res.success) {
        setPrescriptions(res.prescriptions || []);
      } else {
        setError('Failed to fetch prescriptions.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientsList = async () => {
    try {
      const res = await api.doctor.getPatients();
      if (res.success) {
        setPatients(res.patients || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchPatientsList();
  }, []);

  const handleAddMedicineRow = () => {
    setMedicinesList([
      ...medicinesList,
      { name: '', dosage: '1 tablet twice daily', duration: '5 days' }
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicinesList.length <= 1) return;
    setMedicinesList(medicinesList.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicinesList];
    updated[index][field] = value;
    setMedicinesList(updated);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient.');
      return;
    }
    const validMeds = medicinesList.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      alert('Please specify at least one medication name.');
      return;
    }

    try {
      setSubmittingRx(true);
      const res = await api.doctor.createPrescription({
        patient_id: parseInt(selectedPatientId, 10),
        medicines: validMeds,
        instructions: instructions || 'Follow directed medical guidelines.'
      });

      if (res.success) {
        setRxSuccessMsg('Prescription successfully registered and saved to database!');
        setTimeout(() => {
          setNewRxModalOpen(false);
          setRxSuccessMsg(null);
          setSelectedPatientId('');
          setMedicinesList([{ name: '', dosage: '1 tablet daily', duration: '7 days' }]);
          setInstructions('');
          fetchPrescriptions();
        }, 1200);
      }
    } catch (err) {
      alert('Error creating prescription: ' + (err.message || 'Server error'));
    } finally {
      setSubmittingRx(false);
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

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const q = searchQuery.toLowerCase();
    const patientMatch = (rx.patient_name || '').toLowerCase().includes(q);
    const medsMatch = Array.isArray(rx.medicines)
      ? rx.medicines.some((m) => (m.name || '').toLowerCase().includes(q))
      : false;
    return patientMatch || medsMatch;
  });

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescriptions Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Issue verified digital prescriptions, manage active medication regimens, and print clinical slips.
            </p>
          </div>
          <button
            onClick={() => setNewRxModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1677ff] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Issue New Prescription
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8eef5] shadow-sm flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name or medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff] transition-all"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Prescriptions List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677ff]" />
            <p className="text-sm font-medium">Loading clinical prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8eef5] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-[#1677ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No prescriptions found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Click &quot;Issue New Prescription&quot; to formulate a clinical medication plan for your patients.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrescriptions.map((rx) => {
              const meds = Array.isArray(rx.medicines) ? rx.medicines : [];
              return (
                <div
                  key={rx.id}
                  className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1677ff] bg-blue-50 px-2.5 py-0.5 rounded-md">
                            Rx #{rx.id}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(rx.issued_at)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-2">
                          {rx.patient_name || 'Patient'}
                        </h3>
                        <p className="text-xs text-slate-500">{rx.patient_email}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Medications Pills */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Medications ({meds.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {meds.map((m, idx) => (
                          <div
                            key={idx}
                            className="text-xs font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-800 flex items-center gap-2"
                          >
                            <span className="font-bold text-[#1677ff]">{m.name}</span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-slate-600">{m.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {rx.instructions && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        Instructions: &ldquo;{rx.instructions}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => setPrintRx(rx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> View & Print Slip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ISSUE NEW PRESCRIPTION MODAL */}
        {/* ------------------------------------------------------------- */}
        {newRxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#1677ff] rounded-xl flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Issue Clinical Prescription</h2>
                    <p className="text-xs text-slate-500">Record a registered medication plan in the database.</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewRxModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {rxSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  {rxSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCreatePrescription} className="space-y-4">
                
                {/* Select Patient */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Patient *
                  </label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medicines List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Prescribed Medications
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMedicineRow}
                      className="text-xs font-semibold text-[#1677ff] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Medication
                    </button>
                  </div>

                  {medicinesList.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Medicine name (e.g., Amoxicillin 500mg)"
                          value={row.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1677ff]"
                        />
                      </div>
                      <div className="w-40">
                        <input
                          type="text"
                          placeholder="Dosage (e.g., 1 tablet 2x daily)"
                          value={row.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1677ff]"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="text"
                          placeholder="Duration (e.g., 5 days)"
                          value={row.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1677ff]"
                        />
                      </div>
                      {medicinesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Instructions & Lifestyle Advice
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g., Take with plenty of water after meals. Avoid driving after medication."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setNewRxModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRx}
                    className="px-6 py-2.5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingRx ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save & Issue Prescription
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PRINTABLE PRESCRIPTION SLIP MODAL */}
        {/* ------------------------------------------------------------- */}
        {printRx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
              
              {/* Slip Clinic Header */}
              <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="text-[#1677ff]">Illazz</span> Telemedicine Clinic
                  </h1>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {user?.full_name || 'Dr. Ananya Sharma'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.doctor?.specialization || 'Cardiologist & Internal Medicine'} &bull; Reg: MCI-2024-88912
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Rx #{printRx.id}</p>
                  <p>Date: {formatDate(printRx.issued_at)}</p>
                  <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    Digital Verified
                  </span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold uppercase">Patient Name</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{printRx.patient_name || 'Patient'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase">Email / Identifier</p>
                  <p className="text-slate-800 font-medium mt-0.5">{printRx.patient_email || 'Verified User'}</p>
                </div>
              </div>

              {/* Rx Symbol & Medication Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-2xl font-serif font-black text-[#1677ff]">
                  <span>&#8478;</span>
                  <span className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-widest pt-2">
                    Prescribed Medicines
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">Medication Name</th>
                        <th className="py-2.5 px-4">Dosage / Schedule</th>
                        <th className="py-2.5 px-4">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(Array.isArray(printRx.medicines) ? printRx.medicines : []).map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-semibold text-slate-400">{i + 1}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{m.name}</td>
                          <td className="py-2.5 px-4 text-slate-700">{m.dosage}</td>
                          <td className="py-2.5 px-4 text-slate-700">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Instructions */}
              {printRx.instructions && (
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-800 uppercase tracking-wider">Clinical Instructions</p>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {printRx.instructions}
                  </p>
                </div>
              )}

              {/* Signature Section */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>Illazz Healthcare Telemedicine Network</p>
                  <p>Electronically generated clinical document &bull; Valid without physical signature</p>
                </div>
                <div className="text-right">
                  <p className="font-serif italic text-lg text-slate-800 tracking-wider">
                    {user?.full_name || 'Dr. Ananya Sharma'}
                  </p>
                  <p className="text-xs text-slate-500 border-t border-slate-400 pt-1 mt-1 font-medium">
                    Authorized Medical Practitioner
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setPrintRx(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
