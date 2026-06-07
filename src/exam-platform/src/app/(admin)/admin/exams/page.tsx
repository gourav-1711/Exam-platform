"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight, GraduationCap, Eye, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { motion } from "framer-motion";

interface Exam {
  id: number;
  title: string;
  subject: string;
  durationMins: number;
  totalMarks: number;
  status: string;
  category: string | null;
  createdAt: string;
}

interface QuestionDetails {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface ExamQuestionJoin {
  id: number;
  questionId: number;
  orderNum: number;
  marks: number;
  question: QuestionDetails | null;
}

interface ExamDetailResponse extends Exam {
  instructions: string | null;
  passingMarks: number;
  negativeMarking: number;
  questions: ExamQuestionJoin[];
}

async function fetchExams(page: number): Promise<{ data: Exam[]; pagination: { page: number; total: number; totalPages: number; limit: number } }> {
  return customFetch<{ data: Exam[]; pagination: { page: number; total: number; totalPages: number; limit: number } }>(`/api/admin/exams?page=${page}&limit=20`);
}

async function fetchExamDetail(id: number): Promise<ExamDetailResponse> {
  return customFetch<ExamDetailResponse>(`/api/admin/exams/${id}`);
}

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
};

export default function ExamsPage() {
  const [page, setPage] = useState(1);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "exams", page],
    queryFn: () => fetchExams(page),
    staleTime: 60 * 1000,
  });

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin", "exams", "detail", selectedExamId],
    queryFn: () => fetchExamDetail(selectedExamId!),
    enabled: !!selectedExamId,
    staleTime: 30 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<{ success?: boolean }>(`/api/admin/exams/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      toast({ title: "Exam deleted successfully" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.pagination.total ?? "–"} total exams configured</p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/admin/exams/new">
            <Plus className="h-4 w-4 mr-1" /> Create Exam
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />)}</div>
      ) : (
        <>
          <div className="grid gap-4">
            {data?.data.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No exams yet</p>
                  <Button asChild className="mt-4 bg-violet-600 hover:bg-violet-700">
                    <Link href="/admin/exams/new">Create your first exam</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            {data?.data.map((exam) => (
              <Card
                key={exam.id}
                className="border border-border/40 hover:border-violet-500/40 hover:shadow-sm transition-all rounded-2xl bg-white"
              >
                <CardContent className="p-5 flex items-start justify-between gap-4">
                  <div
                    onClick={() => setSelectedExamId(exam.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 hover:text-violet-600 transition-colors">{exam.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor[exam.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {exam.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs font-semibold text-gray-400">
                      <span>{exam.subject}</span>
                      <span>·</span>
                      <span>{exam.durationMins} min</span>
                      <span>·</span>
                      <span>{exam.totalMarks} marks</span>
                      {exam.category && <><span>·</span><Badge variant="outline" className="text-[10px] uppercase font-bold">{exam.category}</Badge></>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedExamId(exam.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/exams/${exam.id}/edit`}><Edit className="h-4 w-4 text-gray-500" /></Link>
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setDeleteId(exam.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Page {data.pagination.page} of {data.pagination.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg h-9"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg h-9"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Exam Details Sheet Drawer */}
      <Sheet open={!!selectedExamId} onOpenChange={(open) => !open && setSelectedExamId(null)}>
        <SheetContent side="right" className="w-[450px] p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-gray-100">
            <SheetTitle className="text-lg font-bold text-gray-900">Exam Details Summary</SheetTitle>
            <SheetDescription className="text-xs text-gray-400">
              Overview config and assigned questions
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {loadingDetail || !detail ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-50 animate-pulse rounded-xl" />
                <div className="h-28 bg-gray-50 animate-pulse rounded-xl" />
              </div>
            ) : (
              <>
                {/* Meta block */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exam Parameters</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                        <p className="text-gray-400">Passing Score</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{detail.passingMarks} / {detail.totalMarks}</p>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                        <p className="text-gray-400">Neg. Marking</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">-{detail.negativeMarking} per wrong</p>
                      </div>
                    </div>
                  </div>

                  {detail.instructions && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instructions</h3>
                      <p className="text-xs text-gray-600 bg-gray-50/50 border border-gray-100 rounded-xl p-3 mt-1.5 leading-relaxed">
                        {detail.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Assigned Questions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Assigned Questions ({detail.questions?.length ?? 0})
                  </h3>
                  {(!detail.questions || detail.questions.length === 0) ? (
                    <div className="bg-gray-50 border border-dashed rounded-2xl p-6 text-center text-xs text-gray-400">
                      No questions linked to this exam yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detail.questions.map((q) => (
                        <div
                          key={q.id}
                          className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-start gap-2.5"
                        >
                          <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5 text-violet-700 font-bold text-xs">
                            {q.orderNum + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 line-clamp-2">
                              {q.question?.text || "Unknown Question text (Deleted)"}
                            </p>
                            <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                              Marks: {q.marks} pts
                            </span>
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