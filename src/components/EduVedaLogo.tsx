import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Clean, high-fidelity vector emblem matching the Edu Veda branding
 * (Graduation Cap + Orange Student V-Figure + Layered Open Book Pages)
 */
export const EduVedaEmblem: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 400 360"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cap Gradient */}
        <linearGradient id="evCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Cap Highlight */}
        <linearGradient id="evCapHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Student Orange Gradient */}
        <linearGradient id="evOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <linearGradient id="evOrangeLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Book Layers Gradients */}
        <linearGradient id="evBookTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00b4d8" />
          <stop offset="60%" stopColor="#0077b6" />
          <stop offset="100%" stopColor="#023e8a" />
        </linearGradient>

        <linearGradient id="evBookMid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0f2b60" />
        </linearGradient>

        <linearGradient id="evBookBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="50%" stopColor="#0f2b60" />
          <stop offset="100%" stopColor="#06122c" />
        </linearGradient>

        {/* Drop shadow for realism */}
        <filter id="evShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#evShadow)">
        {/* 1. GRADUATION MORTARBOARD CAP */}
        <polygon points="200,28 310,68 200,108 90,68" fill="url(#evCapGrad)" />
        <polygon points="200,28 90,68 200,108 200,28" fill="url(#evCapHighlight)" opacity="0.35" />

        {/* Cap Base */}
        <path d="M 142,92 L 142,114 C 142,134 258,134 258,114 L 258,92 C 236,102 164,102 142,92 Z" fill="#091d44" />

        {/* Tassel on the right */}
        <circle cx="200" cy="68" r="4.5" fill="#38bdf8" />
        <path d="M 200,68 Q 288,74 294,102" fill="none" stroke="#091d44" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="294" cy="106" r="5" fill="#091d44" />
        <path d="M 288,110 L 300,110 L 304,138 L 284,138 Z" fill="#091d44" />

        {/* 2. STUDENT HEAD */}
        <circle cx="200" cy="128" r="23" fill="url(#evOrangeGrad)" />
        <ellipse cx="194" cy="120" rx="7" ry="5" fill="#ffffff" opacity="0.45" />

        {/* 3. STUDENT BODY (V-SHAPED FIGURE) */}
        {/* Left Arm */}
        <path d="M 116,120 C 146,138 188,188 200,230 L 188,230 C 170,182 136,140 116,120 Z" fill="url(#evOrangeLight)" />
        {/* Right Arm */}
        <path d="M 284,120 C 254,138 212,188 200,230 L 212,230 C 230,182 264,140 284,120 Z" fill="url(#evOrangeGrad)" />
        {/* Central V Body */}
        <path d="M 116,120 C 156,144 192,194 200,230 C 208,194 244,144 284,120 C 254,164 214,218 200,242 C 186,218 146,164 116,120 Z" fill="url(#evOrangeGrad)" />

        {/* 4. THREE-LAYER OPEN BOOK PAGES */}
        {/* Layer 1: Deep Navy Bottom */}
        <path d="M 200,264 C 124,252 54,272 6,294 C 52,280 122,264 200,274 Z" fill="url(#evBookBottom)" />
        <path d="M 200,264 C 276,252 346,272 394,294 C 348,280 278,264 200,274 Z" fill="url(#evBookBottom)" />

        {/* Layer 2: Royal Blue Middle */}
        <path d="M 200,258 C 124,240 49,258 2,280 C 48,264 122,248 200,266 Z" fill="url(#evBookMid)" />
        <path d="M 200,258 C 276,240 351,258 398,280 C 352,264 278,248 200,266 Z" fill="url(#evBookMid)" />

        {/* Layer 3: Glowing Cyan Top */}
        <path d="M 200,250 C 124,226 54,242 36,258 C 76,238 130,226 200,250 Z" fill="url(#evBookTop)" />
        <path d="M 200,250 C 276,226 346,242 364,258 C 324,238 270,226 200,250 Z" fill="url(#evBookTop)" />

        {/* Center Spine Notch */}
        <polygon points="200,246 192,266 208,266" fill="#06163a" />
      </g>
    </svg>
  );
};
