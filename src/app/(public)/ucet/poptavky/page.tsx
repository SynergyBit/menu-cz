"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { COUNTRIES, getEmploymentLabel } from "@/lib/jobs";

interface Seeker {
  id: string;
  headline: string;
  position: string;
  employmentType: string;
  city: string;
  country: string;
  isActive: boolean;
  isApproved: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function MySeekersPage() {
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauth, setUnauth] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/job-seekers/mine");
    if (res.status === 401) {
      setUnauth(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSeekers(data.seekers || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/job-seekers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Smazat poptávku?")) return;
    await fetch(`/api/job-seekers/${id}`, { method: "DELETE" });
    toast.success("Smazáno");
    load();
  }

  async function prolong(id: string) {
    await fetch(`/api/job-seekers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extendDays: 60 }),
    });
    toast.success("Prodlouženo o 60 dní");
    load();
  }

  if (unauth) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Přihlaste se</h1>
        <p className="mt-2 text-muted-foreground">Pro správu vašich poptávek je nutné být přihlášen.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/prihlaseni-host">
            <Button>Přihlásit se</Button>
          </Link>
          <Link href="/registrace-host">
            <Button variant="outline">Vytvořit účet</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/ucet">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zpět na účet
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moje poptávky práce</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Správa vašich &bdquo;Hledám práci&ldquo; inzerátů.
          </p>
        </div>
        <Link href="/prace/pridat-poptavku">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nová poptávka
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Načítám...</p>
      ) : seekers.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <User className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">Zatím žádná poptávka</p>
            <Link href="/prace/pridat-poptavku">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Vytvořit poptávku
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {seekers.map((s) => {
            const expired = new Date(s.expiresAt) < new Date();
            return (
              <Card key={s.id} className={expired ? "opacity-60" : ""}>
                <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{s.position}</h3>
                      {!s.isActive && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <EyeOff className="h-3 w-3" />
                          Skrytý
                        </Badge>
                      )}
                      {!s.isApproved && (
                        <Badge variant="outline" className="text-xs">Čeká na schválení</Badge>
                      )}
                      {expired && <Badge variant="destructive" className="text-xs">Vypršel</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.headline}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {s.city} · {COUNTRIES.find((c) => c.value === s.country)?.flag}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {getEmploymentLabel(s.employmentType)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        do {new Date(s.expiresAt).toLocaleDateString("cs")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/prace/hledam/${s.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Zobrazit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => toggle(s.id, s.isActive)}>
                      {s.isActive ? "Skrýt" : "Zobrazit"}
                    </Button>
                    {expired && (
                      <Button variant="outline" size="sm" onClick={() => prolong(s.id)}>
                        Prodloužit +60 dní
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(s.id)}
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
