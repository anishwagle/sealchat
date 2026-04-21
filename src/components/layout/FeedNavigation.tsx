"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineArchiveBox, 
  HiOutlineUser 
} from "react-icons/hi2";

const navItems = [
  { href: "/feed", label: "Home", icon: HiOutlineHome },
  { href: "/feed/friends", label: "Friends", icon: HiOutlineUsers },
  { href: "/feed/archive", label: "Archive", icon: HiOutlineArchiveBox },
  { href: "/profile", label: "Profile", icon: HiOutlineUser },
];

export default function FeedNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-background">
      <div className="flex items-center justify-around h-20 max-w-2xl mx-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href === "/feed" && pathname === "/feed/page");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-4 transition-colors",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
