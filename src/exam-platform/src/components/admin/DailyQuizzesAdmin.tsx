"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Quiz = {
  id: number;
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalQuestions: number;
  isPublished: boolean;
};

type QuizzesResponse = {
  quizzes: Quiz[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
};

async function fetchQuizzes(pageNum = 1) {
  return customFetch<QuizzesResponse>(
    `/api/admin/daily-quiz?page=${pageNum}&limit=20`,
  );
}

export default function DailyQuizzesAdmin() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "daily-quizzes", page],
    queryFn: () => fetchQuizzes(page),
    staleTime: 60 * 1000,
  });

  const quizzes = data?.quizzes ?? [];

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this quiz?")) {
      return;
    }

    try {
      await customFetch(`/api/admin/daily-quiz/${id}`, {
        method: "DELETE",
      } as any);
      queryClient.invalidateQueries(["admin", "daily-quizzes"]);
      toast({ title: "Deleted", description: "Quiz deleted." });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">
            Manage scheduled daily quizzes.
          </p>
        </div>
        <div>
          <Link
            href="/admin/daily-quizzes/new"
            className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create
          </Link>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && (
        <p className="text-red-600">
          {(error as any)?.message ?? String(error)}
        </p>
      )}

      {!isLoading && quizzes.length === 0 ? (
        <div className="p-6">
          <Empty>
            <EmptyTitle>No daily quizzes</EmptyTitle>
            <EmptyDescription>Create one to get started.</EmptyDescription>
          </Empty>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">
                  <div className="line-clamp-1">{q.title}</div>
                </TableCell>
                <TableCell>
                  {q.scheduledDate} {q.scheduledTime}
                </TableCell>
                <TableCell>{q.durationMinutes}m</TableCell>
                <TableCell>{q.totalQuestions}</TableCell>
                <TableCell>
                  <Badge variant={q.isPublished ? "secondary" : "outline"}>
                    {q.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/daily-quizzes/${q.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/daily-quizzes/${q.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          void handleDelete(q.id);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {data?.pagination?.totalPages && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
