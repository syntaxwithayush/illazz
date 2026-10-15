import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  FileText,
  TrendingUp,
  Clock,
  Star,
  Megaphone,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';

export default function DoctorLayout({ children, onSearch }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
    { name: 'Medical Records', path: '/doctor/records', icon: FileText },
    { name: 'Earnings', path: '/doctor/earnings', icon: TrendingUp },
    { name: 'Availability & Schedule', path: '/doctor/availability', icon: Clock },
    { name: 'Reviews & Ratings', path: '/doctor/reviews', icon: Star },
    { name: 'Posts / Announcements', path: '/doctor/announcements', icon: Megaphone },
    { name: 'Messages', path: '/doctor/messages', icon: MessageSquare },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/doctor/settings', icon: Settings },
    { name: 'Help & Support', path: '/doctor/settings#help', icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  const doctorName = user?.full_name || 'Dr. Ananya Sharma';
  const specialization = user?.doctor?.specialization || 'Cardiologist';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/doctor/appointments?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fbff] flex font-sans text-gray-900">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Doctor Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e8eef5] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#e8eef5]">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-[#1677ff] tracking-tight">
                Illazz
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#1677ff] border border-blue-100">
                Doctor
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? 'bg-blue-50 text-[#1677ff] font-bold shadow-sm'
                      : 'text-gray-700 hover:text-[#1677ff] hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#1677ff]' : 'text-gray-500'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Settings, Support, Logout */}
          <div className="p-3.5 border-t border-[#e8eef5] space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? 'bg-blue-50 text-[#1677ff] font-bold'
                      : 'text-gray-700 hover:text-[#1677ff] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors mt-1"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-[#e8eef5] flex items-center justify-between px-4 sm:px-8 z-30">
          
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients, appointments, records..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all"
              />
            </form>
          </div>

          {/* Right Top Items: Online Toggle, Notifications, Doctor Profile */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            
            {/* Online / Offline status toggle */}
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{isOnline ? 'Online for Consults' : 'Offline'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-bold text-gray-900">Practice Notifications</h4>
                    <span className="text-[10px] text-[#1677ff] font-semibold cursor-pointer">Mark read</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100/50">
                      <p className="font-bold text-gray-800">New Consultation Scheduled</p>
                      <p className="text-[11px] text-gray-500">Alex Morgan booked for 10:30 AM today</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="font-bold text-gray-800">Lab Report Received</p>
                      <p className="text-[11px] text-gray-500">Rohit Sharma uploaded resting ECG</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Profile Dropdown */}
            <div className="relative">
              <div
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 cursor-pointer select-none p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#1677ff] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {doctorName.charAt(3) || 'D'}
                </div>

                <div className="text-left hidden sm:block leading-tight">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-[#172033]">{doctorName}</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1677ff]" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">{specialization}</p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>

              {userDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900">{doctorName}</p>
                    <p className="text-[10px] text-[#1677ff] font-semibold">{specialization}</p>
                  </div>
                  <Link
                    to="/doctor/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#1677ff]"
                  >
                    Edit Doctor Profile
                  </Link>
                  <Link
                    to="/doctor/availability"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#1677ff]"
                  >
                    Manage Availability
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Doctor Dashboard Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
