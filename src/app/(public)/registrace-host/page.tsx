"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Loader2, UtensilsCrossed } from "lucide-react";

export default function RegisterUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Chyba při registraci");
        return;
      }

      router.push("/ucet");
    } catch {
      setError("Chyba připojení k serveru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <User className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Vytvořte si účet</CardTitle>
          <CardDescription>
            Ukládejte oblíbené restaurace, pište recenze a sledujte denní menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Jméno</Label>
              <Input id="name" name="name" placeholder="Jan" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vas@email.cz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Alespoň 6 znaků"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zaregistrovat se
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">nebo</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-3 text-center text-sm">
            <p className="text-muted-foreground">
              Už máte účet?{" "}
              <Link href="/prihlaseni" className="font-medium text-primary hover:underline">
                Přihlaste se
              </Link>
            </p>
            <p className="text-muted-foreground">
              Jste restaurace?{" "}
              <Link href="/registrace" className="font-medium text-primary hover:underline">
                Registrujte restauraci
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
