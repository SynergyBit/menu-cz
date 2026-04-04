"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  LayoutDashboard,
  FileText,
  CalendarDays,
  Clock,
  QrCode,
  IdCard,
  ImageIcon,
  BarChart3,
  Mail,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarLinks = [
  { href: "/dashboard", label: "Přehled", icon: LayoutDashboard },
  { href: "/dashboard/profil", label: "Profil restaurace", icon: UtensilsCrossed },
  { href: "/dashboard/menu", label: "Jídelní lístek", icon: FileText },
  { href: "/dashboard/denni-menu", label: "Denní menu", icon: CalendarDays },
  { href: "/dashboard/hodiny", label: "Otevírací doba", icon: Clock },
  { href: "/dashboard/vizitka", label: "Vizitka", icon: IdCard },
  { href: "/dashboard/fotky", label: "Fotogalerie", icon: ImageIcon },
  { href: "/dashboard/qr-kod", label: "QR kód", icon: QrCode },
  { href: "/dashboard/zpravy", label: "Zprávy", icon: Mail },
  { href: "/dashboard/analytika", label: "Analytika", icon: BarChart3 },
];

function SidebarContent({ pathname, onLogout }: { pathname: string; onLogout: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <UtensilsCrossed className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          Menu<span className="text-primary">CZ</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {sidebarLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button
              variant={pathname === link.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              size="sm"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="border-t p-3 space-y-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Zpět na web
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          size="sm"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Odhlásit
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-card md:block">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b bg-card px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SidebarContent pathname={pathname} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Dashboard</span>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
