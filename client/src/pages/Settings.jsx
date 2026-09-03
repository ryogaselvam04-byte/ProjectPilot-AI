import React, { useState } from 'react';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Settings: theme toggle, password change, danger-zone account deletion
const Settings = () => {
  const { logout } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put('/users/password', passwords);
      setMsg('Password updated successfully.');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('This permanently deletes your account and all data. Continue?')) return;
    await api.delete('/users/me');
    logout();
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl mb-1">Settings</h1>
        <p className="text-inkDim text-sm">Manage your account and preferences.</p>
      </div>

      <Card hover={false}>
        <h3 className="font-display text-base mb-4">Change password</h3>
        <form onSubmit={changePassword} className="space-y-3.5">
          <input
            type="password"
            placeholder="Current password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="w-full bg-black/25 border border-gold/20 focus:border-gold rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          />
          <input
            type="password"
            placeholder="New password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="w-full bg-black/25 border border-gold/20 focus:border-gold rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          />
          {msg && <p className="text-xs text-goldSoft">{msg}</p>}
          <Button type="submit" loading={saving}>Update password</Button>
        </form>
      </Card>

      <Card hover={false} className="border-red-400/20">
        <h3 className="font-display text-base mb-2 text-red-400">Danger zone</h3>
        <p className="text-xs text-inkDim mb-4">Deleting your account removes all projects, tasks and notes permanently.</p>
        <button
          onClick={deleteAccount}
          className="text-sm font-bold text-red-400 border border-red-400/30 rounded-lg px-4 py-2 hover:bg-red-400/10 transition-colors"
        >
          Delete account
        </button>
      </Card>
    </div>
  );
};

export default Settings;
