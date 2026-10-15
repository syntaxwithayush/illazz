import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api/client';
import {
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Languages,
  Clock,
  IndianRupee,
  Loader2,
  Stethoscope,
  ArrowRight
} from 'lucide-react';

export default function DoctorsPage() {
  const [searchParams] = useSearchParams();
  const initialSpec = searchParams.get('specialization') || 'All';

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState(['All']);
  const [selectedSpec, setSelectedSpec] = useState(initialSpec);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSpecs() {
      try {
        const res = await api.doctors.getSpecializations();
        if (res.success && res.specializations) {
          setSpecializations(['All', ...res.specializations]);
        }
      } catch (err) {
        console.error('Failed to load specializations:', err);
      }
    }
    loadSpecs();
  }, []);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.doctors.getAll({
          search: searchTerm,
          specialization: selectedSpec
        });
        if (res.success) {
          setDoctors(res.doctors || []);
        } else {
          setError('Could not retrieve doctors list.');
        }
      } catch (err) {
        setError(err.message || 'Unable to load doctors.');
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchDoctors, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedSpec]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbff]">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1677ff] text-xs font-bold mb-3 border border-blue-100">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Verified Medical Specialists</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              Find Affiliated Doctors
            </h1>
            <p className="text-gray-600 mt-2 text-base">
              Connect with certified doctors across specialties for online consultations and care management.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-[#e5edf5] shadow-sm mb-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search input */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search doctor by name, qualification..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1677ff] focus:bg-white transition-all text-gray-900"
                />
              </div>

              {/* Specialization Select (Mobile/Compact) */}
              <div className="w-full md:w-auto flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  className="w-full md:w-auto px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#1677ff]"
                >
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Specialization Filter Pills (Desktop) */}
            <div className="hidden sm:flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(spec)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedSpec === spec
                      ? 'bg-[#1677ff] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#1677ff] animate-spin mb-3" />
              <p className="text-gray-500 font-medium">Fetching doctor profiles from database...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Doctors Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                No doctors matched your criteria. Try adjusting the search keywords or selecting "All" specializations.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedSpec('All'); }}
                className="px-4 py-2 bg-blue-50 text-[#1677ff] text-xs font-bold rounded-xl hover:bg-blue-100"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-3xl p-7 border border-[#e1eaf4] shadow-[0_5px_20px_#17365d0a] hover:shadow-card hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold text-2xl shadow-inner">
                        👨‍⚕️
                      </div>
                      {doctor.verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1677ff] border border-blue-100">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#172033] mb-1">
                      {doctor.name}
                    </h3>

                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50/70 text-[#1677ff] text-xs font-bold mb-2">
                      {doctor.specialization}
                    </div>

                    <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                      {doctor.qualifications}
                    </p>

                    <div className="space-y-2.5 py-3.5 border-t border-b border-gray-100 text-xs text-gray-600 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          Experience:
                        </span>
                        <span className="font-bold text-gray-800">{doctor.experience_years} years</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <IndianRupee className="w-3.5 h-3.5" />
                          Consultation Fee:
                        </span>
                        <span className="font-extrabold text-[#172033] text-sm">₹{doctor.consultation_fee}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Languages className="w-3.5 h-3.5" />
                          Languages:
                        </span>
                        <span className="font-medium text-gray-800">
                          {(doctor.languages || []).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/book?doctorId=${doctor.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#1677ff] hover:bg-blue-600 shadow-md shadow-blue-500/15 hover:shadow-lg transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Consultation</span>
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
