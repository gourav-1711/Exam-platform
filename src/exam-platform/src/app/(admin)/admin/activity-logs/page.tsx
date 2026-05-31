"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

async function fetchLogs(page: number, action: string): Promise<{ data: ActivityLog[]; pagination: { page: number; total: number; totalPages: number; limit: number } }> {
  const params = new URLSearchParams({ page: String(page), limit: "50" });
  if (action) params.set("action", action);
  const res = await fetch(`/api/admin/activity-logs?${params}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const actionColor: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  bulk: "bg-amber-100 text-amber-700",
};

function getActionColor(action: string): string {
  const prefix = Object.keys(actionColor).find((k) => action.startsWith(k));
  return prefix ? actionColor[prefix] : "bg-gray-100 text-gray-600";
}

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [debouncedAction, setDebouncedAction] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "activity-logs", page, debouncedAction],
    queryFn: () => fetchLogs(page, debouncedAction),
    staleTime: 30 * 1000,
  });

  const handleSearch = (v: string) => {
    setAction(v);
    clearTimeout((window as unknown as { _aTimer?: ReturnType<typeof setTimeout> })._aTimer);
    (window as unknown as { _aTimer?: ReturnType<typeof setTimeout> })._aTimer = setTimeout(() => { setDebouncedAction(v); setPage(1); }, 400);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-500 text-sm mt-0.5">{data?.pagination.total ?? "–"} total events</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input value={action} onChange={(e) => handleSearch(e.target.value)} placeholder="Filter by action..." className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}</div>
      ) : (
        <>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="divide-y">
              {data?.data.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  No activity logs found
                </div>
              )}
              {data?.data.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5 ${getActionColor(log.action)}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    {log.entityType && (
                      <Badge variant="outline" className="text-xs mr-1.5">{log.entityType}</Badge>
                    )}
                    <span className="font-mono text-xs text-gray-500">{log.userId.slice(0, 20)}…</span>
                    {log.ipAddress && <span className="text-xs text-gray-400 ml-2">{log.ipAddress}</span>}
                  </div>
                  <time className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </time>
                </div>
              ))}
            </div>
          </Card>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Page {data.pagination.page} of {data.pagination.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
