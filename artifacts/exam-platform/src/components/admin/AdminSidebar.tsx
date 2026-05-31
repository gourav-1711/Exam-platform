"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleAdminSidebar } from "@/store/slices/uiSlice";
import {
  LayoutDashboard, HelpCircle, ClipboardList, Users, BarChart3,
  FileEdit, Activity, Settings, ChevronLeft, ChevronRight,
  GraduationCap, BookOpen,
} from "lucide-react";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/questions", icon: HelpCircle, label: "Questions" },
  { href: "/admin/exams", icon: GraduationCap, label: "Exams" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/drafts", icon: FileEdit, label: "Drafts" },
  { href: "/admin/activity-logs", icon: Activity, label: "Activity Logs" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.adminSidebarCollapsed);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-5 w-5 text-violet-400 flex-shrink-0" />
            <span className="font-bold text-sm truncate">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleAdminSidebar())}
          className="p-1 rounded hover:bg-gray-700 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 px-4 py-3">
        <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
          {collapsed ? "←" : "← Back to App"}
        </Link>
      </div>
    </aside>
  );
}
