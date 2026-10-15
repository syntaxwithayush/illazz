import React from 'react';

// 1. Hero Doctor in Smartphone Illustration
export function DoctorPhoneIllustration() {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto select-none">
      
      {/* Floating Badge 1: Top Left Heartbeat */}
      <div className="absolute -top-3 -left-4 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-2xl shadow-lg border border-blue-100 flex items-center gap-2 animate-bounce-slow">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold">
          <svg className="w-5 h-5 text-[#1677ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="flex items-center">
          <svg className="w-12 h-6 text-[#1677ff]" viewBox="0 0 50 20" fill="none">
            <path d="M0 10H15L18 2L24 18L28 6L32 12H50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Floating Badge 2: Top Right "Better Health" */}
      <div className="absolute top-8 -right-6 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-2xl shadow-lg border border-blue-100 text-left">
        <p className="text-[11px] font-extrabold text-[#172033] leading-tight">Better Health</p>
        <p className="text-[10px] font-medium text-gray-500">Brighter Tomorrow</p>
      </div>

      {/* Floating Badge 3: Bottom Right "Consult Anytime, Anywhere" */}
      <div className="absolute bottom-12 -right-6 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-2xl shadow-lg border border-blue-100 text-left">
        <p className="text-[11px] font-extrabold text-[#1677ff] leading-tight">Consult</p>
        <p className="text-[10px] font-semibold text-gray-700">Anytime, Anywhere</p>
      </div>

      {/* Smartphone Device Frame */}
      <div className="relative mx-auto w-[280px] sm:w-[310px] bg-white rounded-[40px] border-[10px] border-[#172033] shadow-2xl overflow-hidden aspect-[9/16]">
        
        {/* Phone Speaker & Camera Notch */}
        <div className="absolute top-2 inset-x-0 mx-auto w-24 h-4 bg-[#172033] rounded-full z-30" />

        {/* Screen Content */}
        <div className="w-full h-full bg-gradient-to-b from-blue-50/80 via-white to-blue-50/40 pt-10 flex flex-col items-center justify-between relative overflow-hidden">
          
          {/* Subtle background medical cross pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="medical-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M15 10v10M10 15h10" stroke="#1677ff" strokeWidth="2" strokeLinecap="round" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#medical-grid)" />
            </svg>
          </div>

          {/* Doctor Vector Graphic */}
          <div className="w-full h-full flex flex-col items-center justify-end z-10">
            <svg viewBox="0 0 240 320" className="w-full h-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Doctor Body & White Lab Coat */}
              <ellipse cx="120" cy="95" rx="38" ry="46" fill="#fcd5b8" /> {/* Face */}
              <path d="M85 85 C85 65, 155 65, 155 85 C155 90, 150 72, 120 72 C90 72, 85 90, 85 85 Z" fill="#2d3748" /> {/* Hair */}
              
              {/* Eyes & Eyeglasses */}
              <rect x="94" y="85" width="22" height="15" rx="4" stroke="#1a202c" strokeWidth="2.5" fill="none" />
              <rect x="124" y="85" width="22" height="15" rx="4" stroke="#1a202c" strokeWidth="2.5" fill="none" />
              <line x1="116" y1="92" x2="124" y2="92" stroke="#1a202c" strokeWidth="2.5" />
              <circle cx="105" cy="92" r="2.5" fill="#1a202c" />
              <circle cx="135" cy="92" r="2.5" fill="#1a202c" />

              {/* Gentle Smile */}
              <path d="M112 115 Q120 122 128 115" stroke="#b7791f" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Neck & Shirt & Tie */}
              <path d="M106 135 L120 150 L134 135 Z" fill="#ebf8ff" />
              <path d="M116 142 L120 185 L124 142 Z" fill="#1677ff" /> {/* Blue Tie */}

              {/* Stethoscope */}
              <path d="M96 148 C96 195, 144 195, 144 148" stroke="#4a5568" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="120" cy="195" r="7" fill="#718096" stroke="#4a5568" strokeWidth="2" />

              {/* Lab Coat (White) */}
              <path d="M60 160 C50 200, 48 300, 48 320 L192 320 C192 300, 190 200, 180 160 C165 148, 145 145, 120 145 C95 145, 75 148, 60 160 Z" fill="#ffffff" stroke="#cbd5e0" strokeWidth="2" />
              <path d="M85 155 L105 220 L120 220 L120 320 L120 220 L135 220 L155 155" stroke="#cbd5e0" strokeWidth="2" fill="none" />

              {/* Clipboard in Hand */}
              <g transform="translate(68, 220) rotate(-5)">
                <rect x="0" y="0" width="46" height="65" rx="5" fill="#2d3748" />
                <rect x="5" y="8" width="36" height="50" rx="3" fill="#ffffff" />
                <rect x="15" y="-3" width="16" height="8" rx="2" fill="#a0aec0" />
                <line x1="10" y1="18" x2="32" y2="18" stroke="#cbd5e0" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="26" x2="36" y2="26" stroke="#cbd5e0" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="34" x2="28" y2="34" stroke="#cbd5e0" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Doctor ID Badge */}
              <rect x="145" y="195" width="22" height="28" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
              <circle cx="156" cy="204" r="4" fill="#1677ff" />
              <line x1="149" y1="213" x2="163" y2="213" stroke="#a0aec0" strokeWidth="1.5" />
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}

