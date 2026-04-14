"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/jobs");
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: Partial<AdminJob>) {
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

  async function remove(id: string) {
    if (!confirm("Smazat inzerát?")) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Smazáno");
      load();
    }
  }

  const filtered = q
    ? jobs.filter((j) =>
        `${j.title} ${j.restaurantName} ${j.city} ${j.position}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
    : jobs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Správa inzerátů práce</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schvalování, zvýraznění, skrytí a mazání nabídek práce.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Hledat v inzerátech..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">Žádné inzeráty</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => {
            const expired = new Date(j.expiresAt) < new Date();
            return (
              <Card key={j.id}>
                <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/prace/${j.id}`} target="_blank" className="font-semibold hover:text-primary">
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
                      <span>
                        <Link href={`/restaurace/${j.restaurantSlug}`} className="text-primary hover:underline" target="_blank">
                          {j.restaurantName}
                        </Link>
                      </span>
                      <span>{j.position}</span>
                      <span>
                        {j.city} · {COUNTRIES.find((c) => c.value === j.country)?.flag}
                      </span>
                      <span>{getEmploymentLabel(j.employmentType)}</span>
                      <span>
                        vytvořeno {new Date(j.createdAt).toLocaleDateString("cs")}
                      </span>
                      <span>do {new Date(j.expiresAt).toLocaleDateString("cs")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => patch(j.id, { isFeatured: !j.isFeatured })}
                      className="gap-1.5"
                    >
                      <Star className={`h-3.5 w-3.5 ${j.isFeatured ? "fill-primary text-primary" : ""}`} />
                      {j.isFeatured ? "Odebrat Top" : "Top"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => patch(j.id, { isApproved: !j.isApproved })}
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
                      onClick={() => patch(j.id, { isActive: !j.isActive })}
                      className="gap-1.5"
                    >
                      {j.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {j.isActive ? "Skrýt" : "Zobrazit"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => remove(j.id)}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
