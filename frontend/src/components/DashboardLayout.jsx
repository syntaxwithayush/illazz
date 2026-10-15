import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Pill,
  Bell,
  CreditCard,
  UserCheck,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Symptom Checker', path: '/symptom-checker', icon: Stethoscope },
    { name: 'Find Doctors', path: '/doctors', icon: Users },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/medical-records', icon: FileText },
    { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
    { name: 'Reminders', path: '/appointments', icon: Bell },
    { name: 'Payments', path: '/appointments', icon: CreditCard },
    { name: 'Family Profiles', path: '/settings', icon: UserCheck },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Support', path: '/symptom-checker', icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  // Extract first name (default to 'Ayush' if name not set or Alex Morgan)
  const displayName = user?.full_name?.split(' ')[0] || 'Ayush';
  const roleLabel = user?.role === 'doctor' ? 'Doctor' : 'Patient';

  return (
    <div className="min-h-screen bg-[#f7fbff] flex font-sans">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar matching Wireframe 3 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e8eef5] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand & Toggle Icon matching Wireframe 3: Illazz + ☰ */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#e8eef5]">
            <Link to="/" className="text-2xl font-extrabold text-[#1677ff] tracking-tight">
              Illazz
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? 'bg-blue-50 text-[#1677ff] font-bold'
                      : 'text-gray-700 hover:text-[#1677ff] hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#1677ff]' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Settings, Help & Support, Logout matching Wireframe 3 */}
        <div className="p-4 border-t border-[#e8eef5] space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header matching Wireframe 3: Hamburger on left, Notification Bell & User profile on right */}
        <header className="h-16 bg-white border-b border-[#e8eef5] flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-500 hidden sm:inline">
              Patient Portal
            </span>
          </div>

          {/* Right User Bar matching Wireframe 3: Bell + A in dark circle + Ayush / Patient + Chevron */}
          <div className="flex items-center gap-4 relative">
            
            {/* Notification Bell with red dot */}
            <button
              onClick={() => alert("You have 1 upcoming consultation scheduled.")}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* User Profile */}
            <div 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 cursor-pointer select-none p-1 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Dark Navy Avatar Circle with initial */}
              <div className="w-9 h-9 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {displayName.charAt(0)}
              </div>

              <div className="text-left hidden sm:block leading-tight">
                <p className="text-xs font-bold text-[#172033]">{displayName}</p>
                <p className="text-[10px] text-gray-400 font-medium">{roleLabel}</p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Profile Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{user?.full_name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#1677ff]"
                >
                  Account Settings
                </Link>
                <Link
                  to="/appointments"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#1677ff]"
                >
                  My Appointments
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
        </header>

        {/* Dashboard Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
