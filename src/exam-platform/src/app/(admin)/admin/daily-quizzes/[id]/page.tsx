"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminDailyQuiz, useDeleteDailyQuiz } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DailyQuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params?.id ? String(params.id) : "";

  const { data: quiz, isLoading, error } = useAdminDailyQuiz(id);
  const deleteMutation = useDeleteDailyQuiz();

  if (isLoading) {
    return <div className="p-6">Loading…</div>;
  }

  if (error || !quiz) {
    return (
      <div className="p-6 text-red-600">
        <p>Error loading quiz or quiz not found.</p>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/daily-quizzes")}
        >
          Back
        </Button>
      </div>
    );
  }

  async function handleDelete() {
    if (!window.confirm("Delete this daily quiz?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Deleted", description: "Daily quiz was deleted." });
      router.push("/admin/daily-quizzes");
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-gray-600">ID: {quiz.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(`/admin/daily-quizzes/${id}/edit`)}
          >
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/daily-quizzes")}
          >
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border bg-white p-4">
          <h2 className="text-lg font-semibold mb-2">Details</h2>
          <p className="mb-2">
            <strong>Description:</strong> {quiz.description || "No description"}
          </p>
          <p className="mb-2">
            <strong>Schedule:</strong> {quiz.scheduledDate} {quiz.scheduledTime}
          </p>
          <p className="mb-2">
            <strong>Duration:</strong> {quiz.durationMinutes} minutes
          </p>
          <p className="mb-2">
            <strong>Total Questions:</strong> {quiz.totalQuestions}
          </p>
          <p className="mb-2">
            <strong>Status:</strong> {quiz.isPublished ? "Published" : "Draft"}
          </p>
        </div>

        <div className="rounded-md border bg-white p-4">
          <h2 className="text-lg font-semibold mb-2">Question IDs</h2>
          {quiz.questionIds?.length ? (
            <ul className="list-disc pl-5">
              {quiz.questionIds.map((id: number) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No question IDs assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
}