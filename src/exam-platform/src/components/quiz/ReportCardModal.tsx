"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Target,
  AlertCircle,
  Share2,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  maxScore: number;
  negativeMarking: number;
  timeTaken?: string;
  onViewExplanations?: () => void;
  onRetry?: () => void;
  onShare?: () => void;
}

export default function ReportCardModal({
  open,
  onOpenChange,
  title,
  totalQuestions,
  correctCount,
  wrongCount,
  unansweredCount,
  score,
  maxScore,
  timeTaken,
  onViewExplanations,
  onRetry,
  onShare,
}: ReportCardProps) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const accuracy = correctCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;

  const getPerformanceTier = () => {
    if (percentage >= 90) return { label: "Outstanding!", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: Sparkles };
    if (percentage >= 70) return { label: "Great Job!", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Trophy };
    if (percentage >= 50) return { label: "Good Effort", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Target };
    return { label: "Keep Practicing", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertCircle };
  };

  const tier = getPerformanceTier();
  const TierIcon = tier.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">Quiz Report Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Performance Banner */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn("rounded-2xl border-2 p-5 text-center", tier.bg)}
          >
            <TierIcon className={cn("w-10 h-10 mx-auto mb-2", tier.color)} />
            <h3 className={cn("text-xl font-extrabold", tier.color)}>{tier.label}</h3>
            <p className="text-3xl font-black text-gray-900 mt-1">{percentage}%</p>
            <p className="text-xs text-muted-foreground mt-1">Score: {score}/{maxScore}</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={CheckCircle2} label="Correct" value={correctCount} color="text-emerald-600" bg="bg-emerald-50" />
            <StatBox icon={XCircle} label="Wrong" value={wrongCount} color="text-red-600" bg="bg-red-50" />
            <StatBox icon={AlertCircle} label="Unanswered" value={unansweredCount} color="text-gray-500" bg="bg-gray-50" />
          </div>

          {/* Detail Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                Accuracy
              </div>
              <p className="text-lg font-bold text-gray-900">{accuracy}%</p>
            </div>
            {timeTaken && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Time Taken
                </div>
                <p className="text-lg font-bold text-gray-900">{timeTaken}</p>
              </div>
            )}
          </div>

          {/* Question Summary Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{correctCount} correct</span>
              <span>{wrongCount} wrong</span>
              <span>{unansweredCount} skip</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
              {correctCount > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-emerald-500"
                />
              )}
              {wrongCount > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(wrongCount / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  className="h-full bg-red-500"
                />
              )}
              {unansweredCount > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unansweredCount / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-gray-300"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onViewExplanations && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewExplanations}
                className="flex-1 rounded-xl"
              >
                Review Answers
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="rounded-xl"
              >
                <Share2 className="w-3.5 h-3.5" />
              </Button>
            )}
            {onRetry && (
              <Button
                size="sm"
                onClick={onRetry}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn("rounded-xl p-3 border text-center", bg, "border-gray-100")}
    >
      <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
      <p className="text-xl font-black text-gray-900">{value}</p>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
    </motion.div>
  );
}
