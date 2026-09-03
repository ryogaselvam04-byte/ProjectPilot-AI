import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lamp from '../components/layout/Lamp.jsx';
import Button from '../components/ui/Button.jsx';
import BrandMark from '../components/ui/BrandMark.jsx';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cinematic login screen: nothing is visible until the lamp is switched on.
const Login = () => {
  const [lampOn, setLampOn] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get('oauthError');
    if (oauthError) setApiError(oauthError);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lampOn) return;
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = (provider) => {
    if (!lampOn) return;
    if (provider === 'apple') {
      setApiError('Apple login requires a paid Apple Developer account and is not set up yet.');
      return;
    }
    // Full-page redirect - the backend takes it from here and sends the
    // browser back to /oauth-callback with a token once the provider confirms.
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* full-screen ambient light tied to lamp state */}
      <motion.div
        animate={{ opacity: lampOn ? 1 : 0 }}
        transition={{ duration: 1.1 }}
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 1200px 800px at 30% 35%, rgba(240,183,91,0.14), transparent 60%), radial-gradient(ellipse 1400px 900px at 70% 55%, rgba(240,183,91,0.09), transparent 65%)',
        }}
      />

      <div className="relative flex flex-wrap items-center justify-center gap-10 md:gap-20 w-full max-w-4xl">
        <Lamp onToggle={setLampOn} />

        <div className="w-full max-w-sm relative">
          <div
            className="relative rounded-2xl border p-7 md:p-8 backdrop-blur-md transition-colors duration-700"
            style={{
              background: lampOn ? 'rgba(18,19,25,0.9)' : 'rgba(10,9,7,0.4)',
              borderColor: lampOn ? 'rgba(240,183,91,0.22)' : 'rgba(255,255,255,0.05)',
              minHeight: 420,
            }}
          >
            {/* off-state message */}
            <AnimatePresence>
              {!lampOn && (
                <motion.div
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-end justify-start p-7 text-[11.5px] tracking-wide text-inkFaint pointer-events-none"
                >
                  The room's dark in here.<br />Switch the lamp on first.
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              animate={{ opacity: lampOn ? 1 : 0, y: lampOn ? 0 : 10 }}
              transition={{ duration: 0.6, delay: lampOn ? 0.35 : 0 }}
              style={{ pointerEvents: lampOn ? 'auto' : 'none' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <BrandMark size={20} />
                <span className="font-display text-sm tracking-wide text-goldSoft">LUMEN ACCESS</span>
              </div>

              <h1 className="font-display text-2xl mb-1">Welcome back</h1>
              <p className="text-xs text-inkDim mb-5">Sign in to pick up right where you left off.</p>

              <div className="flex gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => socialLogin('google')}
                  title="Continue with Google"
                  className="flex-1 h-10 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 hover:border-gold/40 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path fill="#EA4335" d="M12 10.9v3.6h5.1c-.2 1.3-1.6 3.8-5.1 3.8-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.75 0 2.93.7 3.6 1.32l2.46-2.37C16.66 4.6 14.55 3.6 12 3.6 7.36 3.6 3.6 7.36 3.6 12S7.36 20.4 12 20.4c4.86 0 7.68-3.4 7.68-8.2 0-.55-.06-.97-.13-1.3H12z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => socialLogin('github')}
                  title="Continue with GitHub"
                  className="flex-1 h-10 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 hover:border-gold/40 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path fill="#f4f1ea" d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.7c-2.7.6-3.3-1.3-3.3-1.3-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.6-.1-.2-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.4.1 2.6.6.7 1 1.5 1 2.6 0 3.8-2.3 4.7-4.5 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => socialLogin('microsoft')}
                  title="Continue with Microsoft"
                  className="flex-1 h-10 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 hover:border-gold/40 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <rect x="2" y="2" width="9" height="9" fill="#f25022" />
                    <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
                    <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
                    <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => socialLogin('apple')}
                  title="Continue with Apple"
                  className="flex-1 h-10 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 hover:border-gold/40 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path fill="#f4f1ea" d="M16.4 12.5c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.2-3zM14.3 6.1c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2.5 text-[10.5px] text-inkFaint uppercase tracking-wide mb-4">
                <span className="flex-1 h-px bg-white/[0.09]" /> or email <span className="flex-1 h-px bg-white/[0.09]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                <div>
                  <label className="text-[10.5px] uppercase tracking-wide text-[#a89a78]">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@domain.com"
                    className={`w-full mt-1 bg-black/25 border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(240,183,91,0.12)] transition-colors ${
                      errors.email ? 'border-red-400' : 'border-gold/20'
                    }`}
                  />
                  {errors.email && <p className="text-[10.5px] text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-[10.5px] uppercase tracking-wide text-[#a89a78]">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full mt-1 bg-black/25 border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(240,183,91,0.12)] transition-colors ${
                      errors.password ? 'border-red-400' : 'border-gold/20'
                    }`}
                  />
                  {errors.password && <p className="text-[10.5px] text-red-400 mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-[11.5px] text-inkDim">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                      className="accent-gold"
                    />
                    Remember me
                  </label>
                  <a href="#" className="text-goldSoft">Forgot password?</a>
                </div>

                {apiError && <p className="text-[11px] text-red-400">{apiError}</p>}

                <Button type="submit" loading={loading} className="w-full justify-center">
                  Sign in
                </Button>
              </form>

              <p className="text-center text-xs text-inkDim mt-4">
                No account yet?{' '}
                <Link to="/register" className="text-goldSoft font-bold underline underline-offset-2">
                  Create one
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
