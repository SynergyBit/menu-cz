"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, User, CheckCircle2, Info } from "lucide-react";
import { EMPLOYMENT_TYPES, JOB_POSITIONS, COUNTRIES } from "@/lib/jobs";

export default function AddSeekerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    position: "Servírka / Číšník",
    headline: "",
    description: "",
    employmentType: "full_time",
    city: "",
    country: "CZ",
    yearsExperience: "",
    expectedSalaryFrom: "",
    expectedSalaryCurrency: "CZK",
    expectedSalaryPeriod: "month",
    availableFrom: "",
    contactEmail: "",
    contactPhone: "",
    skills: "",
    languages: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.email) {
          setSessionEmail(d.user.email);
          setForm((f) => ({
            ...f,
            name: f.name || d.user.name || "",
            contactEmail: f.contactEmail || d.user.email,
          }));
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        expectedSalaryFrom: form.expectedSalaryFrom ? Number(form.expectedSalaryFrom) : null,
        availableFrom: form.availableFrom || null,
      };
      const res = await fetch("/api/job-seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Chyba");
      }
      toast.success("Poptávka odeslána — po schválení bude viditelná.");
      setDone(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold">Poptávka odeslána</h1>
            <p className="max-w-md text-muted-foreground">
              Po rychlém schválení administrátorem se vaše poptávka objeví v sekci
              &bdquo;Hledám práci&ldquo;. Obvykle do 24 hodin.
            </p>
            <div className="flex gap-3">
              <Link href="/prace">
                <Button variant="outline">Zpět na portál</Button>
              </Link>
              <Link href="/ucet/poptavky">
                <Button>Moje poptávky</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Zpět
      </Button>

      <div className="mt-4">
        <Badge variant="outline" className="mb-3 gap-1.5">
          <User className="h-3 w-3" />
          Hledám práci
        </Badge>
        <h1 className="text-3xl font-bold">Přidat moji poptávku práce</h1>
        <p className="mt-2 text-muted-foreground">
          Zveřejněte svůj profil — restaurace vás kontaktují přímo. Zdarma, platnost 60 dní.
        </p>
      </div>

      {!sessionEmail && (
        <Card className="mt-6 border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Máte účet?</p>
              <p className="mt-1 text-muted-foreground">
                S přihlášením budete moct poptávku kdykoliv upravit nebo smazat.{" "}
                <Link href="/prihlaseni-host" className="text-primary underline">
                  Přihlásit se
                </Link>
                {" · "}
                <Link href="/registrace-host" className="text-primary underline">
                  Vytvořit účet
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={submit} className="mt-6 space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-semibold">Základní údaje</h2>

            <div>
              <Label>Jméno a příjmení *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Jan Novák"
              />
            </div>

            <div>
              <Label>Krátké shrnutí (headline) *</Label>
              <Input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                required
                maxLength={160}
                placeholder="Zkušená servírka s 5 lety praxe, hledám HPP v Praze"
              />
              <p className="mt-1 text-xs text-muted-foreground">Max 160 znaků. Zobrazí se v seznamu.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Pozice *</Label>
                <Select
                  value={form.position}
                  onValueChange={(v) => v && setForm({ ...form, position: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Úvazek *</Label>
                <Select
                  value={form.employmentType}
                  onValueChange={(v) => v && setForm({ ...form, employmentType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Země *</Label>
                <Select
                  value={form.country}
                  onValueChange={(v) =>
                    v &&
                    setForm({
                      ...form,
                      country: v,
                      expectedSalaryCurrency: v === "SK" ? "EUR" : "CZK",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.flag} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Město *</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  placeholder="Praha, Bratislava..."
                />
              </div>
            </div>

            <div>
              <Label>O mně *</Label>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Kde jsem pracoval/a, co umím, co hledám..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-semibold">Zkušenosti a dovednosti</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Roky praxe</Label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={form.yearsExperience}
                  onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div>
                <Label>K dispozici od</Label>
                <Input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Dovednosti</Label>
              <Input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Obsluha kavovaru, latte art, pokladna, cocktaily..."
              />
              <p className="mt-1 text-xs text-muted-foreground">Oddělujte čárkami.</p>
            </div>

            <div>
              <Label>Jazyky</Label>
              <Input
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                placeholder="CZ, EN, DE"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-semibold">Očekávaná mzda (volitelné)</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Od</Label>
                <Input
                  type="number"
                  value={form.expectedSalaryFrom}
                  onChange={(e) => setForm({ ...form, expectedSalaryFrom: e.target.value })}
                  placeholder="30000"
                />
              </div>
              <div>
                <Label>Měna</Label>
                <Select
                  value={form.expectedSalaryCurrency}
                  onValueChange={(v) => v && setForm({ ...form, expectedSalaryCurrency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CZK">CZK</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Období</Label>
                <Select
                  value={form.expectedSalaryPeriod}
                  onValueChange={(v) => v && setForm({ ...form, expectedSalaryPeriod: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">za měsíc</SelectItem>
                    <SelectItem value="hour">za hodinu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-semibold">Kontakt</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Odesláním souhlasíte se zveřejněním údajů a{" "}
            <Link href="/soukromi" className="text-primary underline">
              zpracováním osobních údajů
            </Link>
            .
          </p>
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Odesílám..." : "Zveřejnit poptávku"}
          </Button>
        </div>
      </form>
    </div>
  );
}
