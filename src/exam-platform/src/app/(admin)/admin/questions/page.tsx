"use client";

import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Eye,
  Edit,
  Search,
  BookOpen,
  Loader2,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Papa from "papaparse";

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

// ── Types ─────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  text: string;
  type: string;
  subject: string | null;
  difficulty?: string | null;
  correctIndex: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  explanation?: string | null;
  questionType?: string;
  chapter?: string | null;
  tags?: string | null;
  marks?: number;
  negativeMarking?: number;
  createdAt?: string;
}

interface QuestionsResponse {
  data: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
export default function QuestionsAdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filterSubject, setFilterSubject] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Detail Dialog
  const [viewingItem, setViewingItem] = useState<Question | null>(null);

  // Sheet (create/edit)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Question | null>(null);

  // Delete
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // CSV import
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subjects
  const { data: pyqSubjects = [] } = useListSubjects();

  // ── Form state ────────────────────────────────────────────────────────────
  const [formText, setFormText] = useState("");
  const [formType, setFormType] = useState("quiz");
  const [formQuestionType, setFormQuestionType] = useState("single");
  const [formOptionA, setFormOptionA] = useState("");
  const [formOptionB, setFormOptionB] = useState("");
  const [formOptionC, setFormOptionC] = useState("");
  const [formOptionD, setFormOptionD] = useState("");
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("medium");
  const [formChapter, setFormChapter] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formMarks, setFormMarks] = useState(1);
  const [formNegMarking, setFormNegMarking] = useState(0);
  const [formError, setFormError] = useState("");

  // Sync form when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      if (editingItem) {
        setFormText(editingItem.text);
        setFormType(editingItem.type);
        setFormQuestionType(editingItem.questionType ?? "single");
        setFormOptionA(editingItem.optionA ?? "");
        setFormOptionB(editingItem.optionB ?? "");
        setFormOptionC(editingItem.optionC ?? "");
        setFormOptionD(editingItem.optionD ?? "");
        setFormCorrectIndex(editingItem.correctIndex ?? 0);
        setFormExplanation(editingItem.explanation ?? "");
        setFormSubject(editingItem.subject ?? "");
        setFormDifficulty(editingItem.difficulty ?? "medium");
        setFormChapter(editingItem.chapter ?? "");
        setFormTags(editingItem.tags ?? "");
        setFormMarks(editingItem.marks ?? 1);
        setFormNegMarking(editingItem.negativeMarking ?? 0);
      } else {
        setFormText("");
        setFormType("quiz");
        setFormQuestionType("single");
        setFormOptionA("");
        setFormOptionB("");
        setFormOptionC("");
        setFormOptionD("");
        setFormCorrectIndex(0);
        setFormExplanation("");
        setFormSubject("");
        setFormDifficulty("medium");
        setFormChapter("");
        setFormTags("");
        setFormMarks(1);
        setFormNegMarking(0);
      }
      setFormError("");
    }
  }, [sheetOpen, editingItem]);

  // ── Debounced search ──────────────────────────────────────────────────────
  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 400);
  };

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery<QuestionsResponse>({
    queryKey: ["admin", "questions", page, debouncedSearch, filterSubject, filterType, filterDifficulty],
    queryFn: () => {
      const sp = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedSearch.trim()) sp.set("search", debouncedSearch.trim());
      if (filterSubject !== "All") sp.set("subject", filterSubject);
      if (filterType !== "All") sp.set("type", filterType);
      if (filterDifficulty !== "All") sp.set("difficulty", filterDifficulty);
      return customFetch<QuestionsResponse>(`/api/admin/questions?${sp.toString()}`);
    },
    staleTime: 30000,
  });

  const questions = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const allSelected = questions.length > 0 && selectedIds.length === questions.length;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "questions"] });

  const createMutation = useMutation({
    mutationFn: async (payload: any) =>
      customFetch<Question>("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Created!", description: "Question added successfully." });
      setSheetOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to create question");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) =>
      customFetch<Question>(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Saved!", description: "Question updated." });
      setSheetOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to update question");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      customFetch<{ success?: boolean }>(`/api/admin/questions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast({ title: "Deleted", description: "Question removed." });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) =>
      customFetch<{ success?: boolean }>("/api/admin/questions/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      invalidate();
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      toast({ title: "Deleted", description: `${selectedIds.length} questions removed.` });
    },
    onError: () => toast({ title: "Bulk delete failed", variant: "destructive" }),
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (questions: any[]) =>
      customFetch<{ success: boolean; count: number }>("/api/admin/questions/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      }),
    onSuccess: (res) => {
      invalidate();
      toast({ title: "Imported!", description: `Successfully uploaded ${res.count} questions.` });
    },
    onError: (err: any) => {
      toast({ title: "Upload failed", description: err.message || "Invalid CSV layout", variant: "destructive" });
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingItem(null);
    setSheetOpen(true);
  };

  const openEdit = async (q: Question) => {
    setEditingItem(q);
    setSheetOpen(true);
  };

  const openView = (q: Question) => {
    setViewingItem(q);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formText.trim()) {
      setFormError("Question text is required.");
      return;
    }
    if ((formQuestionType === "single" || formQuestionType === "multiple") && (!formOptionA.trim() || !formOptionB.trim())) {
      setFormError("At least options A and B are required.");
      return;
    }

    const basePayload = {
      text: formText.trim(),
      type: formType,
      questionType: formQuestionType,
      optionA: formOptionA.trim(),
      optionB: formOptionB.trim(),
      optionC: formOptionC.trim(),
      optionD: formOptionD.trim(),
      correctIndex: formCorrectIndex,
      explanation: formExplanation.trim() || null,
      subject: formSubject || null,
      difficulty: formDifficulty,
      chapter: formChapter.trim() || null,
      tags: formTags.trim() || null,
      marks: Number(formMarks),
      negativeMarking: Number(formNegMarking),
    };

    // For true/false, auto-set options
    if (formQuestionType === "truefalse") {
      basePayload.optionA = "True";
      basePayload.optionB = "False";
      basePayload.optionC = "";
      basePayload.optionD = "";
    }
    if (formQuestionType === "fillblank") {
      basePayload.optionA = formOptionA.trim();
      basePayload.optionB = "";
      basePayload.optionC = "";
      basePayload.optionD = "";
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload: basePayload });
    } else {
      createMutation.mutate(basePayload);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q.id));
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImporting(false);
        const mapped = results.data.map((row: any) => ({
          text: row.text || row.Question || "",
          type: row.type || row.Category || "quiz",
          optionA: row.optionA || row.option_a || row.OptionA || "",
          optionB: row.optionB || row.option_b || row.OptionB || "",
          optionC: row.optionC || row.option_c || row.OptionC || "",
          optionD: row.optionD || row.option_d || row.OptionD || "",
          correctIndex: parseInt(row.correctIndex || row.correct_index || row.CorrectIndex || "0", 10),
          explanation: row.explanation || row.Explanation || "",
          subject: row.subject || row.Subject || "",
        }));

        if (mapped.length === 0) {
          toast({ title: "Empty file", description: "No valid rows found in CSV", variant: "destructive" });
          return;
        }

        bulkUploadMutation.mutate(mapped);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: () => {
        setImporting(false);
        toast({ title: "Parsing failed", description: "Could not parse CSV file", variant: "destructive" });
      },
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const diffColor: Record<string, string> = {
    easy: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    hard: "bg-red-100 text-red-700 border-red-200",
  };

  const correctLetter = (idx: number) => String.fromCharCode(65 + idx);

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
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0"
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Questions</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data?.pagination?.total ?? 0} total questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={bulkDeleteMutation.isPending}
                    className="rounded-xl h-9 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete {selectedIds.length}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleCsvImport}
              className="hidden"
            />

            <Button
              variant="outline"
              size="sm"
              disabled={importing || bulkUploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl h-9 gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {importing ? "Parsing..." : bulkUploadMutation.isPending ? "Uploading..." : "Import CSV"}
            </Button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
            >
              <Button
                onClick={openCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-10 font-bold gap-1.5 shadow-md shadow-indigo-200"
              >
                <Plus className="w-4 h-4" /> Add Question
              </Button>
            </motion.div>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search questions..."
              className="pl-9 rounded-xl h-10"
            />
          </div>
          <select
            value={filterSubject}
            onChange={(e) => { setFilterSubject(e.target.value); setPage(1); setSelectedIds([]); }}
            className="px-3 py-2 border border-gray-200 bg-white text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Subjects</option>
            {pyqSubjects.map((s: any) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); setSelectedIds([]); }}
            className="px-3 py-2 border border-gray-200 bg-white text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Categories</option>
            <option value="quiz">Quiz</option>
            <option value="pyq">PYQ</option>
            <option value="ncert">NCERT</option>
            <option value="mock">Mock Test</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1); setSelectedIds([]); }}
            className="px-3 py-2 border border-gray-200 bg-white text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
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
              <p className="text-sm text-muted-foreground">Loading questions…</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 px-6">
              <Empty>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                    <BookOpen className="w-7 h-7 text-indigo-400" />
                  </div>
                  <EmptyTitle>No questions yet</EmptyTitle>
                  <EmptyDescription>
                    Click &quot;Add Question&quot; above or import via CSV to get started.
                  </EmptyDescription>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={openCreate}
                      variant="outline"
                      className="rounded-xl gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Plus className="w-4 h-4" /> Add one
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> Import CSV
                    </Button>
                  </div>
                </motion.div>
              </Empty>
            </div>
          ) : (
            <div>
              {/* Bulk select header */}
              {questions.length > 0 && (
                <div className="flex items-center gap-2 px-5 pt-4 pb-2 text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="accent-indigo-600 w-4 h-4 rounded"
                  />
                  <span>{allSelected ? "Deselect all" : `Select all ${questions.length} on page`}</span>
                </div>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                      <TableHead className="w-10 pl-5"></TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Question</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Category</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Subject</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Difficulty</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Correct</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-gray-500 pr-5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {questions.map((q, i) => (
                        <motion.tr
                          key={q.id}
                          custom={i}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="group border-b border-border/40 hover:bg-gray-50/60 transition-colors cursor-pointer"
                          onClick={() => openView(q)}
                        >
                          <TableCell className="pl-5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(q.id)}
                              onChange={() => toggleSelect(q.id)}
                              className="accent-indigo-600 w-4 h-4 rounded"
                            />
                          </TableCell>
                          <TableCell className="py-3 max-w-[320px]">
                            <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{q.text}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                              {q.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-semibold text-gray-500">{q.subject ?? "—"}</span>
                          </TableCell>
                          <TableCell>
                            {q.difficulty ? (
                              <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${diffColor[q.difficulty] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                {q.difficulty}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {q.correctIndex !== undefined ? (
                              <span className="text-xs font-bold text-green-600">
                                {correctLetter(q.correctIndex)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-50 hover:text-indigo-600" onClick={() => openView(q)}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-amber-50 hover:text-amber-600" onClick={() => openEdit(q)}>
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600" onClick={() => setDeleteId(q.id)}>
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

        {/* ── Detail Dialog ───────────────────────────────────────────────── */}
        <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
          <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
            {viewingItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-gray-900">Question Details</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">Full question preview</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">{viewingItem.text}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Category</p>
                      <Badge variant="outline" className="mt-1 text-xs font-bold uppercase">{viewingItem.type}</Badge>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Type</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{viewingItem.questionType ?? "single"}</p>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Subject</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{viewingItem.subject ?? "—"}</p>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Difficulty</p>
                      {viewingItem.difficulty ? (
                        <span className={`inline-flex text-xs font-bold px-2 py-0.5 rounded-full border mt-1 ${diffColor[viewingItem.difficulty] ?? ""}`}>
                          {viewingItem.difficulty}
                        </span>
                      ) : <span className="text-sm text-gray-400">—</span>}
                    </div>
                  </div>

                  {/* Options */}
                  {viewingItem.optionA && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Options</h3>
                      {["A", "B", "C", "D"].map((letter, i) => {
                        const opt = [viewingItem.optionA, viewingItem.optionB, viewingItem.optionC, viewingItem.optionD][i];
                        if (!opt) return null;
                        const isCorrect = viewingItem.correctIndex === i;
                        return (
                          <div key={letter} className={`flex items-center gap-3 p-3 rounded-xl border ${isCorrect ? "bg-green-50 border-green-200" : "bg-gray-50/50 border-gray-100"}`}>
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isCorrect ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                              {letter}
                            </div>
                            <span className={`text-sm ${isCorrect ? "font-bold text-green-800" : "text-gray-700"}`}>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {viewingItem.explanation && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Explanation</h3>
                      <p className="text-sm text-gray-600 bg-gray-50/50 border border-gray-100 rounded-xl p-3 leading-relaxed">{viewingItem.explanation}</p>
                    </div>
                  )}

                  {(viewingItem.marks || viewingItem.negativeMarking) && (
                    <div className="grid grid-cols-2 gap-3">
                      {viewingItem.marks && (
                        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Marks</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">{viewingItem.marks}</p>
                        </div>
                      )}
                      {viewingItem.negativeMarking && (
                        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Neg. Marking</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">-{viewingItem.negativeMarking}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Create/Edit Sheet ───────────────────────────────────────────── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
            <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center"
                >
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </motion.div>
                <div>
                  <SheetTitle className="text-base font-bold text-gray-900">
                    {editingItem ? "Edit Question" : "Add Question"}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    {editingItem ? "Update the question details below." : "Enter the question details below."}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              {/* Question Text */}
              <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Question Text *</Label>
                <Textarea value={formText} onChange={(e) => setFormText(e.target.value)} placeholder="Enter the question..." rows={3} required className="rounded-xl resize-none" />
              </motion.div>

              {/* Type & Question Type */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</Label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="quiz">Quiz</option>
                    <option value="pyq">PYQ</option>
                    <option value="ncert">NCERT</option>
                    <option value="mock">Mock Test</option>
                  </select>
                </motion.div>
                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Question Type</Label>
                  <select value={formQuestionType} onChange={(e) => {
                    setFormQuestionType(e.target.value);
                    if (e.target.value === "truefalse") {
                      setFormOptionA("True");
                      setFormOptionB("False");
                      setFormOptionC("");
                      setFormOptionD("");
                    } else if (e.target.value === "fillblank") {
                      setFormOptionA("");
                      setFormOptionB("");
                      setFormOptionC("");
                      setFormOptionD("");
                    } else {
                      setFormOptionA("");
                      setFormOptionB("");
                      setFormOptionC("");
                      setFormOptionD("");
                    }
                  }} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="truefalse">True / False</option>
                    <option value="fillblank">Fill in the Blank</option>
                    <option value="subjective">Subjective</option>
                  </select>
                </motion.div>
              </div>

              {/* Options (for single/multiple choice) */}
              {(formQuestionType === "single" || formQuestionType === "multiple") && (
                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Options</Label>
                  {["A", "B", "C", "D"].map((letter, i) => (
                    <div key={letter} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctIndex"
                        value={i}
                        checked={formCorrectIndex === i}
                        onChange={() => setFormCorrectIndex(i)}
                        className="accent-indigo-600"
                      />
                      <span className="text-xs font-bold text-gray-500 w-5 shrink-0">{letter}</span>
                      <Input
                        value={[formOptionA, formOptionB, formOptionC, formOptionD][i]}
                        onChange={(e) => {
                          const vals = [formOptionA, formOptionB, formOptionC, formOptionD];
                          vals[i] = e.target.value;
                          setFormOptionA(vals[0]);
                          setFormOptionB(vals[1]);
                          setFormOptionC(vals[2]);
                          setFormOptionD(vals[3]);
                        }}
                        placeholder={`Option ${letter}`}
                        className="rounded-xl h-9"
                      />
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-1">Select the radio button next to the correct answer</p>
                </motion.div>
              )}

              {/* True/False */}
              {formQuestionType === "truefalse" && (
                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Correct Answer</Label>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formCorrectIndex === 0 ? "bg-green-50 border-green-400" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="tf" checked={formCorrectIndex === 0} onChange={() => { setFormCorrectIndex(0); setFormOptionA("True"); setFormOptionB("False"); }} className="accent-green-600" />
                      <span className="text-sm font-bold text-green-700">True</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formCorrectIndex === 1 ? "bg-red-50 border-red-400" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="tf" checked={formCorrectIndex === 1} onChange={() => { setFormCorrectIndex(1); setFormOptionA("True"); setFormOptionB("False"); }} className="accent-red-600" />
                      <span className="text-sm font-bold text-red-700">False</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Fill in the Blank */}
              {formQuestionType === "fillblank" && (
                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Correct Answer</Label>
                  <Input value={formOptionA} onChange={(e) => setFormOptionA(e.target.value)} placeholder="Enter the correct answer..." className="rounded-xl h-10" />
                </motion.div>
              )}

              {/* Subject & Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subject</Label>
                  <select value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">None</option>
                    {pyqSubjects.map((s: any) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </motion.div>
                <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Difficulty</Label>
                  <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </motion.div>
              </div>

              {/* Explanation */}
              <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Explanation</Label>
                <Textarea value={formExplanation} onChange={(e) => setFormExplanation(e.target.value)} placeholder="Explain the correct answer..." rows={2} className="rounded-xl resize-none" />
              </motion.div>

              {/* Chapter & Tags */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Chapter</Label>
                  <Input value={formChapter} onChange={(e) => setFormChapter(e.target.value)} placeholder="Chapter name..." className="rounded-xl h-10" />
                </motion.div>
                <motion.div custom={8} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tags</Label>
                  <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="tag1, tag2..." className="rounded-xl h-10" />
                </motion.div>
              </div>

              {/* Marks & Neg Marking */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div custom={9} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Marks</Label>
                  <Input type="number" step={0.5} min={0} value={formMarks} onChange={(e) => setFormMarks(Number(e.target.value))} className="rounded-xl h-10" />
                </motion.div>
                <motion.div custom={10} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Negative Marks</Label>
                  <Input type="number" step={0.25} min={0} value={formNegMarking} onChange={(e) => setFormNegMarking(Number(e.target.value))} className="rounded-xl h-10" />
                </motion.div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50/60 flex gap-2.5 shrink-0">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} className="flex-1 rounded-xl font-semibold">Cancel</Button>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 380, damping: 20 }}>
                <Button type="submit" disabled={isPending || !formText.trim()} onClick={handleSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 gap-2"
                >
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingItem ? "Save Changes" : "Add Question"}
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

        {/* ── Bulk Delete Confirm ─────────────────────────────────────────── */}
        <ConfirmDeleteDialog
          isOpen={bulkDeleteOpen}
          onClose={() => setBulkDeleteOpen(false)}
          onConfirm={() => {
            if (selectedIds.length > 0) bulkDeleteMutation.mutate(selectedIds);
          }}
        />
      </motion.div>
    </TooltipProvider>
  );
}
