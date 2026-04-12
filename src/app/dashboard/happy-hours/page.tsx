"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  Clock,
  Beer,
  Percent,
} from "lucide-react";

const dayLabels = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

interface HappyHour {
  id: string;
  title: string;
  description: string | null;
  discount: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
  isActive: boolean;
}

export default function HappyHoursPage() {
  const [items, setItems] = useState<HappyHour[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/restaurants/me/happy-hours");
    const data = await res.json();
    setItems(data.happyHours || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/restaurants/me/happy-hours", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    load();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/restaurants/me/happy-hours?id=${id}`, { method: "DELETE" });
    toast.success("Happy hour smazán");
    load();
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Happy Hours</h1>
          <p className="text-sm text-muted-foreground">Akční nabídky a slevy v určitých hodinách</p>
        </div>
        <AddHappyHourDialog onCreated={load} />
      </div>

      {items.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Beer className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-semibold">Žádné happy hours</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Přidejte akční nabídku — přitáhněte hosty ve slabších hodinách
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((hh) => {
            const days = hh.daysOfWeek.split(",").map(Number);
            return (
              <Card key={hh.id} className={`transition-all ${!hh.isActive ? "opacity-50" : "hover:shadow-md"}`}>
                <CardContent className="flex items-start gap-4 pt-4 pb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                    <Beer className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{hh.title}</h3>
                      {hh.discount && (
                        <Badge className="bg-yellow-500/90 text-yellow-950 text-xs gap-1">
                          <Percent className="h-3 w-3" />
                          {hh.discount}
                        </Badge>
                      )}
                    </div>
                    {hh.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{hh.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {hh.startTime} — {hh.endTime}
                      </span>
                      <div className="flex gap-1">
                        {dayLabels.map((d, i) => (
                          <span
                            key={i}
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium ${
                              days.includes(i)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground/50"
                            }`}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={hh.isActive} onCheckedChange={(v) => toggleActive(hh.id, v)} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteItem(hh.id)}
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

function AddHappyHourDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "Happy Hour",
    description: "",
    discount: "",
    startTime: "15:00",
    endTime: "17:00",
    days: [0, 1, 2, 3, 4] as number[],
  });

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day].sort(),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/restaurants/me/happy-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          discount: form.discount || null,
          startTime: form.startTime,
          endTime: form.endTime,
          daysOfWeek: form.days.join(","),
        }),
      });
      if (res.ok) {
        toast.success("Happy hour vytvořen");
        setOpen(false);
        onCreated();
      } else {
        toast.error("Chyba");
      }
    } catch {
      toast.error("Chyba připojení");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Nový happy hour
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nový Happy Hour</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Název *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Happy Hour" required />
          </div>
          <div className="space-y-2">
            <Label>Sleva / nabídka</Label>
            <Input value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="-50%, 2+1 zdarma, -30 Kč..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Od *</Label>
              <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Do *</Label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dny v týdnu</Label>
            <div className="flex gap-2">
              {dayLabels.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-all ${
                    form.days.includes(i)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Popis</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Pivo za polovic, koktejly 2+1..." />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Beer className="h-4 w-4" />}
            Vytvořit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
