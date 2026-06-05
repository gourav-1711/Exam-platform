"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api";

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

async function fetchExams(page: number): Promise<{ data: Exam[]; pagination: { page: number; total: number; totalPages: number; limit: number } }> {
  return customFetch<{ data: Exam[]; pagination: { page: number; total: number; totalPages: number; limit: number } }>(`/api/admin/exams?page=${page}&limit=20`);
}

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
};

export default function ExamsPage() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "exams", page],
    queryFn: () => fetchExams(page),
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<{ success?: boolean }>(`/api/admin/exams/${id}`, { method: "DELETE" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "exams"] }); toast({ title: "Exam deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.pagination.total ?? "–"} total exams</p>
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
              <Card key={exam.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[exam.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {exam.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
                      <span>{exam.subject}</span>
                      <span>·</span>
                      <span>{exam.durationMins} min</span>
                      <span>·</span>
                      <span>{exam.totalMarks} marks</span>
                      {exam.category && <><span>·</span><Badge variant="outline" className="text-xs">{exam.category}</Badge></>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/exams/${exam.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => deleteMutation.mutate(exam.id)}
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
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
