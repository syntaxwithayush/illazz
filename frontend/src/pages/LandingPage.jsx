import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api/client';
import { 
  DoctorPhoneIllustration, 
  HealthierTomorrowIllustration 
} from '../components/Illustrations';
import {
  Clock,
  ShieldCheck,
  Lock,
  Globe,
  Bot,
  Users,
  Video,
  FolderOpen,
  CreditCard,
  Siren,
  ArrowRight,
  Loader2,
  Calendar
} from 'lucide-react';

export default function LandingPage() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoadingDoctors(true);
        const res = await api.doctors.getAll();
        if (res.success) {
          setDoctors(res.doctors || []);
        }
      } catch (err) {
        console.error('Doctor fetch error:', err);
      } finally {
        setLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, []);

  const valueProps = [
    {
      icon: Clock,
      title: 'Save Time',
      subtitle: 'Consult from home',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: ShieldCheck,
      title: 'Verified Doctors',
      subtitle: 'Trusted professionals',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      subtitle: 'Your data is safe',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Globe,
      title: 'Accessible',
      subtitle: 'Anytime, anywhere',
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  const keyFeatures = [
    {
      icon: Bot,
      title: 'AI Symptom Assessment',
      desc: 'Get preliminary health guidance using AI',
      iconBg: 'bg-blue-50 text-[#1677ff]',
      link: '/symptom-checker'
    },
    {
      icon: Users,
      title: 'Verified Doctors',
      desc: 'Consult with qualified and verified doctors',
      iconBg: 'bg-emerald-50 text-emerald-600',
      link: '/doctors'
    },
    {
      icon: Video,
      title: 'Online Consultation',
      desc: 'Video calls from anywhere',
      iconBg: 'bg-blue-50 text-[#1677ff]',
      link: '/doctors'
    },
    {
      icon: FolderOpen,
      title: 'Medical Records',
      desc: 'Store and access your health history',
      iconBg: 'bg-blue-50 text-[#1677ff]',
      link: '/medical-records'
    },
    {
      icon: CreditCard,
      title: 'Online Payments',
      desc: 'Secure and hassle-free payments',
      iconBg: 'bg-emerald-50 text-emerald-600',
      link: '/book'
    },
    {
      icon: Siren,
      title: 'Emergency Guidance',
      desc: 'Get help when it matters most',
      iconBg: 'bg-red-50 text-red-600',
      link: '/symptom-checker'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* 1. HERO SECTION matching Wireframe 1 */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headline, subtext, CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight leading-[1.12]">
                Healthcare <br />
                <span>from anywhere.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Get preliminary health guidance, connect with verified doctors, and manage your healthcare online — without unnecessary travel.
              </p>

              <div className="pt-2">
                <Link
                  to="/symptom-checker"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-bold text-white bg-[#1677ff] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Smartphone frame with doctor illustration & floating badges */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <DoctorPhoneIllustration />
            </div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPS (4 Icons strip matching Wireframe 1) */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {valueProps.map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <div key={idx} className="flex flex-col items-center space-y-2 p-2">
                  <div className={`w-12 h-12 rounded-2xl ${prop.color} flex items-center justify-center font-bold mb-1 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#172033]">{prop.title}</h4>
                  <p className="text-xs text-gray-500">{prop.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. OUR KEY FEATURES Section (3x2 Grid matching Wireframe 1) */}
      <section id="features" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#172033]">
              Our Key Features
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Everything you need for better healthcare
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={idx}
                  to={feat.link}
                  className="bg-white rounded-2xl p-6 border border-[#e5edf5] hover:border-blue-300 hover:shadow-card transition-all duration-200 flex items-start gap-4 group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#172033] group-hover:text-[#1677ff] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. MEET OUR DOCTORS (Preserved Live PostgreSQL Section) */}
      <section className="py-14 bg-[#f7fbff] border-t border-[#e8eef5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-[#172033]">
                Meet Our Verified Doctors
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Connected directly to certified clinical specialists on Illazz.
              </p>
            </div>
            <Link
              to="/doctors"
              className="mt-3 sm:mt-0 text-xs font-bold text-[#1677ff] hover:underline flex items-center gap-1"
            >
              <span>Explore all doctors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingDoctors ? (
            <div className="py-10 text-center flex items-center justify-center gap-2 text-gray-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#1677ff]" />
              <span>Loading affiliated doctors from database...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl p-5 border border-[#e1eaf4] shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1677ff]">
                        {doctor.specialization}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        ₹{doctor.consultation_fee}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#172033] mb-1">
                      {doctor.name}
                    </h4>
                    <p className="text-xs text-gray-400 mb-4">
                      {doctor.qualifications} • {doctor.experience_years} yrs exp
                    </p>
                  </div>

                  <Link
                    to={`/book?doctorId=${doctor.id}`}
                    className="w-full text-center py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#1677ff] text-[#1677ff] hover:text-white text-xs font-bold transition-colors"
                  >
                    Book Consultation
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. A HEALTHIER TOMORROW STARTS TODAY (Banner matching Wireframe 1) */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f3f7fa] rounded-3xl p-8 sm:p-12 border border-[#e2eaf2] flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-lg text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                A Healthier Tomorrow <br />
                Starts Today
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join thousands who trust Illazz for their healthcare needs.
              </p>
              <div>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/15 transition-all"
                >
                  <span>Create Your Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="shrink-0 flex justify-center">
              <HealthierTomorrowIllustration />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
