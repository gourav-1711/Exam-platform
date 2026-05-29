import React from "react";
import { Link, useLocation } from "wouter";
import { Home, BookOpen, Newspaper, FileText, Menu, Search, User, Bell, ChevronRight, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 border-r border-border bg-card z-50">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Pathshala</span>
            </div>
          </Link>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search exams..." className="pl-9 bg-muted/50 border-none rounded-xl" />
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          <NavItem href="/" icon={Home} label="Home" />
          <NavItem href="/quiz" icon={FileText} label="Daily Quizzes" />
          <NavItem href="/current-affairs" icon={Newspaper} label="Current Affairs" />
          <NavItem href="/study-notes" icon={BookOpen} label="Study Notes" />
          <div className="pt-6 pb-2 px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</p>
          </div>
          <NavItem href="/pyq" icon={FileText} label="PYQ Papers" />
          <NavItem href="/ncert-mcq" icon={BookOpen} label="NCERT MCQs" />
          <NavItem href="/ncert-books" icon={BookOpen} label="NCERT Books" />
          <NavItem href="/mock-tests" icon={FileText} label="Mock Tests" />
          <div className="pt-6 pb-2 px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support</p>
          </div>
          <NavItem href="/support" icon={MessageCircle} label="AI Support" />
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=manish" />
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Manish Kumar</p>
              <p className="text-xs text-muted-foreground truncate">UPSC Aspirant</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 w-full">
        {/* Mobile Top Nav */}
        <header className="md:hidden glass-nav sticky top-0 z-40 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Pathshala</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src="https://i.pravatar.cc/150?u=manish" />
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-border flex items-center justify-around px-2 h-16 z-50 bg-background pb-safe">
          <MobileNavItem href="/" icon={Home} label="Home" />
          <MobileNavItem href="/quiz" icon={FileText} label="Quiz" />
          <MobileNavItem href="/current-affairs" icon={Newspaper} label="News" />
          <MobileNavItem href="/study-notes" icon={BookOpen} label="Notes" />
          <MobileNavItem href="/menu" icon={Menu} label="More" />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}>
        <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
        <span>{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
      </div>
    </Link>
  );
}

function MobileNavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href}>
      <div className={`flex flex-col items-center justify-center w-16 h-full gap-1 cursor-pointer transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}>
        <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
        <span className="text-[10px] font-medium">{label}</span>
      </div>
    </Link>
  );
}
