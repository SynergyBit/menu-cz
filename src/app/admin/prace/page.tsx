"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Briefcase,
  Eye,
  EyeOff,
  Star,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  User,
  Building2,
} from "lucide-react";
import { COUNTRIES, getEmploymentLabel } from "@/lib/jobs";

interface AdminJob {
  id: string;
  title: string;
  position: string;
  employmentType: string;
  city: string;
  country: string;
  isActive: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  expiresAt: string;
  createdAt: string;
  restaurantName: string;
  restaurantSlug: string;
}

interface AdminSeeker {
  id: string;
  name: string;
  headline: string;
  position: string;
  employmentType: string;
  city: string;
  country: string;
  contactEmail: string;
  contactPhone: string | null;
  isActive: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function AdminJobsPage() {
  const [tab, setTab] = useState<"jobs" | "seekers">("jobs");
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [seekers, setSeekers] = useState<AdminSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const url = tab === "jobs" ? "/api/admin/jobs" : "/api/admin/job-seekers";
    const res = await fetch(url);
    const data = await res.json();
    if (tab === "jobs") setJobs(data.jobs || []);
    else setSeekers(data.seekers || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function patchJob(id: string, body: Partial<AdminJob>) {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success("Upraveno");
      load();
    } else toast.error("Chyba");
  }

  async function removeJob(id: string) {
    if (!confirm("Smazat inzerát?")) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Smazáno");
      load();
    }
  }

  async function patchSeeker(id: string, body: Partial<AdminSeeker>) {
    const res = await fetch(`/api/admin/job-seekers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success("Upraveno");
      load();
    }
  }

  async function removeSeeker(id: string) {
    if (!confirm("Smazat poptávku?")) return;
    const res = await fetch(`/api/admin/job-seekers/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Smazáno");
      load();
    }
  }

  const filteredJobs = q
    ? jobs.filter((j) =>
        `${j.title} ${j.restaurantName} ${j.city} ${j.position}`.toLowerCase().includes(q.toLowerCase()),
      )
    : jobs;
  const filteredSeekers = q
    ? seekers.filter((s) =>
        `${s.name} ${s.headline} ${s.city} ${s.position} ${s.contactEmail}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
    : seekers;

  const pendingSeekers = seekers.filter((s) => !s.isApproved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Správa portálu práce</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nabídky od restaurací a poptávky od uchazečů.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "jobs" | "seekers")}>
        <TabsList>
          <TabsTrigger value="jobs" className="gap-2">
            <Building2 className="h-4 w-4" />
            Nabídky
          </TabsTrigger>
          <TabsTrigger value="seekers" className="gap-2">
            <User className="h-4 w-4" />
            Uchazeči
            {pendingSeekers > 0 && (
              <Badge className="ml-1 h-5 bg-destructive/15 px-1.5 text-destructive hover:bg-destructive/20">
                {pendingSeekers}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hledat..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* JOBS */}
        <TabsContent value="jobs" className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám...</p>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
                <p className="font-semibold">Žádné inzeráty</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((j) => {
              const expired = new Date(j.expiresAt) < new Date();
              return (
                <Card key={j.id}>
                  <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/prace/${j.id}`}
                          target="_blank"
                          className="font-semibold hover:text-primary"
                        >
                          {j.title}
                        </Link>
                        {j.isFeatured && (
                          <Badge className="gap-1 bg-primary/15 text-primary hover:bg-primary/20">
                            <Star className="h-3 w-3 fill-primary" />
                            Top
                          </Badge>
                        )}
                        {!j.isActive && <Badge variant="secondary">Skrytý</Badge>}
                        {!j.isApproved && <Badge variant="outline">Čeká</Badge>}
                        {expired && <Badge variant="destructive">Vypršel</Badge>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <Link
                          href={`/restaurace/${j.restaurantSlug}`}
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          {j.restaurantName}
                        </Link>
                        <span>{j.position}</span>
                        <span>
                          {j.city} · {COUNTRIES.find((c) => c.value === j.country)?.flag}
                        </span>
                        <span>{getEmploymentLabel(j.employmentType)}</span>
                        <span>vytvořeno {new Date(j.createdAt).toLocaleDateString("cs")}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => patchJob(j.id, { isFeatured: !j.isFeatured })}
                        className="gap-1.5"
                      >
                        <Star className={`h-3.5 w-3.5 ${j.isFeatured ? "fill-primary text-primary" : ""}`} />
                        {j.isFeatured ? "Odebrat Top" : "Top"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => patchJob(j.id, { isApproved: !j.isApproved })}
                        className="gap-1.5"
                      >
                        {j.isApproved ? (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            Zamítnout
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Schválit
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => patchJob(j.id, { isActive: !j.isActive })}
                        className="gap-1.5"
                      >
                        {j.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {j.isActive ? "Skrýt" : "Zobrazit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeJob(j.id)}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* SEEKERS */}
        <TabsContent value="seekers" className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám...</p>
          ) : filteredSeekers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <User className="h-10 w-10 text-muted-foreground" />
                <p className="font-semibold">Žádní uchazeči</p>
              </CardContent>
            </Card>
          ) : (
            filteredSeekers.map((s) => {
              const expired = new Date(s.expiresAt) < new Date();
              return (
                <Card key={s.id} className={!s.isApproved ? "border-primary/30 bg-primary/[0.02]" : ""}>
                  <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/prace/hledam/${s.id}`}
                          target="_blank"
                          className="font-semibold hover:text-primary"
                        >
                          {s.name} — {s.position}
                        </Link>
                        {s.isFeatured && (
                          <Badge className="gap-1 bg-primary/15 text-primary hover:bg-primary/20">
                            <Star className="h-3 w-3 fill-primary" />
                            Top
                          </Badge>
                        )}
                        {!s.isActive && <Badge variant="secondary">Skrytý</Badge>}
                        {!s.isApproved && (
                          <Badge className="bg-primary text-primary-foreground">Čeká na schválení</Badge>
                        )}
                        {expired && <Badge variant="destructive">Vypršel</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{s.headline}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {s.city} · {COUNTRIES.find((c) => c.value === s.country)?.flag}
                        </span>
                        <span>{getEmploymentLabel(s.employmentType)}</span>
                        <span>{s.contactEmail}</span>
                        {s.contactPhone && <span>{s.contactPhone}</span>}
                        <span>vytvořeno {new Date(s.createdAt).toLocaleDateString("cs")}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => patchSeeker(s.id, { isFeatured: !s.isFeatured })}
                        className="gap-1.5"
                      >
                        <Star className={`h-3.5 w-3.5 ${s.isFeatured ? "fill-primary text-primary" : ""}`} />
                        {s.isFeatured ? "Odebrat Top" : "Top"}
                      </Button>
                      <Button
                        size="sm"
                        variant={s.isApproved ? "outline" : "default"}
                        onClick={() => patchSeeker(s.id, { isApproved: !s.isApproved })}
                        className="gap-1.5"
                      >
                        {s.isApproved ? (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            Zamítnout
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Schválit
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => patchSeeker(s.id, { isActive: !s.isActive })}
                        className="gap-1.5"
                      >
                        {s.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {s.isActive ? "Skrýt" : "Zobrazit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeSeeker(s.id)}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
