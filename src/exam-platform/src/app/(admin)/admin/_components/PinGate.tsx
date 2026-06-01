'use client';
import { useState } from 'react';
import { useAdminPin } from '../_context/AdminPinContext';
import { Lock, AlertCircle } from 'lucide-react';

export function PinGate() {
  const { verify } = useAdminPin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await verify(pin);
    if (!success) {
      setError('Invalid PIN');
    } else {
      setPin('');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-500/20 rounded-full">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-center text-slate-300 text-sm mb-8">Enter your PIN to access the admin panel</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length < 4 || isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200"
          >
            {isLoading ? 'Verifying...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
