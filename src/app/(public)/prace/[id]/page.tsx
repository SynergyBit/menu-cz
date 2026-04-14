"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  MapPin,
  Building2,
  Banknote,
  Clock,
  Mail,
  Phone,
  ArrowLeft,
  Globe,
  Calendar,
} from "lucide-react";
import { COUNTRIES, getEmploymentLabel, formatSalary } from "@/lib/jobs";

interface Job {
  id: string;
  title: string;
  position: string;
  description: string;
  employmentType: string;
  city: string;
  country: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  contactEmail: string | null;
  contactPhone: string | null;
  requirements: string | null;
  benefits: string | null;
  expiresAt: string;
  createdAt: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogo: string | null;
  restaurantAddress: string | null;
  restaurantWebsite: string | null;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => setJob(d.job || null))
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

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Inzerát nenalezen</h1>
        <p className="mt-2 text-muted-foreground">
          Možná byl smazán nebo vypršel. Podívejte se na další aktivní nabídky.
        </p>
        <Link href="/prace" className="mt-6 inline-block">
          <Button>Zpět na nabídky</Button>
        </Link>
      </div>
    );
  }

  const country = COUNTRIES.find((c) => c.value === job.country);
  const salary = formatSalary(job.salaryFrom, job.salaryTo, job.salaryCurrency, job.salaryPeriod);

  return (
    <div>
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-warm/5">
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6">
          <Link href="/prace">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zpět na nabídky
            </Button>
          </Link>

          <div className="mt-6 flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
              {job.restaurantLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.restaurantLogo} alt={job.restaurantName} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{job.title}</h1>
              <p className="mt-2 text-lg">
                <Link href={`/restaurace/${job.restaurantSlug}`} className="font-semibold text-primary hover:underline">
                  {job.restaurantName}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {job.position}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {getEmploymentLabel(job.employmentType)}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {job.city} · {country?.flag} {country?.label}
            </Badge>
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
                <h2 className="text-lg font-bold">Popis pozice</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {job.requirements && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-bold">Požadujeme</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                    {job.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {job.benefits && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-bold">Nabízíme</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                    {job.benefits}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground">Kontaktujte zaměstnavatele</h3>
                <Separator className="my-4" />
                {job.contactEmail ? (
                  <a
                    href={`mailto:${job.contactEmail}?subject=${encodeURIComponent("Zájem o pozici: " + job.title)}`}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="truncate text-sm font-medium">{job.contactEmail}</p>
                    </div>
                  </a>
                ) : null}
                {job.contactPhone ? (
                  <a
                    href={`tel:${job.contactPhone}`}
                    className="mt-2 flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <p className="text-sm font-medium">{job.contactPhone}</p>
                    </div>
                  </a>
                ) : null}
                {!job.contactEmail && !job.contactPhone && (
                  <Link href={`/restaurace/${job.restaurantSlug}`}>
                    <Button className="w-full">Kontaktovat přes profil</Button>
                  </Link>
                )}

                <Separator className="my-4" />
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Zveřejněno {new Date(job.createdAt).toLocaleDateString("cs")}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Aktivní do {new Date(job.expiresAt).toLocaleDateString("cs")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold">O zaměstnavateli</h3>
                <Separator className="my-3" />
                <p className="font-semibold">{job.restaurantName}</p>
                {job.restaurantAddress && (
                  <p className="mt-1 text-xs text-muted-foreground">{job.restaurantAddress}</p>
                )}
                <div className="mt-3 space-y-2">
                  <Link
                    href={`/restaurace/${job.restaurantSlug}`}
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    Profil restaurace
                  </Link>
                  {job.restaurantWebsite && (
                    <a
                      href={job.restaurantWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Web restaurace
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
