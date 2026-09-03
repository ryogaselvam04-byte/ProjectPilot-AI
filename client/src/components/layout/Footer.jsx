import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '../ui/BrandMark.jsx';

// Simple footer for public marketing pages (Landing) - not used inside the app shell
const Footer = () => (
  <footer className="border-t border-white/[0.06] py-10 px-5 md:px-10">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-inkFaint">
      <div className="flex items-center gap-2">
        <BrandMark size={16} />
        <span className="font-display text-inkDim">ProjectPilot AI</span>
      </div>
      <div className="flex gap-6">
        <Link to="/login" className="hover:text-ink transition-colors">Login</Link>
        <Link to="/register" className="hover:text-ink transition-colors">Register</Link>
      </div>
      <p>&copy; {new Date().getFullYear()} ProjectPilot AI. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
