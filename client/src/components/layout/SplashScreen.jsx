import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandMark from '../ui/BrandMark.jsx';

/**
 * Full-screen intro shown once when the app first loads. The glowing brand
 * mark pulses in, the wordmark fades in below it, then the whole thing
 * fades out to reveal the app underneath (which has already been mounting
 * behind it, so there's no blank flash).
 */
const SplashScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050506]"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BrandMark size={64} glow />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-display text-lg tracking-[0.14em] text-goldSoft mt-6"
          >
            PROJECTPILOT
          </motion.p>

          <div className="w-36 h-0.5 rounded-full bg-white/[0.08] overflow-hidden mt-5 relative">
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-goldDim to-goldSoft rounded-full"
              animate={{ x: ['-100%', '350%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
