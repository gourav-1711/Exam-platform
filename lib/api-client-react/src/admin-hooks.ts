import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import { Announcement, CurrentAffair, Quiz, MockTest, StudyNote, NcertBook, SupportMessage, SupportMessageInput } from "./generated/api.schemas";

// --- TYPES ---
export interface AdminActivityLog {
  id: number;
  userId: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalQuestions: number;
  totalExams: number;
  totalAttempts: number;
  passedAttempts: number;
  passPercentage: number;
  recentActivity: AdminActivityLog[];
}

export interface AdminAnalyticsData {
  overview: {
    totalQuestions: number;
    totalExams: number;
    totalQuizzes: number;
    totalAttempts: number;
    activeStudents: number;
    avgScore: number;
    passRate: number;
  };
  subjectStats: {
    subject: string;
    count: number;
  }[];
  dailyAttempts: {
    date: string;
    count: number;
    avgScore: number;
  }[];
  topScorers: {
    userId: string;
    totalScore: number;
    attempts: number;
  }[];
}

export interface AppSettings {
  id: number;
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  leaderboardEnabled: boolean;
  quizEnabled: boolean;
  currentAffairsEnabled: boolean;
  registrationEnabled: boolean;
  updatedAt: string;
}

export interface AppSettingsInput {
  siteName?: string;
  siteDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  maintenanceMode?: boolean;
  leaderboardEnabled?: boolean;
  quizEnabled?: boolean;
  currentAffairsEnabled?: boolean;
  registrationEnabled?: boolean;
}

export interface AdminDraft {
  id: number;
  resourceType: string;
  resourceId: number | null;
  createdBy: string;
  content: any;
  lastSavedAt: string;
  createdAt: string;
}

export interface AdminDraftInput {
  resourceType: string;
  resourceId?: number | null;
  content: any;
}

