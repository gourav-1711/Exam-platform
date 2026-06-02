import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import * as api from "./generated/api";
import * as schemas from "./generated/api.schemas";

// --- DASHBOARD & ANALYTICS ---
export function useAdminDashboard(): UseQueryResult<schemas.AdminDashboardStats, Error> {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.getAdminDashboard(),
    staleTime: 30000,
  });
}

export function useAdminAnalytics(): UseQueryResult<schemas.AdminAnalyticsData, Error> {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.getAdminAnalytics(),
    staleTime: 60000,
  });
}

// --- SETTINGS ---
export function useAdminSettings(): UseQueryResult<schemas.AppSettings, Error> {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => api.getAdminSettings(),
    staleTime: 300000,
  });
}

export function useUpdateSettings(): UseMutationResult<schemas.AppSettings, Error, schemas.AppSettingsInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.AppSettingsInput) => api.updateAdminSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}

// --- ANNOUNCEMENTS ---
export function useAdminListAnnouncements(): UseQueryResult<schemas.Announcement[], Error> {
  return useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () => api.getAdminAnnouncements(),
  });
}

export function useAdminAnnouncement(id: number): UseQueryResult<schemas.Announcement, Error> {
  return useQuery({
    queryKey: ["admin", "announcements", id],
    queryFn: () => api.getAdminAnnouncement(id),
    enabled: !!id,
  });
}

export function useCreateAnnouncement(): UseMutationResult<schemas.Announcement, Error, schemas.Announcement> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.Announcement) => api.createAdminAnnouncement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
}

export function useUpdateAnnouncement(id: number): UseMutationResult<schemas.Announcement, Error, Partial<schemas.Announcement>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<schemas.Announcement>) => api.updateAdminAnnouncement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
      qc.invalidateQueries({ queryKey: ["admin", "announcements", id] });
    },
  });
}

export function useDeleteAnnouncement(): UseMutationResult<schemas.AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
}

// --- CURRENT AFFAIRS ---
export function useAdminListCurrentAffairs(): UseQueryResult<schemas.CurrentAffair[], Error> {
  return useQuery({
    queryKey: ["admin", "current-affairs"],
    queryFn: () => api.getAdminCurrentAffairs(),
  });
}

export function useAdminCurrentAffair(id: number): UseQueryResult<schemas.CurrentAffair, Error> {
  return useQuery({
    queryKey: ["admin", "current-affairs", id],
    queryFn: () => api.getAdminCurrentAffair(id),
    enabled: !!id,
  });
}

export function useCreateCurrentAffair(): UseMutationResult<schemas.CurrentAffair, Error, schemas.CurrentAffair> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.CurrentAffair) => api.createAdminCurrentAffair(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "current-affairs"] });
    },
  });
}

export function useUpdateCurrentAffair(id: number): UseMutationResult<schemas.CurrentAffair, Error, Partial<schemas.CurrentAffair>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<schemas.CurrentAffair>) => api.updateAdminCurrentAffair(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "current-affairs"] });
      qc.invalidateQueries({ queryKey: ["admin", "current-affairs", id] });
    },
  });
}

export function useDeleteCurrentAffair(): UseMutationResult<schemas.AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminCurrentAffair(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "current-affairs"] });
    },
  });
}

// --- QUIZZES ---
export function useAdminListQuizzes(): UseQueryResult<schemas.Quiz[], Error> {
  return useQuery({
    queryKey: ["admin", "quizzes"],
    queryFn: () => api.getAdminQuizzes(),
  });
}

export function useAdminQuiz(id: number): UseQueryResult<schemas.Quiz, Error> {
  return useQuery({
    queryKey: ["admin", "quizzes", id],
    queryFn: () => api.getAdminQuiz(id),
    enabled: !!id,
  });
}

export function useCreateQuiz(): UseMutationResult<schemas.Quiz, Error, schemas.Quiz> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.Quiz) => api.createAdminQuiz(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    },
  });
}

export function useUpdateQuiz(id: number): UseMutationResult<schemas.Quiz, Error, Partial<schemas.Quiz>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<schemas.Quiz>) => api.updateAdminQuiz(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes", id] });
    },
  });
}

export function useDeleteQuiz(): UseMutationResult<schemas.AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminQuiz(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    },
  });
}

// --- MOCK TESTS ---
export function useAdminListMockTests(): UseQueryResult<schemas.MockTest[], Error> {
  return useQuery({
    queryKey: ["admin", "mock-tests"],
    queryFn: () => api.getAdminMockTests(),
  });
}

export function useAdminMockTest(id: number): UseQueryResult<schemas.MockTest, Error> {
  return useQuery({
    queryKey: ["admin", "mock-tests", id],
    queryFn: () => api.getAdminMockTest(id),
    enabled: !!id,
  });
}

export function useCreateMockTest(): UseMutationResult<schemas.MockTest, Error, schemas.MockTest> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.MockTest) => api.createAdminMockTest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
    },
  });
}

export function useUpdateMockTest(id: number): UseMutationResult<schemas.MockTest, Error, Partial<schemas.MockTest>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<schemas.MockTest>) => api.updateAdminMockTest(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests", id] });
    },
  });
}

