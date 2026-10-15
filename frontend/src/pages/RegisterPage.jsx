import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Activity, Lock, Mail, User, AlertCircle, ArrowRight, Loader2, Stethoscope, Briefcase, IndianRupee } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('General Physician');
  const [qualifications, setQualifications] = useState('MBBS');
  const [experienceYears, setExperienceYears] = useState('5');
  const [consultationFee, setConsultationFee] = useState('500');
  const [languages, setLanguages] = useState('English, Hindi');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || fullName.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        full_name: fullName,
        email,
        password,
        role,
        ...(role === 'doctor' ? {
          specialization,
          qualifications,
          experience_years: parseInt(experienceYears, 10),
          consultation_fee: parseFloat(consultationFee),
          languages: languages.split(',').map(s => s.trim()).filter(Boolean)
        } : {})
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbff]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e5edf5] shadow-[0_15px_45px_rgba(30,80,130,0.08)]">
            
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center mx-auto mb-3 font-bold text-xl shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-[#172033]">
                Create Your Account
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Join Illazz to access personalized digital healthcare
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-gray-100/80 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  role === 'patient'
                    ? 'bg-white text-[#1677ff] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                I am a Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  role === 'doctor'
                    ? 'bg-white text-[#1677ff] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                I am a Doctor
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'doctor' ? "Dr. Firstname Lastname" : "Alex Morgan"}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all text-gray-900"
                  />
                </div>
              </div>

              {/* Doctor Details */}
              {role === 'doctor' && (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4 pt-4 mt-2">
                  <div className="text-xs font-bold text-[#1677ff] flex items-center gap-1.5 uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor Profile Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Specialization
                      </label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff]"
                      >
                        <option value="General Physician">General Physician</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Orthopedic">Orthopedic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Qualifications
                      </label>
                      <input
                        type="text"
                        value={qualifications}
                        onChange={(e) => setQualifications(e.target.value)}
                        placeholder="e.g. MBBS, MD (Demo)"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Consultation Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Languages Spoken (comma separated)
                    </label>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="e.g. English, Hindi, Spanish"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#1677ff] hover:bg-blue-600 disabled:opacity-60 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#1677ff] hover:underline">
                Sign In
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
