import { apiFetch } from "./client";
import type { CurrentAffair } from "@workspace/db";

export type AdminAnalyticsResponse = {
  overview: {
    totalQuestions: number;
    activeStudents: number;
    avgScore: number;
    passRate: number;
  };
  dailyAttempts: Array<{
    date: string;
    count: number;
    avgScore: number;
  }>;
  subjectStats: Array<{
    subject: string;
    count: number;
    percent: number;
  }>;
  topScorers: Array<{
    userId: string;
    totalScore: number;
    attempts: number;
  }>;
};

export type AdminActivityLog = {
  id: number;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userId: string;
  ipAddress?: string | null;
  createdAt: string;
};

export type AdminActivityLogsResponse = {
  data: AdminActivityLog[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
};

export type AdminCurrentAffairsResponse = {
  items: CurrentAffair[];
  total: number;
  page: number;
  limit: number;
};

type Paginated<T> = {
  data: T[];
  totalPages: number;
};

// NOTE: For this initial refactor step, we keep endpoint payloads loosely typed.
// After codegen validators are removed, we can tighten types using Drizzle schema types.

// Quizzes
export const quizzesApi = {
  list: (params?: { status?: string }) =>
    apiFetch<any[]>(`/quizzes?${new URLSearchParams(params as any)}`),
};

// ── Current Affairs ──────────────────────────────────────────────────────

export const currentAffairsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiFetch<Paginated<any>>(
      `/current-affairs?${new URLSearchParams(params as any)}`,
    ),

  // Public detail is slug-based for human-readable URLs.
  getById: (id: string | number) =>
    apiFetch<any>(`/current-affairs/${encodeURIComponent(String(id))}`),
};

// ── Admin (auth required) ────────────────────────────────────────────────
export const adminApi = {
  activityLogs: (
    token: string,
    params: { page: number; limit: number; action?: string },
  ): Promise<AdminActivityLogsResponse> => {
    const sp = new URLSearchParams();
    sp.set("page", String(params.page));
    sp.set("limit", String(params.limit));
    if (params.action) sp.set("action", params.action);
    return apiFetch<AdminActivityLogsResponse>(
      `/admin/activity-logs?${sp.toString()}`,
      { token },
    );
  },

  analytics: (token: string) =>
    apiFetch<AdminAnalyticsResponse>(`/admin/analytics`, { token }),

  // Current Affairs (auth required)
  listCurrentAffairs: (
    token: string,
    params: { page: number; limit: number; search?: string; category?: string },
  ): Promise<AdminCurrentAffairsResponse> => {
    const sp = new URLSearchParams();
    // Current API route currently does not support pagination/search.
    // Keep params for frontend contract; server will be updated next.
    sp.set("page", String(params.page));
    sp.set("limit", String(params.limit));
    if (params.search) sp.set("search", params.search);
    if (params.category && params.category !== "All")
      sp.set("category", params.category);
    return apiFetch<AdminCurrentAffairsResponse>(
      `/admin/current-affairs?${sp.toString()}`,
      { token },
    );
  },

  getCurrentAffairsDetail: (token: string, id: number) =>
    apiFetch<CurrentAffair>(`/admin/current-affairs/${id}`, { token }),

  createCurrentAffair: (token: string, body: Record<string, unknown>) =>
    apiFetch<any>(`/admin/current-affairs`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  updateCurrentAffair: (
    token: string,
    id: number,
    body: Record<string, unknown>,
  ) =>
    apiFetch<any>(`/admin/current-affairs/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    }),

  deleteCurrentAffair: (token: string, id: number) =>
    apiFetch<any>(`/admin/current-affairs/${id}`, {
      method: "DELETE",
      token,
    }),
};

// ── Daily quizzes (auth required) ─────────────────────────────────────
// Kept loosely typed until codegen is removed.
export const dailyQuizzesApi = {
  get: (token: string, id: string) =>
    apiFetch<any>(`/admin/daily-quizzes/${id}`, { token }),
  delete: (token: string, id: string) =>
    apiFetch<any>(`/admin/daily-quizzes/${id}`, { method: "DELETE", token }),
};

// Streaks (auth required)

export const streaksApi = {
  get: (token: string) => apiFetch<any>("/streaks", { token }),
};
