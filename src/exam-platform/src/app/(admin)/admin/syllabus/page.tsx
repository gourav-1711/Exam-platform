"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
import { Plus, Trash2, Edit3, Check, X, FileText, Upload, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { customFetch } from "@/lib/api";
import { motion } from "framer-motion";

interface SyllabusItem {
  id: number;
  examName: string;
  readUrl: string | null;
  downloadUrl: string | null;
}

export default function SyllabusAdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [examName, setExamName] = useState("");
  const [readUrl, setReadUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  const { data: list = [], isLoading } = useQuery<SyllabusItem[]>({
    queryKey: ["admin", "syllabus"],
    queryFn: () => customFetch<SyllabusItem[]>("/api/admin/syllabus"),
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE_URL}/api/admin/syllabus`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create syllabus");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "syllabus"] });
      setExamName("");
      setReadUrl("");
      setDownloadUrl("");
      setFile(null);
      setFileName("");
      toast({ title: "Created", description: "Syllabus record created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => {
      return customFetch<SyllabusItem>(`/api/admin/syllabus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "syllabus"] });
      setEditingId(null);
      toast({ title: "Updated", description: "Syllabus updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<any>(`/api/admin/syllabus/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "syllabus"] });
      toast({ title: "Deleted", description: "Syllabus record deleted" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    const data = new FormData();
    data.append("examName", examName.trim());

    if (uploadMode === "file") {
      if (!file) {
        setError("Please select a syllabus PDF file");
        return;
      }
      data.append("file", file);
    } else {
      if (readUrl.trim()) data.append("readUrl", readUrl.trim());
      if (downloadUrl.trim()) data.append("downloadUrl", downloadUrl.trim());
    }

    createMutation.mutate(data);
  };

  const startEdit = (item: SyllabusItem) => {
    setEditingId(item.id);
    setEditingName(item.examName);
  };

  const handleSaveEdit = (id: number) => {
    if (!editingName.trim()) return;
    updateMutation.mutate({ id, body: { examName: editingName.trim() } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 p-2"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          Syllabus
        </h1>
        <p className="text-gray-500 mt-2">
          Manage exam curriculums by uploading PDFs or sharing reference links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Card */}
        <Card className="border border-border/50 bg-white shadow-sm p-5 h-fit rounded-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> New Curriculum
          </h2>

          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                uploadMode === "file"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                uploadMode === "url"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              URL Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Exam Name *</Label>
              <Input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. UPSC CSE 2026..."
                required
              />
            </div>

            {uploadMode === "file" ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="syllabus-file-input"
                />
                <label htmlFor="syllabus-file-input" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">
                    {fileName || "Select PDF document"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF max 50MB</p>
                </label>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Read URL (Optional)</Label>
                  <Input
                    value={readUrl}
                    onChange={(e) => setReadUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Download URL (Optional)</Label>
                  <Input
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-700 text-xs font-semibold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-11"
            >
              {createMutation.isPending ? "Creating..." : "Create Syllabus"}
            </Button>
          </form>
        </Card>

        {/* Table List Card */}
        <Card className="border border-border/50 bg-white shadow-sm lg:col-span-2 overflow-hidden rounded-2xl">
          {isLoading ? (
            <p className="p-6 text-center text-gray-500">Loading syllabus list...</p>
          ) : list.length === 0 ? (
            <div className="p-12">
              <Empty>
                <EmptyTitle>No syllabus configured yet</EmptyTitle>
                <EmptyDescription>
                  Fill out the form on the left to add your first syllabus.
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Syllabus Reference Links</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-gray-900 max-w-[200px]">
                        {editingId === item.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 rounded-lg"
                            autoFocus
                          />
                        ) : (
                          <span className="line-clamp-1">{item.examName}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.readUrl && (
                            <Badge variant="outline" className="text-xs bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border-indigo-100 cursor-pointer" onClick={() => window.open(item.readUrl!, "_blank")}>
                              Read online
                            </Badge>
                          )}
                          {item.downloadUrl && (
                            <Badge variant="outline" className="text-xs bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 border-emerald-100 cursor-pointer" onClick={() => window.open(item.downloadUrl!, "_blank")}>
                              Download PDF
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveEdit(item.id)}
                              disabled={updateMutation.isPending}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(item)}
                            >
                              <Edit3 className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(item.id)}
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
    </motion.div>
  );
}