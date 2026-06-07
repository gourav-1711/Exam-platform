"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, BookOpen, Check, X } from "lucide-react";
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
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { customFetch, useListSubjects } from "@/lib/api";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { motion } from "framer-motion";

interface StudyNote {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  medium: string;
  url: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StudyNotesAdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: pyqSubjects = [] } = useListSubjects();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [medium, setMedium] = useState("English");
  const [url, setUrl] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingName] = useState("");
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  // Set default subject once subjects load
  useEffect(() => {
    if (pyqSubjects.length > 0 && !subject) {
      setSubject(pyqSubjects[0].name);
    }
  }, [pyqSubjects, subject]);

  const { data: notes = [], isLoading } = useQuery<StudyNote[]>({
    queryKey: ["admin", "study-notes"],
    queryFn: () => customFetch<StudyNote[]>("/api/admin/study-notes"),
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      return customFetch<StudyNote>("/api/admin/study-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
      setTitle("");
      setDescription("");
      setUrl("");
      toast({ title: "Created", description: "Study note created" });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => {
      return customFetch<StudyNote>(`/api/admin/study-notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
      setEditingId(null);
      toast({ title: "Updated", description: "Study note updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<any>(`/api/admin/study-notes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "study-notes"] });
      toast({ title: "Deleted", description: "Study note deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      subject,
      medium,
      url: url.trim() || null,
    });
  };

  const startEdit = (note: StudyNote) => {
    setEditingId(note.id);
    setEditingName(note.title);
  };

  const handleSaveEdit = (id: number) => {
    if (!editingTitle.trim()) return;
    updateMutation.mutate({ id, body: { title: editingTitle.trim() } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-6xl mx-auto space-y-8 p-2"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Study Notes
        </h1>
        <p className="text-gray-500 mt-2">
          Upload and manage study materials and notes PDF read URLs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Card */}
        <Card className="border border-border/50 bg-white shadow-sm p-5 h-fit rounded-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> New Study Note
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Indian Polity chapter 1..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description (Optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this note..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {pyqSubjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Medium</Label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>URL (Optional)</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/notes/..."
              />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              {createMutation.isPending ? "Creating..." : "Create Note"}
            </Button>
          </form>
        </Card>

        {/* Table List Card */}
        <Card className="border border-border/50 bg-white shadow-sm lg:col-span-2 overflow-hidden rounded-2xl">
          {isLoading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : notes.length === 0 ? (
            <div className="p-12">
              <Empty>
                <EmptyTitle>No study notes yet</EmptyTitle>
                <EmptyDescription>
                  Fill out the form on the left to create one.
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Medium</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-semibold text-gray-900 max-w-[200px]">
                        {editingId === note.id ? (
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 rounded-lg"
                            autoFocus
                          />
                        ) : (
                          <span className="line-clamp-1">{note.title}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {note.subject}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-gray-500">
                          {note.medium}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === note.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveEdit(note.id)}
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
                              onClick={() => startEdit(note)}
                            >
                              <Edit3 className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(note.id)}
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