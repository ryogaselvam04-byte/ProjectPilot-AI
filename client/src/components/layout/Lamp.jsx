import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Lamp - the cinematic pull-cord switch used on the Login/Register screens.
 * Renders a hanging lamp with a pull-chain. Clicking it toggles `on` and
 * fires onToggle(isOn) so the parent page can reveal its content.
 */
const Lamp = ({ onToggle }) => {
  const [on, setOn] = useState(false);
  const [tug, setTug] = useState(false);

  const handlePull = () => {
    setTug(true);
    setTimeout(() => setTug(false), 180);
    const next = !on;
    setOn(next);
    onToggle?.(next);
  };

  return (
    <div className="relative w-[220px] flex flex-col items-center flex-shrink-0">
      {/* hanging wire */}
      <div className="w-[2px] h-16 bg-gradient-to-b from-[#26282e] to-[#3a3d45]" />

      <div className="relative">
        {/* shade */}
        <div
          className="w-[190px] h-[110px] relative z-[3]"
          style={{
            clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)',
            background: 'linear-gradient(160deg,#8a6a3f,#3d2f1c 75%)',
            boxShadow: '0 10px 24px -8px rgba(0,0,0,0.7), inset 0 -6px 14px rgba(0,0,0,0.35)',
          }}
        />

        {/* bulb glow */}
        <AnimatePresence>
          {on && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-[70px] h-[26px] rounded-full blur-[1px] z-[4]"
              style={{
                background: 'radial-gradient(circle, #f9dca0 0%, #f0b75b 45%, transparent 75%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* light cone spreading downward */}
        <AnimatePresence>
          {on && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute left-1/2 -translate-x-1/2 z-[1] pointer-events-none mix-blend-screen"
              style={{
                top: 100,
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderBottom: '340px solid rgba(240,183,91,0.10)',
              }}
            />
          )}
        </AnimatePresence>

        {/* pull cord */}
        <button
          onClick={handlePull}
          aria-pressed={on}
          aria-label="Toggle lamp power"
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer bg-transparent border-none p-1.5 z-[5]"
          style={{ top: 96 }}
        >
          <motion.span
            animate={{ height: tug ? 44 : 30 }}
            transition={{ duration: 0.18 }}
            className="w-[2px] bg-gradient-to-b from-[#4a4d55] to-[#2a2c31]"
          />
          <motion.span
            animate={{
              boxShadow: on ? '0 0 10px 3px rgba(240,183,91,0.65)' : '0 2px 5px rgba(0,0,0,0.5)',
            }}
            className="w-3.5 h-3.5 rounded-full"
            style={{
              background: on
                ? 'linear-gradient(180deg,#f9dca0,#f0b75b)'
                : 'linear-gradient(180deg,#4a4f5c,#22252c)',
            }}
          />
        </button>
      </div>

      <motion.div
        animate={{ opacity: on ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="mt-6 text-[11px] tracking-[0.14em] uppercase text-inkFaint text-center"
      >
        Pull the cord<br />to switch on
      </motion.div>
    </div>
  );
};

export default Lamp;
