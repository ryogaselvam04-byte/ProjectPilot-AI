import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderKanban, ListChecks, StickyNote, Sparkles, Apple, PlayCircle } from 'lucide-react';
import Footer from '../components/layout/Footer.jsx';
import BrandMark from '../components/ui/BrandMark.jsx';
import { useAuth } from '../hooks/useAuth';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const features = [
  { icon: FolderKanban, title: 'Projects', copy: 'Track status, priority and deadlines for everything you\u2019re building.' },
  { icon: ListChecks, title: 'Kanban tasks', copy: 'Drag work across Todo, In Progress, Testing and Completed.' },
  { icon: StickyNote, title: 'Notes', copy: 'Markdown notes that auto-save as you type, pin the important ones.' },
  { icon: Sparkles, title: 'AI-ready', copy: 'Built on an API designed to plug an AI assistant in when you\u2019re ready.' },
];

// Public marketing home page - the first thing a signed-out visitor sees.
const Landing = () => {
  const [appToast, setAppToast] = useState('');
  const { user } = useAuth();

  const notifyComingSoon = (platform) => {
    setAppToast(`${platform} app launching soon \u2014 we'll let you know.`);
    setTimeout(() => setAppToast(''), 2500);
  };

  return (
    <div className="min-h-screen">
      {/* ===== Public nav ===== */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-10 py-5 border-b border-white/[0.06] bg-[#07080b]/70 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <BrandMark size={22} />
          <span className="font-display text-base tracking-wide text-goldSoft">PROJECTPILOT</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="text-sm font-bold text-[#251b06] bg-gradient-to-b from-goldSoft to-gold rounded-lg px-4 py-2 shadow-gold"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-inkDim hover:text-ink transition-colors px-3 py-2">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold text-[#251b06] bg-gradient-to-b from-goldSoft to-gold rounded-lg px-4 py-2 shadow-gold"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="max-w-5xl mx-auto px-5 md:px-10 pt-20 pb-24 text-center">
        <motion.p
          initial="hidden" animate="show" variants={fadeUp}
          className="text-xs tracking-[0.28em] uppercase text-goldSoft mb-5"
        >
          Build. Manage. Create. Everything.
        </motion.p>
        <motion.h1
          initial="hidden" animate="show" variants={fadeUp}
          transition={{ delay: 0.08 }}
          className="font-display text-4xl md:text-6xl leading-[1.05] mb-6"
        >
          One calm place for<br />everything you're building.
        </motion.h1>
        <motion.p
          initial="hidden" animate="show" variants={fadeUp}
          transition={{ delay: 0.16 }}
          className="text-inkDim text-sm md:text-base max-w-lg mx-auto mb-9"
        >
          Projects, tasks, and notes in one premium workspace — built to feel
          as good to use every day as it looks on day one.
        </motion.p>
        <motion.div
          initial="hidden" animate="show" variants={fadeUp}
          transition={{ delay: 0.24 }}
          className="flex items-center justify-center gap-4"
        >
          {user ? (
            <Link
              to="/dashboard"
              className="font-bold text-[#251b06] bg-gradient-to-b from-goldSoft to-gold rounded-lg px-6 py-3 shadow-gold hover:-translate-y-0.5 transition-transform"
            >
              Go to your dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="font-bold text-[#251b06] bg-gradient-to-b from-goldSoft to-gold rounded-lg px-6 py-3 shadow-gold hover:-translate-y-0.5 transition-transform"
              >
                Create your account
              </Link>
              <Link
                to="/login"
                className="font-bold text-ink border border-white/10 hover:border-gold/40 rounded-lg px-6 py-3 transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* ===== Features ===== */}
      <section className="max-w-5xl mx-auto px-5 md:px-10 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-panel border border-white/[0.08] rounded-2xl p-5"
            >
              <f.icon size={19} className="text-goldSoft mb-4" />
              <h3 className="font-display text-base mb-1.5">{f.title}</h3>
              <p className="text-xs text-inkDim leading-relaxed">{f.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Mobile app download (scroll-triggered) ===== */}
      <section className="max-w-5xl mx-auto px-5 md:px-10 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-gold/20 bg-gradient-to-br from-panel to-panel2 p-9 md:p-14 text-center overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(ellipse 500px 300px at 50% 0%, rgba(240,183,91,0.14), transparent 70%)' }}
          />
          <div className="relative">
            <p className="text-xs tracking-[0.24em] uppercase text-goldSoft mb-3">Take it with you</p>
            <h2 className="font-display text-2xl md:text-3xl mb-3">ProjectPilot, in your pocket.</h2>
            <p className="text-inkDim text-sm max-w-md mx-auto mb-8">
              The same premium workspace, built for iOS and Android — so your
              projects follow you off the desktop too.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => notifyComingSoon('iOS')}
                className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 hover:border-gold/40 rounded-xl px-5 py-3 transition-colors"
              >
                <Apple size={20} />
                <span className="text-left">
                  <span className="block text-[9px] text-inkFaint leading-none mb-0.5">Coming soon on</span>
                  <span className="block text-sm font-semibold leading-none">App Store</span>
                </span>
              </button>
              <button
                onClick={() => notifyComingSoon('Android')}
                className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 hover:border-gold/40 rounded-xl px-5 py-3 transition-colors"
              >
                <PlayCircle size={20} />
                <span className="text-left">
                  <span className="block text-[9px] text-inkFaint leading-none mb-0.5">Coming soon on</span>
                  <span className="block text-sm font-semibold leading-none">Google Play</span>
                </span>
              </button>
            </div>

            {appToast && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-goldSoft mt-5"
              >
                {appToast}
              </motion.p>
            )}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
