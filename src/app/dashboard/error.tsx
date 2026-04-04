"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Card className="mx-auto mt-12 max-w-md">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <h2 className="text-lg font-semibold">Chyba při načítání</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Zkuste stránku obnovit nebo se vraťte později.
          </p>
        </div>
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Zkusit znovu
        </Button>
      </CardContent>
    </Card>
  );
}
