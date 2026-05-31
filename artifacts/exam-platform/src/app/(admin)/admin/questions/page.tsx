"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleQuestionSelection, selectAllQuestions, clearQuestionSelection } from "@/store/slices/adminSlice";
import { useToast } from "@/hooks/use-toast";

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
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

async function fetchQuestions(page: number, search: string): Promise<QuestionsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) params.set("search", search);
  const res = await fetch(`/api/admin/questions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.admin.selectedQuestions);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "questions", page, debouncedSearch],
    queryFn: () => fetchQuestions(page, debouncedSearch),
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      toast({ title: "Question deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch("/api/admin/questions/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      dispatch(clearQuestionSelection());
      toast({ title: `${selected.length} questions deleted` });
    },
    onError: () => toast({ title: "Bulk delete failed", variant: "destructive" }),
  });

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer);
    (window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 400);
  };

  const difficultyColor: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data?.pagination.total ?? "–"} total questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => bulkDeleteMutation.mutate(selected)}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete {selected.length}
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" /> Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/admin/questions/new">
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search questions..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={selected.length === (data?.data.length ?? 0) && selected.length > 0}
              onChange={(e) => {
                if (e.target.checked) dispatch(selectAllQuestions(data?.data.map((q) => q.id) ?? []));
                else dispatch(clearQuestionSelection());
              }}
              className="accent-violet-600"
            />
            <span>Select all on page</span>
          </div>

          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="divide-y">
              {data?.data.length === 0 && (
                <div className="py-12 text-center text-gray-400">No questions found</div>
              )}
              {data?.data.map((q) => (
                <div key={q.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.includes(q.id)}
                    onChange={() => dispatch(toggleQuestionSelection(q.id))}
                    className="mt-1 accent-violet-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{q.text}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs">{q.type}</Badge>
                      {q.subject && <span className="text-xs text-gray-500">{q.subject}</span>}
                      {q.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[q.difficulty] ?? "bg-gray-100 text-gray-600"}`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/questions/${q.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(q.id)}
                      disabled={deleteMutation.isPending}
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
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
