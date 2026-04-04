"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Shield,
  UtensilsCrossed,
  ChevronLeft,
  LogOut,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="font-bold">
                Menu<span className="text-primary">CZ</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-sm font-medium text-destructive">
              <Shield className="h-3.5 w-3.5" />
              Admin
            </div>
            <nav className="hidden sm:flex items-center gap-1 ml-4">
              <Link href="/admin">
                <Button variant={pathname === "/admin" ? "secondary" : "ghost"} size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/restaurace">
                <Button variant={pathname === "/admin/restaurace" ? "secondary" : "ghost"} size="sm">
                  Restaurace
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" />
                Web
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Odhlásit
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
