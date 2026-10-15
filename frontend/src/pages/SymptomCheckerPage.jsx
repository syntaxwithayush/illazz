import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Plus,
  X,
  Loader2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

export default function SymptomCheckerPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const commonSymptoms = [
    'Fever',
    'Persistent Cough',
    'Severe Headache',
    'Chest Pain',
    'Difficulty Breathing',
    'Shortness of Breath',
    'Sore Throat',
    'Fatigue',
    'Nausea',
    'Skin Rash',
    'Dizziness',
    'Abdominal Pain',
    'Joint Pain'
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache', 'Fever']);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = (e) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (clean && !selectedSymptoms.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSelectedSymptoms([...selectedSymptoms, clean]);
      setCustomInput('');
    }
  };

  const removeSymptom = (symptomToRemove) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomToRemove));
  };

  const handleAssessment = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select or enter at least one symptom.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.symptoms.assess(selectedSymptoms);
      if (res.success) {
        setAssessment(res);
      } else {
        setError(res.message || 'Assessment failed.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to the triage server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbff]">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1677ff] text-xs font-bold mb-3 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Preliminary Triage Guidance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              Symptom Checker
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Select or describe your current symptoms for preliminary evaluation and appropriate clinical next steps.
            </p>
          </div>

          {/* Legal / Clinical Disclaimer Notice */}
          <div className="mb-8 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900 leading-relaxed shadow-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Important Preliminary Guidance Notice:</strong> This AI tool provides educational triage guidance and does NOT provide a definitive medical diagnosis. If you are experiencing sudden intense chest pain, severe difficulty breathing, or trauma, contact emergency personnel immediately.
            </div>
          </div>

          {/* Interactive Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5edf5] shadow-[0_15px_45px_rgba(30,80,130,0.06)] space-y-8">
            
            {/* 1. Selected Symptoms */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-800">
                  Selected Symptoms ({selectedSymptoms.length})
                </label>
                {selectedSymptoms.length > 0 && (
                  <button
                    onClick={() => setSelectedSymptoms([])}
                    className="text-xs text-gray-400 hover:text-red-500 font-semibold"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {selectedSymptoms.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400">
                  No symptoms selected yet. Pick from the suggestions below or type your own.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-blue-50/40 border border-blue-100/60 rounded-2xl">
                  {selectedSymptoms.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-[#1677ff] text-xs font-bold shadow-sm"
                    >
                      <span>{sym}</span>
                      <button
                        type="button"
                        onClick={() => removeSymptom(sym)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Common suggestions */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Common Symptoms (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#1677ff] text-white shadow-sm'
                          : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Add custom symptom */}
            <form onSubmit={addCustomSymptom} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type a specific symptom (e.g. sharp earache, mild chills)..."
                className="flex-1 px-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all text-gray-900"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Submit Action */}
            <button
              type="button"
              onClick={handleAssessment}
              disabled={loading || selectedSymptoms.length === 0}
              className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white bg-[#1677ff] hover:bg-blue-600 disabled:opacity-50 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing symptoms with clinical triage logic...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  <span>Analyze Symptoms & Get Guidance</span>
                </>
              )}
            </button>

            {/* Assessment Result Panel */}
            {assessment && (
              <div className="pt-8 border-t border-[#e8eef5] space-y-6">
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#172033]">
                    Preliminary Assessment Result
                  </h3>
                  <span className="text-xs text-gray-400">
                    ID: #{assessment.assessment_id || 'Triage-Temp'}
                  </span>
                </div>

                {/* Risk Level Badge & Emergency Notice */}
                {assessment.risk === 'high' ? (
                  <div className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-red-700">
                          Urgent Medical Advisory
                        </span>
                        <h4 className="text-xl font-extrabold text-red-800">
                          High Risk / Potential Emergency
                        </h4>
                      </div>
                    </div>

                    <p className="text-sm text-red-900 leading-relaxed font-semibold">
                      {assessment.emergency_guidance}
                    </p>

                    <div className="p-4 bg-white/80 rounded-2xl border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-700 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 text-red-600" />
                        <span>Emergency Dispatch: 112 / 911 / 102</span>
                      </div>
                      <a
                        href="tel:112"
                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl text-center hover:bg-red-700 shadow-sm"
                      >
                        Call Emergency Hotline
                      </a>
                    </div>
                  </div>
                ) : assessment.risk === 'moderate' ? (
                  <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                          Triage Level
                        </span>
                        <h4 className="text-xl font-extrabold text-amber-800">
                          Moderate Risk — Medical Consultation Recommended
                        </h4>
                      </div>
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      {assessment.recommendation}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-3xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                          Triage Level
                        </span>
                        <h4 className="text-xl font-extrabold text-emerald-800">
                          Low Risk — Self-Care & Routine Monitoring
                        </h4>
                      </div>
                    </div>
                    <p className="text-sm text-emerald-900 leading-relaxed">
                      {assessment.recommendation}
                    </p>
                  </div>
                )}

                {/* Next Step Doctor Booking CTA */}
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">
                      Connect with a qualified doctor
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Consult directly with an affiliated physician to evaluate these symptoms.
                    </p>
                  </div>
                  <Link
                    to={`/book?reason=${encodeURIComponent(
                      `Consultation for reported symptoms: ${assessment.symptoms.join(', ')}`
                    )}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all shrink-0"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Consultation</span>
                  </Link>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{assessment.disclaimer}</span>
                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
