"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { customFetch } from "@workspace/api-client-react";

interface StudentStat {
  userId: string;
  totalAttempts: number;
  avgScore: number;
  totalScore: number;
  passedCount: number;
  lastAttemptAt: string | null;
}

async function fetchStudents(
  page: number,
): Promise<{
  data: StudentStat[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
}> {
  return customFetch<{
    data: StudentStat[];
    pagination: {
      page: number;
      total: number;
      totalPages: number;
      limit: number;
    };
  }>(`/api/admin/students?page=${page}&limit=20`);
}

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "students", page],
    queryFn: () => fetchStudents(page),
    staleTime: 60 * 1000,
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {data?.pagination.total ?? "–"} active students
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <>
          {data?.data.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No student attempts yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium text-gray-600">
                        User ID
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Attempts
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Avg Score
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Total Score
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Passed
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.data.map((s, i) => (
                      <tr
                        key={s.userId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
                              {i + 1}
                            </div>
                            <span className="font-mono text-xs text-gray-600 truncate max-w-[120px]">
                              {s.userId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {s.totalAttempts}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {s.avgScore}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-violet-600">
                          {s.totalScore}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {s.passedCount}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {s.lastAttemptAt
                            ? new Date(s.lastAttemptAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages}
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
                  disabled={page >= data.pagination.totalPages}
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
