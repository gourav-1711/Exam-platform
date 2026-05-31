"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListPyqQuestions, getListPyqQuestionsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PyqQuestions() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params?.subjectId ?? "";
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListPyqQuestions({ subjectId: Number(subjectId), page }, { query: { enabled: !!subjectId, queryKey: getListPyqQuestionsQueryKey({ subjectId: Number(subjectId), page }) } });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  React.useEffect(() => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
  }, [page, data]);

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-3xl" /></div>;
  }

  const questions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Link href="/pyq">
          <Button variant="ghost" className="-ml-4 mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        </Link>
        <p>No questions found for this subject.</p>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const isLastQ = currentQIndex === questions.length - 1;
  const isFirstQ = currentQIndex === 0;
  const isCorrect = selectedOption === currentQ.correctIndex;

  const handleOptionSelect = (idx: number) => {
    if (showAnswer) return;
    setSelectedOption(idx);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (isLastQ) {
      if (page < totalPages) {
        setPage(p => p + 1);
      }
    } else {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (!isFirstQ) {
      setCurrentQIndex(prev => prev - 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else if (page > 1) {
      setPage(p => p - 1);
    }
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pyq">
          <Button variant="ghost" className="-ml-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        </Link>
        <div className="ml-auto text-sm text-muted-foreground">
          Q {currentQIndex + 1}/{questions.length} · Page {page}/{totalPages}
        </div>
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
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {currentQIndex + 1}
              </div>
              <p className="text-base md:text-lg font-medium leading-relaxed">{currentQ.text}</p>
            </div>

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
                      !showAnswer && !isSelected && "border-border bg-card"
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

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={isFirstQ && page === 1} className="rounded-xl gap-2">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={isLastQ && page >= totalPages} className="rounded-xl gap-2 bg-foreground text-background hover:bg-foreground/90">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </PageTransition>
  );
}
