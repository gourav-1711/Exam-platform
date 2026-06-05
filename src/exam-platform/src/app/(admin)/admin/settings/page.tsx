'use client';

import { useAdminSettings, useUpdateSettings } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, AlertTriangle, ShieldCheck, Mail, Phone, Power } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    siteName: '',
    siteDescription: '',
    supportEmail: '',
    supportPhone: '',
    maintenanceMode: false,
    leaderboardEnabled: true,
    quizEnabled: true,
    currentAffairsEnabled: true,
    registrationEnabled: true,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        maintenanceMode: settings.maintenanceMode,
        leaderboardEnabled: settings.leaderboardEnabled,
        quizEnabled: settings.quizEnabled,
        currentAffairsEnabled: settings.currentAffairsEnabled,
        registrationEnabled: settings.registrationEnabled,
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(form);
      toast({ title: 'Settings saved successfully' });
    } catch {
      toast({ title: 'Failed to update settings', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-400" />
          Settings
        </h1>
        <p className="text-slate-400 mt-2">Manage global application settings, modules, and support details</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> General Customization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Site Name</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm(p => ({ ...p, siteName: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Site Description</label>
              <input
                type="text"
                value={form.siteDescription}
                onChange={(e) => setForm(p => ({ ...p, siteDescription: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" /> Support Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Support Email</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm(p => ({ ...p, supportEmail: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Support Phone</label>
              <input
                type="text"
                value={form.supportPhone}
                onChange={(e) => setForm(p => ({ ...p, supportPhone: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles & Maintenance */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Power className="w-5 h-5 text-indigo-400" /> Feature Toggles & Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <p className="font-semibold text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-400">Lock site for general users</p>
              </div>
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm(p => ({ ...p, maintenanceMode: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <p className="font-semibold text-white">Leaderboard System</p>
                <p className="text-xs text-slate-400">Enable points ranking boards</p>
              </div>
              <input
                type="checkbox"
                checked={form.leaderboardEnabled}
                onChange={(e) => setForm(p => ({ ...p, leaderboardEnabled: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <p className="font-semibold text-white">Quiz Module</p>
                <p className="text-xs text-slate-400">Enable free interactive tests</p>
              </div>
              <input
                type="checkbox"
                checked={form.quizEnabled}
                onChange={(e) => setForm(p => ({ ...p, quizEnabled: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <p className="font-semibold text-white">Current Affairs</p>
                <p className="text-xs text-slate-400">Display daily news analysis</p>
              </div>
              <input
                type="checkbox"
                checked={form.currentAffairsEnabled}
                onChange={(e) => setForm(p => ({ ...p, currentAffairsEnabled: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 col-span-1 md:col-span-2">
              <div>
                <p className="font-semibold text-white">Registration Enabled</p>
                <p className="text-xs text-slate-400">Allow new students to sign up</p>
              </div>
              <input
                type="checkbox"
                checked={form.registrationEnabled}
                onChange={(e) => setForm(p => ({ ...p, registrationEnabled: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow"
          >
            <Save className="w-4 h-4" />
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
