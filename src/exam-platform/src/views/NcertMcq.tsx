"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import {
  useListNcertBooks,
  ListNcertBooksParams,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Download } from "lucide-react";

export default function NcertBooks() {
  const [classNum, setClassNum] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");

  const queryParams: ListNcertBooksParams = {
    classNum: classNum !== "all" ? Number(classNum) : undefined,
    subject: subject !== "all" ? subject : undefined,
  };

  const { data: books, isLoading } = useListNcertBooks(queryParams);

  return (
    <PageTransition className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">NCERT Books</h1>
        <p className="text-muted-foreground">
          Download or read NCERT textbooks online for free.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-card border rounded-2xl shadow-sm">
        <Select value={classNum} onValueChange={setClassNum}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {[6, 7, 8, 9, 10, 11, 12].map((c) => (
              <SelectItem key={c} value={c.toString()}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="History">History</SelectItem>
            <SelectItem value="Geography">Geography</SelectItem>
            <SelectItem value="Polity">Polity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array(8)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
        ) : books?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-2xl">
            No books found for selected criteria.
          </div>
        ) : (
          books?.map((book) => (
            <Card
              key={book.id}
              className="card-hover border-border/50 rounded-2xl bg-card overflow-hidden flex flex-col"
            >
              <div className="h-32 bg-gradient-to-br from-emerald-400 to-teal-600 p-4 flex items-end">
                <span className="text-white/90 font-bold tracking-widest text-2xl uppercase">
                  NCERT
                </span>
              </div>
              <CardContent className="p-5 flex flex-col flex-1 gap-4 -mt-6">
                <div className="bg-card border shadow-sm rounded-xl p-3 flex-1 flex flex-col items-center text-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-2">
                    Class {book.classNum} • {book.subject}
                  </span>
                  <h3 className="font-bold leading-tight">{book.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {book.medium} Medium
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    title="Read"
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> Read
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Download"
                    className="shrink-0 rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageTransition>
  );
}
