import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e8eef5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo matching wireframe */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1677ff]">
              Illazz
            </span>
          </Link>

          {/* Desktop Navigation Links matching wireframe 1: Home, Doctors, How It Works, About */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-gray-700">
            <Link
              to="/"
              className={`hover:text-[#1677ff] transition-colors ${
                isActive('/') ? 'text-[#1677ff] font-bold' : ''
              }`}
            >
              Home
            </Link>

            <Link
              to="/doctors"
              className={`hover:text-[#1677ff] transition-colors ${
                isActive('/doctors') ? 'text-[#1677ff] font-bold' : ''
              }`}
            >
              Doctors
            </Link>

            <Link
              to="/symptom-checker"
              className={`hover:text-[#1677ff] transition-colors ${
                isActive('/symptom-checker') ? 'text-[#1677ff] font-bold' : ''
              }`}
            >
              How It Works
            </Link>

            <a
              href="/#features"
              className="hover:text-[#1677ff] transition-colors"
            >
              About
            </a>
          </nav>

          {/* Right Buttons matching wireframe: Login (outlined) & Sign Up (solid blue) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-50 text-[#1677ff] hover:bg-blue-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-[#1677ff] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate font-semibold">{user?.full_name?.split(' ')[0]}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-bold text-[#1677ff] border-2 border-[#1677ff] hover:bg-blue-50 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#1677ff] hover:bg-blue-600 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-[#1677ff]"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-[#1677ff]"
          >
            Doctors
          </Link>
          <Link
            to="/symptom-checker"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-[#1677ff]"
          >
            How It Works
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-[#1677ff]"
          >
            About
          </a>
          
          {isAuthenticated ? (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-bold text-[#1677ff]"
              >
                Go to Dashboard ({user?.full_name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-base font-semibold text-red-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-bold text-[#1677ff] border-2 border-[#1677ff] rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-bold text-white bg-[#1677ff] rounded-xl shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
