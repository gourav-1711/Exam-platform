import React, { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Star, Zap, BookOpen, RotateCcw, TrendingUp } from "lucide-react";
import { Show } from "@clerk/react";
import { Link } from "wouter";

// ─── Mock leaderboard data ─────────────────────────────────────────────────────
const LEADERBOARD = [
  { rank: 1,  name: "Priya Sharma",       state: "Rajasthan",  score: 4820, quizzes: 148, mocks: 22, pyqs: 310, avatar: "PS", color: "bg-yellow-500" },
  { rank: 2,  name: "Rahul Meena",        state: "Rajasthan",  score: 4615, quizzes: 139, mocks: 19, pyqs: 285, avatar: "RM", color: "bg-gray-400" },
  { rank: 3,  name: "Sunita Verma",       state: "UP",         score: 4430, quizzes: 132, mocks: 17, pyqs: 260, avatar: "SV", color: "bg-amber-700" },
  { rank: 4,  name: "Arjun Yadav",        state: "Bihar",      score: 4210, quizzes: 127, mocks: 15, pyqs: 240, avatar: "AY", color: "bg-violet-500" },
  { rank: 5,  name: "Kavita Gupta",       state: "MP",         score: 3980, quizzes: 120, mocks: 14, pyqs: 220, avatar: "KG", color: "bg-blue-500" },
  { rank: 6,  name: "Suresh Patel",       state: "Gujarat",    score: 3750, quizzes: 112, mocks: 13, pyqs: 198, avatar: "SP", color: "bg-green-500" },
  { rank: 7,  name: "Deepika Rajput",     state: "Rajasthan",  score: 3620, quizzes: 108, mocks: 12, pyqs: 185, avatar: "DR", color: "bg-pink-500" },
  { rank: 8,  name: "Vikram Singh",       state: "HP",         score: 3490, quizzes: 102, mocks: 11, pyqs: 170, avatar: "VS", color: "bg-teal-500" },
  { rank: 9,  name: "Anita Kumari",       state: "Jharkhand",  score: 3310, quizzes: 98,  mocks: 10, pyqs: 155, avatar: "AK", color: "bg-orange-500" },
  { rank: 10, name: "Manoj Tiwari",       state: "UP",         score: 3180, quizzes: 94,  mocks: 9,  pyqs: 140, avatar: "MT", color: "bg-indigo-500" },
];

type Tab = "allTime" | "monthly" | "weekly";

const TABS: { key: Tab; label: string }[] = [
  { key: "allTime", label: "All Time" },
  { key: "monthly", label: "This Month" },
  { key: "weekly",  label: "This Week" },
];

function PodiumCard({ entry, size }: { entry: typeof LEADERBOARD[0]; size: "lg" | "md" | "sm" }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className={cn(
      "flex flex-col items-center gap-1.5 px-3",
      size === "lg" ? "order-2" : size === "md" ? "order-1" : "order-3"
    )}>
      <span className="text-2xl">{medals[entry.rank - 1]}</span>
      <div className={cn(
        "rounded-full border-4 border-white shadow-lg flex items-center justify-center font-extrabold text-white",
        entry.color,
        size === "lg" ? "w-16 h-16 text-lg" : size === "md" ? "w-13 h-13 w-[52px] h-[52px] text-base" : "w-11 h-11 text-sm"
      )}>
        {entry.avatar}
      </div>
      <p className={cn("font-bold text-foreground text-center leading-tight", size === "lg" ? "text-sm" : "text-xs")}>{entry.name.split(" ")[0]}</p>
      <div className={cn(
        "flex items-center gap-1 font-extrabold text-primary",
        size === "lg" ? "text-base" : "text-sm"
      )}>
        <Trophy className={cn("shrink-0", size === "lg" ? "w-4 h-4" : "w-3 h-3")} />
        {entry.score.toLocaleString()}
      </div>
      <div className={cn(
        "rounded-full text-center text-white font-bold py-3",
        entry.rank === 1 ? "bg-yellow-400 w-10 h-10 flex items-center justify-center text-lg" :
        entry.rank === 2 ? "bg-gray-400 w-9 h-9 flex items-center justify-center" :
        "bg-amber-700 w-8 h-8 flex items-center justify-center text-sm",
        "rounded-full shadow-md"
      )}>
        {entry.rank}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>("allTime");

  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <PageTransition className="min-h-screen bg-gray-50 pb-6">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-violet-700 to-purple-600 px-4 pt-5 pb-8 text-white">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight">Leaderboard</h1>
            <p className="text-xs text-violet-200">Top aspirants across India</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-1 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Podium (top 3) ── */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm py-5 px-2">
          <div className="flex items-end justify-center gap-2">
            {[top3[1], top3[0], top3[2]].map((entry) => (
              <PodiumCard key={entry.rank} entry={entry} size={entry.rank === 1 ? "lg" : entry.rank === 2 ? "md" : "sm"} />
            ))}
          </div>
        </div>

        {/* ── Rest of rankings ── */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rankings</p>
            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-teal-500" /> Quizzes</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-violet-500" /> Mocks</span>
              <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3 text-pink-500" /> PYQs</span>
            </div>
          </div>

          {rest.map((entry, idx) => (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                idx !== rest.length - 1 && "border-b border-border/30"
              )}
            >
              {/* Rank */}
              <span className="w-6 text-center text-sm font-extrabold text-muted-foreground shrink-0">
                {entry.rank}
              </span>

              {/* Avatar */}
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0", entry.color)}>
                {entry.avatar}
              </div>

              {/* Name + state */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{entry.name}</p>
                <p className="text-[10px] text-muted-foreground">{entry.state}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 text-[10px] font-bold shrink-0">
                <span className="text-teal-600">{entry.quizzes}</span>
                <span className="text-violet-600">{entry.mocks}</span>
                <span className="text-pink-600">{entry.pyqs}</span>
              </div>

              {/* Score */}
              <div className="text-right shrink-0 ml-1">
                <p className="text-sm font-extrabold text-primary">{entry.score.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Auth CTA (shown when signed out) ── */}
        <Show when="signed-out">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="font-bold text-sm text-foreground">Want to appear on the leaderboard?</p>
            <p className="text-xs text-muted-foreground">Sign in and start solving quizzes, mock tests and PYQs to earn points!</p>
            <Link href="/sign-in">
              <button className="mt-1 bg-primary text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                Sign In to Compete
              </button>
            </Link>
          </div>
        </Show>

        {/* ── Scoring guide ── */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4">
          <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" /> How Points Are Earned
          </p>
          <div className="space-y-2">
            {[
              { icon: Zap, color: "text-teal-600 bg-teal-100", label: "Quiz question correct", pts: "+5 pts" },
              { icon: BookOpen, color: "text-violet-600 bg-violet-100", label: "Mock test completed", pts: "+50 pts" },
              { icon: RotateCcw, color: "text-pink-600 bg-pink-100", label: "PYQ solved correctly", pts: "+3 pts" },
              { icon: Trophy, color: "text-yellow-600 bg-yellow-100", label: "Daily streak maintained", pts: "+20 pts" },
            ].map(({ icon: Icon, color, label, pts }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", color.split(" ")[1])}>
                  <Icon className={cn("w-3.5 h-3.5", color.split(" ")[0])} />
                </div>
                <span className="flex-1 text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-extrabold text-primary">{pts}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
