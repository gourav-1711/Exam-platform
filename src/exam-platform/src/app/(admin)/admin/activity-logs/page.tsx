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
  create: "bg-green-500/10 text-green-400 border-green-500/20",
  update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-400 border-red-500/20",
  reply: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  assign: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

function getActionColor(action: string): string {
  const prefix = Object.keys(actionColor).find((k) => action.startsWith(k));
  return prefix
    ? actionColor[prefix]
    : "bg-slate-800 text-slate-400 border-slate-700";
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-400" />
          Activity Logs
        </h1>
        <p className="text-slate-400 mt-2">
          {pagination?.total !== undefined ? pagination.total : "–"} total
          tracked actions and operations
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          value={action}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Filter by action name..."
          className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 rounded-lg text-sm h-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-slate-900 border border-slate-800 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <>
          <Card className="border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-800">
              {data?.data.length === 0 && (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Activity className="h-10 w-10 opacity-30" />
                  No action logs found
                </div>
              )}
              {data?.data.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-4 py-3.5 hover:bg-slate-800/30 transition-colors"
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
                        className="text-[10px] uppercase font-bold mr-1.5 border-slate-700 text-slate-300"
                      >
                        {log.entityType}
                      </Badge>
                    )}
                    <span className="font-mono text-xs text-slate-400">
                      by {log.userId.slice(0, 20)}...
                    </span>
                    {log.ipAddress && (
                      <span className="text-[10px] text-slate-500 ml-2 font-mono">
                        ({log.ipAddress})
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-slate-500 shrink-0 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
          </Card>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
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
