import React from 'react';
import { motion } from 'framer-motion';

// Full-screen loader shown while auth state is resolving
const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-void z-50">
    <motion.div
      className="w-10 h-10 rounded-full border-2 border-goldDim border-t-gold"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  </div>
);

export default Loader;
