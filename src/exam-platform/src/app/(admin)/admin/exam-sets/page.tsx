"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit,
  BookOpen,
  Library,
  Search,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { customFetch, useListSubjects } from "@/lib/api";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { CLASSES, MEDIUMS, EXAM_SET_TYPES } from "@/lib/data";

interface ExamSet {
  id: number;
  title: string;
  description: string | null;
  type: "pyq" | "ncert";
  subjectId: number | null;
  classNum: number | null;
  medium: string | null;
  questionIds: number[];
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExamSetsResponse {
  data: ExamSet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ExamSetsAdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamSet | null>(null);
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"pyq" | "ncert">("pyq");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formClassNum, setFormClassNum] = useState("");
  const [formMedium, setFormMedium] = useState("");
  const [formQuestionIds, setFormQuestionIds] = useState("");

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  // Subjects
  const { data: subjects = [] } = useListSubjects();

  const { data, isLoading } = useQuery<ExamSetsResponse>({
    queryKey: ["admin", "exam-sets", typeFilter, search, page],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      sp.set("limit", "20");
      if (typeFilter) sp.set("type", typeFilter);
      if (search.trim()) sp.set("search", search.trim());
      const query = sp.toString();
      return customFetch<ExamSetsResponse>(
        `/api/admin/exam-sets${query ? `?${query}` : ""}`,
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      return customFetch<ExamSet>("/api/admin/exam-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam-sets"] });
      setSheetOpen(false);
      resetForm();
      toast({ title: "Created", description: "Exam set created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      return customFetch<ExamSet>(`/api/admin/exam-sets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam-sets"] });
      setSheetOpen(false);
      toast({ title: "Updated", description: "Exam set updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<{ success: boolean }>(`/api/admin/exam-sets/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exam-sets"] });
      toast({ title: "Deleted", description: "Exam set removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormType("pyq");
    setFormSubjectId("");
    setFormClassNum("");
    setFormMedium("");
    setFormQuestionIds("");
  };

  const openCreate = () => {
    setEditingItem(null);
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (item: ExamSet) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description ?? "");
    setFormType(item.type);
    setFormSubjectId(item.subjectId ? String(item.subjectId) : "");
    setFormClassNum(item.classNum ? String(item.classNum) : "");
    setFormMedium(item.medium ?? "");
    setFormQuestionIds(item.questionIds.join(", "));
    setSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast({ title: "Validation", description: "Title is required", variant: "destructive" });
      return;
    }

    const questionIds = formQuestionIds
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      type: formType,
      subjectId: formSubjectId ? parseInt(formSubjectId) : null,
      classNum: formType === "ncert" && formClassNum ? parseInt(formClassNum) : null,
      medium: formMedium || null,
      questionIds,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const examSets = data?.data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-6xl mx-auto space-y-6 p-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center">
            <Layers className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Exam Sets
            </h1>
            <p className="text-sm text-muted-foreground">
              PYQ &amp; NCERT question sets
            </p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Set
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam sets..."
            className="pl-9 rounded-xl h-10"
          />
        </div>
        <div className="flex gap-2">
          {["", "pyq", "ncert"].map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t)}
              className={`rounded-xl h-9 text-xs font-bold ${
                typeFilter === t
                  ? "bg-violet-600 hover:bg-violet-700"
                  : ""
              }`}
            >
              {t ? (t === "pyq" ? "PYQ" : "NCERT") : "All"}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-border/50 bg-white shadow-sm overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading exam sets...
          </div>
        ) : examSets.length === 0 ? (
          <div className="py-16 px-6">
            <Empty>
              <EmptyTitle>No exam sets yet</EmptyTitle>
              <EmptyDescription>
                Click "Create Set" above to group questions into PYQ or NCERT
                sets.
              </EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70">
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Title</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Type</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Subject</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Questions</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Class</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Medium</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-gray-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examSets.map((set) => (
                  <TableRow
                    key={set.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="font-semibold text-gray-900 max-w-[200px]">
                      <span className="line-clamp-1">{set.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          set.type === "pyq"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {set.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {subjects.find(
                        (s: { id: number }) => s.id === set.subjectId,
                      )?.name ?? (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-gray-700">
                      {set.totalQuestions}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {set.classNum ? `Class ${set.classNum}` : "-"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {set.medium ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(set)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(set.id)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg h-9"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg h-9"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg font-bold text-gray-900">
              {editingItem ? "Edit Exam Set" : "Create Exam Set"}
            </SheetTitle>
            <SheetDescription>
              Group questions into PYQ or NCERT sets
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Title *
              </Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. UPSC Prelims 2024 PYQ"
                required
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Description
              </Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description..."
                className="rounded-xl h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Type *
                </Label>
                <select
                  value={formType}
                  onChange={(e) =>
                    setFormType(e.target.value as "pyq" | "ncert")
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {EXAM_SET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Subject
                </Label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">None</option>
                  {subjects.map((s: { id: number; name: string }) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formType === "ncert" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Class (Required for NCERT)
                  </Label>
                  <select
                    value={formClassNum}
                    onChange={(e) => setFormClassNum(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="">Select</option>
                    {CLASSES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Medium
                  </Label>
                  <select
                    value={formMedium}
                    onChange={(e) => setFormMedium(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="">Any</option>
                    {MEDIUMS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Question IDs
              </Label>
              <Input
                value={formQuestionIds}
                onChange={(e) => setFormQuestionIds(e.target.value)}
                placeholder="e.g. 1, 2, 3, 4, 5"
                className="rounded-xl h-10"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated question IDs
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !formTitle.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
              >
                {isPending
                  ? "Saving..."
                  : editingItem
                    ? "Save Changes"
                    : "Create Set"}
              </Button>
            </div>
          </form>
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
