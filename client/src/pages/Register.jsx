import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button.jsx';
import BrandMark from '../components/ui/BrandMark.jsx';
import { useAuth } from '../hooks/useAuth';

// Registration screen - same luxury visual language as Login, simpler entrance
const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10 relative"
      style={{
        background:
          'radial-gradient(ellipse 1300px 800px at 40% 20%, #1c170f 0%, #121014 45%, #08090b 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm rounded-2xl border border-gold/20 bg-panel/90 backdrop-blur-md p-7 md:p-8"
      >
        <div className="flex items-center gap-2 mb-5">
          <BrandMark size={20} />
          <span className="font-display text-sm tracking-wide text-goldSoft">LUMEN ACCESS</span>
        </div>

        <h1 className="font-display text-2xl mb-1">Create your account</h1>
        <p className="text-xs text-inkDim mb-6">A few details and the light's all yours.</p>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {[
            { key: 'name', label: 'Full name', type: 'text', placeholder: 'Ada Lovelace' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@domain.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
            { key: 'confirm', label: 'Confirm password', type: 'password', placeholder: 'Repeat your password' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-[10.5px] uppercase tracking-wide text-[#a89a78]">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className={`w-full mt-1 bg-black/25 border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(240,183,91,0.12)] transition-colors ${
                  errors[f.key] ? 'border-red-400' : 'border-gold/20'
                }`}
              />
              {errors[f.key] && <p className="text-[10.5px] text-red-400 mt-1">{errors[f.key]}</p>}
            </div>
          ))}

          {apiError && <p className="text-[11px] text-red-400">{apiError}</p>}

          <Button type="submit" loading={loading} className="w-full justify-center">
            Create account
          </Button>
        </form>

        <p className="text-center text-xs text-inkDim mt-4">
          Already have one?{' '}
          <Link to="/login" className="text-goldSoft font-bold underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
