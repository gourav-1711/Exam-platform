"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGetQuiz, getGetQuizQueryKey, useSaveAttempt } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Share2, Lightbulb, BarChart3, List, X } from "lucide-react";
import ReportCardModal from "@/components/quiz/ReportCardModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function QuizPlayer() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { data: quiz, isLoading } = useGetQuiz(id, { query: { enabled: !!id, queryKey: getGetQuizQueryKey(id) } });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  
  const saveAttempt = useSaveAttempt();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartedRef = useRef(false);

  // Start timer when quiz loads — use a ref to prevent duplicate starts
  useEffect(() => {
    if (quiz && !isSubmitted && !timerStartedRef.current && timeLeft === 0) {
      timerStartedRef.current = true;
      setTimeLeft(quiz.durationMins * 60);
    }
  }, [quiz, isSubmitted]);

  // Countdown timer — only runs when timeLeft > 0
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && quiz && !isSubmitted && timerStartedRef.current) {
      // Auto-submit when timer reaches 0, but only after timer was actually started
      handleSubmit();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isSubmitted, quiz]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const handleSubmit = () => {
    // Calculate score BEFORE setState to avoid closure issues
    let computedScore = 0;
    let correct = 0;
    let wrong = 0;
    Object.entries(answers).forEach(([qIdx, ansIdx]) => {
      if (questions[Number(qIdx)].correctIndex === ansIdx) {
        computedScore += 1;
        correct++;
      } else {
        computedScore -= quiz!.negativeMarking;
        wrong++;
      }
    });

    setIsSubmitted(true);
    setShowExplanation(true);
    setShowReportCard(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Save attempt history
    const unanswered = questions.length - Object.keys(answers).length;
    saveAttempt.mutate({
      quizId: id,
      score: computedScore,
      totalMarks: questions.length,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: unanswered,
      timeTakenSecs: quiz!.durationMins * 60 - timeLeft,
      isPassed: computedScore >= questions.length / 2,
    });
  };

  const handleShare = () => {
    if (navigator.share && quiz) {
      navigator.share({
        title: `Manish Ki Pathshala - ${quiz.title}`,
        text: `I'm taking the ${quiz.title} quiz! Join me.`,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-3xl" /></div>;
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-6">This quiz doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push("/daily-quiz")} size="lg" className="rounded-xl">
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Questions Available</h2>
          <p className="text-muted-foreground mb-2">
            <strong>{quiz.title}</strong> doesn&apos;t have any questions yet.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Questions are no longer directly linked to quizzes. They need to be added before this quiz can be played.
          </p>
          <Button onClick={() => router.push("/daily-quiz")} size="lg" className="rounded-xl">
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQ = questions[currentQIndex];
  const isLastQ = currentQIndex === questions.length - 1;
  const isFirstQ = currentQIndex === 0;

  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  if (isSubmitted) {
    Object.entries(answers).forEach(([qIdx, ansIdx]) => {
      if (questions[Number(qIdx)].correctIndex === ansIdx) {
        score += 1;
        correctCount++;
      } else {
        score -= quiz.negativeMarking;
        wrongCount++;
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col md:flex-row overflow-hidden">
      <div className="flex-1 flex flex-col h-full bg-muted/20 min-h-0">
        <header className="h-14 md:h-16 px-3 md:px-8 border-b bg-background flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg hidden md:inline-block truncate max-w-sm">{quiz.title}</span>
            <span className="md:hidden font-bold">Q {currentQIndex + 1}/{questions.length}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!isSubmitted && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold border",
                timeLeft < 60 ? "text-destructive border-destructive bg-destructive/10 animate-pulse" : "border-border bg-card text-foreground"
              )}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            
            {/* Mobile palette toggle */}
            <Button variant="ghost" size="icon" onClick={() => setShowMobilePalette(true)} className="md:hidden">
              <List className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            
            {isSubmitted ? (
              <Button onClick={() => router.push("/daily-quiz")} variant="default">Exit</Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" className="bg-primary text-white">Submit Test</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You have answered {Object.keys(answers).length} out of {questions.length} questions.
                      Are you sure you want to submit? You won&apos;t be able to change your answers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Yes, Submit</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 md:p-8 min-h-0">
          <div className="max-w-3xl mx-auto pb-safe">
            {isSubmitted && (
              <div className="mb-6 p-4 rounded-xl bg-card border shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Quiz Completed</h3>
                  <p className="text-sm text-muted-foreground">Score: {score.toFixed(2)} | Correct: {correctCount} | Wrong: {wrongCount}</p>
                </div>
                <Button variant="outline" onClick={() => setShowExplanation(!showExplanation)}>
                  {showExplanation ? "Hide Explanations" : "Show Explanations"}
                </Button>
              </div>
            )}

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
                    const isCorrect = isSubmitted && currentQ.correctIndex === i;
                    const isWrongSelected = isSubmitted && isSelected && !isCorrect;
                    
                    let bgClass = "bg-card hover:bg-muted border-border";
                    if (isSelected && !isSubmitted) bgClass = "bg-primary/5 border-primary text-primary shadow-sm";
                    if (isCorrect) bgClass = "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-medium";
                    if (isWrongSelected) bgClass = "bg-destructive/10 border-destructive text-destructive";

                    return (
                      <div
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                          bgClass,
                          isSubmitted && "cursor-default"
                        )}
                      >
                        <div className={cn(
                          "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                          isSelected && !isSubmitted ? "border-primary bg-primary text-white" : "border-muted-foreground/30",
                          isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                          isWrongSelected && "border-destructive bg-destructive text-white"
                        )}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {isWrongSelected && <AlertCircle className="w-5 h-5 text-destructive shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {isSubmitted && showExplanation && currentQ.explanation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900"
                  >
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold mb-2">
                      <Lightbulb className="w-5 h-5" /> Explanation
                    </div>
                    <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={isFirstQ}
                className="rounded-xl h-12 px-6"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Previous
              </Button>
              
              <Button
                onClick={() => {
                  if (!isLastQ) {
                    setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1));
                  }
                }}
                disabled={isLastQ && isSubmitted}
                className="rounded-xl h-12 px-6 bg-foreground text-background hover:bg-foreground/90"
              >
                {isLastQ && !isSubmitted ? "Finish" : (
                  <>Next <ChevronRight className="w-5 h-5 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Card Modal */}
      <ReportCardModal
        open={showReportCard}
        onOpenChange={setShowReportCard}
        title={quiz.title}
        totalQuestions={questions.length}
        correctCount={correctCount}
        wrongCount={wrongCount}
        unansweredCount={questions.length - Object.keys(answers).length}
        score={score}
        maxScore={questions.length}
        negativeMarking={quiz.negativeMarking}
        onViewExplanations={() => setShowExplanation(true)}
        onShare={handleShare}
      />

      {/* Mobile question palette sheet */}
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

                let bgClass = "bg-muted text-muted-foreground hover:bg-muted/80";
                if (isAnswered && !isSubmitted) bgClass = "bg-primary/20 text-primary border-primary/30";
                if (isCurrent && !isSubmitted) bgClass = "ring-2 ring-primary bg-background";

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
                      bgClass
                    )}
                  >
                    {i + 1}
                  </Button>
                );
              })}
            </div>

            <div className="mt-8 space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted"></div> Unanswered</div>
              {isSubmitted && (
                <>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Correct</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div> Wrong</div>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop question palette */}
      <div className="hidden md:flex w-72 border-l bg-card flex-col overflow-hidden">
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
              
              let bgClass = "bg-muted text-muted-foreground hover:bg-muted/80";
              if (isAnswered && !isSubmitted) bgClass = "bg-primary/20 text-primary border-primary/30";
              if (isCurrent && !isSubmitted) bgClass = "ring-2 ring-primary bg-background";
              
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
                  onClick={() => setCurrentQIndex(i)}
                  className={cn(
                    "h-10 rounded-lg text-sm transition-all border border-transparent",
                    bgClass
                  )}
                >
                  {i + 1}
                </Button>
              );
            })}
          </div>
          
          <div className="mt-8 space-y-2 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted"></div> Unanswered</div>
            {isSubmitted && (
              <>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Correct</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div> Wrong</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
