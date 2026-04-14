"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import {
  EMPLOYMENT_TYPES,
  JOB_POSITIONS,
  COUNTRIES,
  getEmploymentLabel,
  formatSalary,
} from "@/lib/jobs";

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
  isActive: boolean;
  isApproved: boolean;
  expiresAt: string;
  createdAt: string;
}

const emptyForm = {
  title: "",
  position: "Kuchař",
  description: "",
  employmentType: "full_time",
  city: "",
  country: "CZ",
  salaryFrom: "",
  salaryTo: "",
  salaryCurrency: "CZK",
  salaryPeriod: "month",
  contactEmail: "",
  contactPhone: "",
  requirements: "",
  benefits: "",
  validDays: 30,
};

export default function DashboardJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/jobs/mine");
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(job: Job) {
    setEditing(job);
    setForm({
      title: job.title,
      position: job.position,
      description: job.description,
      employmentType: job.employmentType,
      city: job.city,
      country: job.country,
      salaryFrom: job.salaryFrom?.toString() || "",
      salaryTo: job.salaryTo?.toString() || "",
      salaryCurrency: job.salaryCurrency,
      salaryPeriod: job.salaryPeriod,
      contactEmail: job.contactEmail || "",
      contactPhone: job.contactPhone || "",
      requirements: job.requirements || "",
      benefits: job.benefits || "",
      validDays: 30,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        salaryFrom: form.salaryFrom ? Number(form.salaryFrom) : null,
        salaryTo: form.salaryTo ? Number(form.salaryTo) : null,
      };
      const url = editing ? `/api/jobs/${editing.id}` : `/api/jobs`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Chyba");
      }
      toast.success(editing ? "Inzerát upraven" : "Inzerát přidán");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Opravdu smazat inzerát?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    toast.success("Inzerát smazán");
    load();
  }

  async function prolong(id: string) {
    await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extendDays: 30 }),
    });
    toast.success("Inzerát prodloužen o 30 dní");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nabídky práce</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publikujte nabídky pro kuchaře, servírky i brigádníky — <strong>zdarma</strong>.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nový inzerát
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Načítám...</div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <p className="font-semibold">Zatím žádný inzerát</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vytvořte první nabídku práce — vkládání je zdarma.
              </p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Vytvořit inzerát
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => {
            const expired = new Date(j.expiresAt) < new Date();
            return (
              <Card key={j.id} className={expired ? "opacity-60" : ""}>
                <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{j.title}</h3>
                      {!j.isActive && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <EyeOff className="h-3 w-3" />
                          Skrytý
                        </Badge>
                      )}
                      {!j.isApproved && (
                        <Badge variant="outline" className="text-xs">Čeká na schválení</Badge>
                      )}
                      {expired && <Badge variant="destructive" className="text-xs">Vypršel</Badge>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {j.position}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {j.city} · {COUNTRIES.find((c) => c.value === j.country)?.flag}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getEmploymentLabel(j.employmentType)}
                      </span>
                      {formatSalary(j.salaryFrom, j.salaryTo, j.salaryCurrency, j.salaryPeriod) && (
                        <span className="font-medium text-primary">
                          {formatSalary(j.salaryFrom, j.salaryTo, j.salaryCurrency, j.salaryPeriod)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        do {new Date(j.expiresAt).toLocaleDateString("cs")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/prace/${j.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Zobrazit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => openEdit(j)} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Upravit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggle(j.id, j.isActive)}>
                      {j.isActive ? "Skrýt" : "Zobrazit"}
                    </Button>
                    {expired && (
                      <Button variant="outline" size="sm" onClick={() => prolong(j.id)}>
                        Prodloužit +30 dní
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Upravit inzerát" : "Nový inzerát"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Název pozice *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Např. Zkušená servírka do kavárny v centru"
              />
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
                      salaryCurrency: v === "SK" ? "EUR" : "CZK",
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
                  placeholder="Praha, Brno, Bratislava..."
                />
              </div>
            </div>

            <div>
              <Label>Popis pozice *</Label>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Co bude daná osoba dělat, jak vypadá typický den, kolektiv..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Požadujeme</Label>
                <Textarea
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Praxe, jazyky, zdravotní průkaz..."
                />
              </div>
              <div>
                <Label>Nabízíme</Label>
                <Textarea
                  rows={4}
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  placeholder="Stravování, bonusy, tipy, příjemný kolektiv..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <Label>Mzda od</Label>
                <Input
                  type="number"
                  value={form.salaryFrom}
                  onChange={(e) => setForm({ ...form, salaryFrom: e.target.value })}
                  placeholder="25000"
                />
              </div>
              <div>
                <Label>Mzda do</Label>
                <Input
                  type="number"
                  value={form.salaryTo}
                  onChange={(e) => setForm({ ...form, salaryTo: e.target.value })}
                  placeholder="35000"
                />
              </div>
              <div>
                <Label>Měna</Label>
                <Select
                  value={form.salaryCurrency}
                  onValueChange={(v) => v && setForm({ ...form, salaryCurrency: v })}
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
                  value={form.salaryPeriod}
                  onValueChange={(v) => v && setForm({ ...form, salaryPeriod: v })}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Kontaktní email</Label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Kontaktní telefon</Label>
                <Input
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>
            </div>

            {!editing && (
              <div>
                <Label>Platnost inzerátu</Label>
                <Select
                  value={String(form.validDays)}
                  onValueChange={(v) => v && setForm({ ...form, validDays: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dní</SelectItem>
                    <SelectItem value="14">14 dní</SelectItem>
                    <SelectItem value="30">30 dní</SelectItem>
                    <SelectItem value="60">60 dní</SelectItem>
                    <SelectItem value="90">90 dní</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Zrušit
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Ukládám..." : "Uložit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
