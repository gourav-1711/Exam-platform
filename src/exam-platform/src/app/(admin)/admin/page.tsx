"use client";

import { useQuery } from "@tanstack/react-query";
import {
  HelpCircle,
  GraduationCap,
  Users,
  TrendingUp,
  Activity,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalQuestions: number;
  totalExams: number;
  totalAttempts: number;
  passedAttempts: number;
  passPercentage: number;
  recentActivity: {
    id: number;
    action: string;
    entityType: string | null;
    userId: string;
    createdAt: string;
  }[];
}

async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch("/api/admin/dashboard");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const statCards = (s: DashboardStats) => [
  {
    label: "Total Questions",
    value: s.totalQuestions,
    icon: HelpCircle,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Total Exams",
    value: s.totalExams,
    icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Total Attempts",
    value: s.totalAttempts,
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Pass Rate",
    value: `${s.passPercentage}%`,
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboard,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
          Failed to load dashboard. Make sure you have admin access.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Overview of platform activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(data).map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
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

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-700">
                      {formatAction(a.action)}
                    </span>
                    {a.entityType && (
                      <span className="text-gray-400 ml-1">
                        · {a.entityType}
                      </span>
                    )}
                    <span className="text-gray-400 ml-1 text-xs">
                      by {a.userId.slice(0, 12)}…
                    </span>
                  </div>
                  <time className="text-xs text-gray-400 shrink-0 ml-4">
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
