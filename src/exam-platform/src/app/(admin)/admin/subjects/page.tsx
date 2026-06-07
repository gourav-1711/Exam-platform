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
import { Trash2, Edit3, Check, X, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { motion } from "framer-motion";

export default function SubjectsAdminPage() {
  const { data: subjects = [], isLoading } = useListSubjects();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

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
        body: JSON.stringify({ name: trimmedName }),
        headers: { "Content-Type": "application/json" },
      });
      toast({ title: "Created", description: "Subject created successfully" });
      setName("");
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

  const saveEdit = async (id: number) => {
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

  const handleDelete = async (id: number) => {
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

      <form onSubmit={createSubject} className="flex gap-2 mb-4 max-w-md">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New subject name..."
          className="rounded-xl h-11"
        />
        <Button type="submit" disabled={!name.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-11 font-bold">
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
              <TableHead>Linked Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((s: Subject) => (
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
                    s.name
                  )}
                </TableCell>
                <TableCell>{(s as any).questionCount ?? 0}</TableCell>
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