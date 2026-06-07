"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  GraduationCap,
  Loader2,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { customFetch, useListSubjects } from "@/lib/api";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { QuestionSelector } from "@/components/admin/QuestionSelector";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Exam {
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

interface ExamDetailResponse extends Exam {
  questions: Array<{
    id: number;
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
  }>;
}

interface ExamsListResponse {
  data: Exam[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CATEGORIES = ["", "UPSC", "SSC", "RAS", "RRB", "Banking", "State PCS"];

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600 border-gray-200" },
  published: { label: "Published", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  archived: { label: "Archived", color: "bg-red-50 text-red-600 border-red-200" },
};

// ── Animation variants ────────────────────────────────────────────────────────
const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.28, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.28, ease: "easeOut" },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ExamsAdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Detail Sheet
  const [detailExamId, setDetailExamId] = useState<number | null>(null);

  // Create/Edit Sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Exam | null>(null);

  // Delete
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDuration, setFormDuration] = useState(60);
  const [formTotalMarks, setFormTotalMarks] = useState(100);
  const [formPassingMarks, setFormPassingMarks] = useState(40);
  const [formNegMarking, setFormNegMarking] = useState(0);
  const [formInstructions, setFormInstructions] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published" | "archived">("draft");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

  // Subjects
  const { data: subjects = [] } = useListSubjects();

  // Sync form when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      if (editingItem) {
        setFormTitle(editingItem.title);
        setFormDescription(editingItem.description ?? "");
        setFormSubject(editingItem.subject);
        setFormCategory(editingItem.category ?? "");
        setFormDuration(editingItem.durationMins);
        setFormTotalMarks(editingItem.totalMarks);
        setFormPassingMarks(editingItem.passingMarks);
        setFormNegMarking(editingItem.negativeMarking);
        setFormInstructions(editingItem.instructions ?? "");
        setFormStatus(editingItem.status);
        // Load questions separately for edit
        loadExamQuestions(editingItem.id);
      } else {
        setFormTitle("");
        setFormDescription("");
        setFormSubject("");
        setFormCategory("");
        setFormDuration(60);
        setFormTotalMarks(100);
        setFormPassingMarks(40);
        setFormNegMarking(0);
        setFormInstructions("");
        setFormStatus("draft");
        setSelectedQuestionIds([]);
      }
    }
  }, [sheetOpen, editingItem]);

  // Load exam questions for edit
  const loadExamQuestions = async (examId: number) => {
    try {
      const detail = await customFetch<ExamDetailResponse>(`/api/admin/exams/${examId}`);
      if (detail.questions) {
        setSelectedQuestionIds(detail.questions.map((q) => q.questionId));
      }
    } catch {
      // silently fail
    }
  };

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery<ExamsListResponse>({
    queryKey: ["admin", "exams", page, search],
    queryFn: () => {
      const sp = new URLSearchParams({ page: String(page), limit: "20" });
      if (search.trim()) sp.set("search", search.trim());
      return customFetch<ExamsListResponse>(`/api/admin/exams?${sp.toString()}`);
    },
    staleTime: 30000,
  });

  const { data: detail, isLoading: loadingDetail } = useQuery<ExamDetailResponse>({
    queryKey: ["admin", "exams", "detail", detailExamId],
    queryFn: () => customFetch<ExamDetailResponse>(`/api/admin/exams/${detailExamId!}`),
    enabled: !!detailExamId,
    staleTime: 15000,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "exams"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) =>
      customFetch<{ id: number }>("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: async (result) => {
      // Save questions after creating
      if (selectedQuestionIds.length > 0) {
        await customFetch(`/api/admin/exams/${result.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionIds: selectedQuestionIds }),
        });
      }
      invalidate();
      toast({ title: "Created!", description: "Exam published successfully." });
      setSheetOpen(false);
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) =>
      customFetch<Exam>(`/api/admin/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: async (_, variables) => {
      // Save questions after updating
      if (selectedQuestionIds.length >= 0) {
        await customFetch(`/api/admin/exams/${variables.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionIds: selectedQuestionIds }),
        }).catch(() => {});
      }
      invalidate();
      toast({ title: "Saved!", description: "Exam details updated." });
      setSheetOpen(false);
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      customFetch<{ success?: boolean }>(`/api/admin/exams/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast({ title: "Deleted", description: "Exam removed." });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingItem(null);
    setSheetOpen(true);
  };

  const openEdit = async (exam: Exam) => {
    setEditingItem(exam);
    setSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubject) {
      toast({ title: "Validation", description: "Title and Subject are required.", variant: "destructive" });
      return;
    }
    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      subject: formSubject,
      category: formCategory || undefined,
      durationMins: Number(formDuration),
      totalMarks: Number(formTotalMarks),
      passingMarks: Number(formPassingMarks),
      negativeMarking: Number(formNegMarking),
      instructions: formInstructions.trim() || undefined,
      status: formStatus,
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const totalPages = data?.pagination?.totalPages ?? 1;
  const exams = data?.data ?? [];

  const statusColor = (status: string) => {
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
    return cfg.color;
  };

  return (
    <TooltipProvider>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-6 p-2 sm:p-4"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.45 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 shrink-0"
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Exams</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data?.pagination?.total ?? 0} total exams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AnimatePresence>
              {exams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden sm:flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5"
                >
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="w-2 h-2 rounded-full bg-violet-500 inline-block"
                  />
                  <span className="text-xs font-semibold text-violet-700">{exams.length} shown</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
            >
              <Button
                onClick={openCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-10 font-bold gap-1.5 shadow-md shadow-indigo-200"
              >
                <Plus className="w-4 h-4" /> Create Exam
              </Button>
            </motion.div>
          </div>
        </div>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search exams..."
            className="pl-9 rounded-xl h-10"
          />
        </div>

        {/* ── Table Card ──────────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border/50 bg-white shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}>
                <Loader2 className="w-7 h-7 text-indigo-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading exams…</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="py-16 px-6">
              <Empty>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                    <GraduationCap className="w-7 h-7 text-violet-400" />
                  </div>
                  <EmptyTitle>No exams yet</EmptyTitle>
                  <EmptyDescription>Click &quot;Create Exam&quot; above to configure your first exam.</EmptyDescription>
                  <Button
                    onClick={openCreate}
                    variant="outline"
                    className="mt-4 rounded-xl gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Plus className="w-4 h-4" /> Create one
                  </Button>
                </motion.div>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 pl-5">Exam</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Duration</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Marks</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Status</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-gray-500 pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {exams.map((exam, i) => (
                      <motion.tr
                        key={exam.id}
                        custom={i}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="group border-b border-border/40 hover:bg-gray-50/60 transition-colors cursor-pointer"
                        onClick={() => setDetailExamId(exam.id)}
                      >
                        <TableCell className="pl-5 py-3.5 max-w-[280px]">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                              <BookOpen className="w-3.5 h-3.5 text-violet-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{exam.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {exam.subject}{exam.category ? ` · ${exam.category}` : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" /> {exam.durationMins} min
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-gray-700">{exam.totalMarks}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor(exam.status)}`}>
                            {exam.status === "published" ? <CheckCircle2 className="w-3 h-3" /> : exam.status === "archived" ? <XCircle className="w-3 h-3" /> : null}
                            {STATUS_CONFIG[exam.status]?.label ?? exam.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-50 hover:text-indigo-600" onClick={() => setDetailExamId(exam.id)}>
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-amber-50 hover:text-amber-600" onClick={() => openEdit(exam)}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600" onClick={() => setDeleteId(exam.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {data && data.pagination.total > 0 && totalPages > 1 && (
          <motion.div variants={cardVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg h-9">Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg h-9">Next</Button>
            </div>
          </motion.div>
        )}

        {/* ── Detail Sheet ────────────────────────────────────────────────── */}
        <Sheet open={!!detailExamId} onOpenChange={(open) => !open && setDetailExamId(null)}>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
            <SheetHeader className="px-5 py-4 border-b shrink-0">
              <SheetTitle className="text-base font-bold text-gray-900">Exam Details</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">Overview config and assigned questions</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {loadingDetail || !detail ? (
                <div className="space-y-4">
                  <div className="h-10 bg-gray-50 animate-pulse rounded-xl" />
                  <div className="h-28 bg-gray-50 animate-pulse rounded-xl" />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-2">{detail.title}</h3>
                    <p className="text-xs text-gray-500">{detail.subject}{detail.category ? ` · ${detail.category}` : ""}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-2 ${statusColor(detail.status)}`}>
                      {detail.status === "published" ? <CheckCircle2 className="w-2.5 h-2.5" /> : null}
                      {STATUS_CONFIG[detail.status]?.label ?? detail.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Duration</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{detail.durationMins} min</p>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Marks</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{detail.totalMarks}</p>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Passing</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{detail.passingMarks} / {detail.totalMarks}</p>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Neg. Marking</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">-{detail.negativeMarking}</p>
                    </div>
                  </div>
                  {detail.instructions && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Instructions</h3>
                      <p className="text-xs text-gray-600 bg-gray-50/50 border border-gray-100 rounded-xl p-3 leading-relaxed">{detail.instructions}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Questions ({detail.questions?.length ?? 0})
                    </h3>
                    {(!detail.questions || detail.questions.length === 0) ? (
                      <div className="bg-gray-50 border border-dashed rounded-2xl p-6 text-center text-xs text-gray-400">No questions linked yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {detail.questions.map((q) => (
                          <div key={q.id} className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5 text-violet-700 font-bold text-xs">
                              {q.orderNum + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 line-clamp-2">{q.question?.text || "Deleted question"}</p>
                              <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">Marks: {q.marks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* ── Create/Edit Sheet ───────────────────────────────────────────── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
            <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"
                >
                  <Settings className="w-5 h-5 text-violet-600" />
                </motion.div>
                <div>
                  <SheetTitle className="text-base font-bold text-gray-900">
                    {editingItem ? "Edit Exam" : "Create Exam"}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    {editingItem ? "Update exam details and question selection." : "Configure a new exam paper."}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Basic Info */}
              <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Title *</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. UPSC Prelims 2025" required className="rounded-xl h-10" />
              </motion.div>

              <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</Label>
                <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Optional description..." rows={2} className="rounded-xl resize-none" />
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subject *</Label>
                  <select value={formSubject} onChange={(e) => setFormSubject(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Select</option>
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </motion.div>
                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</Label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">None</option>
                    {CATEGORIES.filter(Boolean).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </motion.div>
              </div>

              {/* Numeric fields */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration (min)</Label>
                  <Input type="number" min={1} value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} className="rounded-xl h-10" />
                </motion.div>
                <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Marks</Label>
                  <Input type="number" min={1} value={formTotalMarks} onChange={(e) => setFormTotalMarks(Number(e.target.value))} className="rounded-xl h-10" />
                </motion.div>
                <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Passing Marks</Label>
                  <Input type="number" min={0} value={formPassingMarks} onChange={(e) => setFormPassingMarks(Number(e.target.value))} className="rounded-xl h-10" />
                </motion.div>
                <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Neg. Marking</Label>
                  <Input type="number" step={0.25} value={formNegMarking} onChange={(e) => setFormNegMarking(Number(e.target.value))} className="rounded-xl h-10" />
                </motion.div>
              </div>

              {/* Instructions */}
              <motion.div custom={8} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Instructions</Label>
                <Textarea value={formInstructions} onChange={(e) => setFormInstructions(e.target.value)} placeholder="Instructions for students..." rows={3} className="rounded-xl resize-none" />
              </motion.div>

              {/* Status */}
              <motion.div custom={9} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</Label>
                <div className="flex gap-2">
                  {(["draft", "published", "archived"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setFormStatus(s)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        formStatus === s
                          ? s === "published" ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                            : s === "archived" ? "bg-red-50 border-red-400 text-red-600"
                            : "bg-gray-100 border-gray-400 text-gray-600"
                          : "border-border/40 text-muted-foreground hover:border-border"
                      }`}
                    >
                      {s === "published" ? "Published" : s === "archived" ? "Archived" : "Draft"}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Question Selector */}
              <motion.div custom={10} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-3 pt-2 border-t">
                <div>
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Select Questions</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Choose questions to include in this exam ({selectedQuestionIds.length} selected)</p>
                </div>
                <QuestionSelector selectedIds={selectedQuestionIds} onChange={setSelectedQuestionIds} />
              </motion.div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50/60 flex gap-2.5 shrink-0">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} className="flex-1 rounded-xl font-semibold">Cancel</Button>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 380, damping: 20 }}>
                <Button type="submit" disabled={isPending || !formTitle.trim() || !formSubject} onClick={handleSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 gap-2"
                >
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingItem ? "Save Changes" : "Create Exam"}
                </Button>
              </motion.div>
            </div>
          </SheetContent>
        </Sheet>

        {/* ── Delete Confirm ──────────────────────────────────────────────── */}
        <ConfirmDeleteDialog
          isOpen={deleteTargetId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            if (deleteTargetId !== null) deleteMutation.mutate(deleteTargetId);
          }}
        />
      </motion.div>
    </TooltipProvider>
  );
}
