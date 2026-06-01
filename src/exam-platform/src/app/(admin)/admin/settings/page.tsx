'use client';
import { useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { useAdminPin } from '../_context/AdminPinContext';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { pin: sessionPin } = useAdminPin();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPin !== confirmPin) {
      setError('New PIN and confirm PIN do not match');
      return;
    }

    if (newPin.length < 4) {
      setError('PIN must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/document-admin/set-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update PIN');
      }

      setSuccess('PIN updated successfully');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage admin settings</p>
      </div>

      {/* Change PIN */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Change Admin PIN</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Current PIN</label>
            <input
              type="password"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="Enter current PIN"
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New PIN</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter new PIN (min 4 characters)"
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm new PIN"
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-200">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !currentPin || !newPin || !confirmPin}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {isLoading ? 'Updating...' : 'Update PIN'}
          </button>
        </form>
      </div>

      {/* Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-4">Admin Information</h2>
        <div className="space-y-3 text-slate-300 text-sm">
          <p>The admin PIN is used to authenticate file uploads and deletions for NCERT and PYP documents.</p>
          <p>Your PIN is stored securely in the database using bcrypt hashing and is never displayed in plain text.</p>
          <p className="text-slate-500 mt-4">Remember to change your PIN regularly for security.</p>
        </div>
      </div>
    </div>
  );
}
