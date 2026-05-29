import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { PageTransition } from "@/components/shared/PageTransition";
import {
  Zap, Newspaper, BookOpen, FlaskConical, RotateCcw, FileText,
  List, Cpu, BookMarked, Bot, Play, GraduationCap, Star, MessageCircle,
  X, AlertTriangle, CheckCircle2, Info, Megaphone, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useListAnnouncements } from "@workspace/api-client-react";
import { AnimatePresence, motion } from "framer-motion";

type Feature = {
  label: string;
  sublabel: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href: string;
  isNew?: boolean;
};

const FEATURES: Feature[] = [
  {
    label: "Daily Free Quiz",
    sublabel: "OPEN NOW",
    icon: Zap,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    href: "/quiz",
    isNew: true,
  },
  {
    label: "Daily Current Affairs",
    sublabel: "OPEN NOW",
    icon: Newspaper,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    href: "/current-affairs",
  },
  {
    label: "Study Notes",
    sublabel: "OPEN NOW",
    icon: BookOpen,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    href: "/study-notes",
  },
  {
    label: "Mock Tests",
    sublabel: "OPEN NOW",
    icon: FlaskConical,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    href: "/mock-tests",
  },
  {
    label: "PYQ's",
    sublabel: "OPEN NOW",
    icon: RotateCcw,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    href: "/pyq",
    isNew: true,
  },
  {
    label: "PYP's",
    sublabel: "OPEN NOW",
    icon: FileText,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    href: "/pyp",
  },
  {
    label: "Syllabus",
    sublabel: "OPEN NOW",
    icon: List,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    href: "/syllabus",
  },
  {
    label: "NCERT MCQ's",
    sublabel: "OPEN NOW",
    icon: Cpu,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    href: "/ncert-mcq",
    isNew: true,
  },
  {
    label: "NCERT Books",
    sublabel: "OPEN NOW",
    icon: BookMarked,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    href: "/ncert-books",
  },
  {
    label: "AI Learning Support",
    sublabel: "OPEN NOW",
    icon: Bot,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    href: "/support",
  },
];

const FEATURES_LIST = [
  { title: "Free Daily Quizzes", desc: "Curated subject-wise MCQs updated every morning to sharpen your concepts." },
  { title: "Current Affairs", desc: "Daily national & international news in simplified, exam-ready format." },
  { title: "Study Notes", desc: "Premium notes in Hindi & English covering UPSC, SSC, RAS syllabi." },
  { title: "Full Mock Tests", desc: "Timed, scored mock exams with negative marking and detailed analytics." },
  { title: "NCERT Solutions", desc: "Chapter-wise MCQs and full e-books for Class 6–12 — free forever." },
  { title: "AI Learning Support", desc: "24/7 AI tutor to answer your exam doubts instantly." },
];

export default function Home() {
  return (
    <PageTransition className="min-h-screen bg-gray-50">

      {/* ── Announcement Banner ── */}
      <AnnouncementBanner />

      {/* ── Welcome Banner ── */}
      <div className="p-4 pt-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 to-purple-600 p-5 text-white shadow-lg">
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold leading-tight">
                Welcome, <span className="text-yellow-300">Learner!</span>
              </h1>
              <p className="text-sm text-purple-100 leading-snug max-w-[200px]">
                Master your exams with expert notes, daily quizzes and AI strategy.
              </p>
            </div>
            <Link href="/quiz">
              <Button size="sm" className="bg-white text-primary hover:bg-gray-100 font-bold rounded-xl shrink-0 shadow-md shadow-black/10 gap-1.5 px-4 h-10">
                <Play className="w-3.5 h-3.5 fill-primary" />
                START QUIZ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Feature Grid ── */}
      <div className="px-4 pb-2">
        <div className="grid grid-cols-3 gap-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.href} {...feature} />
          ))}
        </div>
      </div>

      {/* ── About / Hindi Section ── */}
      <div className="mx-4 mt-4 mb-6 rounded-2xl bg-white border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 text-center space-y-3 border-b border-border/40">
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">
            <GraduationCap className="w-3 h-3" /> Best Learning Platform
          </div>
          <h2 className="text-xl font-extrabold text-red-600 leading-tight">
            मनीष की पाठशाला में आपका स्वागत है –
            <span className="block">गुणवत्तापूर्ण शिक्षा हेतु समर्पित</span>
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            A Great Place For Learn And Grow.
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-violet-600 fill-violet-200" />
            </div>
            <h3 className="font-bold text-sm text-foreground">वेबसाइट के बेहतरीन फीचर्स</h3>
          </div>

          <div className="space-y-3">
            {FEATURES_LIST.map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold leading-snug">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WhatsApp FAB ── */}
      <a
        href="https://wa.me/919999999999?text=Namaste!%20Mujhe%20Manish%20Ki%20Pathshala%20ke%20baare%20mein%20jaankari%20chahiye."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 md:bottom-6 z-50 group"
        aria-label="Chat on WhatsApp"
      >
        <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#25D366] flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-transform duration-200">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12.004 2C6.478 2 2 6.478 2 12.004c0 1.76.463 3.41 1.27 4.847L2 22l5.272-1.381A9.956 9.956 0 0012.004 22C17.526 22 22 17.526 22 12.004 22 6.478 17.526 2 12.004 2zm0 18.214a8.21 8.21 0 01-4.174-1.136l-.3-.177-3.13.82.835-3.05-.195-.314A8.204 8.204 0 013.786 12c0-4.536 3.692-8.228 8.224-8.228 4.536 0 8.224 3.692 8.224 8.228-.004 4.536-3.692 8.214-8.23 8.214z"/>
          </svg>
        </div>
        <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Chat with us
        </span>
      </a>

    </PageTransition>
  );
}

