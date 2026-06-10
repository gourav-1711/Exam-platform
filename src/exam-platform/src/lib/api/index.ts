import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import type {
  Announcement,
  CurrentAffair,
  MockTest,
  NcertBook,
  PreviousYearPaper,
  Syllabus,
  StudyNote,
  SupportMessage,
  SupportTicket,
  Subject as DbSubject,
} from "@workspace/db";
import { apiFetch, ApiError } from "./client";
import { adminApi, currentAffairsApi, quizzesApi } from "./endpoints";
import { queryKeys } from "./query-keys";

import type {
  PyqSubject,
  DailyQuiz,
  PyqQuestion,
  QuizDetails,
  MyStreak,
  RecordActivityResponse,
  AdminDashboardStats,
  LeaderboardEntry,
  StudentAttempt,
} from "@/lib/types/api";

export type { LeaderboardEntry } from "@/lib/types/api";
export type { PyqSubject } from "@/lib/types/api";
export type Subject = DbSubject;

export type ListNcertBooksParams = {
  classNum?: number;
  subject?: string;
  medium?: string;
};

// ── Support API Types ────────────────────────────────────────────────────

export interface SupportTicketListItem {
  id: string;
  title: string;
  status: string;
  isReadByUser: boolean;
  lastMessageAt: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketDetail {
  ticket: SupportTicketListItem;
  messages: {
    id: string;
    ticketId: string;
    message: string;
    sender: "user" | "support";
    createdAt: string;
  }[];
}

// ── Helper to build search params ────────────────────────────────────────

function toSearchParams(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function normalizeId(id: string | number): string {
  return String(id).trim();
}

function adminPath(path: string): string {
  return path.startsWith("/api/")
    ? path
    : `/api${path.startsWith("/") ? path : `/${path}`}`;
}

export const customFetch = apiFetch;

// ── Tokenized query/mutation helpers ─────────────────────────────────────

type QueryHookOptions = {
  query?: Record<string, unknown>;
};

type MutationHookOptions = Record<string, unknown>;

function useTokenizedQuery<TData>(
  queryKey: readonly unknown[],
  fetcher: (token?: string) => Promise<TData>,
  options?: QueryHookOptions,
) {
  const { getToken } = useAuth();
  const overrideOptions = options?.query ?? {};

  return useQuery({
    queryKey: (overrideOptions.queryKey as readonly unknown[]) ?? queryKey,
    queryFn: async () => fetcher((await getToken()) ?? undefined),
    enabled: (overrideOptions.enabled as boolean | undefined) ?? true,
  } as UseQueryOptions<TData, Error>);
}

function useTokenizedMutation<TVariables, TData>(
  mutationFn: (variables: TVariables, token?: string) => Promise<TData>,
  _options?: MutationHookOptions,
) {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (variables: TVariables) =>
      mutationFn(variables, (await getToken()) ?? undefined),
  } as UseMutationOptions<TData, Error, TVariables>);
}

// ── Query Key Helper Functions ───────────────────────────────────────────

export function getListAnnouncementsQueryKey() {
  return ["announcements", "list"] as const;
}

export function getGetQuizQueryKey(id: string) {
  return queryKeys.quizzes.detail(id);
}

export function getGetMockTestQueryKey(id: string) {
  return queryKeys.mockTests.detail(id);
}

export function getGetCurrentAffairQueryKey(id: string) {
  return queryKeys.currentAffairs.detail(id);
}

export function getListPyqQuestionsQueryKey(params: {
  subjectId: string;
  page?: number;
}) {
  return queryKeys.pyq.questions(String(params.subjectId), {
    page: params.page ?? 1,
  });
}

// ── Announcements ────────────────────────────────────────────────────────

export function useListAnnouncements(options?: QueryHookOptions) {
  return useTokenizedQuery<Announcement[]>(
    getListAnnouncementsQueryKey(),
    () => apiFetch<Announcement[]>("/announcements"),
    options,
  );
}

// ── Support API ──────────────────────────────────────────────────────────

export function useListSupportTickets(options?: QueryHookOptions) {
  return useTokenizedQuery<SupportTicketListItem[]>(
    ["support", "tickets", "list"] as const,
    () => apiFetch<SupportTicketListItem[]>("/support/tickets"),
    options,
  );
}

