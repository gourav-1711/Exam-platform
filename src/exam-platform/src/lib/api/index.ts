import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  Announcement,
  Draft,
  CurrentAffair,
  MockTest,
  NcertBook,
  PreviousYearPaper,
  Quiz,
  Settings,
  Syllabus,
  StudyNote,
  SupportMessage,
  SupportTicket,
  PyqSubject as DbPyqSubject,
} from "@workspace/db";
import { apiFetch, ApiError } from "./client";
import { adminApi, currentAffairsApi, quizzesApi, streaksApi } from "./endpoints";
import { queryKeys } from "./query-keys";
export type PyqSubject = DbPyqSubject;

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  quizCount: number;
  mockCount: number;
  pyqCount: number;
};

export type ListNcertBooksParams = {
  classNum?: number;
  subject?: string;
  medium?: string;
};

export type DailyQuiz = {
  id: number;
  title: string;
  description?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalQuestions: number;
  questionIds: number[];
  isPublished?: boolean | null;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PyqQuestion = {
  id: number;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string | null;
  examLabel: string | null;
};

export type QuizDetails = Omit<Quiz, "createdAt"> & {
  createdAt: string;
  questions: PyqQuestion[];
};

export type MyStreak = {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  quizCount: number;
  mockCount: number;
  pyqCount: number;
  lastActivityDate: string | null;
};

export type RecordActivityResponse = {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  pointsEarned: number;
  streakIncremented: boolean;
};

export type AdminActivityLog = {
  id: number;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userId: string;
  createdAt: string;
};

export type AdminDashboardStats = {
  totalQuestions: number;
  totalExams: number;
  totalAttempts: number;
  passedAttempts: number;
  passPercentage: number;
  recentActivity: AdminActivityLog[];
};

export type DraftItem = Omit<Draft, "content" | "lastSavedAt" | "createdAt"> & {
  content: Record<string, unknown> & {
    title?: string;
    text?: string;
  };
  lastSavedAt: string;
  createdAt: string;
};

type QueryHookOptions = {
  query?: Record<string, any>;
};

type MutationHookOptions = Record<string, any>;

function useTokenizedQuery<TData>(
  queryKey: readonly unknown[],
  fetcher: (token?: string) => Promise<TData>,
  options?: QueryHookOptions,
) {
  const { getToken } = useAuth();
  const query = options?.query ?? {};

  return useQuery({
    ...query,
    queryKey: query.queryKey ?? queryKey,
    queryFn: async () => fetcher((await getToken()) ?? undefined),
  });
}

function useTokenizedMutation<TVariables, TData>(
  mutationFn: (variables: TVariables, token?: string) => Promise<TData>,
  options?: MutationHookOptions,
) {
  const { getToken } = useAuth();

  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) =>
      mutationFn(variables, (await getToken()) ?? undefined),
  });
}