export interface SupportTicket {
  id: number;
  userId: string;
  title: string;
  status: "open" | "pending" | "resolved" | "closed";
  category: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketsList {
  data: SupportTicket[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SupportTicketThread {
  ticket: SupportTicket;
  messages: SupportMessage[];
}

export interface AdminActivityLogsList {
  data: AdminActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminSuccessResponse {
  success: boolean;
}

// --- API FUNCTIONS ---
const getAdminDashboard = () => customFetch<AdminDashboardStats>("/api/admin/dashboard", { method: "GET" });
const getAdminAnalytics = () => customFetch<AdminAnalyticsData>("/api/admin/analytics", { method: "GET" });
const getAdminSettings = () => customFetch<AppSettings>("/api/admin/settings", { method: "GET" });
const updateAdminSettings = (data: AppSettingsInput) => customFetch<AppSettings>("/api/admin/settings", { method: "PATCH", body: JSON.stringify(data) });

const getAdminAnnouncements = () => customFetch<Announcement[]>("/api/admin/announcements", { method: "GET" });
const getAdminAnnouncement = (id: number) => customFetch<Announcement>(`/api/admin/announcements/${id}`, { method: "GET" });
const createAdminAnnouncement = (data: Announcement) => customFetch<Announcement>("/api/admin/announcements", { method: "POST", body: JSON.stringify(data) });
const updateAdminAnnouncement = (id: number, data: Partial<Announcement>) => customFetch<Announcement>(`/api/admin/announcements/${id}`, { method: "PATCH", body: JSON.stringify(data) });
const deleteAdminAnnouncement = (id: number) => customFetch<AdminSuccessResponse>(`/api/admin/announcements/${id}`, { method: "DELETE" });

const getAdminCurrentAffairs = () => customFetch<CurrentAffair[]>("/api/admin/current-affairs", { method: "GET" });
const getAdminCurrentAffair = (id: number) => customFetch<CurrentAffair>(`/api/admin/current-affairs/${id}`, { method: "GET" });
const createAdminCurrentAffair = (data: CurrentAffair) => customFetch<CurrentAffair>("/api/admin/current-affairs", { method: "POST", body: JSON.stringify(data) });
const updateAdminCurrentAffair = (id: number, data: Partial<CurrentAffair>) => customFetch<CurrentAffair>(`/api/admin/current-affairs/${id}`, { method: "PATCH", body: JSON.stringify(data) });
const deleteAdminCurrentAffair = (id: number) => customFetch<AdminSuccessResponse>(`/api/admin/current-affairs/${id}`, { method: "DELETE" });

const getAdminQuizzes = () => customFetch<Quiz[]>("/api/admin/quizzes", { method: "GET" });
const getAdminQuiz = (id: number) => customFetch<Quiz>(`/api/admin/quizzes/${id}`, { method: "GET" });
const createAdminQuiz = (data: Quiz) => customFetch<Quiz>("/api/admin/quizzes", { method: "POST", body: JSON.stringify(data) });
const updateAdminQuiz = (id: number, data: Partial<Quiz>) => customFetch<Quiz>(`/api/admin/quizzes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
const deleteAdminQuiz = (id: number) => customFetch<AdminSuccessResponse>(`/api/admin/quizzes/${id}`, { method: "DELETE" });

const getAdminMockTests = () => customFetch<MockTest[]>("/api/admin/mock-tests", { method: "GET" });
const getAdminMockTest = (id: number) => customFetch<MockTest>(`/api/admin/mock-tests/${id}`, { method: "GET" });
const createAdminMockTest = (data: MockTest) => customFetch<MockTest>("/api/admin/mock-tests", { method: "POST", body: JSON.stringify(data) });
const updateAdminMockTest = (id: number, data: Partial<MockTest>) => customFetch<MockTest>(`/api/admin/mock-tests/${id}`, { method: "PATCH", body: JSON.stringify(data) });
const deleteAdminMockTest = (id: number) => customFetch<AdminSuccessResponse>(`/api/admin/mock-tests/${id}`, { method: "DELETE" });

const getAdminStudyNotes = () => customFetch<StudyNote[]>("/api/admin/study-notes", { method: "GET" });
const getAdminStudyNote = (id: number) => customFetch<StudyNote>(`/api/admin/study-notes/${id}`, { method: "GET" });
const createAdminStudyNote = (data: StudyNote) => customFetch<StudyNote>("/api/admin/study-notes", { method: "POST", body: JSON.stringify(data) });
const updateAdminStudyNote = (id: number, data: Partial<StudyNote>) => customFetch<StudyNote>(`/api/admin/study-notes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
const deleteAdminStudyNote = (id: number) => customFetch<AdminSuccessResponse>(`/api/admin/study-notes/${id}`, { method: "DELETE" });

const getAdminNcertBooks = () => customFetch<NcertBook[]>("/api/admin/ncert-books", { method: "GET" });
const getAdminNcertBook = (id: number) => customFetch<NcertBook>(`/api/admin/ncert-books/${id}`, { method: "GET" });
const createAdminNcertBook = (data: NcertBook) => customFetch<NcertBook>("/api/admin/ncert-books", { method: "POST", body: JSON.stringify(data) });
const updateAdminNcertBook = (id: number, data: Partial<NcertBook>) => customFetch<NcertBook>(`/api/admin/ncert-books/${id}`, { method: "PATCH", body: JSON.stringify(data) });
const deleteAdminNcertBook = (id: number) => customFetch<AdminSuccessResponse>(`/api/admin/ncert-books/${id}`, { method: "DELETE" });

const getAdminDrafts = (params?: { resourceType?: string }) => {
  const url = params?.resourceType ? `/api/admin/drafts?resourceType=${params.resourceType}` : "/api/admin/drafts";
  return customFetch<AdminDraft[]>(url, { method: "GET" });
};
const getAdminDraft = (id: number) => customFetch<AdminDraft>(`/api/admin/drafts/${id}`, { method: "GET" });
const createAdminDraft = (data: AdminDraftInput) => customFetch<AdminDraft>("/api/admin/drafts", { method: "POST", body: JSON.stringify(data) });
const updateAdminDraft = (id: number, data: AdminDraftInput) => customFetch<AdminDraft>(`/api/admin/drafts/${id}`, { method: "PATCH", body: JSON.stringify(data) });
const deleteAdminDraft = (id: number) => customFetch<AdminSuccessResponse>(`/api/admin/drafts/${id}`, { method: "DELETE" });

const getAdminSupportTickets = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  const qStr = queryParams.toString();
  const url = qStr ? `/api/admin/support-tickets?${qStr}` : "/api/admin/support-tickets";
  return customFetch<SupportTicketsList>(url, { method: "GET" });
};
const getAdminSupportTicket = (id: number) => customFetch<SupportTicketThread>(`/api/admin/support-tickets/${id}`, { method: "GET" });
const createAdminSupportTicketReply = (id: number, data: SupportMessageInput) => customFetch<SupportMessage>(`/api/admin/support-tickets/${id}/replies`, { method: "POST", body: JSON.stringify(data) });
const updateAdminSupportTicketStatus = (id: number, data: { status: string }) => customFetch<SupportTicket>(`/api/admin/support-tickets/${id}/status`, { method: "PATCH", body: JSON.stringify(data) });
const assignAdminSupportTicket = (id: number, data: { assignedTo: string }) => customFetch<SupportTicket>(`/api/admin/support-tickets/${id}/assign`, { method: "PATCH", body: JSON.stringify(data) });

const getAdminActivityLogs = (params?: { page?: number; limit?: number; userId?: string; action?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.userId) queryParams.append("userId", params.userId);
  if (params?.action) queryParams.append("action", params.action);
  const qStr = queryParams.toString();
  const url = qStr ? `/api/admin/activity-logs?${qStr}` : "/api/admin/activity-logs";
  return customFetch<AdminActivityLogsList>(url, { method: "GET" });
};

export const getDailyQuizById = (id: string | number) => customFetch<any>(`/api/admin/daily-quiz/${id}`, { method: "GET" });

// --- HOOKS ---

// --- DASHBOARD & ANALYTICS ---
export function useAdminDashboard(): UseQueryResult<AdminDashboardStats, Error> {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 30000,
  });
}

export function useAdminAnalytics(): UseQueryResult<AdminAnalyticsData, Error> {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: getAdminAnalytics,
    staleTime: 60000,
  });
}

