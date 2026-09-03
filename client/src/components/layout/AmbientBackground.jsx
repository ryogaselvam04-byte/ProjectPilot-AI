import React from 'react';
import { motion } from 'framer-motion';

/**
 * Site-wide animated backdrop: slow-drifting soft gold/dark gradient blobs
 * behind the content. Pure CSS/SVG gradients (no external image assets, so
 * no licensing concerns) - gives every page a bit of premium motion without
 * distracting from the UI in front of it.
 */
const AmbientBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
      style={{ background: 'radial-gradient(circle, rgba(240,183,91,0.14), transparent 70%)', top: '-10%', left: '-10%' }}
      animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
      style={{ background: 'radial-gradient(circle, rgba(240,183,91,0.10), transparent 70%)', bottom: '-15%', right: '-10%' }}
      animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)', top: '40%', left: '55%' }}
      animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
    />
    <div className="grain-overlay" />
  </div>
);

export default AmbientBackground;