// 2. Dashboard Waving Patient Illustration
export function WavingPatientIllustration() {
  return (
    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative select-none">
      <div className="absolute inset-0 bg-blue-100/70 rounded-full scale-105" />
      <svg viewBox="0 0 120 120" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft Circular Background */}
        <circle cx="60" cy="60" r="54" fill="#dbeafe" />

        {/* Head */}
        <circle cx="60" cy="46" r="18" fill="#fcd5b8" />

        {/* Hair */}
        <path d="M44 42 C44 26, 76 26, 76 42 C76 34, 60 30, 44 42 Z" fill="#1e293b" />

        {/* Happy Face */}
        <circle cx="54" cy="45" r="2" fill="#1e293b" />
        <circle cx="66" cy="45" r="2" fill="#1e293b" />
        <path d="M56 53 Q60 57 64 53" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Body (Navy Shirt) */}
        <path d="M36 84 C36 72, 84 72, 84 84 L88 114 L32 114 Z" fill="#1e3a8a" />

        {/* Waving Arm & Hand */}
        <path d="M38 76 C28 65, 24 50, 24 45" stroke="#fcd5b8" strokeWidth="8" strokeLinecap="round" />
        {/* Hand */}
        <g transform="translate(20, 36) rotate(-15)">
          <path d="M4 14 C1 10, 2 4, 6 4 C7 4, 8 6, 8 7 C9 5, 11 5, 12 7 C13 5, 15 6, 15 8 C16 7, 18 8, 17 11 L14 16 Z" fill="#fcd5b8" />
        </g>
      </svg>
    </div>
  );
}

// 3. Healthier Tomorrow (Nature / Backpacker Banner Illustration)
export function HealthierTomorrowIllustration() {
  return (
    <div className="w-full max-w-[280px] sm:max-w-[340px] h-[160px] sm:h-[180px] relative overflow-hidden select-none">
      <svg viewBox="0 0 320 180" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sky gradient background */}
        <rect width="320" height="180" rx="16" fill="#e0f2fe" />

        {/* Distant Blue Mountains */}
        <path d="M40 180 L120 70 L200 180 Z" fill="#bae6fd" opacity="0.6" />
        <path d="M140 180 L230 50 L320 180 Z" fill="#7dd3fc" opacity="0.5" />
        <path d="M-20 180 L70 95 L160 180 Z" fill="#93c5fd" opacity="0.7" />

        {/* Gentle Hills */}
        <path d="M0 180 Q100 130 220 150 T320 180 Z" fill="#a7f3d0" />
        <path d="M60 180 Q180 140 320 155 L320 180 Z" fill="#6ee7b7" />

        {/* Person / Backpacker Looking Out */}
        <g transform="translate(180, 75)">
          {/* Head & Cap */}
          <circle cx="20" cy="18" r="8" fill="#fcd5b8" />
          <path d="M12 16 C12 11, 28 11, 28 16 L33 16 Z" fill="#1e293b" />

          {/* Backpack (Green) */}
          <rect x="6" y="24" width="14" height="24" rx="5" fill="#047857" />
          <path d="M10 26 L10 44" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />

          {/* Body / Blue Windbreaker */}
          <path d="M14 26 C14 24, 30 24, 30 26 L32 60 L14 60 Z" fill="#0284c7" />
        </g>

        {/* Floating handwritten-style text badge */}
        <g transform="translate(200, 30)">
          <text x="0" y="0" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="#0369a1" fontStyle="italic">
            Better Health
          </text>
          <text x="5" y="16" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="#0369a1" fontStyle="italic">
            Happier You
          </text>
        </g>
      </svg>
    </div>
  );
}

// 4. Wave Graphic for Login/Sign Up Card Bottom
export function LoginWaveGraphic() {
  return (
    <div className="relative w-full h-24 overflow-hidden rounded-b-3xl mt-6">
      <svg
        viewBox="0 0 500 150"
        preserveAspectRatio="none"
        className="absolute bottom-0 w-full h-full text-blue-50/90"
      >
        <path
          d="M0,40 C150,90 350,0 500,50 L500,150 L0,150 Z"
          fill="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-4">
        <p className="text-xs font-bold text-[#1677ff] tracking-wide">
          "Accessible Healthcare for a Healthier You"
        </p>
        <div className="text-[#1677ff] mt-1 text-sm">💙</div>
      </div>
    </div>
  );
}
