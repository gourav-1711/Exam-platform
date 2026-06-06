"use client";

import { useAdminDashboard } from "@/lib/api";
import type { AdminDashboardStats } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { formatAction } from "@/components/admin/CurrentAffairsTable";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-slate-800 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-slate-800 animate-pulse rounded-xl"
            />}
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          Failed to load dashboard. Make sure you have admin access.
        </div>
      </div>
    );
  }

  // Safely access recentActivity to prevent TypeError
  if (!data?.recentActivity?.length) {
    return (
      <div className="p-6 text-center text-slate-500">
        No recent actions logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-indigo-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Overview of platform learning progress, resources, and live actions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Questions",
            value: data.totalQuestions,
            icon: HelpCircle,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            label: "Total Exams",
            value: data.totalExams,
            icon: GraduationCap,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Total Attempts",
            value: data.totalAttempts,
            icon: TrendingUp,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Pass Rate",
            value: `${data.passPercentage}%`,
            icon: CheckCircle,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-800 bg-slate-900 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    {value}
                  </p>
                </div>
                <div className={`${bg} p-3 rounded-xl`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-800 bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-base text-white font-semibold">
            Recent Action Logs          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {data?.recentActivity?.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              No recent actions logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between text-sm py-2 border-b border-slate-800 last:border-0 last:pb-0"
                >                  <div>
                    <span className="font-semibold text-slate-200">
                      {formatAction(a.action)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 truncate">
                      {a.userId?.slice(0, 15) ?? "unknown"}
                    </span>
                  </div>
                  <span className="text-slate-500 ml-2 text-xs">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}