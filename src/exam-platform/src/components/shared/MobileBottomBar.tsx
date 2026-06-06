import {
  FlaskConical,
  Home,
  Newspaper,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNavItem } from "../layout/AppLayout";


const BOTTOM_NAV = [
  { href: "/", icon: Home, label: "HOME" },
  { href: "/quiz", icon: FlaskConical, label: "QUIZZES" },
  { href: "/study-notes", icon: StickyNote, label: "NOTES" },
  { href: "/pyq", icon: RotateCcw, label: "PYQS" },
];

export default function MobileBottomBar() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border/60 flex items-center h-16 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {BOTTOM_NAV.slice(0, 2).map((item) => (
        <MobileNavItem
          key={item.href}
          {...item}
          isActive={
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          }
        />
      ))}
      <Link
        href="/current-affairs"
        className="flex-1 flex items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-700 flex items-center justify-center shadow-lg shadow-primary/40 -mt-4">
          <Newspaper className="w-5 h-5 text-white" />
        </div>
      </Link>
      {BOTTOM_NAV.slice(2).map((item) => (
        <MobileNavItem
          key={item.href}
          {...item}
          isActive={
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          }
        />
      ))}
    </nav>
  );
}