// --- SETTINGS ---
export function useAdminSettings(): UseQueryResult<AppSettings, Error> {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getAdminSettings,
    staleTime: 300000,
  });
}

export function useUpdateSettings(): UseMutationResult<AppSettings, Error, AppSettingsInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}

// --- ANNOUNCEMENTS ---
export function useAdminListAnnouncements(): UseQueryResult<Announcement[], Error> {
  return useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: getAdminAnnouncements,
  });
}

export function useAdminAnnouncement(id: number): UseQueryResult<Announcement, Error> {
  return useQuery({
    queryKey: ["admin", "announcements", id],
    queryFn: () => getAdminAnnouncement(id),
    enabled: !!id,
  });
}

export function useCreateAnnouncement(): UseMutationResult<Announcement, Error, Announcement> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
}

export function useUpdateAnnouncement(id: number): UseMutationResult<Announcement, Error, Partial<Announcement>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Announcement>) => updateAdminAnnouncement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
      qc.invalidateQueries({ queryKey: ["admin", "announcements", id] });
    },
  });
}

export function useDeleteAnnouncement(): UseMutationResult<AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
}

// --- CURRENT AFFAIRS ---
export const fetchCurrentAffairs = async (): Promise<CurrentAffair[]> => {
  return customFetch('/api/current-affairs', { method: 'GET' });
};

export const fetchCurrentAffair = async (id: number): Promise<CurrentAffair> => {
  return customFetch(`/api/current-affairs/${id}`, { method: 'GET' });
};

