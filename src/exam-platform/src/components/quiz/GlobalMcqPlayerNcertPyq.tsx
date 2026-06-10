"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { PageTransition } from "@/components/shared/PageTransition";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import ReportCardModal from "@/components/quiz/ReportCardModal";
import { Clock } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export type GlobalMcqModeNcertPyq = "ncert" | "pyq";

type SaveAttemptPayload = {
  examId?: string;
  quizId?: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTakenSecs: number;
  isPassed: boolean;
};

export type GlobalMcqQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string] | string[];
  correctIndex: number;
  explanation: string | null;
};

type Props = {
  mode: GlobalMcqModeNcertPyq;
  title: string;
  durationMins: number;
  questions: GlobalMcqQuestion[];
  isLoading?: boolean;
  error?: string | null;
  onBackHref: string;
  // DB saving
  saveAttempt: (payload: {
    examId?: string;
    quizId?: string;
    score: number;
    totalMarks: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    timeTakenSecs: number;
    isPassed: boolean;
  }) => void;
  negativeMarking?: number; // optional (if needed for scoring)
  maxScore?: number; // optional override
};

export default function GlobalMcqPlayerNcertPyq({
  mode,
  title,
  durationMins,
  questions,
  isLoading,
  error,
  onBackHref,
  saveAttempt,
  negativeMarking = 0,
  maxScore,
}: Props) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number>(durationMins * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartedRef = useRef(false);

  const [showExplanation, setShowExplanation] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  useEffect(() => {
    // Reset whenever question list changes.
    setCurrentQIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setShowAnswer(false);
    setIsSubmitted(false);
    setShowExplanation(false);
    setShowReportCard(false);
    setTimeLeft(durationMins * 60);
    timerStartedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [durationMins, questions]);

  useEffect(() => {
    if (!timerStartedRef.current && questions.length > 0) {
      timerStartedRef.current = true;
    }
  }, [questions.length]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    if (timeLeft === 0 && !isSubmitted && timerStartedRef.current) {
      handleSubmit();
    }

    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isSubmitted, questions, answers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalQuestions = questions.length;

  const currentQ = questions[currentQIndex];

  const isLastQ = currentQIndex === totalQuestions - 1;
  const isFirstQ = currentQIndex === 0;

  const computed = useMemo(() => {
    if (!isSubmitted) {
      return {
        score: 0,
        correctCount: 0,
        wrongCount: 0,
      };
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    for (let i = 0; i < totalQuestions; i++) {
      const ansIdx = answers[i];
      if (ansIdx === undefined) continue;
      const q = questions[i];
      if (!q) continue;
      if (ansIdx === q.correctIndex) {
        correctCount++;
        // default scoring: +1 per correct
        score += 1;
      } else {
        wrongCount++;
        score -= negativeMarking;
      }
    }

    return { score, correctCount, wrongCount };
  }, [answers, isSubmitted, negativeMarking, questions, totalQuestions]);

  const maxScoreResolved = maxScore ?? totalQuestions;

  const handleSelectOption = (idx: number) => {
    if (isSubmitted || !currentQ || showAnswer) return;
    setSelectedOption(idx);
    setShowAnswer(true);
    setAnswers((prev) => ({ ...prev, [currentQIndex]: idx }));
  };

  const handleNext = () => {
    if (!isSubmitted && !showAnswer) return;

    if (isLastQ) {
      // in NCERT/PYQ mode, submit explicitly/auto by timer; keep Next behavior to advance
      return;
    }

    setCurrentQIndex((p) => p + 1);
    setSelectedOption(null);
    setShowAnswer(false);
  };

  const handlePrev = () => {
    if (!isFirstQ) {
      setCurrentQIndex((p) => p - 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const correctCount = computed.correctCount;
    const wrongCount = computed.wrongCount;

    // unanswered = questions length - answered entries
    const skippedCount = totalQuestions - Object.keys(answers).length;

    const totalMarks = maxScoreResolved;
    const score = computed.score;

    const payload = {
      score,
      totalMarks,
      correctCount,
      wrongCount,
      skippedCount,
      timeTakenSecs: durationMins * 60 - timeLeft,
      isPassed: score >= totalMarks / 2,
    };

    setIsSubmitted(true);
    setShowExplanation(true);
    setShowReportCard(true);

    saveAttempt(payload);
  };

  if (isLoading) {
    return (
      <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      </PageTransition>
    );
  }

  if (!questions.length) {
    return (
      <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="py-16">
          <Empty>
            <EmptyTitle>No questions found</EmptyTitle>
            <EmptyDescription>
              This {mode.toUpperCase()} set has no questions.
            </EmptyDescription>
          </Empty>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={onBackHref}>
          <Button variant="ghost" className="-ml-4">
            Back
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground ml-auto">{title}</div>

        {!isSubmitted && (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold border",
              timeLeft < 60
                ? "text-destructive border-destructive bg-destructive/10 animate-pulse"
                : "border-border bg-card text-foreground",
            )}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentQIndex}-${showAnswer}-${isSubmitted}`}
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
              <p className="text-base md:text-lg font-medium leading-relaxed">
                {currentQ.text}
              </p>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrectOpt = currentQ.correctIndex === i;
                const isWrong = showAnswer && isSelected && !isCorrectOpt;
                const showCorrect = showAnswer && isCorrectOpt;

                return (
                  <div
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                      !showAnswer &&
                        !isSubmitted &&
                        "hover:border-primary/40 hover:bg-primary/5",
                      (showAnswer || isSubmitted) && "cursor-default",
                      isSelected &&
                        !showAnswer &&
                        "border-primary bg-primary/5",
                      showCorrect &&
                        "border-emerald-500 bg-emerald-50 text-emerald-800",
                      isWrong &&
                        "border-destructive bg-destructive/10 text-destructive",
                      !showAnswer && !isSelected && "border-border bg-card",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold",
                        showCorrect
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isWrong
                            ? "border-destructive bg-destructive text-white"
                            : isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/30",
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {showCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isWrong && (
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    )}
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
                <p className="text-sm text-blue-900 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={isFirstQ}
          className="rounded-xl gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        {!isSubmitted ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAnswer(false)}
              disabled={showAnswer}
              className="hidden sm:inline-flex"
            >
              Clear
            </Button>

            {isLastQ ? (
              <Button
                onClick={handleSubmit}
                className="rounded-xl gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                Submit
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="rounded-xl gap-2 bg-foreground text-background hover:bg-foreground/90"
                disabled={!showAnswer}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={() => (window.location.href = onBackHref)}
            className="rounded-xl gap-2"
          >
            Back
          </Button>
        )}
      </div>

      {/* Mobile palette */}
      <Sheet open={showMobilePalette} onOpenChange={setShowMobilePalette}>
        <SheetContent side="right" className="w-72 p-0">
          <div className="p-4 border-b font-semibold flex items-center justify-between">
            Question Palette
            <span className="text-xs font-normal text-muted-foreground">
              {Object.keys(answers).length}/{questions.length} Answered
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isCurrent = currentQIndex === i;

                let bgClass =
                  "bg-muted text-muted-foreground hover:bg-muted/80";
                if (isAnswered && !isSubmitted)
                  bgClass = "bg-primary/20 text-primary border-primary/30";
                if (isCurrent && !isSubmitted)
                  bgClass = "ring-2 ring-primary bg-background";

                if (isSubmitted) {
                  const isCorrect = answers[i] === questions[i].correctIndex;
                  if (!isAnswered) bgClass = "bg-muted";
                  else if (isCorrect) bgClass = "bg-emerald-500 text-white";
                  else bgClass = "bg-destructive text-white";
                }

                return (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentQIndex(i);
                      setSelectedOption(answers[i] ?? null);
                      setShowAnswer(
                        isSubmitted ? true : answers[i] !== undefined,
                      );
                      setShowMobilePalette(false);
                    }}
                    className={cn(
                      "h-10 rounded-lg text-sm transition-all border border-transparent",
                      bgClass,
                    )}
                  >
                    {i + 1}
                  </Button>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ReportCardModal
        open={showReportCard}
        onOpenChange={setShowReportCard}
        title={title}
        totalQuestions={totalQuestions}
        correctCount={computed.correctCount}
        wrongCount={computed.wrongCount}
        unansweredCount={totalQuestions - Object.keys(answers).length}
        score={computed.score}
        maxScore={maxScoreResolved}
        negativeMarking={negativeMarking}
        onViewExplanations={() => setShowExplanation(true)}
        onShare={undefined}
      />
    </PageTransition>
  );
}
