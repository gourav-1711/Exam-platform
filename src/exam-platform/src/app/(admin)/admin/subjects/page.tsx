"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListSubjects, customFetch } from "@/lib/api";
import type { Subject } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Trash2, Edit3, Check, X, BookOpen, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { motion } from "framer-motion";

export default function SubjectsAdminPage() {
  const { data: subjects = [], isLoading } = useListSubjects();
  const [name, setName] = useState("");
  const [examCategory, setExamCategory] = useState("General");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [deleteTargetId, setDeleteId] = useState<string | null>(null);

  const invalidateSubjects = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all() });
  };

  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      await customFetch(`/api/admin/subjects`, {
        method: "POST",
        body: JSON.stringify({ name: trimmedName, examCategory }),
        headers: { "Content-Type": "application/json" },
      });
      toast({ title: "Created", description: "Subject created successfully" });
      setName("");
      setExamCategory("General");
      invalidateSubjects();
    } catch (err: unknown) {
      toast({
        title: "Create failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditingName(subject.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id: string) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) return;

    try {
      await customFetch(`/api/admin/subjects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: trimmedName }),
        headers: { "Content-Type": "application/json" },
      });
      toast({ title: "Updated", description: "Subject updated successfully" });
      cancelEdit();
      invalidateSubjects();
    } catch (err: unknown) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customFetch(`/api/admin/subjects/${id}`, {
        method: "DELETE",
      });
      toast({ title: "Deleted", description: "Subject deleted successfully" });
      invalidateSubjects();
    } catch (err: unknown) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-6xl mx-auto space-y-6 p-2"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Subjects
        </h1>
        <p className="text-gray-500 mt-2">
          Manage dynamic subjects used for question grouping and curriculum configurations.
        </p>
      </div>

      <form onSubmit={createSubject} className="flex gap-2 mb-4 max-w-lg">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New subject name..."
          className="rounded-xl h-11 flex-1"
        />
        <select
          value={examCategory}
          onChange={(e) => setExamCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-11"
        >
          <option value="General">General</option>
          <option value="UPSC">UPSC</option>
          <option value="SSC">SSC</option>
          <option value="Banking">Banking</option>
          <option value="Railway">Railway</option>
          <option value="State PSC">State PSC</option>
        </select>
        <Button type="submit" disabled={!name.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-11 font-bold shrink-0">
          Create
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : subjects.length === 0 ? (
        <Empty>
          <EmptyTitle>No subjects found</EmptyTitle>
          <EmptyDescription>Create a subject to get started.</EmptyDescription>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-semibold text-gray-900">
                  {editingId === s.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full rounded-xl"
                      autoFocus
                    />
                  ) : (
                    <span className="flex items-center gap-2">
                      {s.name}
                      <span className="text-[10px] text-gray-400 font-mono">/{s.slug}</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {s.examCategory ?? "General"}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-50 text-gray-400 border border-gray-200"
                  }`}>
                    {s.isActive ? <BadgeCheck className="w-3 h-3" /> : null}
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-gray-700">
                  {s.questionCount ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === s.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveEdit(s.id)}
                        disabled={!editingName.trim()}
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        <X className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(s)}
                      >
                        <Edit3 className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(s.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDeleteDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) handleDelete(deleteTargetId);
        }}
      />
    </motion.div>
  );
}