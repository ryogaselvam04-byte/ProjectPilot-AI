import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ListChecks, StickyNote, User, Settings, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import MasterAILogo from '../ui/MasterAILogo.jsx';
import BrandMark from '../ui/BrandMark.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'MASTER AI', icon: MasterAILogo },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// Fixed left sidebar for the authenticated app shell
const Sidebar = () => {
  const { user } = useAuth();
  const items = user?.role === 'admin' ? [...navItems, { to: '/admin', label: 'Admin', icon: ShieldCheck }] : navItems;

  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-white/[0.08] bg-[#0c0d11]/80 backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-10 px-2">
        <BrandMark size={22} />
        <span className="font-display text-base tracking-wide text-goldSoft">PROJECTPILOT</span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-ink bg-white/[0.05]' : 'text-inkDim hover:text-ink hover:bg-white/[0.03]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-goldSoft to-gold"
                  />
                )}
                <Icon size={17} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
