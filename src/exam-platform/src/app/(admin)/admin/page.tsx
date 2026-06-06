"use client";

import { useAdminDashboard } from "@/lib/api";
import type { AdminDashboardStats } from "@/lib/api";
import {
  HelpCircle,
  GraduationCap,
  TrendingUp,
  Activity,
  CheckCircle,
  Shield,
  Clock,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const statCards = (s: AdminDashboardStats) => [
  {
    label: "Total Questions",
    value: s?.totalQuestions ?? 0,
    icon: HelpCircle,
    color: "text-violet-600",
    bg: "bg-violet-100/60",
  },
  {
    label: "Total Exams",
    value: s?.totalExams ?? 0,
    icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-100/60",
  },
  {
    label: "Total Attempts",
    value: s?.totalAttempts ?? 0,
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-100/60",
  },
  {
    label: "Pass Rate",
    value: `${s?.passPercentage ?? 0}%`,
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-100/60",
  },
];

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-2">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto p-2">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-bold text-sm">Failed to load admin dashboard</p>
          <p className="text-xs mt-1 text-red-600">
            Please make sure you have the required admin role permissions or try reloading.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-6xl mx-auto p-2"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-violet-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Overview of platform learning progress, resources, and live actions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(data).map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <Card className="border border-border/50 bg-white shadow-sm rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      {value}
                    </p>
                  </div>
                  <div className={`${bg} p-3 rounded-2xl`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Action Logs */}
      <Card className="border border-border/50 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 h-4 text-violet-600" /> Recent Action Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          {!data.recentActivity || data.recentActivity.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No recent actions recorded yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentActivity.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 hover:bg-gray-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200/50">
                      {formatAction(a.action)}
                    </span>
                    {a.entityType && (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                        {a.entityType}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                      by {a.userId.slice(0, 15)}...
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5 sm:self-center">
                    <Clock className="w-3.5 h-3.5 text-gray-300" />
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
</dyad-file>

Let's test this fresh build. Since we updated the Next.js frontend code and the API router, let's request a **restart** of the servers so that we can immediately see the beautiful, clean, light-themed admin dashboard rendering perfectly on the right.

I will output the restart command now.To fix the admin dashboard UI and ensure it matches the clean light theme design system used throughout the rest of the application, I have performed the following updates:

1. **Server Dashboard (`/admin/dashboard`)**: Changed the dashboard stats cache key to a fresh value (`"admin:dashboard:light:v4"`) to prevent stale deserialized keys from causing `undefined` values. Added safe default values to ensure variables never render as `undefined`.
2. **Dashboard UI Component**: Rewrote the admin dashboard in `src/exam-platform/src/app/(admin)/admin/page.tsx` to align with the elegant light theme. Removed the contrasting dark-theme styling, substituting it with clean white cards, soft border outlines, and consistent gray text styling.

Please look above the chat box to use the Action button to **Restart** the application.

<dyad-command type="restart"></dyad-command>

<dyad-chat-summary>Fixed admin dashboard layout styling and undefined metrics values</dyad-chat-summary><dyad-write path="src/exam-platform/src/app/(admin)/admin/activity-logs/page.tsx" description="Converting activity logs view to light theme colors for full interface styling alignment">
"use client";

import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import type { AdminActivityLogsResponse } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { Activity, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const actionColor: Record<string, string> = {
  create: "bg-green-100 text-green-700 border-green-200/50",
  update: "bg-blue-100 text-blue-700 border-blue-200/50",
  delete: "bg-red-100 text-red-700 border-red-200/50",
  reply: "bg-indigo-100 text-indigo-700 border-indigo-200/50",
  assign: "bg-pink-100 text-pink-700 border-pink-200/50",
};

function getActionColor(action: string): string {
  const prefix = Object.keys(actionColor).find((k) => action.startsWith(k));
  return prefix
    ? actionColor[prefix]
    : "bg-gray-100 text-gray-600 border-gray-200";
}

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [debouncedAction, setDebouncedAction] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getToken } = useAuth();

  const { data, isLoading } = useQuery<AdminActivityLogsResponse>({
    queryKey: queryKeys.admin.activityLogs.list({
      page,
      limit: 50,
      action: debouncedAction || undefined,
    }),
    enabled: true,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return adminApi.activityLogs(token, {
        page,
        limit: 50,
        action: debouncedAction || undefined,
      });
    },
  });

  const handleSearch = (v: string) => {
    setAction(v);
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      setDebouncedAction(v);
      setPage(1);
    }, 400);
  };

  const pagination = data?.pagination;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-600" />
          Activity Logs
        </h1>
        <p className="text-gray-500 mt-2">
          {pagination?.total !== undefined ? pagination.total : "–"} total
          tracked actions and operations
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={action}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Filter by action name..."
          className="pl-9 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg text-sm h-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-white border border-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <>
          <Card className="border border-border/50 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {data?.data.length === 0 && (
                <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Activity className="h-10 w-10 opacity-30" />
                  No action logs found
                </div>
              )}
              {data?.data.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-4 py-3.5 hover:bg-gray-50/40 transition-colors"
                >
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 mt-0.5 border ${getActionColor(log.action)}`}
                  >
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    {log.entityType && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold mr-1.5 border-gray-200 text-gray-600"
                      >
                        {log.entityType}
                      </Badge>
                    )}
                    <span className="font-mono text-xs text-gray-500">
                      by {log.userId.slice(0, 20)}...
                    </span>
                    {log.ipAddress && (
                      <span className="text-[10px] text-gray-400 ml-2 font-mono">
                        ({log.ipAddress})
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-gray-400 shrink-0 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
          </Card>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}