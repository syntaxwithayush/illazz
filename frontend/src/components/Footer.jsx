import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, PhoneCall, Linkedin, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e8eef5] text-gray-600 mt-auto select-none">
      {/* Disclaimer Strip */}
      <div className="bg-[#f1f6fb] border-b border-[#e5edf5] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-600">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Medical Disclaimer:</strong> Illazz provides preliminary AI triage guidance. Always seek certified medical emergency care (112 / 911 / 102) for urgent symptoms.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-red-600 shrink-0">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency: 112 / 102</span>
          </div>
        </div>
      </div>

      {/* Main Footer matching Screen 1 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-100">
          
          {/* Brand */}
          <Link to="/" className="text-2xl font-extrabold text-[#1677ff] tracking-tight">
            Illazz
          </Link>

          {/* Navigation Links: Home, About, Privacy, Contact */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm font-semibold text-gray-700">
            <Link to="/" className="hover:text-[#1677ff] transition-colors">
              Home
            </Link>
            <a href="/#features" className="hover:text-[#1677ff] transition-colors">
              About
            </a>
            <a href="/#privacy" className="hover:text-[#1677ff] transition-colors">
              Privacy
            </a>
            <a href="/#contact" className="hover:text-[#1677ff] transition-colors">
              Contact
            </a>
          </div>

          {/* Social Icons matching wireframe: LinkedIn, Twitter, Instagram, YouTube */}
          <div className="flex items-center gap-3 text-gray-500">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-blue-50 hover:text-[#1677ff] transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-blue-50 hover:text-[#1677ff] transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-blue-50 hover:text-[#1677ff] transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-blue-50 hover:text-[#1677ff] transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 text-center text-xs text-gray-400 font-medium">
          © 2026 Illazz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
