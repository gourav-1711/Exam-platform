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