export const createCurrentAffair = async (data: Omit<CurrentAffair, 'id'>): Promise<CurrentAffair> => {
  return customFetch('/api/current-affairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updateCurrentAffair = async (id: number, data: Partial<CurrentAffair>): Promise<CurrentAffair> => {
  return customFetch(`/api/current-affairs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteCurrentAffair = async (id: number): Promise<void> => {
  return customFetch(`/api/current-affairs/${id}`, { method: 'DELETE' });
};

export const useCurrentAffairs = () => {
  return useQuery<CurrentAffair[], Error>({
    queryKey: ['current-affairs'],
    queryFn: fetchCurrentAffairs,
    staleTime: 60_000,
  });
};

export const useCurrentAffair = (id: number) => {
  return useQuery<CurrentAffair, Error>({
    queryKey: ['current-affair', id],
    queryFn: () => fetchCurrentAffair(id),
    enabled: !!id,
  });
};

export const useCreateCurrentAffair = () => {
  const qc = useQueryClient();
  return useMutation<CurrentAffair, Error, Omit<CurrentAffair, 'id'>>({
    mutationFn: createCurrentAffair,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['current-affairs'] }),
  });
};

export const useUpdateCurrentAffair = (id: number) => {
  const qc = useQueryClient();
  return useMutation<CurrentAffair, Error, Partial<CurrentAffair>>({
    mutationFn: (data: Partial<CurrentAffair>) => updateCurrentAffair(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['current-affair', id] }),
  });
};

export const useDeleteCurrentAffair = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteCurrentAffair,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['current-affairs'] }),
  });
}
// --- QUIZZES ---
export function useAdminListQuizzes(): UseQueryResult<Quiz[], Error> {
  return useQuery({
    queryKey: ["admin", "quizzes"],
    queryFn: getAdminQuizzes,
  });
}

export function useAdminQuiz(id: number): UseQueryResult<Quiz, Error> {
  return useQuery({
    queryKey: ["admin", "quizzes", id],
    queryFn: () => getAdminQuiz(id),
    enabled: !!id,
  });
}

export function useCreateQuiz(): UseMutationResult<Quiz, Error, Quiz> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminQuiz,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    },
  });
}

export function useUpdateQuiz(id: number): UseMutationResult<Quiz, Error, Partial<Quiz>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Quiz>) => updateAdminQuiz(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes", id] });
    },
  });
}

export function useDeleteQuiz(): UseMutationResult<AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminQuiz,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    },
  });
}

// --- MOCK TESTS ---
export function useAdminListMockTests(): UseQueryResult<MockTest[], Error> {
  return useQuery({
    queryKey: ["admin", "mock-tests"],
    queryFn: getAdminMockTests,
  });
}

export function useAdminMockTest(id: number): UseQueryResult<MockTest, Error> {
  return useQuery({
    queryKey: ["admin", "mock-tests", id],
    queryFn: () => getAdminMockTest(id),
    enabled: !!id,
  });
}

export function useCreateMockTest(): UseMutationResult<MockTest, Error, MockTest> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminMockTest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
    },
  });
}

export function useUpdateMockTest(id: number): UseMutationResult<MockTest, Error, Partial<MockTest>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MockTest>) => updateAdminMockTest(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests", id] });
    },
  });
}

export function useDeleteMockTest(): UseMutationResult<AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminMockTest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
    },
  });
}

// --- STUDY NOTES ---
export function useAdminListStudyNotes(): UseQueryResult<StudyNote[], Error> {
  return useQuery({
    queryKey: ["admin", "study-notes"],
    queryFn: getAdminStudyNotes,
  });
}

export function useAdminStudyNote(id: number): UseQueryResult<StudyNote, Error> {
  return useQuery({
    queryKey: ["admin", "study-notes", id],
    queryFn: () => getAdminStudyNote(id),
    enabled: !!id,
  });
}

export function useCreateStudyNote(): UseMutationResult<StudyNote, Error, StudyNote> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminStudyNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
    },
  });
}

export function useUpdateStudyNote(id: number): UseMutationResult<StudyNote, Error, Partial<StudyNote>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StudyNote>) => updateAdminStudyNote(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
      qc.invalidateQueries({ queryKey: ["admin", "study-notes", id] });
    },
  });
}

export function useDeleteStudyNote(): UseMutationResult<AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminStudyNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
    },
  });
}

// --- NCERT BOOKS ---
export function useAdminListNcertBooks(): UseQueryResult<NcertBook[], Error> {
  return useQuery({
    queryKey: ["admin", "ncert-books"],
    queryFn: getAdminNcertBooks,
  });
}

export function useAdminNcertBook(id: number): UseQueryResult<NcertBook, Error> {
  return useQuery({
    queryKey: ["admin", "ncert-books", id],
    queryFn: () => getAdminNcertBook(id),
    enabled: !!id,
  });
}

export function useCreateNcertBook(): UseMutationResult<NcertBook, Error, NcertBook> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminNcertBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books"] });
    },
  });
}

export function useUpdateNcertBook(id: number): UseMutationResult<NcertBook, Error, Partial<NcertBook>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NcertBook>) => updateAdminNcertBook(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books"] });
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books", id] });
    },
  });
}

export function useDeleteNcertBook(): UseMutationResult<AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminNcertBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books"] });
    },
  });
}

// --- DRAFTS ---
export function useAdminListDrafts(resourceType?: string): UseQueryResult<AdminDraft[], Error> {
  return useQuery({
    queryKey: ["admin", "drafts", resourceType],
    queryFn: () => getAdminDrafts({ resourceType }),
  });
}

export function useAdminDraft(id: number): UseQueryResult<AdminDraft, Error> {
  return useQuery({
    queryKey: ["admin", "drafts", "item", id],
    queryFn: () => getAdminDraft(id),
    enabled: !!id,
  });
}

export function useCreateDraft(): UseMutationResult<AdminDraft, Error, AdminDraftInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminDraft,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "drafts"] });
    },
  });
}

export function useUpdateDraft(id: number): UseMutationResult<AdminDraft, Error, AdminDraftInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminDraftInput) => updateAdminDraft(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "drafts"] });
      qc.invalidateQueries({ queryKey: ["admin", "drafts", "item", id] });
    },
  });
}

export function useDeleteDraft(): UseMutationResult<AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminDraft,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "drafts"] });
    },
  });
}

// --- SUPPORT TICKETS ---
export function useAdminListSupportTickets(params?: { page?: number; limit?: number; status?: string; search?: string }): UseQueryResult<SupportTicketsList, Error> {
  return useQuery({
    queryKey: ["admin", "support-tickets", params],
    queryFn: () => getAdminSupportTickets(params),
  });
}

export function useAdminSupportTicket(id: number): UseQueryResult<SupportTicketThread, Error> {
  return useQuery({
    queryKey: ["admin", "support-tickets", id],
    queryFn: () => getAdminSupportTicket(id),
    enabled: !!id,
  });
}

export function useCreateSupportTicketReply(id: number): UseMutationResult<SupportMessage, Error, SupportMessageInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SupportMessageInput) => createAdminSupportTicketReply(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets", id] });
    },
  });
}

export function useUpdateSupportTicketStatus(id: number): UseMutationResult<SupportTicket, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateAdminSupportTicketStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets", id] });
    },
  });
}

export function useAssignSupportTicket(id: number): UseMutationResult<SupportTicket, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignedTo: string) => assignAdminSupportTicket(id, { assignedTo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets", id] });
    },
  });
}

// --- AUDIT LOGS ---
export function useAdminActivityLogs(params?: { page?: number; limit?: number; userId?: string; action?: string }): UseQueryResult<AdminActivityLogsList, Error> {
  return useQuery({
    queryKey: ["admin", "activity-logs", params],
    queryFn: () => getAdminActivityLogs(params),
  });
}