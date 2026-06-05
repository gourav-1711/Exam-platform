"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  QuestionForm,
  type QuestionFormData,
} from "@/components/admin/QuestionForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api";

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: question, isLoading: isFetching } = useQuery({
    queryKey: ["admin", "questions", id],
    queryFn: async () => {
      return customFetch<QuestionFormData>(`/api/admin/questions/${id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      return customFetch<QuestionFormData>(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "questions"] });
      toast({ title: "Question updated!" });
      router.push("/admin/questions");
    },
    onError: () =>
      toast({ title: "Failed to update question", variant: "destructive" }),
  });

  if (isFetching)
    return <div className="p-8 text-gray-500">Loading question...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/questions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Question</h1>
          <p className="text-sm text-gray-500">
            Changes auto-save every 3 seconds
          </p>
        </div>
      </div>
      {question && (
        <QuestionForm
          initialData={question}
          questionId={Number(id)}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
