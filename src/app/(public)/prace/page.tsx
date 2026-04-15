"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Briefcase,
  MapPin,
  Building2,
  Banknote,
  Clock,
  Star,
  Search,
  User,
  Plus,
  Languages,
} from "lucide-react";
import {
  EMPLOYMENT_TYPES,
  JOB_POSITIONS,
  COUNTRIES,
  getEmploymentLabel,
  formatSalary,
  formatExpectedSalary,
} from "@/lib/jobs";

interface Job {
  id: string;
  title: string;
  position: string;
  employmentType: string;
  city: string;
  country: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  isFeatured: boolean;
  createdAt: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogo: string | null;
}

interface Seeker {
  id: string;
  name: string;
  headline: string;
  position: string;
  employmentType: string;
  city: string;
  country: string;
  yearsExperience: number | null;
  expectedSalaryFrom: number | null;
  expectedSalaryCurrency: string;
  expectedSalaryPeriod: string;
  availableFrom: string | null;
  languages: string | null;
  skills: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export default function JobsPage() {
  const [tab, setTab] = useState<"jobs" | "seekers">("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("all");
  const [position, setPosition] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (country !== "all") params.set("country", country);
    if (position !== "all") params.set("position", position);
    if (type !== "all") params.set("type", type);
    if (city) params.set("city", city);
    const url = tab === "jobs" ? `/api/jobs?${params}` : `/api/job-seekers?${params}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (tab === "jobs") setJobs(d.jobs || []);
        else setSeekers(d.seekers || []);
      })
      .finally(() => setLoading(false));
  }, [tab, country, position, type, city]);

  const filteredJobs = useMemo(() => {
    if (!q) return jobs;
    const needle = q.toLowerCase();
    return jobs.filter((j) =>
      `${j.title} ${j.position} ${j.restaurantName} ${j.city}`.toLowerCase().includes(needle),
    );
  }, [jobs, q]);

  const filteredSeekers = useMemo(() => {
    if (!q) return seekers;
    const needle = q.toLowerCase();
    return seekers.filter((s) =>
      `${s.name} ${s.headline} ${s.position} ${s.city} ${s.skills || ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [seekers, q]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-warm/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_30/0.12),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 bg-primary/5">
              <Briefcase className="h-3 w-3 text-primary" />
              Práce v gastru
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Práce v{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                restauracích a kavárnách
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Nabídky práce od restaurací i poptávky od uchazečů. Česko a Slovensko.
              Vkládání je pro všechny <strong>zdarma</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/registrace">
                <Button size="lg" variant="outline" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Jsem restaurace — přidat inzerát
                </Button>
              </Link>
              <Link href="/prace/pridat-poptavku">
                <Button size="lg" className="gap-2">
                  <User className="h-4 w-4" />
                  Hledám práci — přidat se
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "jobs" | "seekers")}>
        <div className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <TabsList className="mb-4">
              <TabsTrigger value="jobs" className="gap-2">
                <Building2 className="h-4 w-4" />
                Nabídky práce
              </TabsTrigger>
              <TabsTrigger value="seekers" className="gap-2">
                <User className="h-4 w-4" />
                Hledám práci
              </TabsTrigger>
            </TabsList>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_180px_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={
                    tab === "jobs" ? "Hledat pozici, restauraci..." : "Hledat uchazeče, dovednosti..."
                  }
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input placeholder="Město" value={city} onChange={(e) => setCity(e.target.value)} />
              <Select value={country} onValueChange={(v) => setCountry(v || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Země" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny země</SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.flag} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={position} onValueChange={(v) => setPosition(v || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pozice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny pozice</SelectItem>
                  {JOB_POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={(v) => setType(v || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Úvazek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny úvazky</SelectItem>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Jobs list */}
        <TabsContent value="jobs" className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-2xl border bg-muted/30 py-16 text-center">
                <Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-semibold">Žádné inzeráty nenalezeny</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Nalezeno <strong className="text-foreground">{filteredJobs.length}</strong> inzerátů
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredJobs.map((j) => (
                    <Link key={j.id} href={`/prace/${j.id}`}>
                      <Card
                        className={`group h-full transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                          j.isFeatured ? "border-primary/40 bg-primary/[0.02]" : ""
                        }`}
                      >
                        {j.isFeatured && (
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-primary/40" />
                        )}
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                              {j.restaurantLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={j.restaurantLogo} alt={j.restaurantName} className="h-full w-full object-cover" />
                              ) : (
                                <Building2 className="h-6 w-6" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold leading-snug group-hover:text-primary">{j.title}</h3>
                                {j.isFeatured && (
                                  <Badge className="shrink-0 gap-1 bg-primary/10 text-primary">
                                    <Star className="h-3 w-3 fill-primary" />
                                    Top
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{j.restaurantName}</p>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {j.city} · {COUNTRIES.find((c) => c.value === j.country)?.flag}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  {j.position}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {getEmploymentLabel(j.employmentType)}
                                </span>
                                {formatSalary(j.salaryFrom, j.salaryTo, j.salaryCurrency, j.salaryPeriod) && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                                    <Banknote className="h-3.5 w-3.5" />
                                    {formatSalary(j.salaryFrom, j.salaryTo, j.salaryCurrency, j.salaryPeriod)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Seekers list */}
        <TabsContent value="seekers" className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Uchazeči, kteří hledají práci v gastru — kontaktujte je přímo.
              </p>
              <Link href="/prace/pridat-poptavku">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat moji poptávku
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full" />
                ))}
              </div>
            ) : filteredSeekers.length === 0 ? (
              <div className="rounded-2xl border bg-muted/30 py-16 text-center">
                <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-semibold">Zatím žádní uchazeči</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hledáte práci? Buďte první — <Link href="/prace/pridat-poptavku" className="text-primary underline">přidejte svoji poptávku</Link>.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Nalezeno <strong className="text-foreground">{filteredSeekers.length}</strong> uchazečů
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredSeekers.map((s) => (
                    <Link key={s.id} href={`/prace/hledam/${s.id}`}>
                      <Card
                        className={`group h-full transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                          s.isFeatured ? "border-primary/40 bg-primary/[0.02]" : ""
                        }`}
                      >
                        {s.isFeatured && (
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-primary/40" />
                        )}
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                              <span className="font-bold text-sm">
                                {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold leading-snug group-hover:text-primary">
                                  {s.position}
                                </h3>
                                {s.isFeatured && (
                                  <Badge className="shrink-0 gap-1 bg-primary/10 text-primary">
                                    <Star className="h-3 w-3 fill-primary" />
                                    Top
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {s.headline}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {s.city} · {COUNTRIES.find((c) => c.value === s.country)?.flag}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {getEmploymentLabel(s.employmentType)}
                                </span>
                                {s.yearsExperience != null && (
                                  <span className="inline-flex items-center gap-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    {s.yearsExperience} let praxe
                                  </span>
                                )}
                                {s.languages && (
                                  <span className="inline-flex items-center gap-1">
                                    <Languages className="h-3.5 w-3.5" />
                                    {s.languages}
                                  </span>
                                )}
                                {formatExpectedSalary(s.expectedSalaryFrom, s.expectedSalaryCurrency, s.expectedSalaryPeriod) && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                                    <Banknote className="h-3.5 w-3.5" />
                                    {formatExpectedSalary(s.expectedSalaryFrom, s.expectedSalaryCurrency, s.expectedSalaryPeriod)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {tab === "jobs" ? "Jste restaurace a hledáte kolegy?" : "Hledáte práci v gastru?"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {tab === "jobs"
              ? "Přidejte inzerát zdarma, bez poplatků a skrytých nákladů."
              : "Zveřejněte svoji poptávku zdarma — restaurace vás kontaktují přímo."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {tab === "jobs" ? (
              <>
                <Link href="/registrace">
                  <Button size="lg">Zaregistrovat restauraci</Button>
                </Link>
                <Link href="/dashboard/prace">
                  <Button size="lg" variant="outline">Přihlásit se</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/prace/pridat-poptavku">
                  <Button size="lg">Přidat svoji poptávku</Button>
                </Link>
                <Link href="/registrace-host">
                  <Button size="lg" variant="outline">Vytvořit účet (zdarma)</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
