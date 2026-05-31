"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, BookOpen, TrendingUp, Award } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalQuestions: number;
    totalExams: number;
    totalQuizzes: number;
    totalAttempts: number;
    activeStudents: number;
    avgScore: number;
    passRate: number;
  };
  subjectStats: { subject: string; count: number }[];
  dailyAttempts: { date: string; count: number; avgScore: number }[];
  topScorers: { userId: string; totalScore: number; attempts: number }[];
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "analytics"], queryFn: fetchAnalytics, staleTime: 15 * 60 * 1000 });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview } = data;
  const statCards = [
    { label: "Total Questions", value: overview.totalQuestions, icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Active Students", value: overview.activeStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Avg Score", value: overview.avgScore, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pass Rate", value: `${overview.passRate}%`, icon: Award, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Platform performance insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Daily Attempts (Last 30 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailyAttempts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={false} name="Attempts" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Questions by Subject</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.subjectStats} dataKey="count" nameKey="subject" cx="50%" cy="50%" outerRadius={80} label={({ subject, percent }) => `${subject} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {data.subjectStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Avg Score Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.dailyAttempts.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Top Scorers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topScorers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No attempts yet</p>
              ) : (
                data.topScorers.map((s, i) => (
                  <div key={s.userId} className="flex items-center gap-3 py-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-amber-700 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {i + 1}
                    </div>
                    <span className="flex-1 font-mono text-xs text-gray-600 truncate">{s.userId.slice(0, 16)}…</span>
                    <span className="font-bold text-violet-600">{s.totalScore}</span>
                    <span className="text-xs text-gray-400">{s.attempts} att.</span>
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
