"use client";

import { useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import {
  setDraftStatus,
  setDraftSaved,
  markUnsaved,
  resetDraft,
} from "@/store/slices/draftSlice";
import { DraftStatus } from "@/components/admin/DraftStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";

interface ExamFormData {
  title: string;
  description: string;
  subject: string;
  durationMins: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number;
  instructions: string;
  status: "draft" | "published" | "archived";
  category: string;
}

const SUBJECTS = [
  "History",
  "Geography",
  "Polity",
  "Economy",
  "Science",
  "Current Affairs",
  "Mathematics",
  "English",
  "General Studies",
  "Reasoning",
];

export default function EditExamPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: exam, isLoading } = useQuery({
    queryKey: ["admin", "exams", id],
    queryFn: async () => {
      return customFetch<any>(`/api/admin/exams/${id}`);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<ExamFormData>();

  useEffect(() => {
    if (exam) reset(exam);
  }, [exam, reset]);

  const saveDraft = useCallback(
    async (data: ExamFormData) => {
      dispatch(setDraftStatus("saving"));
      try {
        await customFetch<any>(`/api/admin/exams/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, status: "draft" }),
        });
        dispatch(setDraftSaved());
      } catch {
        dispatch(setDraftStatus("error"));
      }
    },
    [dispatch, id],
  );

  useEffect(() => {
    const subscription = watch((data) => {
      if (!isDirty) return;
      dispatch(markUnsaved());
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(
        () => saveDraft(data as ExamFormData),
        3000,
      );
    });
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watch, isDirty, saveDraft, dispatch]);

  const updateMutation = useMutation({
    mutationFn: async (data: ExamFormData) => {
      return customFetch<any>(`/api/admin/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exams"] });
      dispatch(resetDraft());
      toast({ title: "Exam updated!" });
      router.push("/admin/exams");
    },
    onError: () =>
      toast({ title: "Failed to update exam", variant: "destructive" }),
  });

  if (isLoading)
    return <div className="p-8 text-gray-500">Loading exam...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/exams">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Exam</h1>
          <p className="text-sm text-gray-500">
            Changes auto-save every 3 seconds
          </p>
        </div>
        <div className="ml-auto">
          <DraftStatus />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form
            onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
            className="space-y-5"
          >
            <div>
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("title", { required: true })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Subject</Label>
                <Select
                  value={watch("subject")}
                  onValueChange={(v) => setValue("subject", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["UPSC", "SSC", "RAS", "RRB", "Banking", "State PCS"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label>Duration (min)</Label>
                <Input
                  {...register("durationMins", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input
                  {...register("totalMarks", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Passing Marks</Label>
                <Input
                  {...register("passingMarks", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Neg. Marking</Label>
                <Input
                  {...register("negativeMarking", { valueAsNumber: true })}
                  type="number"
                  step="0.25"
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea
                {...register("instructions")}
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as ExamFormData["status"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => saveDraft(watch())}
              >
                <Save className="h-4 w-4 mr-1.5" /> Save Draft
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Send className="h-4 w-4 mr-1.5" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
