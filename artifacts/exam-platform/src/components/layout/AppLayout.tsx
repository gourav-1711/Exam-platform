import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, BookOpen, Newspaper, FileText, MessageCircle,
  GraduationCap, BookMarked, Library, Search, Bell, Menu,
  Info, Phone, Shield, ScrollText, FlaskConical, RotateCcw,
  StickyNote, X, Zap, Cpu, Bot
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavGroup = {
  label?: string;
  items: { href: string; icon: React.ElementType; label: string; keywords?: string }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/",                icon: Home,         label: "Home",             keywords: "home dashboard" },
      { href: "/quiz",            icon: Zap,          label: "Daily Quizzes",    keywords: "quiz mcq test questions" },
      { href: "/current-affairs", icon: Newspaper,    label: "Current Affairs",  keywords: "news current affairs daily" },
      { href: "/study-notes",     icon: BookMarked,   label: "Study Notes",      keywords: "notes study material" },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/pyq",         icon: RotateCcw,    label: "PYQ Papers",         keywords: "previous year questions pyq" },
      { href: "/pyp",         icon: FileText,     label: "Prev Year Papers",   keywords: "previous year papers pyp" },
      { href: "/ncert-mcq",   icon: Cpu,          label: "NCERT MCQs",         keywords: "ncert mcq class books" },
      { href: "/ncert-books", icon: Library,      label: "NCERT Books",        keywords: "ncert books class 6 7 8 9 10 11 12" },
      { href: "/syllabus",    icon: ScrollText,   label: "Syllabus",           keywords: "syllabus upsc ssc ras rrb" },
      { href: "/mock-tests",  icon: GraduationCap,label: "Mock Tests",         keywords: "mock test full exam" },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/support", icon: Bot, label: "AI Support", keywords: "ai chat support help" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/about",   icon: Info,       label: "About Us",          keywords: "about" },
      { href: "/contact", icon: Phone,      label: "Contact",           keywords: "contact phone email" },
      { href: "/privacy", icon: Shield,     label: "Privacy Policy",    keywords: "privacy policy" },
      { href: "/terms",   icon: ScrollText, label: "Terms & Conditions",keywords: "terms conditions" },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const BOTTOM_NAV = [
  { href: "/",            icon: Home,       label: "HOME" },
  { href: "/quiz",        icon: FlaskConical,label: "QUIZZES" },
  { href: "/study-notes", icon: StickyNote, label: "NOTES" },
  { href: "/pyq",         icon: RotateCcw,  label: "PYQS" },
];

// ─── SearchBar ────────────────────────────────────────────────────────────────
function SearchBar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length === 0 ? [] : ALL_NAV_ITEMS.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      (item.keywords ?? "").toLowerCase().includes(q)
    );
  }).slice(0, 6);

  const showDropdown = focused && query.trim().length > 0 && results.length > 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (href: string) => {
    navigate(href);
    setQuery("");
    setFocused(false);
    onNavigate?.();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search quizzes, notes, news..."
          className="w-full pl-8 pr-8 h-9 text-xs bg-gray-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-lg border border-border z-[200] overflow-hidden">
          {results.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onMouseDown={() => handleSelect(item.href)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {focused && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-lg border border-border z-[200] px-4 py-3 text-xs text-muted-foreground text-center">
          No results for "<span className="font-semibold text-foreground">{query}</span>"
        </div>
      )}
    </div>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────
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

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
function DesktopSidebar() {
  const [, navigate] = useLocation();
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
        <SearchBar onNavigate={() => {}} className="w-full" />
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

// ─── Mobile Top Nav ───────────────────────────────────────────────────────────
function MobileTopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-border/60 px-3 h-14 flex items-center gap-2.5 shadow-sm">

      {/* Hamburger button → opens sidebar sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="p-5 border-b flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow text-white font-bold text-sm">
              MK
            </div>
            <div>
              <span className="font-bold text-sm block leading-none">Manish Ki Pathshala</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Education Redefined</span>
            </div>
          </div>
          <div className="px-4 py-3 border-b border-border/50">
            <SearchBar onNavigate={() => setOpen(false)} />
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

      {/* App logo / brand */}
      <Link href="/" className="flex items-center gap-1.5 shrink-0 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow">
          MK
        </div>
        <div className="leading-none min-w-0">
          <p className="font-extrabold text-xs text-foreground tracking-tight truncate">Manish Ki Pathshala</p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Education Redefined</p>
        </div>
      </Link>

      {/* Search (flex-1) */}
      <div className="flex-1 min-w-0">
        <SearchBar />
      </div>

      {/* Bell + Avatar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 relative" aria-label="Notifications">
          <Bell className="w-[18px] h-[18px] text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <Avatar className="w-7 h-7 border border-primary/20">
          <AvatarImage src="https://i.pravatar.cc/150?u=manish" />
          <AvatarFallback className="bg-primary text-white font-bold text-xs">M</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
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

// ─── Shared Nav Item ──────────────────────────────────────────────────────────
function SidebarNavItem({
  href, icon: Icon, label, onClick
}: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href} onClick={onClick}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer text-sm",
        isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
        <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
        <span className="truncate">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
      </div>
    </Link>
  );
}

function MobileNavItem({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string; isActive: boolean }) {
  return (
    <Link href={href} className="flex-1">
      <div className={cn(
        "flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors py-2",
        isActive ? "text-primary" : "text-muted-foreground"
      )}>
        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
        <span className={cn("text-[9px] font-bold tracking-wide", isActive ? "text-primary" : "text-muted-foreground")}>{label}</span>
      </div>
    </Link>
  );
}
