'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, BookOpen, FileText, Settings, LogOut } from 'lucide-react';
import { useAdminPin } from '../_context/AdminPinContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Shield },
  { href: '/admin/ncert', label: 'NCERT Books', icon: BookOpen },
  { href: '/admin/pyp', label: 'Previous Year Papers', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminPin();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <p className="text-xs text-slate-400">Document Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-300 hover:bg-slate-800/50 border-l-2 border-transparent'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
