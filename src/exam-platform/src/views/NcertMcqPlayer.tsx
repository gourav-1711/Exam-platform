"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageTransition } from "@/components/shared/PageTransition";
import { useRequireAuth } from "@/components/shared/RequireAuthModal";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface McqQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string | null;
}

interface McqResponse {
  data: McqQuestion[];
  total: number;
  page: number;
  totalPages: number;
}

export default function NcertMcqPlayer() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const setId = params?.slug ?? "";
  const [page, setPage] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth guard on mount
  useEffect(() => {
    (async () => {
      const authed = await requireAuth(() => true);
      if (!authed) {
        router.replace("/ncert-mcq");
        return;
      }
      setAuthChecked(true);
    })();
  }, []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Fetch exam set details
  const { data: setData } = useQuery<{ title?: string; classNum?: number }>({
    queryKey: ["exam-set", setId],
    queryFn: () => apiFetch<{ title?: string; classNum?: number }>(`/exam-sets/${setId}`),
    enabled: !!setId,
  });

  const { data, isLoading, error } = useQuery<McqResponse>({
    queryKey: ["ncert-mcq-questions", setId, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), setId });
      return apiFetch<McqResponse>(`/ncert-mcq/questions?${params.toString()}`);
    },
    enabled: !!setId,
  });

  const questions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  React.useEffect(() => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
  }, [page, data]);

  const currentQ = questions[currentQIndex] as McqQuestion | undefined;
  const isLastQ = currentQIndex === questions.length - 1;
  const isFirstQ = currentQIndex === 0;
  const isCorrect = selectedOption === currentQ?.correctIndex;

  const handleOptionSelect = (idx: number) => {
    if (showAnswer || !currentQ) return;
    setSelectedOption(idx);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (isLastQ) {
      if (page < totalPages) setPage((p) => p + 1);
    } else {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (!isFirstQ) {
      setCurrentQIndex((prev) => prev - 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else if (page > 1) setPage((p) => p - 1);
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header with back button and set title */}
      <div className="flex items-center gap-4">
        <Link href="/ncert-mcq">
          <Button variant="ghost" className="-ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sets
          </Button>
        </Link>
        {setData && (
          <div className="text-sm text-muted-foreground ml-auto">
            {setData.title} {setData.classNum && `• Class ${setData.classNum}`}
          </div>
        )}
      </div>

      {/* MCQ Player */}
      {isLoading ? (
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      ) : error ? (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          Failed to load questions. Please try again later.
        </div>
      ) : !currentQ ? (
        <div className="py-16">
          <Empty>
            <EmptyTitle>No questions found</EmptyTitle>
            <EmptyDescription>This set doesn't have any questions yet.</EmptyDescription>
          </Empty>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {page}/{totalPages}</span>
            <span>Q {currentQIndex + 1}/{questions.length}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${currentQIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 rounded-2xl border-border/50 shadow-sm space-y-5">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {currentQIndex + 1}
                  </div>
                  <p className="text-base md:text-lg font-medium leading-relaxed">{currentQ.text}</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt: string, i: number) => {
                    const isSelected = selectedOption === i;
                    const isCorrectOpt = currentQ.correctIndex === i;
                    const isWrong = showAnswer && isSelected && !isCorrectOpt;
                    const showCorrect = showAnswer && isCorrectOpt;

                    return (
                      <div
                        key={i}
                        onClick={() => handleOptionSelect(i)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                          !showAnswer && "hover:border-primary/40 hover:bg-primary/5",
                          showAnswer && "cursor-default",
                          isSelected && !showAnswer && "border-primary bg-primary/5",
                          showCorrect && "border-emerald-500 bg-emerald-50 text-emerald-800",
                          isWrong && "border-destructive bg-destructive/10 text-destructive",
                          !showAnswer && !isSelected && "border-border bg-card",
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold",
                          showCorrect ? "border-emerald-500 bg-emerald-500 text-white" :
                          isWrong ? "border-destructive bg-destructive text-white" :
                          isSelected ? "border-primary bg-primary text-white" :
                          "border-muted-foreground/30"
                        )}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="flex-1">{opt}</span>
                        {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {isWrong && <AlertCircle className="w-5 h-5 text-destructive shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showAnswer && currentQ.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl bg-blue-50 border border-blue-100"
                  >
                    <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2 text-sm">
                      <Lightbulb className="w-4 h-4" /> Explanation
                    </div>
                    <p className="text-sm text-blue-900 leading-relaxed">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={isFirstQ && page === 1} className="rounded-xl gap-2">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={isLastQ && page >= totalPages} className="rounded-xl gap-2 bg-foreground text-background hover:bg-foreground/90">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </PageTransition>
  );
}
