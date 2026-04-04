"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Něco se pokazilo</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Omlouváme se, došlo k neočekávané chybě. Zkuste to prosím znovu.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Zkusit znovu
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Domů
          </Button>
        </Link>
      </div>
    </div>
  );
}
