import React from 'react';
import { motion } from 'framer-motion';

// Generic premium panel card used across Dashboard/Projects/Notes etc.
const Card = ({ children, className = '', hover = true, ...props }) => (
  <motion.div
    whileHover={hover ? { y: -3, borderColor: 'rgba(240,183,91,0.35)' } : undefined}
    className={`bg-panel border border-white/[0.08] rounded-2xl p-5 transition-colors ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export default Card;