export function useSupportTicket(id: string | number, options?: QueryHookOptions) {
  return useTokenizedQuery<SupportTicketDetail>(
    ["support", "tickets", "detail", id] as const,
    () => apiFetch<SupportTicketDetail>(`/support/tickets/${id}`),
    options,
  );
}

export function useCreateSupportTicket(options?: MutationHookOptions) {
  return useTokenizedMutation<
    { title: string; message: string },
    SupportTicketListItem
  >(
    async (body) =>
      apiFetch<SupportTicketListItem>("/support/tickets", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    options,
  );
}

export function useSendSupportTicketMessage(
  id: string | number,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<
    { message: string },
    {
      id: string;
      ticketId: string;
      message: string;
      sender: string;
      createdAt: string;
    }
  >(async (body) => {
    const result = await apiFetch<{
      id: string;
      ticketId: string;
      message: string;
      sender: string;
      createdAt: string;
    }>(`/support/tickets/${id}/messages`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return result;
  }, options);
}

export function useDeleteSupportTicket(options?: MutationHookOptions) {
  return useTokenizedMutation<string, { success: boolean }>(
    async (id) =>
      apiFetch<{ success: boolean }>(`/support/tickets/${id}`, {
        method: "DELETE",
      }),
    options,
  );
}

export function useSupportUnreadCount(options?: QueryHookOptions) {
  return useTokenizedQuery<{ unreadCount: number }>(
    ["support", "unread-count"] as const,
    () => apiFetch<{ unreadCount: number }>("/support/unread-count"),
    options,
  );
}

// ── Admin Support ────────────────────────────────────────────────────────

export function useAdminSupportUnreadCount(options?: QueryHookOptions) {
  return useTokenizedQuery<{ unreadCount: number }>(
    ["admin", "supportTickets", "unread-count"] as const,
    () => apiFetch<{ unreadCount: number }>("/admin/support-tickets/unread-count"),
    options,
  );
}

// ── Study Notes ──────────────────────────────────────────────────────────

export function useListStudyNotes(
  params?: {
    subject?: string;
    medium?: string;
    search?: string;
    page?: number;
  },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{
    data: StudyNote[];
    total: number;
    page: number;
    totalPages: number;
  }>(
    ["studyNotes", "list", params ?? {}] as const,
    () =>
      apiFetch<{
        data: StudyNote[];
        total: number;
        page: number;
        totalPages: number;
      }>("/study-notes" + toSearchParams(params ?? {})),
    options,
  );
}

// ── Syllabus ─────────────────────────────────────────────────────────────

export function useListSyllabus(options?: QueryHookOptions) {
  return useTokenizedQuery<Syllabus[]>(
    ["syllabus", "list"] as const,
    () => apiFetch<Syllabus[]>("/syllabus"),
    options,
  );
}

// ── NCERT Books ──────────────────────────────────────────────────────────

export function useListNcertBooks(
  params?: ListNcertBooksParams,
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{
    data: NcertBook[];
    total: number;
    page: number;
    totalPages: number;
  }>(
    ["ncertBooks", "list", params ?? {}] as const,
    () =>
      apiFetch<{
        data: NcertBook[];
        total: number;
        page: number;
        totalPages: number;
      }>("/ncert-books" + toSearchParams(params ?? {})),
    options,
  );
}

// ── PYPs ─────────────────────────────────────────────────────────────────

export function useListPyp(
  params?: { examName?: string },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<PreviousYearPaper[]>(
    ["pyp", "list", params ?? {}] as const,
    () => apiFetch<PreviousYearPaper[]>("/pyp" + toSearchParams(params ?? {})),
    options,
  );
}

// ── Mock Tests ───────────────────────────────────────────────────────────

export function useListMockTests(options?: QueryHookOptions) {
  return useTokenizedQuery<MockTest[]>(
    queryKeys.mockTests.list(),
    () => apiFetch<MockTest[]>("/mock-tests"),
    options,
  );
}

export function useGetMockTest(id: string, options?: QueryHookOptions) {
  return useTokenizedQuery<MockTest>(
    getGetMockTestQueryKey(id),
    () => apiFetch<MockTest>(`/mock-tests/${normalizeId(id)}`),
    options,
  );
}

// ── Daily Quizzes ────────────────────────────────────────────────────────

export function useGetQuiz(id: string, options?: QueryHookOptions) {
  return useTokenizedQuery<QuizDetails>(
    getGetQuizQueryKey(id),
    () => apiFetch<QuizDetails>(`/daily-quizzes/${normalizeId(id)}`),
    options,
  );
}

// ── Subjects ─────────────────────────────────────────────────────────────

export function useListSubjects(options?: QueryHookOptions) {
  return useTokenizedQuery<PyqSubject[]>(
    queryKeys.subjects.all(),
    () => apiFetch<PyqSubject[]>("/subjects"),
    options,
  );
}

// ── PYQ Questions ────────────────────────────────────────────────────────

export function useListPyqQuestions(
  params: { subjectId: string; page?: number },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{
    data: PyqQuestion[];
    total: number;
    page: number;
    totalPages: number;
  }>(
    getListPyqQuestionsQueryKey(params),
    () =>
      apiFetch<{
        data: PyqQuestion[];
        total: number;
        page: number;
        totalPages: number;
      }>(
        `/pyq/questions${toSearchParams({
          subjectId: params.subjectId,
          page: params.page ?? 1,
        })}`,
      ),
    options,
  );
}

// ── Current Affairs ──────────────────────────────────────────────────────

export function useGetCurrentAffair(id: string, options?: QueryHookOptions) {
  return useTokenizedQuery<CurrentAffair>(
    getGetCurrentAffairQueryKey(id),
    () => apiFetch<CurrentAffair>(`/current-affairs/${encodeURIComponent(id)}`),
    options,
  );
}

export function useCurrentAffair(id: string, options?: QueryHookOptions) {
  return useTokenizedQuery<CurrentAffair>(
    ["admin", "currentAffairs", "detail", normalizeId(id)] as const,
    () => apiFetch<CurrentAffair>(`/admin/current-affairs/${normalizeId(id)}`),
    options,
  );
}

export function useUpdateCurrentAffair(
  id: string,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<Record<string, unknown>, CurrentAffair>(
    async (body) =>
      apiFetch<CurrentAffair>(`/admin/current-affairs/${normalizeId(id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    options,
  );
}

// ── Streaks ──────────────────────────────────────────────────────────────

export function useGetMyStreak(options?: QueryHookOptions) {
  return useTokenizedQuery<MyStreak>(
    queryKeys.streaks.current(),
    () => apiFetch<MyStreak>("/streaks/me"),
    options,
  );
}

export function useGetLeaderboard(
  params?: { limit?: number; period?: string },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<LeaderboardEntry[]>(
    ["stats", "leaderboard", params ?? {}] as const,
    () =>
      apiFetch<LeaderboardEntry[]>(
        `/leaderboard${toSearchParams(params ?? {})}`,
      ),
    options,
  );
}

export function useRecordActivity(options?: MutationHookOptions) {
  return useTokenizedMutation<
    { data: { activityType: string; displayName: string } },
    RecordActivityResponse
  >(
    async (variables) =>
      apiFetch<RecordActivityResponse>("/streaks/activity", {
        method: "POST",
        body: JSON.stringify(variables.data),
      }),
    options,
  );
}

// ── Attempts History ────────────────────────────────────────────────────

export function useSaveAttempt(options?: MutationHookOptions) {
  return useTokenizedMutation<
    {
      examId?: string;
      quizId?: string;
      score: number;
      totalMarks: number;
      correctCount: number;
      wrongCount: number;
      skippedCount: number;
      timeTakenSecs: number;
      isPassed: boolean;
    },
    StudentAttempt
  >(
    async (body) =>
      apiFetch<StudentAttempt>("/attempts", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    options,
  );
}

export function useMyAttempts(options?: QueryHookOptions) {
  return useTokenizedQuery<StudentAttempt[]>(
    ["attempts", "mine"] as const,
    () => apiFetch<StudentAttempt[]>("/attempts/mine"),
    options,
  );
}

// ── Admin Dashboard ──────────────────────────────────────────────────────

export function useAdminDashboard(options?: QueryHookOptions) {
  return useTokenizedQuery<AdminDashboardStats>(
    ["admin", "dashboard", "overview"] as const,
    () => apiFetch<AdminDashboardStats>("/admin/dashboard"),
    options,
  );
}

// ── Admin Daily Quizzes ──────────────────────────────────────────────────

export function useAdminListDailyQuizzes(
  params?: { page?: number; limit?: number },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{
    quizzes: DailyQuiz[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(
    ["admin", "dailyQuizzes", "list", params ?? {}] as const,
    () =>
      apiFetch<{
        quizzes: DailyQuiz[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/admin/daily-quizzes${toSearchParams(params ?? {})}`),
    options,
  );
}

export function useAdminDailyQuiz(
  id: string | number,
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<DailyQuiz>(
    ["admin", "dailyQuizzes", "detail", normalizeId(id)] as const,
    () => apiFetch<DailyQuiz>(`/admin/daily-quizzes/${normalizeId(id)}`),
    options,
  );
}

export function useDeleteDailyQuiz(options?: MutationHookOptions) {
  return useTokenizedMutation<string | number, Record<string, unknown>>(
    async (id) =>
      apiFetch<Record<string, unknown>>(
        `/admin/daily-quizzes/${normalizeId(id)}`,
        { method: "DELETE" },
      ),
    options,
  );
}

export function useCreateDailyQuiz(options?: MutationHookOptions) {
  return useTokenizedMutation<Record<string, unknown>, DailyQuiz>(
    async (body) =>
      apiFetch<DailyQuiz>("/admin/daily-quizzes", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    options,
  );
}

export function useUpdateDailyQuiz(
  id: string | number,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<Record<string, unknown>, DailyQuiz>(
    async (body) =>
      apiFetch<DailyQuiz>(`/admin/daily-quizzes/${normalizeId(id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    options,
  );
}

// ── Admin Support Tickets ────────────────────────────────────────────────

export function useAdminListSupportTickets(
  params?: { page?: number; limit?: number; status?: string; search?: string },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{
    data: SupportTicket[];
    total: number;
    page: number;
    totalPages: number;
  }>(
    ["admin", "supportTickets", "list", params ?? {}] as const,
    () =>
      apiFetch<{
        data: SupportTicket[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/support-tickets${toSearchParams(params ?? {})}`),
    options,
  );
}

export function useAdminSupportTicket(
  id: string | number,
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{
    ticket: SupportTicket;
    messages: SupportMessage[];
  }>(
    ["admin", "supportTickets", "detail", normalizeId(id)] as const,
    () =>
      apiFetch<{
        ticket: SupportTicket;
        messages: SupportMessage[];
      }>(`/admin/support-tickets/${normalizeId(id)}`),
    options,
  );
}

export function useCreateSupportTicketReply(
  id: string | number,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<{ message: string }, SupportMessage>(
    async (body) =>
      apiFetch<SupportMessage>(
        `/admin/support-tickets/${normalizeId(id)}/replies`,
        { method: "POST", body: JSON.stringify(body) },
      ),
    options,
  );
}

export function useUpdateSupportTicketStatus(
  id: string | number,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<string, SupportTicket>(
    async (status) =>
      apiFetch<SupportTicket>(
        `/admin/support-tickets/${normalizeId(id)}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
      ),
    options,
  );
}

export function useAssignSupportTicket(
  id: string | number,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<string, SupportTicket>(
    async (assignedTo) =>
      apiFetch<SupportTicket>(
        `/admin/support-tickets/${normalizeId(id)}/assign`,
        { method: "PATCH", body: JSON.stringify({ assignedTo }) },
      ),
    options,
  );
}

// ── Re-exports ───────────────────────────────────────────────────────────

export { ApiError, adminApi, currentAffairsApi, quizzesApi };

export type { DailyQuiz } from "@/lib/types/api";
export type {
  Announcement,
  CurrentAffair,
  MockTest,
  NcertBook,
  PreviousYearPaper,
  StudyNote,
  SupportMessage,
  SupportTicket,
};
