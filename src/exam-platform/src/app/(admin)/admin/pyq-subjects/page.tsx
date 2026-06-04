"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListPyqSubjects } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
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
import { Trash2, Edit3, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PyqSubjectsAdmin() {
  const { data: subjects = [], isLoading } = useListPyqSubjects();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateSubjects = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/pyq/subjects"] });
  };

  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      await customFetch(`/api/admin/pyq-subjects`, {
        method: "POST",
        body: JSON.stringify({ name: trimmedName }),
        headers: { "Content-Type": "application/json" },
      } as any);
      toast({ title: "Created", description: "Subject created" });
      setName("");
      invalidateSubjects();
    } catch (err: any) {
      toast({
        title: "Create failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  };

  const startEdit = (subject: any) => {
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
      await customFetch(`/api/admin/pyq-subjects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: trimmedName }),
        headers: { "Content-Type": "application/json" },
      } as any);
      toast({ title: "Updated", description: "Subject updated" });
      cancelEdit();
      invalidateSubjects();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subject?")) return;
    try {
      await customFetch(`/api/admin/pyq-subjects/${id}`, {
        method: "DELETE",
      } as any);
      toast({ title: "Deleted", description: "Subject deleted" });
      invalidateSubjects();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">PYQ Subjects</h2>
          <p className="text-sm text-muted-foreground">
            Manage subjects used for PYQ question grouping.
          </p>
        </div>
      </div>

      <form onSubmit={createSubject} className="flex gap-2 mb-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New subject name"
        />
        <Button type="submit" disabled={!name.trim()}>
          Create
        </Button>
      </form>

      {isLoading ? (
        <p>Loading…</p>
      ) : subjects.length === 0 ? (
        <Empty>
          <EmptyTitle>No subjects</EmptyTitle>
          <EmptyDescription>Create a subject to get started.</EmptyDescription>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>
                  {editingId === s.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  ) : (
                    s.name
                  )}
                </TableCell>
                <TableCell>{s.questionCount ?? 0}</TableCell>
                <TableCell className="text-right">
                  {editingId === s.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveEdit(s.id)}
                        disabled={!editingName.trim()}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(s)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
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
    </div>
  );
}
