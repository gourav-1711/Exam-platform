'use client';

import { useAdminSettings, useUpdateSettings } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, ShieldCheck, Mail, Phone, Power } from 'lucide-react';

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
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600" />
          Settings
        </h1>
        <p className="text-gray-500 mt-2">Manage global application settings, modules, and support details</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Info */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> General Customization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Site Name</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm(p => ({ ...p, siteName: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Site Description</label>
              <input
                type="text"
                value={form.siteDescription}
                onChange={(e) => setForm(p => ({ ...p, siteDescription: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" /> Support Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Support Email</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm(p => ({ ...p, supportEmail: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Support Phone</label>
              <input
                type="text"
                value={form.supportPhone}
                onChange={(e) => setForm(p => ({ ...p, supportPhone: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles & Maintenance */}
        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Power className="w-5 h-5 text-indigo-600" /> Feature Toggles & Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Lock site for general users</p>
              </div>
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm(p => ({ ...p, maintenanceMode: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Leaderboard System</p>
                <p className="text-xs text-gray-500">Enable points ranking boards</p>
              </div>
              <input
                type="checkbox"
                checked={form.leaderboardEnabled}
                onChange={(e) => setForm(p => ({ ...p, leaderboardEnabled: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Quiz Module</p>
                <p className="text-xs text-gray-500">Enable free interactive tests</p>
              </div>
              <input
                type="checkbox"
                checked={form.quizEnabled}
                onChange={(e) => setForm(p => ({ ...p, quizEnabled: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Current Affairs</p>
                <p className="text-xs text-gray-500">Display daily news analysis</p>
              </div>
              <input
                type="checkbox"
                checked={form.currentAffairsEnabled}
                onChange={(e) => setForm(p => ({ ...p, currentAffairsEnabled: e.target.checked }))}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 col-span-1 md:col-span-2">
              <div>
                <p className="font-semibold text-gray-900">Registration Enabled</p>
                <p className="text-xs text-gray-500">Allow new students to sign up</p>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow"
          >
            <Save className="w-4 h-4" />
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}