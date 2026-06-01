"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import { setDraftStatus, setDraftSaved, markUnsaved, setQuestionDraftId } from "@/store/slices/draftSlice";
import { DraftStatus } from "./DraftStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Send } from "lucide-react";

export interface QuestionFormData {
  text: string;
  questionType: "single" | "multiple" | "truefalse" | "fillblank" | "subjective";
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
  explanation: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  chapter: string;
  tags: string;
  marks: number;
  negativeMarking: number;
  type: string;
}

interface QuestionFormProps {
  initialData?: Partial<QuestionFormData>;
  questionId?: number;
  draftId?: number;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onSaveDraft?: (data: QuestionFormData) => Promise<{ id: number }>;
  isLoading?: boolean;
}

const SUBJECTS = ["History", "Geography", "Polity", "Economy", "Science", "Current Affairs", "Environment", "Mathematics", "English", "Hindi", "Reasoning"];

export function QuestionForm({ initialData, questionId, draftId, onSubmit, onSaveDraft, isLoading }: QuestionFormProps) {
  const dispatch = useAppDispatch();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDraftId = useRef<number | undefined>(draftId);

  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm<QuestionFormData>({
    defaultValues: {
      text: "",
      questionType: "single",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctIndex: 0,
      explanation: "",
      subject: "",
      difficulty: "medium",
      chapter: "",
      tags: "",
      marks: 1,
      negativeMarking: 0,
      type: "quiz",
      ...initialData,
    },
  });

  const questionType = watch("questionType");

  const triggerAutoSave = useCallback(
    (formData: QuestionFormData) => {
      if (!onSaveDraft) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      dispatch(markUnsaved());
      autoSaveTimer.current = setTimeout(async () => {
        dispatch(setDraftStatus("saving"));
        try {
          const result = await onSaveDraft(formData);
          currentDraftId.current = result.id;
          dispatch(setQuestionDraftId(result.id));
          dispatch(setDraftSaved());
        } catch {
          dispatch(setDraftStatus("error"));
        }
      }, 3000);
    },
    [dispatch, onSaveDraft]
  );

  useEffect(() => {
    const subscription = watch((data) => {
      if (isDirty) triggerAutoSave(data as QuestionFormData);
    });
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watch, isDirty, triggerAutoSave]);

  const handleManualSave = async () => {
    if (!onSaveDraft) return;
    dispatch(setDraftStatus("saving"));
    try {
      const data = watch();
      const result = await onSaveDraft(data as QuestionFormData);
      dispatch(setDraftSaved());
      dispatch(setQuestionDraftId(result.id));
    } catch {
      dispatch(setDraftStatus("error"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">
          {questionId ? "Edit Question" : "New Question"}
        </h3>
        <div className="flex items-center gap-3">
          <DraftStatus />
          {onSaveDraft && (
            <Button type="button" variant="outline" size="sm" onClick={handleManualSave}>
              <Save className="h-3.5 w-3.5 mr-1" /> Save Draft
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Label>Question Type</Label>
          <Select defaultValue="single" onValueChange={(v) => setValue("questionType", v as QuestionFormData["questionType"])}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Choice</SelectItem>
              <SelectItem value="multiple">Multiple Choice</SelectItem>
              <SelectItem value="truefalse">True / False</SelectItem>
              <SelectItem value="fillblank">Fill in the Blank</SelectItem>
              <SelectItem value="subjective">Subjective</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-1">
          <Label>Difficulty</Label>
          <Select defaultValue="medium" onValueChange={(v) => setValue("difficulty", v as QuestionFormData["difficulty"])}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy"><span className="text-green-600">Easy</span></SelectItem>
              <SelectItem value="medium"><span className="text-amber-600">Medium</span></SelectItem>
              <SelectItem value="hard"><span className="text-red-600">Hard</span></SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Category</Label>
          <Select defaultValue="quiz" onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="pyq">PYQ</SelectItem>
              <SelectItem value="ncert">NCERT</SelectItem>
              <SelectItem value="mock">Mock Test</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Question Text <span className="text-red-500">*</span></Label>
        <Textarea
          {...register("text", { required: true })}
          className="mt-1 min-h-[100px]"
          placeholder="Enter the question..."
        />
      </div>

      {(questionType === "single" || questionType === "multiple") && (
        <div className="space-y-3">
          <Label>Options</Label>
          {(["A", "B", "C", "D"] as const).map((letter, i) => (
            <div key={letter} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctIndex"
                value={i}
                defaultChecked={i === 0}
                onChange={() => setValue("correctIndex", i)}
                className="accent-violet-600"
              />
              <Badge variant="outline" className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                {letter}
              </Badge>
              <Input
                {...register(`option${letter}` as keyof QuestionFormData)}
                placeholder={`Option ${letter}`}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      )}

      {questionType === "truefalse" && (
        <div className="space-y-2">
          <Label>Correct Answer</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="correctIndex" value={0} defaultChecked onChange={() => { setValue("optionA", "True"); setValue("optionB", "False"); setValue("correctIndex", 0); }} />
              <span className="text-green-600 font-medium">True</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="correctIndex" value={1} onChange={() => { setValue("optionA", "True"); setValue("optionB", "False"); setValue("correctIndex", 1); }} />
              <span className="text-red-600 font-medium">False</span>
            </label>
          </div>
        </div>
      )}

      {questionType === "fillblank" && (
        <div>
          <Label>Correct Answer</Label>
          <Input {...register("optionA")} className="mt-1" placeholder="Enter the correct answer..." />
        </div>
      )}

      <div>
        <Label>Explanation</Label>
        <Textarea {...register("explanation")} className="mt-1" placeholder="Explain the correct answer..." rows={3} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Subject</Label>
          <Select onValueChange={(v) => setValue("subject", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Chapter</Label>
          <Input {...register("chapter")} className="mt-1" placeholder="Chapter name..." />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>Marks</Label>
          <Input {...register("marks", { valueAsNumber: true })} type="number" step="0.5" min="0" className="mt-1" />
        </div>
        <div>
          <Label>Negative Marks</Label>
          <Input {...register("negativeMarking", { valueAsNumber: true })} type="number" step="0.25" min="0" className="mt-1" />
        </div>
        <div>
          <Label>Tags</Label>
          <Input {...register("tags")} className="mt-1" placeholder="tag1, tag2..." />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700">
          <Send className="h-4 w-4 mr-1.5" />
          {isLoading ? "Publishing..." : "Publish Question"}
        </Button>
      </div>
    </form>
  );
}
