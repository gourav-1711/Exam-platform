import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, BookOpen, Newspaper, FileText, MessageCircle,
  GraduationCap, BookMarked, Library, Search, User, X, Menu,
  Info, Phone, Shield, ScrollText, FlaskConical, ChevronDown, ChevronUp
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
      { href: "/pyq", icon: FileText, label: "PYQ Papers" },
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
  { href: "/", icon: Home, label: "Home" },
  { href: "/quiz", icon: FlaskConical, label: "Quiz" },
  { href: "/current-affairs", icon: Newspaper, label: "News" },
  { href: "/study-notes", icon: BookMarked, label: "Notes" },
  { href: "/mock-tests", icon: GraduationCap, label: "Tests" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background md:flex-row">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col md:pl-64 w-full">
        <MobileTopNav />
        <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
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
            <p className="text-sm font-semibold truncate">Manish Kumar</p>
            <p className="text-xs text-muted-foreground truncate">UPSC Aspirant</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileTopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden glass-nav sticky top-0 z-40 px-4 h-14 flex items-center justify-between">
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">
            <span className="text-foreground">Manish Ki </span>
            <span className="text-primary">Pathshala</span>
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
          <Search className="w-4 h-4" />
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-sm block leading-none">Manish Ki</span>
                  <span className="font-bold text-sm text-primary leading-none">Pathshala</span>
                </div>
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
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">MK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Manish Kumar</p>
                  <p className="text-xs text-muted-foreground">UPSC Aspirant</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-border flex items-center justify-around px-2 h-16 z-50 bg-background">
      {BOTTOM_NAV.map((item) => (
        <MobileNavItem key={item.href} {...item} />
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

function MobileNavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href}>
      <div className={`flex flex-col items-center justify-center w-14 h-full gap-0.5 cursor-pointer transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}>
        <Icon className={`w-5 h-5 ${isActive ? "fill-primary/10" : ""}`} />
        <span className="text-[9px] font-semibold">{label}</span>
      </div>
    </Link>
  );
}
