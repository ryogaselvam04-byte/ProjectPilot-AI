import React, { useState } from 'react';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

// Top bar shown above every authenticated page: search, notifications, user menu
const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 md:px-8 py-4 border-b border-white/[0.08] bg-[#09090c]/70 backdrop-blur-xl">
      <button className="md:hidden text-inkDim"><Menu size={20} /></button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2">
        <Search size={15} className="text-inkFaint" />
        <input
          placeholder="Search projects, tasks, notes..."
          className="bg-transparent outline-none text-sm text-ink placeholder:text-inkFaint w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-inkDim hover:text-ink transition-colors">
          <Bell size={19} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-goldSoft to-goldDim flex items-center justify-center text-xs font-bold text-[#251b06]"
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-panel shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 text-xs text-inkDim border-b border-white/5">{user?.email}</div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-inkDim hover:text-ink hover:bg-white/5 transition-colors"
                >
                  <LogOut size={15} /> Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
