"use client";

import { useAdminDashboard } from "@/lib/api";
import type { AdminDashboardStats } from "@/lib/api";
import { HelpCircle, GraduationCap, TrendingUp, Activity, CheckCircle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statCards = (s: AdminDashboardStats) => [
  { label: "Total Questions", value: s.totalQuestions, icon: HelpCircle, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Total Exams", value: s.totalExams, icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Total Attempts", value: s.totalAttempts, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Pass Rate", value: `${s.passPercentage}%`, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
];

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-slate-800 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 animate-pulse rounded-xl" />
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-2">Overview of platform learning progress, resources, and live actions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(data).map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-800 bg-slate-900 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
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
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" /> Recent Action Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No recent actions</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((a) => (
                <div key={a.id} className="flex items-start justify-between text-sm py-2 border-b border-slate-800 last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-slate-200">{formatAction(a.action)}</span>
                    {a.entityType && (
                      <span className="text-slate-400 ml-1.5 px-1.5 py-0.5 bg-slate-800 rounded-full text-xs font-medium">{a.entityType}</span>
                    )}
                    <span className="text-slate-500 ml-2 text-xs">by {a.userId.slice(0, 15)}...</span>
                  </div>
                  <time className="text-xs text-slate-400 shrink-0 ml-4">
                    {new Date(a.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
