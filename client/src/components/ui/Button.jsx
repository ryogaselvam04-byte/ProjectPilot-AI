import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Reusable animated button.
 * variant: 'primary' | 'ghost'
 */
const Button = ({ children, variant = 'primary', loading = false, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-shadow disabled:opacity-70';
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-b from-goldSoft to-gold text-[#251b06] shadow-gold'
      : 'bg-white/[0.04] text-ink border border-white/10 hover:border-gold/40';

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      disabled={loading}
      className={`${base} ${styles} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </motion.button>
  );
};

export default Button;
