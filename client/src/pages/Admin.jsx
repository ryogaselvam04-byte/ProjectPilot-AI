import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FolderKanban, ListChecks, Radio, ShieldCheck, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.05 } }),
};

// Admin-only dashboard: platform stats + full user list with live "online now" status.
// Backed by GET /api/users and GET /api/users/stats (both require role: "admin").
const Admin = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([api.get('/users'), api.get('/users/stats')]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Refresh online-status every 30s so the panel feels live without a websocket
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleRole = async (u) => {
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      const { data } = await api.put(`/users/${u._id}/role`, { role: nextRole });
      setUsers((list) => list.map((x) => (x._id === u._id ? data : x)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update role.');
    }
  };

  const removeUser = async (u) => {
    if (!confirm(`Delete ${u.name}'s account? This removes their projects and tasks too.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setUsers((list) => list.filter((x) => x._id !== u._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user.');
    }
  };

  const statCards = stats && [
    { label: 'Total users', value: stats.userCount, icon: Users },
    { label: 'Online now', value: stats.onlineNow, icon: Radio, highlight: true },
    { label: 'Projects', value: stats.projectCount, icon: FolderKanban },
    { label: 'Tasks', value: stats.taskCount, icon: ListChecks },
  ];

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-goldSoft" />
          <h1 className="font-display text-2xl md:text-3xl">Admin</h1>
        </div>
        <p className="text-inkDim text-sm">Everyone using ProjectPilot AI, at a glance.</p>
      </motion.div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {statCards && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} initial="hidden" animate="show" custom={i + 1}>
              <Card>
                <s.icon size={18} className={s.highlight ? 'text-emerald-400 mb-3' : 'text-goldSoft mb-3'} />
                <div className="font-display text-2xl flex items-center gap-2">
                  {s.value}
                  {s.highlight && s.value > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="text-[11px] text-inkDim mt-1">{s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
        <Card hover={false} className="p-0 overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="font-display text-base">All users</h3>
          </div>

          {loading ? (
            <p className="text-sm text-inkFaint p-5">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-inkFaint border-b border-white/[0.06]">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {users.map((u) => (
                      <motion.tr
                        key={u._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/[0.04] last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-goldSoft to-goldDim flex items-center justify-center text-[11px] font-bold text-[#251b06] flex-shrink-0">
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium leading-tight">{u.name}</p>
                              <p className="text-[11px] text-inkFaint">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.online ? 'bg-emerald-400' : 'bg-inkFaint'
                              }`}
                            />
                            {u.online ? 'Online now' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => toggleRole(u)}
                            disabled={u._id === me?._id}
                            className={`text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.role === 'admin'
                                ? 'text-goldSoft border-gold/30 bg-gold/10'
                                : 'text-inkDim border-white/10 hover:border-gold/30'
                            }`}
                            title={u._id === me?._id ? "You can't change your own role" : 'Click to toggle'}
                          >
                            {u.role}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-inkFaint text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => removeUser(u)}
                            disabled={u._id === me?._id}
                            className="text-inkFaint hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {users.length === 0 && <p className="text-sm text-inkFaint p-5">No users yet.</p>}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Admin;