export function useDeleteMockTest(): UseMutationResult<schemas.AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminMockTest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
    },
  });
}

// --- STUDY NOTES ---
export function useAdminListStudyNotes(): UseQueryResult<schemas.StudyNote[], Error> {
  return useQuery({
    queryKey: ["admin", "study-notes"],
    queryFn: () => api.getAdminStudyNotes(),
  });
}

export function useAdminStudyNote(id: number): UseQueryResult<schemas.StudyNote, Error> {
  return useQuery({
    queryKey: ["admin", "study-notes", id],
    queryFn: () => api.getAdminStudyNote(id),
    enabled: !!id,
  });
}

export function useCreateStudyNote(): UseMutationResult<schemas.StudyNote, Error, schemas.StudyNote> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.StudyNote) => api.createAdminStudyNote(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
    },
  });
}

export function useUpdateStudyNote(id: number): UseMutationResult<schemas.StudyNote, Error, Partial<schemas.StudyNote>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<schemas.StudyNote>) => api.updateAdminStudyNote(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
      qc.invalidateQueries({ queryKey: ["admin", "study-notes", id] });
    },
  });
}

export function useDeleteStudyNote(): UseMutationResult<schemas.AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminStudyNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
    },
  });
}

// --- NCERT BOOKS ---
export function useAdminListNcertBooks(): UseQueryResult<schemas.NcertBook[], Error> {
  return useQuery({
    queryKey: ["admin", "ncert-books"],
    queryFn: () => api.getAdminNcertBooks(),
  });
}

export function useAdminNcertBook(id: number): UseQueryResult<schemas.NcertBook, Error> {
  return useQuery({
    queryKey: ["admin", "ncert-books", id],
    queryFn: () => api.getAdminNcertBook(id),
    enabled: !!id,
  });
}

export function useCreateNcertBook(): UseMutationResult<schemas.NcertBook, Error, schemas.NcertBook> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.NcertBook) => api.createAdminNcertBook(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books"] });
    },
  });
}

export function useUpdateNcertBook(id: number): UseMutationResult<schemas.NcertBook, Error, Partial<schemas.NcertBook>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<schemas.NcertBook>) => api.updateAdminNcertBook(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books"] });
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books", id] });
    },
  });
}

export function useDeleteNcertBook(): UseMutationResult<schemas.AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminNcertBook(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "ncert-books"] });
    },
  });
}

// --- DRAFTS ---
export function useAdminListDrafts(resourceType?: string): UseQueryResult<schemas.AdminDraft[], Error> {
  return useQuery({
    queryKey: ["admin", "drafts", resourceType],
    queryFn: () => api.getAdminDrafts({ resourceType }),
  });
}

export function useAdminDraft(id: number): UseQueryResult<schemas.AdminDraft, Error> {
  return useQuery({
    queryKey: ["admin", "drafts", "item", id],
    queryFn: () => api.getAdminDraft(id),
    enabled: !!id,
  });
}

export function useCreateDraft(): UseMutationResult<schemas.AdminDraft, Error, schemas.AdminDraftInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.AdminDraftInput) => api.createAdminDraft(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "drafts"] });
    },
  });
}

export function useUpdateDraft(id: number): UseMutationResult<schemas.AdminDraft, Error, schemas.AdminDraftInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.AdminDraftInput) => api.updateAdminDraft(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "drafts"] });
      qc.invalidateQueries({ queryKey: ["admin", "drafts", "item", id] });
    },
  });
}

export function useDeleteDraft(): UseMutationResult<schemas.AdminSuccessResponse, Error, number> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminDraft(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "drafts"] });
    },
  });
}

// --- SUPPORT TICKETS ---
export function useAdminListSupportTickets(params?: { page?: number; limit?: number; status?: string; search?: string }): UseQueryResult<schemas.SupportTicketsList, Error> {
  return useQuery({
    queryKey: ["admin", "support-tickets", params],
    queryFn: () => api.getAdminSupportTickets(params),
  });
}

export function useAdminSupportTicket(id: number): UseQueryResult<schemas.SupportTicketThread, Error> {
  return useQuery({
    queryKey: ["admin", "support-tickets", id],
    queryFn: () => api.getAdminSupportTicket(id),
    enabled: !!id,
  });
}

export function useCreateSupportTicketReply(id: number): UseMutationResult<schemas.SupportMessage, Error, schemas.SupportMessageInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: schemas.SupportMessageInput) => api.createAdminSupportTicketReply(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets", id] });
    },
  });
}

export function useUpdateSupportTicketStatus(id: number): UseMutationResult<schemas.SupportTicket, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => api.updateAdminSupportTicketStatus(id, { status: status as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets", id] });
    },
  });
}

export function useAssignSupportTicket(id: number): UseMutationResult<schemas.SupportTicket, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignedTo: string) => api.assignAdminSupportTicket(id, { assignedTo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets", id] });
    },
  });
}

// --- AUDIT LOGS ---
export function useAdminActivityLogs(params?: { page?: number; limit?: number; userId?: string; action?: string }): UseQueryResult<schemas.AdminActivityLogsList, Error> {
  return useQuery({
    queryKey: ["admin", "activity-logs", params],
    queryFn: () => api.getAdminActivityLogs(params),
  });
}