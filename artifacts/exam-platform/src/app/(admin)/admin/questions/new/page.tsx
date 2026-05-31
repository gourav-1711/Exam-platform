"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuestionForm, type QuestionFormData } from "@/components/admin/QuestionForm";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store/hooks";
import { resetDraft } from "@/store/slices/draftSlice";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const dispatch = useAppDispatch();

  const createMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      dispatch(resetDraft());
      toast({ title: "Question published!" });
      router.push("/admin/questions");
    },
    onError: (err: Error) => toast({ title: err.message, variant: "destructive" }),
  });

  const saveDraftMutation = async (data: QuestionFormData) => {
    const res = await fetch("/api/admin/drafts/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: data }),
    });
    if (!res.ok) throw new Error("Failed to save draft");
    return res.json();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/questions"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Question</h1>
          <p className="text-sm text-gray-500">Drafts auto-save every 3 seconds</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <QuestionForm
            onSubmit={createMutation.mutate}
            onSaveDraft={saveDraftMutation}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
