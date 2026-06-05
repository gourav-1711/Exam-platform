"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Award, BarChart3 } from "lucide-react";

type AnalyticsOverview = {
  totalQuestions: number;
  activeStudents: number;
  avgScore: number;
  passRate: number;
};

type AnalyticsDailyAttempt = {
  date: string;
  count: number;
  avgScore: number;
};

type AnalyticsSubjectStat = {
  subject: string;
  count: number;
  percent: number;
};

type AnalyticsTopScorer = {
  userId: string;
  totalScore: number;
  attempts: number;
};

type AnalyticsResponse = {
  overview: AnalyticsOverview;
  dailyAttempts: AnalyticsDailyAttempt[];
  subjectStats: AnalyticsSubjectStat[];
  topScorers: AnalyticsTopScorer[];
};

const COLORS = [
  "#7c3aed",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
];

export default function AnalyticsPage() {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: queryKeys.admin.analytics.overview(),
    enabled: true,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return adminApi.analytics(token);
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-40 bg-slate-800 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-slate-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview } = data;
  const statCards = [
    {
      label: "Total Questions",
      value: overview.totalQuestions,
      icon: BookOpen,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Active Students",
      value: overview.activeStudents,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Avg Score",
      value: overview.avgScore,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Pass Rate",
      value: `${overview.passRate}%`,
      icon: Award,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          Analytics
        </h1>
        <p className="text-slate-400 mt-2">
          Platform performance insights and user metric trend logs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">
              Daily Attempts (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailyAttempts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  name="Attempts"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">
              Questions by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.subjectStats}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: import("recharts").PieLabelRenderProps) => {
                    const subject = entry.name ?? "";
                    const percent =
                      typeof entry.percent === "number"
                        ? (entry.percent * 100).toFixed(0)
                        : "0";
                    return `${subject} ${percent}%`;
                  }}
                  labelLine={false}
                >
                  {data.subjectStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">
              Avg Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.dailyAttempts.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                  }}
                />
                <Bar
                  dataKey="avgScore"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Avg Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">
              Top Scorers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topScorers.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  No attempts yet
                </p>
              ) : (
                data.topScorers.map((s, i) => (
                  <div
                    key={s.userId}
                    className="flex items-center gap-3 py-1.5 border-b border-slate-800 last:border-0"
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-slate-900" : i === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400"}`}
                    >
                      {i + 1}
                    </div>
                    <span className="flex-1 font-mono text-xs text-slate-300 truncate max-w-[120px]">
                      {s.userId}
                    </span>
                    <span className="font-extrabold text-indigo-400">
                      {s.totalScore}
                    </span>
                    <span className="text-xs text-slate-400">
                      {s.attempts} att.
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
