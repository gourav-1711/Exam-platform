"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleAdminSidebar } from "@/store/slices/uiSlice";
import {
  LayoutDashboard,
  HelpCircle,
  GraduationCap,
  Users,
  BarChart3,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  MessageSquare,
  BookOpen,
  CalendarDays,
  Megaphone,
  Award,
  NotebookTabs,
} from "lucide-react";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/questions", icon: HelpCircle, label: "Questions" },
  { href: "/admin/exams", icon: GraduationCap, label: "Exams" },
  { href: "/admin/daily-quizzes", icon: CalendarDays, label: "Daily Quizzes" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/pyq-subjects", icon: BookOpen, label: "PYQ Subjects" },
  { href: "/admin/current-affairs", icon: Newspaper, label: "Current Affairs" },
  { href: "/admin/study-notes", icon: NotebookTabs, label: "Study Notes" },
  { href: "/admin/mock-tests", icon: Award, label: "Mock Tests" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  {
    href: "/admin/support-tickets",
    icon: MessageSquare,
    label: "Support Tickets",
  },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },

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
        "flex flex-col h-screen bg-white text-gray-900 transition-all duration-300 sticky top-0 border-r",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <Newspaper className="h-5 w-5 text-violet-600 flex-shrink-0" />
            <span className="font-bold text-sm truncate">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleAdminSidebar())}
          className="p-1 rounded hover:bg-gray-100 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : (pathname?.startsWith(href) ?? false);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-3">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          {collapsed ? "←" : "← Back to App"}
        </Link>
      </div>
    </aside>
  );
}