function toSearchParams(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function normalizeId(id: string | number) {
  return String(id).trim();
}

function adminPath(path: string) {
  return path.startsWith("/api/") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`;
}

export const customFetch = apiFetch;

export function getListAnnouncementsQueryKey() {
  return ["announcements", "list"] as const;
}

export function getListSupportMessagesQueryKey() {
  return ["supportMessages", "list"] as const;
}

export function getGetQuizQueryKey(id: number) {
  return queryKeys.quizzes.detail(String(id));
}

export function getGetMockTestQueryKey(id: number) {
  return queryKeys.mockTests.detail(String(id));
}

export function getGetCurrentAffairQueryKey(id: number) {
  return queryKeys.currentAffairs.detail(String(id));
}

export function getListPyqQuestionsQueryKey(params: {
  subjectId: number;
  page?: number;
}) {
  return queryKeys.pyq.questions(String(params.subjectId), {
    page: params.page ?? 1,
  });
}

export function useListAnnouncements(options?: QueryHookOptions) {
  return useTokenizedQuery<Announcement[]>(
    getListAnnouncementsQueryKey(),
    () => apiFetch<Announcement[]>("/announcements"),
    options,
  );
}

export function useListSupportMessages(options?: QueryHookOptions) {
  return useTokenizedQuery<SupportMessage[]>(
    getListSupportMessagesQueryKey(),
    () => apiFetch<SupportMessage[]>("/support/messages"),
    options,
  );
}

export function useSendSupportMessage(options?: MutationHookOptions) {
  return useTokenizedMutation<{ data: { message: string } }, SupportMessage>(
    async (variables) =>
      apiFetch<SupportMessage>("/support/messages", {
        method: "POST",
        body: JSON.stringify(variables.data),
      }),
    options,
  );
}

export function useListStudyNotes(
  params?: { subject?: string; medium?: string; search?: string; page?: number },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{ data: StudyNote[]; total: number; page: number; totalPages: number }>(
    ["studyNotes", "list", params ?? {}] as const,
    () =>
      apiFetch<{ data: StudyNote[]; total: number; page: number; totalPages: number }>(
        "/study-notes" + toSearchParams(params ?? {}),
      ),
    options,
  );
}

export function useListSyllabus(options?: QueryHookOptions) {
  return useTokenizedQuery<Syllabus[]>(
    ["syllabus", "list"] as const,
    () => apiFetch<Syllabus[]>("/syllabus"),
    options,
  );
}

export function useListNcertBooks(
  params?: ListNcertBooksParams,
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<NcertBook[]>(
    ["ncertBooks", "list", params ?? {}] as const,
    () => apiFetch<NcertBook[]>("/ncert-books" + toSearchParams(params ?? {})),
    options,
  );
}

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

export function useListMockTests(options?: QueryHookOptions) {
  return useTokenizedQuery<MockTest[]>(
    queryKeys.mockTests.list(),
    () => apiFetch<MockTest[]>("/mock-tests"),
    options,
  );
}

export function useGetMockTest(id: number, options?: QueryHookOptions) {
  return useTokenizedQuery<MockTest>(
    getGetMockTestQueryKey(id),
    () => apiFetch<MockTest>(`/mock-tests/${normalizeId(id)}`),
    options,
  );
}

export function useGetQuiz(id: number, options?: QueryHookOptions) {
  return useTokenizedQuery<QuizDetails>(
    getGetQuizQueryKey(id),
    () => apiFetch<QuizDetails>(`/quizzes/${normalizeId(id)}`),
    options,
  );
}

export function useListPyqSubjects(options?: QueryHookOptions) {
  return useTokenizedQuery<PyqSubject[]>(
    queryKeys.pyq.subjects(),
    () => apiFetch<PyqSubject[]>(adminPath("/admin/pyq-subjects")),
    options,
  );
}

export function useListPyqQuestions(
  params: { subjectId: number; page?: number },
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

export function useGetCurrentAffair(id: number, options?: QueryHookOptions) {
  return useTokenizedQuery<CurrentAffair>(
    getGetCurrentAffairQueryKey(id),
    () => apiFetch<CurrentAffair>(`/current-affairs/${normalizeId(id)}`),
    options,
  );
}

export function useCurrentAffair(id: number, options?: QueryHookOptions) {
  return useTokenizedQuery<CurrentAffair>(
    ["admin", "currentAffairs", "detail", normalizeId(id)] as const,
    () => apiFetch<CurrentAffair>(`/admin/current-affairs/${normalizeId(id)}`),
    options,
  );
}

export function useUpdateCurrentAffair(id: number, options?: MutationHookOptions) {
  return useTokenizedMutation<Record<string, unknown>, CurrentAffair>(
    async (body) =>
      apiFetch<CurrentAffair>(`/admin/current-affairs/${normalizeId(id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    options,
  );
}

export function useGetMyStreak(options?: QueryHookOptions) {
  return useTokenizedQuery<MyStreak>(
    queryKeys.streaks.current(),
    () => apiFetch<MyStreak>("/streaks/me"),
    options,
  );
}

export function useGetLeaderboard(params?: { limit?: number }, options?: QueryHookOptions) {
  return useTokenizedQuery<LeaderboardEntry[]>(
    ["stats", "leaderboard", params ?? {}] as const,
    () => apiFetch<LeaderboardEntry[]>(`/leaderboard${toSearchParams(params ?? {})}`),
    options,
  );
}

export function useRecordActivity(options?: MutationHookOptions) {
  return useTokenizedMutation<
    { data: { activityType: string; displayName: string } },
    RecordActivityResponse
  >(async (variables) =>
    apiFetch<RecordActivityResponse>("/streaks/activity", {
      method: "POST",
      body: JSON.stringify(variables.data),
    }),
  options);
}

export function useAdminDashboard(options?: QueryHookOptions) {
  return useTokenizedQuery<AdminDashboardStats>(
    ["admin", "dashboard", "overview"] as const,
    () => apiFetch<AdminDashboardStats>("/admin/dashboard"),
    options,
  );
}

export function useAdminSettings(options?: QueryHookOptions) {
  return useTokenizedQuery<Settings>(
    ["admin", "settings"] as const,
    () => apiFetch<Settings>("/admin/settings"),
    options,
  );
}

export function useUpdateSettings(options?: MutationHookOptions) {
  return useTokenizedMutation<Record<string, unknown>, Settings>(
    async (body) =>
      apiFetch<Settings>("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    options,
  );
}

export function useAdminListDrafts(options?: QueryHookOptions) {
  return useTokenizedQuery<DraftItem[]>(
    ["admin", "drafts", "list"] as const,
    () => apiFetch<DraftItem[]>("/admin/drafts"),
    options,
  );
}

export function useDeleteDraft(options?: MutationHookOptions) {
  return useTokenizedMutation<number, { success: boolean }>(
    async (id) =>
      apiFetch<{ success: boolean }>(`/admin/drafts/${normalizeId(id)}`, {
        method: "DELETE",
      }),
    options,
  );
}

export function useAdminListDailyQuizzes(
  params?: { page?: number; limit?: number },
  options?: QueryHookOptions,
) {
  return useTokenizedQuery<{ quizzes: DailyQuiz[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
    ["admin", "dailyQuizzes", "list", params ?? {}] as const,
    () =>
      apiFetch<{
        quizzes: DailyQuiz[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/admin/daily-quizzes${toSearchParams(params ?? {})}`),
    options,
  );
}

export function useAdminDailyQuiz(id: string | number, options?: QueryHookOptions) {
  return useTokenizedQuery<DailyQuiz>(
    ["admin", "dailyQuizzes", "detail", normalizeId(id)] as const,
    () => apiFetch<DailyQuiz>(`/admin/daily-quizzes/${normalizeId(id)}`),
    options,
  );
}

export function useDeleteDailyQuiz(options?: MutationHookOptions) {
  return useTokenizedMutation<string | number, Record<string, unknown>>(
    async (id) =>
      apiFetch<Record<string, unknown>>(`/admin/daily-quizzes/${normalizeId(id)}`, {
        method: "DELETE",
      }),
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

export function useUpdateDailyQuiz(id: string | number, options?: MutationHookOptions) {
  return useTokenizedMutation<Record<string, unknown>, DailyQuiz>(
    async (body) =>
      apiFetch<DailyQuiz>(`/admin/daily-quizzes/${normalizeId(id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    options,
  );
}

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

export function useAdminSupportTicket(id: string | number, options?: QueryHookOptions) {
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

export function useCreateSupportTicketReply(id: string | number, options?: MutationHookOptions) {
  return useTokenizedMutation<{ message: string }, SupportMessage>(
    async (body) =>
      apiFetch<SupportMessage>(`/admin/support-tickets/${normalizeId(id)}/replies`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    options,
  );
}

export function useUpdateSupportTicketStatus(
  id: string | number,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<string, SupportTicket>(
    async (status) =>
      apiFetch<SupportTicket>(`/admin/support-tickets/${normalizeId(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    options,
  );
}

export function useAssignSupportTicket(
  id: string | number,
  options?: MutationHookOptions,
) {
  return useTokenizedMutation<string, SupportTicket>(
    async (assignedTo) =>
      apiFetch<SupportTicket>(`/admin/support-tickets/${normalizeId(id)}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ assignedTo }),
      }),
    options,
  );
}

export { ApiError, adminApi, currentAffairsApi, quizzesApi, streaksApi };
export type {
  Announcement,
  CurrentAffair,
  MockTest,
  NcertBook,
  PreviousYearPaper,
  Quiz,
  Settings,
  StudyNote,
  SupportMessage,
  SupportTicket,
};
