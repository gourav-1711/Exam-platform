"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Eye,
  Plus,
  ExternalLink,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useListSubjects, customFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
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
import { YEARS } from "@/lib/data";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

interface PypPaper {
  id: number;
  examName: string;
  shiftName: string;
  year: number;
  subject: string | null;
  subjectId: number | null;
  questionPaperUrl: string | null;
  answerKeyUrl: string | null;
  answerKeyPdf: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SHIFT_NAMES = [
  "Shift 1",
  "Shift 2",
  "Shift 3",
  "Evening Shift",
] as const;

export default function PypAdminPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [examName, setExamName] = useState("");
  const [shiftName, setShiftName] = useState("Shift 1");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [subjectId, setSubjectId] = useState("");
  const [questionPaperUrl, setQuestionPaperUrl] = useState("");
  const [answerKeyUrl, setAnswerKeyUrl] = useState("");
  const [answerKeyPdf, setAnswerKeyPdf] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Dynamic Subjects
  const { data: subjects = [] } = useListSubjects();

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ["admin", "pyp", search],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (search.trim()) sp.set("search", search.trim());
      const query = sp.toString();
      return customFetch<PypPaper[]>(
        `/api/admin/pyp${query ? `?${query}` : ""}`,
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      return customFetch<PypPaper>("/api/admin/pyp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pyp"] });
      setSheetOpen(false);
      resetForm();
      toast({ title: "Created", description: "PYP paper added successfully" });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to create",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<{ success: boolean }>(`/api/admin/pyp/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pyp"] });
      toast({
        title: "Deleted",
        description: "PYP Paper deleted successfully",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to delete",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setExamName("");
    setShiftName("Shift 1");
    setYear(String(new Date().getFullYear()));
    setSubjectId("");
    setQuestionPaperUrl("");
    setAnswerKeyUrl("");
    setAnswerKeyPdf("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      toast({
        title: "Validation",
        description: "Exam name is required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      examName: examName.trim(),
      shiftName,
      year: parseInt(year),
      subjectId: subjectId ? parseInt(subjectId) : null,
      questionPaperUrl: questionPaperUrl.trim() || null,
      answerKeyUrl: answerKeyUrl.trim() || null,
      answerKeyPdf: answerKeyPdf.trim() || null,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6 p-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              PYP Papers
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage previous year papers and answer keys
            </p>
          </div>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Paper
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search papers..."
          className="pl-9 rounded-xl h-10"
        />
      </div>

      {/* Table Card */}
      <Card className="border border-border/50 bg-white shadow-sm overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading papers...
          </div>
        ) : papers.length === 0 ? (
          <div className="py-16 px-6">
            <Empty>
              <EmptyTitle>No PYP papers yet</EmptyTitle>
              <EmptyDescription>
                Click "Add Paper" above to add your first previous year paper.
              </EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70">
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">
                    Exam Name
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">
                    Shift
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">
                    Year
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">
                    Subject
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">
                    Answer Key
                  </TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-gray-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers.map((paper) => (
                  <TableRow
                    key={paper.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="font-semibold text-gray-900">
                      {paper.examName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {paper.shiftName}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-gray-700">
                      {paper.year}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {paper.subject ?? (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {paper.answerKeyPdf || paper.answerKeyUrl ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Available
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-gray-400 text-xs"
                        >
                          <XCircle className="w-3 h-3 mr-1" /> N/A
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {paper.questionPaperUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(paper.questionPaperUrl!, "_blank")
                            }
                            className="h-8 gap-1.5 text-indigo-600 hover:text-indigo-800"
                          >
                            <Eye className="w-3.5 h-3.5" /> Paper
                          </Button>
                        )}
                        {paper.answerKeyPdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(paper.answerKeyPdf!, "_blank")
                            }
                            className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-800"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Key
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(paper.id)}
                          className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg font-bold text-gray-900">
              Add PYP Paper
            </SheetTitle>
            <SheetDescription>
              Add a previous year paper with URLs to the question paper and
              answer key
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Exam Name *
              </Label>
              <Input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. UPSC Prelims 2025"
                required
                className="rounded-xl h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Shift
                </Label>
                <select
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {SHIFT_NAMES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Year *
                </Label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Subject
              </Label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">None</option>
                {subjects.map((s: { id: number; name: string }) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Question Paper URL
                </Label>
                <Input
                  value={questionPaperUrl}
                  onChange={(e) => setQuestionPaperUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Answer Key URL
                </Label>
                <Input
                  value={answerKeyUrl}
                  onChange={(e) => setAnswerKeyUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Answer Key PDF URL
                </Label>
                <Input
                  value={answerKeyPdf}
                  onChange={(e) => setAnswerKeyPdf(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || !examName.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11"
            >
              {createMutation.isPending ? "Creating..." : "Add PYP Paper"}
            </Button>
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
