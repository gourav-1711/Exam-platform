"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  BookOpen,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  toggleQuestionSelection,
  selectAllQuestions,
  clearQuestionSelection,
} from "@/store/slices/adminSlice";
import { useToast } from "@/hooks/use-toast";
import { customFetch, useListPyqSubjects } from "@/lib/api";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { motion } from "framer-motion";

interface Question {
  id: number;
  text: string;
  type: string;
  subject: string | null;
  difficulty?: string;
  correctIndex: number;
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

async function fetchQuestions(
  page: number,
  search: string,
  subject: string,
  type: string,
): Promise<QuestionsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) params.set("search", search);
  if (subject && subject !== "All") params.set("subject", subject);
  if (type && type !== "All") params.set("type", type);
  return customFetch<QuestionsResponse>(`/api/admin/questions?${params}`);
}

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filterSubject, setFilterSubject] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const [deleteTargetId, setDeleteId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.admin.selectedQuestions);

  // Dynamic Subjects
  const { data: pyqSubjects = [] } = useListPyqSubjects();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "questions", page, debouncedSearch, filterSubject, filterType],
    queryFn: () => fetchQuestions(page, debouncedSearch, filterSubject, filterType),
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<{ success?: boolean }>(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      toast({ title: "Question deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return customFetch<{ success?: boolean }>("/api/admin/questions/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      dispatch(clearQuestionSelection());
      toast({ title: `${selected.length} questions deleted` });
    },
    onError: () =>
      toast({ title: "Bulk delete failed", variant: "destructive" }),
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (questions: any[]) => {
      return customFetch<{ success: boolean; count: number }>("/api/admin/questions/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      toast({ title: "Success", description: `Successfully bulk uploaded ${res.count} questions!` });
    },
    onError: (err: any) => {
      toast({ title: "Upload failed", description: err.message || "Invalid CSV layout", variant: "destructive" });
    },
  });

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 400);
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

  const difficultyColor: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data?.pagination.total ?? "–"} total questions found
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm(`Delete ${selected.length} selected questions?`)) {
                  bulkDeleteMutation.mutate(selected);
                }
              }}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete {selected.length}
            </Button>
          )}

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
          >
            <Upload className="h-4 w-4 mr-1" />
            {importing ? "Parsing..." : bulkUploadMutation.isPending ? "Uploading..." : "Import CSV"}
          </Button>

          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/admin/questions/new">
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Link>
          </Button>
        </div>
      </div>

      {/* Reactive Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative col-span-1 sm:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search questions..."
            className="pl-9"
          />
        </div>

        <select
          value={filterSubject}
          onChange={(e) => {
            setFilterSubject(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 bg-white text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="All">All Subjects</option>
          {pyqSubjects.map((s: PyqSubject) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 bg-white text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="All">All Categories</option>
          <option value="quiz">Quiz</option>
          <option value="pyq">PYQ</option>
          <option value="ncert">NCERT</option>
          <option value="mock">Mock Test</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={
                selected.length === (data?.data.length ?? 0) &&
                selected.length > 0
              }
              onChange={(e) => {
                if (e.target.checked)
                  dispatch(
                    selectAllQuestions(data?.data.map((q) => q.id) ?? []),
                  );
                else dispatch(clearQuestionSelection());
              }}
              className="accent-violet-600"
            />
            <span>Select all on page</span>
          </div>

          <Card className="border-0 shadow-sm overflow-hidden rounded-2xl">
            <div className="divide-y">
              {data?.data.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  No questions found matching selected filters
                </div>
              )}
              {data?.data.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(q.id)}
                    onChange={() => dispatch(toggleQuestionSelection(q.id))}
                    className="mt-1 accent-violet-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-relaxed">
                      {q.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs font-bold uppercase">
                        {q.type}
                      </Badge>
                      {q.subject && (
                        <span className="text-xs font-semibold text-gray-500">
                          {q.subject}
                        </span>
                      )}
                      {q.difficulty && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${difficultyColor[q.difficulty] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/questions/${q.id}/edit`}>
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(q.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg h-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg h-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDeleteDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) deleteMutation.mutate(deleteTargetId);
        }}
      />
    </motion.div>
  );
}