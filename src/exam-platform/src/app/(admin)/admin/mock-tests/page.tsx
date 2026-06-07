"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, HelpCircle, FileText, Check, X, Shield, Award, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

interface MockTest {
  id: number;
  title: string;
  description: string;
  durationMins: number;
  questionCount: number;
  maxMarks: number;
  negativeMarking: number;
  isFeatured: boolean;
}

export default function MockTestsAdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [questionCount, setQuestionCount] = useState(100);
  const [maxMarks, setMaxMarks] = useState(100);
  const [negativeMarking, setNegativeMarking] = useState(0.25);
  const [isFeatured, setIsFeatured] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingName] = useState("");
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  const { data: tests = [], isLoading } = useQuery<MockTest[]>({
    queryKey: ["admin", "mock-tests"],
    queryFn: () => customFetch<MockTest[]>("/api/admin/mock-tests"),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return customFetch<MockTest>("/api/admin/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
      setTitle("");
      setDescription("");
      setIsFeatured(false);
      toast({ title: "Created", description: "Mock test created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => {
      return customFetch<MockTest>(`/api/admin/mock-tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
      setEditingId(null);
      toast({ title: "Updated", description: "Mock test title updated" });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      return customFetch<MockTest>(`/api/admin/mock-tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
      toast({ title: "Updated", description: "Featured tag toggled successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<any>(`/api/admin/mock-tests/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "mock-tests"] });
      toast({ title: "Deleted", description: "Mock test deleted successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      durationMins,
      questionCount,
      maxMarks,
      negativeMarking,
      isFeatured,
    });
  };

  const startEdit = (test: MockTest) => {
    setEditingId(test.id);
    setEditingName(test.title);
  };

  const handleSaveEdit = (id: number) => {
    if (!editingTitle.trim()) return;
    updateMutation.mutate({ id, body: { title: editingTitle.trim() } });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Award className="w-8 h-8 text-indigo-600" />
          Mock Tests
        </h1>
        <p className="text-gray-500 mt-2">Manage full-length timed evaluation exams and mock papers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Card */}
        <Card className="border border-border/50 bg-white shadow-sm p-5 h-fit rounded-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> New Evaluation Paper
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Exam Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="UPSC IAS Prelims Full-length..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key topics and target audience..."
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duration (Mins)</Label>
                <Input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Question Count</Label>
                <Input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Neg. Marking</Label>
                <Input
                  type="number"
                  step="0.05"
                  value={negativeMarking}
                  onChange={(e) => setNegativeMarking(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-500"
                />
                <span className="text-sm font-semibold text-gray-700">Feature on top grid</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              {createMutation.isPending ? "Creating..." : "Create Mock Test"}
            </Button>
          </form>
        </Card>

        {/* List Table Card */}
        <Card className="border border-border/50 bg-white shadow-sm lg:col-span-2 overflow-hidden rounded-2xl">
          {isLoading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : tests.length === 0 ? (
            <div className="p-12">
              <Empty>
                <EmptyTitle>No mock tests yet</EmptyTitle>
                <EmptyDescription>Fill out the form on the left to generate one.</EmptyDescription>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Metadata</TableHead>
                    <TableHead>Timer</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="max-w-[220px]">
                        <div>
                          {editingId === test.id ? (
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 rounded-lg"
                              autoFocus
                            />
                          ) : (
                            <p className="font-bold text-gray-900 line-clamp-1">{test.title}</p>
                          )}
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{test.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {test.questionCount} Questions
                            </Badge>
                            <span className="text-[11px] font-semibold text-indigo-500">
                              {test.maxMarks} Marks
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-gray-500">{test.durationMins} Mins</span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => toggleFeatureMutation.mutate({ id: test.id, isFeatured: !test.isFeatured })}
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                            test.isFeatured
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}
                        >
                          {test.isFeatured ? "FEATURED" : "STANDARD"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === test.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveEdit(test.id)}
                              disabled={updateMutation.isPending}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => startEdit(test)}>
                              <Edit3 className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(test.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) deleteMutation.mutate(deleteTargetId);
        }}
      />
    </div>
  );
}