import React from 'react';

/**
 * ProjectPilot's whole-app brand mark - an overlapping triangle + circle
 * (a classic geometric motif, not tied to any single copyrighted image),
 * rendered in the gold gradient with an optional soft glow. Used in the
 * sidebar, public nav, and the splash screen for one consistent identity.
 */
const BrandMark = ({ size = 24, glow = false, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    style={glow ? { filter: 'drop-shadow(0 0 10px rgba(240,183,91,0.65))' } : undefined}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="brandMarkGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f9dca0" />
        <stop offset="100%" stopColor="#c9922f" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="36" r="20" stroke="url(#brandMarkGrad)" strokeWidth="4" fill="none" />
    <path
      d="M32 8 L54 48 L10 48 Z"
      stroke="url(#brandMarkGrad)"
      strokeWidth="4"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default BrandMark;
