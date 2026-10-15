import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginWaveGraphic } from '../components/Illustrations';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  const [error, setError] = useState('');
  const [socialNotice, setSocialNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSocialNotice('');

    if (!email || !password) {
      setError('Please provide your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else {
        const dest = (from === '/login' || from.startsWith('/doctor')) ? '/dashboard' : from;
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoRole) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f7fbff] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      
      {/* Top Navbar Home Shortcut */}
      <div className="w-full max-w-[440px] flex justify-between items-center mb-4 px-2">
        <Link to="/" className="text-xs font-bold text-gray-500 hover:text-[#1677ff] transition-colors">
          ← Back to Illazz Home
        </Link>
        <span className="text-xs text-gray-400">Secure Portal</span>
      </div>

      {/* Main Card Container matching Wireframe 2 */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#e5edf5] shadow-[0_15px_45px_rgba(30,80,130,0.08)] overflow-hidden">
        
        <div className="p-7 sm:p-9 pb-2">
          
          {/* Logo & Tagline */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-extrabold text-[#1677ff] tracking-tight">
                Illazz
              </span>
            </Link>
            <p className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">
              Care. Connect. Consult.
            </p>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-[#172033]">
              Welcome Back
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Login to access your account
            </p>
          </div>

          {/* Role Selector (Patient | Doctor) matching wireframe 2 */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('patient');
                if (email === 'ananya.demo@illazz.test') setEmail('patient.demo@illazz.test');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'patient'
                  ? 'bg-[#1e3a8a] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('doctor');
                if (email === 'patient.demo@illazz.test') setEmail('ananya.demo@illazz.test');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'doctor'
                  ? 'bg-[#1e3a8a] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Doctor
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {socialNotice && (
            <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-[#1677ff] text-xs text-center font-medium">
              {socialNotice}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email field */}
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] transition-all"
              />
            </div>

            {/* Password field with toggle */}
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Keep me logged in & Forgot password? */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1677ff] focus:ring-[#1677ff] border-gray-300"
                />
                <span className="font-medium">Keep me logged in</span>
              </label>

              <button
                type="button"
                onClick={() => alert("To reset password in demo mode, use the registered password: password123")}
                className="text-[#1677ff] font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#1677ff] hover:bg-blue-600 disabled:opacity-60 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* OR Divider matching Wireframe 2 */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-semibold">OR</span>
            </div>
          </div>

          {/* Social Buttons matching Wireframe 2 */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setSocialNotice('Social login with Google is in development. Please use email & password or the 1-click Demo Fill below.')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => setSocialNotice('Social login with Apple is in development. Please use email & password or the 1-click Demo Fill below.')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.8 1.09-1.92.97-3.04-.94.04-2.08.63-2.75 1.42-.59.68-1.11 1.77-.97 2.87 1.05.08 2.1-.47 2.75-1.25z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Quick Demo Credentials shortcut */}
          <div className="mt-5 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1677ff] mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Quick-Fill Demo Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleDemoFill('patient.demo@illazz.test', 'patient')}
                className="p-1.5 rounded-lg bg-white border border-blue-200 text-[10px] text-gray-700 hover:border-blue-400"
              >
                <span className="font-bold block text-[#1677ff]">Alex Morgan</span>
                <span>Patient Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('ananya.demo@illazz.test', 'doctor')}
                className="p-1.5 rounded-lg bg-white border border-blue-200 text-[10px] text-gray-700 hover:border-blue-400"
              >
                <span className="font-bold block text-[#1677ff]">Dr. Ananya</span>
                <span>Doctor Demo</span>
              </button>
            </div>
          </div>

          {/* Don't have an account? Sign Up */}
          <div className="mt-5 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#1677ff] hover:underline">
              Sign Up
            </Link>
          </div>

        </div>

        {/* Wavy light-blue graphic matching Wireframe 2 bottom */}
        <LoginWaveGraphic />

      </div>
    </div>
  );
}
