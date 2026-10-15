import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  User,
  ShieldCheck,
  Stethoscope,
  IndianRupee,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Globe,
  FileCheck,
  Award
} from 'lucide-react';

export default function DoctorSettingsPage() {
  const { user, login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [consultationFee, setConsultationFee] = useState(800);
  const [languages, setLanguages] = useState('English, Hindi');
  const [about, setAbout] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.doctor.getProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setFullName(p.full_name || '');
        setEmail(p.email || '');
        setSpecialization(p.specialization || '');
        setQualifications(p.qualifications || '');
        setExperienceYears(p.experience_years || 10);
        setConsultationFee(parseFloat(p.consultation_fee) || 800);
        setLanguages(Array.isArray(p.languages) ? p.languages.join(', ') : p.languages || 'English, Hindi');
        setAbout(p.about || '');
      }
    } catch (err) {
      setError(err.message || 'Error loading doctor profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setError(null);

      const langsArray = languages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.doctor.updateProfile({
        full_name: fullName.trim(),
        specialization: specialization.trim(),
        qualifications: qualifications.trim(),
        experience_years: parseInt(experienceYears, 10),
        consultation_fee: parseFloat(consultationFee),
        languages: langsArray,
        about: about.trim()
      });

      if (res.success) {
        setSuccessMsg('Doctor profile and practice credentials updated in PostgreSQL database!');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Server error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Profile & Practice Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your professional clinical credentials, consultation details, and verification status.
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
            <p className="text-sm font-medium">Loading clinical profile settings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Profile & Medical Credentials Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#1677ff]" /> Personal & Contact Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Doctor Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (Read-only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Practice Details */}
                <div className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#1677ff]" /> Clinical Credentials & Specialization
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Medical Specialization
                      </label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Cardiologist"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Degrees & Qualifications
                      </label>
                      <input
                        type="text"
                        value={qualifications}
                        onChange={(e) => setQualifications(e.target.value)}
                        placeholder="e.g. MBBS, MD - Cardiology, FACC"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Years of Clinical Experience
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Consultation Fee (INR ₹)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        step="50"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Consultation Languages (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        placeholder="e.g. English, Hindi, Bengali"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        About Doctor / Professional Bio
                      </label>
                      <textarea
                        rows={4}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Provide details on clinical background, patient care philosophy, or areas of focus..."
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1677ff]/20 focus:border-[#1677ff]"
                      />
                    </div>
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
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving credentials...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Profile Changes
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column: Verification & Support */}
            <div className="space-y-6">
              
              {/* Verification Badge Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Verified Practitioner</h4>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Your medical degree, MCI registration, and telemedicine licensure are fully certified on the Illazz network.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
                  <span>Licensure: MCI-2024-88912</span>
                  <span className="bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/40">
                    Active
                  </span>
                </div>
              </div>

              {/* Help & Support FAQ */}
              <div id="help" className="bg-white p-6 rounded-2xl border border-[#e8eef5] shadow-sm space-y-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#1677ff]" /> Help & Doctor Support
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800">How do payouts work?</p>
                    <p className="text-slate-600 leading-relaxed">
                      Consultation fees are collected upon booking and deposited weekly directly into your bank account.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800">Can I reschedule an appointment?</p>
                    <p className="text-slate-600 leading-relaxed">
                      Yes, use the &ldquo;Reschedule&rdquo; button on any scheduled appointment card.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800">Need emergency assistance?</p>
                    <p className="text-slate-600 leading-relaxed">
                      Contact the Illazz provider support team at <span className="text-[#1677ff] font-semibold">doctors@illazz.test</span>.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
