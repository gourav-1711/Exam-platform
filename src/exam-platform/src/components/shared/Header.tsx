"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogIn } from "lucide-react";
import SearchBar from "./SearchBar";
import { ClientSignedIn, ClientSignedOut, NAV_GROUPS, SidebarNavItem } from "../layout/AppLayout";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationsPanel from "./NotificationPanel";
import AuthButton from "./AuthButton";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-40 bg-white border-b border-border/60 px-3 h-14 flex items-center gap-2.5 shadow-sm"
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </motion.button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            App navigation and search
          </SheetDescription>
          <div className="p-5 border-b flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow text-white font-bold text-sm">
              MK
            </div>
            <div>
              <span className="font-bold text-sm block leading-none">
                Manish Ki Pathshala
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Education Redefined
              </span>
            </div>
          </div>
          <div className="px-4 py-1 border-b border-border/50">
            <SearchBar onNavigate={() => setOpen(false)} />
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <div className="pt-4 pb-1.5 px-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {group.label}
                    </p>
                  </div>
                )}
                {group.items.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    {...item}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t">
            <ClientSignedIn>
              <Link href="/profile" onClick={() => setOpen(false)}>
                <div className="flex items-center gap-3 hover:bg-muted rounded-xl p-1 transition-colors cursor-pointer">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(user?.firstName?.[0] ?? "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {user?.fullName ?? user?.firstName ?? "Learner"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View Profile →
                    </p>
                  </div>
                </div>
              </Link>
            </ClientSignedIn>
            <ClientSignedOut>
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                <div className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer">
                  <LogIn className="w-4 h-4" /> Sign In / Sign Up
                </div>
              </Link>
            </ClientSignedOut>
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/" className="flex items-center gap-1.5 shrink-0 min-w-0">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
          className="w-7 h-7 rounded-lg bg-linear-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow cursor-pointer"
        >
          MK
        </motion.div>
        <div className="leading-none min-w-0">
          <p className="font-extrabold text-xs text-foreground tracking-tight truncate">
            Manish Ki Pathshala
          </p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
            Education Redefined
          </p>
        </div>
      </Link>

      <div className="flex-1 min-w-0 md:block hidden">
        <SearchBar />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <NotificationsPanel />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <AuthButton compact />
        </motion.div>
      </div>
    </motion.header>
  );
}