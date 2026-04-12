"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  CalendarDays,
  Heart,
  User,
  LayoutDashboard,
  Shield,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  matchPrefix?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Don't show on dashboard/admin pages (they have their own nav)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: "/", label: "Domů", icon: Home },
    { href: "/restaurace", label: "Hledat", icon: Search, matchPrefix: true },
    { href: "/dnes", label: "Denní menu", icon: CalendarDays },
    { href: "/oblibene", label: "Oblíbené", icon: Heart },
  ];

  // Last item depends on auth state
  if (user?.role === "restaurant") {
    navItems.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
  } else if (user?.role === "admin") {
    navItems.push({ href: "/admin", label: "Admin", icon: Shield });
  } else if (user?.role === "user") {
    navItems.push({ href: "/ucet", label: "Účet", icon: User });
  } else {
    navItems.push({ href: "/prihlaseni", label: "Přihlásit", icon: User });
  }

  function isActive(item: NavItem): boolean {
    if (item.href === "/") return pathname === "/";
    if (item.matchPrefix) return pathname.startsWith(item.href);
    return pathname === item.href;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-xl md:hidden safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
