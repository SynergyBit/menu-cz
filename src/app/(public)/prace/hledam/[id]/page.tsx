"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  MapPin,
  Briefcase,
  Banknote,
  Clock,
  Mail,
  Phone,
  ArrowLeft,
  Calendar,
  Languages,
  Sparkles,
} from "lucide-react";
import { COUNTRIES, getEmploymentLabel, formatExpectedSalary } from "@/lib/jobs";

interface Seeker {
  id: string;
  name: string;
  headline: string;
  position: string;
  description: string;
  employmentType: string;
  city: string;
  country: string;
  yearsExperience: number | null;
  expectedSalaryFrom: number | null;
  expectedSalaryCurrency: string;
  expectedSalaryPeriod: string;
  availableFrom: string | null;
  contactEmail: string;
  contactPhone: string | null;
  skills: string | null;
  languages: string | null;
  expiresAt: string;
  createdAt: string;
}

export default function SeekerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [seeker, setSeeker] = useState<Seeker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/job-seekers/${id}`)
      .then((r) => r.json())
      .then((d) => setSeeker(d.seeker || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!seeker) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Poptávka nenalezena</h1>
        <Link href="/prace" className="mt-6 inline-block">
          <Button>Zpět na portál</Button>
        </Link>
      </div>
    );
  }

  const country = COUNTRIES.find((c) => c.value === seeker.country);
  const salary = formatExpectedSalary(
    seeker.expectedSalaryFrom,
    seeker.expectedSalaryCurrency,
    seeker.expectedSalaryPeriod,
  );

  return (
    <div>
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-warm/5">
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6">
          <Link href="/prace">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zpět na portál
            </Button>
          </Link>

          <div className="mt-6 flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground">
              {seeker.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Badge variant="outline" className="mb-2 gap-1.5">
                <User className="h-3 w-3" />
                Hledám práci
              </Badge>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{seeker.position}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{seeker.headline}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {seeker.position}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {getEmploymentLabel(seeker.employmentType)}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {seeker.city} · {country?.flag} {country?.label}
            </Badge>
            {seeker.yearsExperience != null && (
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {seeker.yearsExperience} let praxe
              </Badge>
            )}
            {salary && (
              <Badge className="gap-1.5 bg-primary/15 text-primary hover:bg-primary/20">
                <Banknote className="h-3.5 w-3.5" />
                {salary}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold">O uchazeči</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {seeker.description}
                </p>
              </CardContent>
            </Card>

            {(seeker.skills || seeker.languages) && (
              <Card>
                <CardContent className="space-y-4 pt-6">
                  {seeker.skills && (
                    <div>
                      <h3 className="font-semibold">Dovednosti</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {seeker.skills.split(",").map((s) => (
                          <Badge key={s} variant="outline">
                            {s.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {seeker.languages && (
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold">
                        <Languages className="h-4 w-4" />
                        Jazyky
                      </h3>
                      <p className="mt-2 text-sm text-foreground/85">{seeker.languages}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground">Kontaktovat uchazeče</h3>
                <Separator className="my-4" />
                <a
                  href={`mailto:${seeker.contactEmail}?subject=${encodeURIComponent("Nabídka práce: " + seeker.position)}`}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="truncate text-sm font-medium">{seeker.contactEmail}</p>
                  </div>
                </a>
                {seeker.contactPhone && (
                  <a
                    href={`tel:${seeker.contactPhone}`}
                    className="mt-2 flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <p className="text-sm font-medium">{seeker.contactPhone}</p>
                    </div>
                  </a>
                )}

                <Separator className="my-4" />
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Zveřejněno {new Date(seeker.createdAt).toLocaleDateString("cs")}
                  </p>
                  {seeker.availableFrom && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      K dispozici od {new Date(seeker.availableFrom).toLocaleDateString("cs")}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Aktivní do {new Date(seeker.expiresAt).toLocaleDateString("cs")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
