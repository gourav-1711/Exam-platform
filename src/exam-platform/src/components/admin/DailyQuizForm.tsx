"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateDailyQuiz, useUpdateDailyQuiz } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Props = {
  initial?: any;
  mode: "create" | "edit";
  id?: string | number;
};

export default function DailyQuizForm({ initial, mode, id }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [scheduledDate, setScheduledDate] = useState(
    initial?.scheduledDate ?? "",
  );
  const [scheduledTime, setScheduledTime] = useState(
    initial?.scheduledTime ?? "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.durationMinutes ?? 30,
  );
  const [totalQuestions, setTotalQuestions] = useState(
    initial?.totalQuestions ?? 10,
  );
  const [questionIds, setQuestionIds] = useState(
    (initial?.questionIds ?? []).join?.(",") ?? "",
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateDailyQuiz();
  const updateMutation = useUpdateDailyQuiz(id ?? 0);

  React.useEffect(() => {
    if (!initial) return;

    setTitle(initial.title ?? "");
    setDescription(initial.description ?? "");
    setScheduledDate(initial.scheduledDate ?? "");
    setScheduledTime(initial.scheduledTime ?? "");
    setDurationMinutes(initial.durationMinutes ?? 30);
    setTotalQuestions(initial.totalQuestions ?? 10);
    setQuestionIds((initial.questionIds ?? []).join(","));
    setIsPublished(initial.isPublished ?? false);
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title,
        description,
        scheduledDate,
        scheduledTime,
        durationMinutes: Number(durationMinutes),
        totalQuestions: Number(totalQuestions),
        questionIds: questionIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map(Number),
        isPublished,
      } as any;

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync(payload);
      }

      toast({
        title: mode === "create" ? "Created" : "Updated",
        description: `Daily quiz ${mode === "create" ? "created" : "updated"} successfully.`,
      });
      router.push("/admin/daily-quizzes");
    } catch (err: any) {
      setError(err.message || String(err));
      toast({
        title: "Error",
        description: err.message || String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 rounded-md border"
    >
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Scheduled Date
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Scheduled Time
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Duration (mins)
          </label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Total Questions
          </label>
          <input
            type="number"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Question IDs (comma)
          </label>
          <input
            value={questionIds}
            onChange={(e) => setQuestionIds(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span className="text-sm">Publish</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || createMutation.isPending || updateMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          {loading || createMutation.isPending || updateMutation.isPending ? "Saving…" : mode === "create" ? "Create" : "Update"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/daily-quizzes")}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
