import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, BookOpen, Newspaper, FileText, MessageCircle,
  GraduationCap, BookMarked, Library, Search, Bell, Menu,
  Info, Phone, Shield, ScrollText, FlaskConical, RotateCcw, StickyNote
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavGroup = {
  label?: string;
  items: { href: string; icon: React.ElementType; label: string }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/", icon: Home, label: "Home" },
      { href: "/quiz", icon: FlaskConical, label: "Daily Quizzes" },
      { href: "/current-affairs", icon: Newspaper, label: "Current Affairs" },
      { href: "/study-notes", icon: BookMarked, label: "Study Notes" },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/pyq", icon: RotateCcw, label: "PYQ Papers" },
      { href: "/pyp", icon: FileText, label: "Prev Year Papers" },
      { href: "/ncert-mcq", icon: BookOpen, label: "NCERT MCQs" },
      { href: "/ncert-books", icon: Library, label: "NCERT Books" },
      { href: "/syllabus", icon: ScrollText, label: "Syllabus" },
      { href: "/mock-tests", icon: GraduationCap, label: "Mock Tests" },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/support", icon: MessageCircle, label: "AI Support" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/about", icon: Info, label: "About Us" },
      { href: "/contact", icon: Phone, label: "Contact" },
      { href: "/privacy", icon: Shield, label: "Privacy Policy" },
      { href: "/terms", icon: ScrollText, label: "Terms & Conditions" },
    ],
  },
];

const BOTTOM_NAV = [
  { href: "/", icon: Home, label: "HOME" },
  { href: "/quiz", icon: FlaskConical, label: "QUIZZES" },
  { href: "/study-notes", icon: StickyNote, label: "NOTES" },
  { href: "/pyq", icon: RotateCcw, label: "PYQS" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background md:flex-row">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col md:pl-64 w-full">
        <MobileTopNav />
        <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden bg-gray-50 md:bg-background">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 border-r border-border bg-card z-50 overflow-y-auto">
      <div className="p-6 shrink-0">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md shadow-primary/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground leading-none block">Manish Ki</span>
              <span className="font-bold text-base tracking-tight text-primary leading-none">Pathshala</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="px-4 pb-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search exams..." className="pl-9 bg-muted/50 border-none rounded-xl h-9 text-sm" />
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="pt-5 pb-1.5 px-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{group.label}</p>
              </div>
            )}
            {group.items.map((item) => (
              <SidebarNavItem key={item.href} {...item} />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border-2 border-primary/20">
            <AvatarImage src="https://i.pravatar.cc/150?u=manish" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">MK</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Manish Swami</p>
            <p className="text-xs text-muted-foreground truncate">Learner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileTopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-border/60 px-4 h-14 flex items-center gap-3 shadow-sm">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow text-white font-bold text-sm">
              MK
            </div>
            <div className="leading-none">
              <p className="font-extrabold text-xs text-foreground tracking-tight">Manish Ki Pathshala</p>
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Education Redefined</p>
            </div>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <div className="p-5 border-b flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              MK
            </div>
            <div>
              <span className="font-bold text-sm block leading-none">Manish Ki Pathshala</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Education Redefined</span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <div className="pt-4 pb-1.5 px-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{group.label}</p>
                  </div>
                )}
                {group.items.map((item) => (
                  <SidebarNavItem key={item.href} {...item} onClick={() => setOpen(false)} />
                ))}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src="https://i.pravatar.cc/150?u=manish" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">MS</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">Manish Swami</p>
                <p className="text-xs text-muted-foreground">Learner</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search quizzes, notes, news..."
          className="pl-8 h-9 text-xs bg-gray-100 border-none rounded-xl"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 relative">
          <Bell className="w-4.5 h-4.5 text-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="leading-none text-right hidden xs:block">
            <p className="text-[10px] font-bold text-foreground">Manish Swami</p>
            <p className="text-[9px] text-primary font-semibold uppercase">Learner</p>
          </div>
          <Avatar className="w-7 h-7 border border-primary/20">
            <AvatarImage src="https://i.pravatar.cc/150?u=manish" />
            <AvatarFallback className="bg-primary text-white font-bold text-xs">M</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border/60 flex items-center h-16 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {BOTTOM_NAV.slice(0, 2).map((item) => (
        <MobileNavItem key={item.href} {...item} isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />
      ))}

      <Link href="/current-affairs" className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-700 flex items-center justify-center shadow-lg shadow-primary/40 -mt-4">
          <Newspaper className="w-5 h-5 text-white" />
        </div>
      </Link>

      {BOTTOM_NAV.slice(2).map((item) => (
        <MobileNavItem key={item.href} {...item} isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />
      ))}
    </nav>
  );
}

function SidebarNavItem({
  href, icon: Icon, label, onClick
}: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href} onClick={onClick}>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer text-sm ${
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}>
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
        <span className="truncate">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
      </div>
    </Link>
  );
}

function MobileNavItem({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string; isActive: boolean }) {
  return (
    <Link href={href} className="flex-1">
      <div className={`flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors py-2 ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}>
        <Icon className={`w-5 h-5 ${isActive ? "" : ""}`} strokeWidth={isActive ? 2.5 : 1.8} />
        <span className={`text-[9px] font-bold tracking-wide ${isActive ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
      </div>
    </Link>
  );
}
