'use client';
import { AdminPinProvider, useAdminPin } from './_context/AdminPinContext';
import { PinGate } from './_components/PinGate';
import { AdminSidebar } from './_components/AdminSidebar';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { verified } = useAdminPin();
  if (!verified) return <PinGate />;
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminPinProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminPinProvider>
  );
}
