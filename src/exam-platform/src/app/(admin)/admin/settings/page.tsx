'use client';
import { useUser } from '@clerk/nextjs';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage admin settings</p>
      </div>

      {/* Admin Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Admin Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
            <p className="text-slate-200">{user?.fullName || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <p className="text-slate-200">{user?.primaryEmailAddress?.emailAddress || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Admin Role</label>
            <p className="text-slate-200">{(user?.publicMetadata as Record<string, unknown>)?.role === 'admin' ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-4">About Admin Panel</h2>
        <div className="space-y-3 text-slate-300 text-sm">
          <p>The admin panel allows authorized administrators to manage NCERT books and previous year papers for students.</p>
          <p>Access is controlled through Clerk authentication and verified via the admin role in your public metadata.</p>
          <p className="text-slate-500 mt-4">Contact the system administrator to modify admin access.</p>
        </div>
      </div>
    </div>
  );
}
