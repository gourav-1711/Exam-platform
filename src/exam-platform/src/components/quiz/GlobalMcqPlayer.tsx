"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { PageTransition } from "@/components/shared/PageTransition";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import ReportCardModal from "@/components/quiz/ReportCardModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMcqSession } from "./useMcqSession";

// ── Types ────────────────────────────────────────────────────────────────

export type GlobalMcqMode = "mock" | "daily" | "ncert" | "pyq";

export type GlobalMcqQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
};

export type ResultData = {
  title: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  maxScore: number;
  negativeMarking: number;
  questions: GlobalMcqQuestion[];
  userAnswers: Record<number, number>;
  timeTakenSecs: number;
};

type Props = {
  mode: GlobalMcqMode;
  title: string;
  durationMins: number;
  questions: GlobalMcqQuestion[];
  sessionId?: string;
  isLoading?: boolean;
  error?: string | null;
  onBackHref: string;
  /** For mock/daily — marks-based scoring */
  maxMarks?: number;
  /** Negative marking per wrong answer (default 0) */
  negativeMarking?: number;
  /** For ncert/pyq — max score (default = questions.length) */
  maxScore?: number;
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
  /** If provided, navigates to a separate results page instead of showing inline report modal */
  onShowResult?: (data: ResultData) => void;
};

// ── Scoring helpers ──────────────────────────────────────────────────────

function computeScore(
  mode: GlobalMcqMode,
  answers: Record<number, number>,
  questions: GlobalMcqQuestion[],
  maxMarks: number,
  negativeMarking: number,
  maxScore: number,
) {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const chosen = answers[i];
    if (chosen === undefined) continue;

    const q = questions[i];
    if (chosen === q.correctIndex) {
      correctCount++;
      if (mode === "ncert" || mode === "pyq") {
        score += 1;
      } else {
        score += maxMarks / questions.length;
      }
    } else {
      wrongCount++;
      score -= negativeMarking;
    }
  }

  return { score, correctCount, wrongCount };
}

// ── Component ────────────────────────────────────────────────────────────

