// ── Shared / Reusable Types ──────────────────────────────────────────────────

/** Paginated API response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit?: number;
}

/** Standard API error response */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

/** Generic mutation/action response */
export interface ActionResponse {
  success: boolean;
  message?: string;
}

// ── API Response Types ───────────────────────────────────────────────────────

/** Admin dashboard stats */
export interface AdminDashboardStats {
  totalQuestions: number;
  totalExams: number;
  totalAttempts: number;
  passedAttempts: number;
  passPercentage: number;
  recentActivity: Array<{
    id: number;
    action: string;
    entityType: string | null;
    entityId: string | null;
    userId: string;
    createdAt: string;
  }>;
  stats?: {
    totalStudents: number;
    newStudentsThisWeek: number;
    totalQuestions: number;
    totalQuizzes: number;
    totalMockTests: number;
    totalCurrentAffairs: number;
    openSupportTickets: number;
    storageUsedMb: number;
  };
  activityChart?: Array<{
    date: string;
    quizAttempts: number;
    newUsers: number;
  }>;
  topQuizzes?: Array<{
    id: string;
    title: string;
    attempts: number;
  }>;
  recentStudents?: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  }>;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  quizCount: number;
  mockCount: number;
  pyqCount: number;
}

/** Daily quiz (as received from API) */
export interface DailyQuiz {
  id: number;
  title: string;
  description?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalQuestions: number;
  questionIds: number[];
  isPublished?: boolean | null;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** PYQ question (as shown in UI) */
export interface PyqQuestion {
  id: number;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string | null;
  examLabel: string | null;
}

/** Quiz detail with questions */
export interface QuizDetails {
  id: number;
  title: string;
  subject: string;
  durationMins: number;
  questionCount: number;
  negativeMarking: number;
  status: string;
  instructions: string;
  isActive: boolean;
  createdAt: string;
  questions: PyqQuestion[];
}

/** User streak info */
export interface MyStreak {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  quizCount: number;
  mockCount: number;
  pyqCount: number;
  lastActivityDate: string | null;
}

/** Streak activity response */
export interface RecordActivityResponse {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  pointsEarned: number;
  streakIncremented: boolean;
}

/** Admin activity log */
export interface AdminActivityLog {
  id: number;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userId: string;
  createdAt: string;
}

/** Exam details with questions (from API) */
export interface ExamDetailQuestion {
  id: number;
  examId: number;
  questionId: number;
  orderNum: number;
  marks: number;
  negativeMarks: number;
  question: {
    id: number;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    type: string;
    subject: string | null;
  } | null;
}

/** Full exam detail response from API */
export interface ExamDetailResponse extends ExamListItem {
  questions: ExamDetailQuestion[];
}

/** Exam list item (from API) */
export interface ExamListItem {
  id: number;
  title: string;
  description?: string | null;
  subject: string;
  durationMins: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number;
  instructions?: string | null;
  status: "draft" | "published" | "archived";
  category: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Exam set (PYQ/NCERT question groups) */
export interface ExamSet {
  id: number;
  title: string;
  description: string | null;
  type: "pyq" | "ncert";
  subjectId: number | null;
  classNum: number | null;
  medium: string | null;
  questionIds: number[];
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subject?: { id: number; name: string } | null;
}

/** NCERB book type */
export interface NcertBookListItem {
  id: number;
  title: string;
  classNum: number;
  subject: string;
  medium: string;
  readUrl?: string | null;
  downloadUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Previous year paper (PYP) */
export interface PreviousYearPaperListItem {
  id: number;
  examName: string;
  shiftName: string;
  year: number;
  subject: string | null;
  subjectId: number | null;
  questionPaperUrl: string | null;
  answerKeyUrl: string | null;
  answerKeyPdf: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Component Props Types ────────────────────────────────────────────────────

/** Props for a status badge component */
export interface StatusBadgeProps {
  status: string;
  statusConfig?: Record<string, { label: string; color: string }>;
}

/** Props for pagination controls */
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
