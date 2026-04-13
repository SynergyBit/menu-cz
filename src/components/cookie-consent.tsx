"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gastroo_cookie_consent");
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem("gastroo_cookie_consent", "accepted");
    setShow(false);
  }

  function decline() {
    localStorage.setItem("gastroo_cookie_consent", "declined");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:bottom-4 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border bg-card p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Cookies</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Používáme nezbytné cookies pro přihlášení a funkční cookies pro uložení vašich preferencí.
              Nepoužíváme analytické cookies třetích stran.{" "}
              <Link href="/soukromi" className="text-primary hover:underline">
                Více informací
              </Link>
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={accept} className="h-8 text-xs">
                Rozumím
              </Button>
              <Button size="sm" variant="ghost" onClick={decline} className="h-8 text-xs text-muted-foreground">
                Odmítnout volitelné
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
