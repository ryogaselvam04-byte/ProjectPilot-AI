import React from 'react';

/**
 * Custom mark for MASTER AI - a layered diamond with a spark, distinct from
 * the generic Lucide "Sparkles" icon used elsewhere so the assistant has its
 * own identity. Pure SVG, no external image, themeable via currentColor/gold.
 */
const MasterAILogo = ({ size = 22, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="maiGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f9dca0" />
        <stop offset="100%" stopColor="#c9922f" />
      </linearGradient>
    </defs>
    {/* outer diamond */}
    <path d="M16 2 L27 16 L16 30 L5 16 Z" fill="url(#maiGrad)" opacity="0.9" />
    {/* inner facet */}
    <path d="M16 8 L21.5 16 L16 24 L10.5 16 Z" fill="#1a1408" opacity="0.55" />
    {/* spark accent, top-right */}
    <path
      d="M24.5 3.5 L25.6 6.4 L28.5 7.5 L25.6 8.6 L24.5 11.5 L23.4 8.6 L20.5 7.5 L23.4 6.4 Z"
      fill="#f9dca0"
    />
  </svg>
);

export default MasterAILogo;