const TYPE_CONFIG = {
  urgent:  { bg: "bg-red-50",    border: "border-red-200",    icon: Megaphone,     iconColor: "text-red-600",    badge: "bg-red-600 text-white",    label: "URGENT" },
  warning: { bg: "bg-amber-50",  border: "border-amber-200",  icon: AlertTriangle, iconColor: "text-amber-600",  badge: "bg-amber-500 text-white",  label: "NOTICE" },
  success: { bg: "bg-green-50",  border: "border-green-200",  icon: CheckCircle2,  iconColor: "text-green-600",  badge: "bg-green-600 text-white",  label: "NEW" },
  info:    { bg: "bg-blue-50",   border: "border-blue-200",   icon: Info,          iconColor: "text-blue-600",   badge: "bg-blue-600 text-white",   label: "INFO" },
} as const;

function AnnouncementBanner() {
  const { data: announcements } = useListAnnouncements();
  const [dismissed, setDismissed] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem("dismissed_announcements");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const dismiss = (id: number) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    try { localStorage.setItem("dismissed_announcements", JSON.stringify([...next])); } catch {}
  };

  const visible = announcements?.filter((a) => !dismissed.has(a.id)) ?? [];
  if (visible.length === 0) return null;

  return (
    <div className="px-4 pt-3 space-y-2.5">
      <AnimatePresence initial={false}>
        {visible.map((ann) => {
          const cfg = TYPE_CONFIG[(ann.type as keyof typeof TYPE_CONFIG)] ?? TYPE_CONFIG.info;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "rounded-2xl border p-3.5 flex gap-3 items-start shadow-sm",
                cfg.bg, cfg.border
              )}>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.bg, "border", cfg.border)}>
                  <Icon className={cn("w-4 h-4", cfg.iconColor)} />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full", cfg.badge)}>
                      {cfg.label}
                    </span>
                    <p className="font-bold text-sm text-foreground leading-snug">{ann.title}</p>
                  </div>
                  {ann.body && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{ann.body}</p>
                  )}
                  {ann.linkText && ann.linkUrl && (
                    ann.linkUrl.startsWith("/") ? (
                      <Link href={ann.linkUrl}>
                        <span className={cn("inline-flex items-center gap-1 text-xs font-bold mt-1 cursor-pointer", cfg.iconColor)}>
                          {ann.linkText} <ChevronRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ) : (
                      <a href={ann.linkUrl} target="_blank" rel="noopener noreferrer"
                        className={cn("inline-flex items-center gap-1 text-xs font-bold mt-1", cfg.iconColor)}>
                        {ann.linkText} <ChevronRight className="w-3 h-3" />
                      </a>
                    )
                  )}
                </div>

                <button
                  onClick={() => dismiss(ann.id)}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/10 transition-colors mt-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ label, sublabel, icon: Icon, iconBg, iconColor, href, isNew }: Feature) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-3.5 flex flex-col items-center text-center gap-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 min-h-[110px] justify-center">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center relative", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
          {isNew && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
          )}
        </div>
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-foreground leading-snug">{label}</p>
          <p className="text-[9px] font-semibold text-red-500 uppercase tracking-wide flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            {sublabel}
          </p>
        </div>
      </div>
    </Link>
  );
}
