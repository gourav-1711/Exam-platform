"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileEdit, Trash2, Clock, HelpCircle, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-config";

interface Draft {
  id: number;
  questionId: number | null;
  examId: number | null;
  createdBy: string;
  content: object;
  lastSavedAt: string;
  createdAt: string;
}

async function fetchQuestionDrafts(): Promise<Draft[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/drafts/questions`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchExamDrafts(): Promise<Draft[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/drafts/exams`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

function DraftCard({ draft, onDelete, type }: { draft: Draft; onDelete: () => void; type: "question" | "exam" }) {
  const content = draft.content as Record<string, unknown>;
  const title = (content.text as string) || (content.title as string) || "Untitled draft";
  const href = type === "question"
    ? (draft.questionId ? `/admin/questions/${draft.questionId}/edit` : "/admin/questions/new")
    : (draft.examId ? `/admin/exams/${draft.examId}/edit` : "/admin/exams/new");

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border hover:border-violet-200 hover:bg-violet-50/30 transition-colors group">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
          {type === "question" ? <HelpCircle className="h-4 w-4 text-gray-500" /> : <GraduationCap className="h-4 w-4 text-gray-500" />}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{title as string}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Saved {new Date(draft.lastSavedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DraftsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: questionDrafts, isLoading: loadingQ } = useQuery({ queryKey: ["admin", "drafts", "questions"], queryFn: fetchQuestionDrafts });
  const { data: examDrafts, isLoading: loadingE } = useQuery({ queryKey: ["admin", "drafts", "exams"], queryFn: fetchExamDrafts });

  const deleteQDraft = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`${API_BASE_URL}/api/admin/drafts/questions/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "drafts"] }); toast({ title: "Draft deleted" }); },
  });

  const totalDrafts = (questionDrafts?.length ?? 0) + (examDrafts?.length ?? 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Drafts</h1>
        <p className="text-gray-500 text-sm mt-0.5">{totalDrafts} unsaved draft{totalDrafts !== 1 ? "s" : ""}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-gray-400" /> Question Drafts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingQ ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />)}</div>
          ) : questionDrafts?.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No question drafts</p>
          ) : (
            <div className="space-y-2">
              {questionDrafts?.map((d) => (
                <DraftCard key={d.id} draft={d} type="question" onDelete={() => deleteQDraft.mutate(d.id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" /> Exam Drafts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingE ? (
            <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />)}</div>
          ) : examDrafts?.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No exam drafts</p>
          ) : (
            <div className="space-y-2">
              {examDrafts?.map((d) => (
                <DraftCard key={d.id} draft={d} type="exam" onDelete={() => deleteQDraft.mutate(d.id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
