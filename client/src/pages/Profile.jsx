import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Profile page: bio, skills, location, social links - saved via /api/users/profile
const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    experience: user?.experience || '',
    skills: (user?.skills || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl mb-1">Profile</h1>
        <p className="text-inkDim text-sm">This is what teammates see about you.</p>
      </div>

      <Card hover={false} className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-goldSoft to-goldDim flex items-center justify-center font-display text-2xl text-[#251b06]">
          {form.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold">{form.name}</p>
          <p className="text-xs text-inkDim">{user?.email}</p>
        </div>
      </Card>

      <Card hover={false}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { key: 'name', label: 'Full name' },
            { key: 'location', label: 'Location' },
            { key: 'experience', label: 'Experience' },
            { key: 'skills', label: 'Skills (comma separated)' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-[10.5px] uppercase tracking-wide text-[#a89a78]">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full mt-1 bg-black/25 border border-gold/20 focus:border-gold rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-[10.5px] uppercase tracking-wide text-[#a89a78]">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full mt-1 bg-black/25 border border-gold/20 focus:border-gold rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>Save changes</Button>
            {saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-goldSoft">Saved!</motion.span>}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
