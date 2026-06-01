'use client';
import { useUser } from '@clerk/nextjs';
import { AdminSidebar } from './_components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as Record<string, unknown>)?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
