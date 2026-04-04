import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <UtensilsCrossed className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Stránka nebyla nalezena
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Stránka, kterou hledáte, neexistuje nebo byla přesunuta.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Domů
          </Button>
        </Link>
        <Link href="/restaurace">
          <Button variant="outline" className="gap-2">
            Najít restauraci
          </Button>
        </Link>
      </div>
    </div>
  );
}