export default function GlobalMcqPlayer({
  mode,
  title,
  durationMins,
  questions,
  sessionId,
  isLoading,
  error,
  onBackHref,
  maxMarks: maxMarksProp,
  negativeMarking = 0,
  maxScore: maxScoreProp,
  saveAttempt,
  onShowResult,
}: Props) {
  const resolvedMaxMarks = maxMarksProp ?? questions.length;
  const resolvedMaxScore = maxScoreProp ?? questions.length;

  const {
    answers,
    setAnswers,
    currentQIndex,
    setCurrentQIndex,
    isSubmitted,
    setIsSubmitted,
    timeLeft,
    reset,
  } = useMcqSession(sessionId, durationMins, questions.length);

  const [showExplanation, setShowExplanation] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  const submittedRef = useRef(false);
  const initializedRef = useRef(false);

  // FIX: keep a ref to the latest handleSubmit so the auto-submit effect never
  // closes over a stale version of the function (avoids the eslint-disable
  // hack that was masking the stale-closure bug).
  const handleSubmitRef = useRef<() => void>(() => {});

  // Reset local UI state when questions change (new session)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    reset();
    setShowExplanation(false);
    setShowReportCard(false);
    setShowMobilePalette(false);
    submittedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMins, questions]);

  // FIX: use the ref so this effect always calls the current handleSubmit,
  // even though timeLeft (and therefore the effect) updates every second.
  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      handleSubmitRef.current();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentQIndex];
  const isLastQ = currentQIndex === questions.length - 1;
  const isFirstQ = currentQIndex === 0;

  // Score computation — stable reference via useMemo
  const computed = useMemo(
    () =>
      computeScore(
        mode,
        answers,
        questions,
        resolvedMaxMarks,
        negativeMarking,
        resolvedMaxScore,
      ),
    [
      mode,
      answers,
      questions,
      resolvedMaxMarks,
      negativeMarking,
      resolvedMaxScore,
    ],
  );

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const handleSubmit = () => {
    if (isSubmitted || submittedRef.current) return;
    submittedRef.current = true;

    // Compute from current answers (avoids stale closure issues)
    const { score, correctCount, wrongCount } = computeScore(
      mode,
      answers,
      questions,
      resolvedMaxMarks,
      negativeMarking,
      resolvedMaxScore,
    );

    const answeredCount = Object.keys(answers).length;
    const skippedCount = questions.length - answeredCount;
    const timeTakenSecs = durationMins * 60 - timeLeft;
    const isPassed =
      score >= (mode === "mock" ? resolvedMaxMarks : resolvedMaxScore) / 2;

    setIsSubmitted(true);
    setShowExplanation(true);

    // FIX: saveAttempt is called BEFORE onShowResult/navigation so the mutation
    // fires while the component is still mounted. Previously the order was the
    // same but the intent wasn't explicit — make it clear with a comment.
    saveAttempt({
      score,
      totalMarks:
        mode === "mock" || mode === "daily"
          ? resolvedMaxMarks
          : resolvedMaxScore,
      correctCount,
      wrongCount,
      skippedCount,
      timeTakenSecs,
      isPassed,
    });

    // Navigate to separate results page if handler provided.
    // This may unmount the component — saveAttempt must already be fired above.
    if (onShowResult) {
      onShowResult({
        title,
        totalQuestions: questions.length,
        correctCount,
        wrongCount,
        skippedCount,
        score,
        maxScore:
          mode === "mock" || mode === "daily"
            ? resolvedMaxMarks
            : resolvedMaxScore,
        negativeMarking,
        questions,
        userAnswers: { ...answers },
        timeTakenSecs,
      });
    } else {
      // Fallback: show inline report modal
      setShowReportCard(true);
    }
  };

  // FIX: keep the ref pointing at the latest handleSubmit after every render
  handleSubmitRef.current = handleSubmit;

  // ── Loading / Error / Empty states ──────────────────────────────────────

  if (isLoading) {
    return (
      <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-[600px] w-full rounded-3xl" />
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
            <EmptyTitle>No questions available</EmptyTitle>
            <EmptyDescription>
              This{" "}
              {mode === "mock"
                ? "mock test"
                : mode === "daily"
                  ? "quiz"
                  : mode.toUpperCase()}{" "}
              has no questions yet.
            </EmptyDescription>
          </Empty>
        </div>
      </PageTransition>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col md:flex-row overflow-hidden">
      {/* ── Question area ─────────────────────────────────────────────── */}

      <div className="flex-1 flex flex-col h-full bg-muted/20 min-h-0">
        {/* Header */}
        <header className="h-14 md:h-16 px-3 md:px-8 border-b bg-background flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = onBackHref;
              }}
              className="hidden md:inline-flex"
            >
              Exit
            </Button>
            <span
              className="font-bold text-lg hidden md:inline-block truncate max-w-sm cursor-pointer"
              onClick={() => {
                window.location.href = onBackHref;
              }}
            >
              {title}
            </span>
            <span className="md:hidden font-bold">
              Q {currentQIndex + 1}/{questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
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

            {/* Question palette button (mobile) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobilePalette(true)}
              className="md:hidden"
            >
              {Object.keys(answers).length}/{questions.length}
            </Button>

            {/* Submit or Exit button */}
            {isSubmitted ? (
              <Button
                onClick={() => {
                  window.location.href = onBackHref;
                }}
                variant="default"
              >
                Exit
              </Button>
            ) : (
              <Button
                variant="default"
                className="bg-primary text-white"
                onClick={handleSubmit}
              >
                Submit Test
              </Button>
            )}
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 min-h-0">
          <div className="max-w-3xl mx-auto pb-safe">
            {/* Completed banner */}
            {isSubmitted && (
              <div className="mb-6 p-4 rounded-xl bg-card border shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Completed</h3>
                  <p className="text-sm text-muted-foreground">
                    Score:{" "}
                    {computed.score.toFixed(
                      mode === "ncert" || mode === "pyq" ? 0 : 2,
                    )}{" "}
                    | Correct: {computed.correctCount} | Wrong:{" "}
                    {computed.wrongCount} | Skipped:{" "}
                    {questions.length - Object.keys(answers).length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation((v) => !v)}
                >
                  {showExplanation ? "Hide Explanations" : "Show Explanations"}
                </Button>
              </div>
            )}

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {currentQIndex + 1}
                  </div>
                  <h2 className="text-lg md:text-xl font-medium leading-relaxed">
                    {currentQ.text}
                  </h2>
                </div>

                <div className="space-y-3">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = answers[currentQIndex] === i;
                    const isCorrect =
                      isSubmitted && currentQ.correctIndex === i;
                    const isWrongSelected =
                      isSubmitted && isSelected && !isCorrect;

                    let bgClass = "bg-card hover:bg-muted border-border";
                    if (isSelected && !isSubmitted)
                      bgClass =
                        "bg-primary/5 border-primary text-primary shadow-sm";
                    if (isCorrect)
                      bgClass =
                        "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-medium";
                    if (isWrongSelected)
                      bgClass =
                        "bg-destructive/10 border-destructive text-destructive";

                    return (
                      <div
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                          bgClass,
                          isSubmitted && "cursor-default",
                          !isSubmitted &&
                            "hover:border-primary/40 hover:bg-primary/5",
                        )}
                      >
                        <div
                          className={cn(
                            "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                            isSelected && !isSubmitted
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/30",
                            isCorrect &&
                              "border-emerald-500 bg-emerald-500 text-white",
                            isWrongSelected &&
                              "border-destructive bg-destructive text-white",
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isWrongSelected && (
                          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {isSubmitted && showExplanation && currentQ.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100"
                  >
                    <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                      <Lightbulb className="w-5 h-5" /> Explanation
                    </div>
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQIndex((p) => Math.max(0, p - 1))}
                disabled={isFirstQ}
                className="rounded-xl h-12 px-6"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Previous
              </Button>

              <Button
                onClick={() => {
                  if (isLastQ && !isSubmitted) {
                    handleSubmit();
                  } else if (!isLastQ) {
                    setCurrentQIndex((p) =>
                      Math.min(questions.length - 1, p + 1),
                    );
                  }
                }}
                disabled={isLastQ && isSubmitted}
                className="rounded-xl h-12 px-6 bg-foreground text-background hover:bg-foreground/90"
              >
                {isLastQ && !isSubmitted ? (
                  "Finish & Submit"
                ) : (
                  <>
                    Next <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Report card modal (fallback if no onShowResult) ───────────── */}
      <ReportCardModal
        open={showReportCard}
        onOpenChange={setShowReportCard}
        title={title}
        totalQuestions={questions.length}
        correctCount={computed.correctCount}
        wrongCount={computed.wrongCount}
        unansweredCount={questions.length - Object.keys(answers).length}
        score={computed.score}
        maxScore={
          mode === "mock" || mode === "daily"
            ? resolvedMaxMarks
            : resolvedMaxScore
        }
        negativeMarking={negativeMarking}
        questions={questions}
        userAnswers={answers}
        onViewExplanations={() => setShowExplanation(true)}
      />

      {/* ── Mobile question palette ──────────────────────────────────── */}
      <Sheet open={showMobilePalette} onOpenChange={setShowMobilePalette}>
        <SheetContent side="right" className="w-72 p-0">
          {/* FIX: SheetTitle is required by shadcn — omitting it throws an
              accessibility error in strict mode and breaks some versions. */}
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center justify-between text-sm font-semibold">
              Question Palette
              <span className="text-xs font-normal text-muted-foreground">
                {Object.keys(answers).length}/{questions.length} Answered
              </span>
            </SheetTitle>
          </SheetHeader>
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
    </div>
  );
}
