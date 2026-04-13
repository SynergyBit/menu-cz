"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import { toast } from "sonner";
import {
  BookmarkPlus, Trash2, Play, Loader2, ChefHat, Soup, CakeSlice,
  Plus, Calendar, Bookmark,
} from "lucide-react";

interface TemplateItem { name: string; description?: string; price: string; type: string; }
interface Template { id: string; name: string; items: TemplateItem[]; createdAt: string; }

const typeIcons: Record<string, typeof Soup> = { soup: Soup, main: ChefHat, dessert: CakeSlice };
const typeLabels: Record<string, string> = { soup: "Polévka", main: "Hlavní", dessert: "Dezert" };

export default function SablonyMenuPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [tRes, meRes] = await Promise.all([
      fetch("/api/restaurants/me/menu-templates").then((r) => r.json()).catch(() => ({ templates: [] })),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setTemplates(tRes.templates || []);
    setPlan(meRes.restaurant?.plan || "free");
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteTemplate(id: string) {
    await fetch("/api/restaurants/me/menu-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteTemplate", templateId: id }),
    });
    toast.success("Šablona smazána");
    load();
  }

  async function applyTemplate(templateId: string, date: string) {
    const res = await fetch("/api/restaurants/me/menu-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "applyTemplate", templateId, date }),
    });
    if (res.ok) {
      toast.success("Šablona aplikována na " + new Date(date).toLocaleDateString("cs-CZ"));
    } else {
      const d = await res.json();
      toast.error(d.error || "Chyba");
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Šablony denního menu</h1>
          <p className="text-sm text-muted-foreground">Uložte menu a aplikujte jedním klikem</p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Šablony denního menu" requiredPlan="standard" currentPlan={plan}>
        {/* Save today as template */}
        <SaveTodayDialog onSaved={load} />

        {/* Templates list */}
        {templates.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-semibold">Žádné šablony</p>
              <p className="mt-1 text-sm text-muted-foreground">Uložte dnešní menu jako šablonu, nebo vytvořte novou</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <Card key={t.id} className="transition-all hover:shadow-md">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{t.name}</h3>
                        <Badge variant="secondary" className="text-xs">{t.items.length} položek</Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        {t.items.map((item, i) => {
                          const Icon = typeIcons[item.type] || ChefHat;
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Icon className="h-3 w-3" />
                                {item.name}
                              </span>
                              <span className="text-xs font-medium text-primary">{item.price} Kč</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Vytvořeno {new Date(t.createdAt).toLocaleDateString("cs-CZ")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <ApplyDialog templateId={t.id} templateName={t.name} onApply={applyTemplate} />
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" />
                        }>
                          <Trash2 className="h-3.5 w-3.5" />
                          Smazat
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Smazat šablonu?</AlertDialogTitle>
                            <AlertDialogDescription>&quot;{t.name}&quot; bude trvale smazána.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Zrušit</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTemplate(t.id)}>Smazat</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PremiumGate>
    </div>
  );
}

function SaveTodayDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/restaurants/me/menu-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveAsTemplate", name: name.trim() }),
    });
    if (res.ok) {
      toast.success("Šablona uložena");
      setName("");
      setOpen(false);
      onSaved();
    } else {
      const d = await res.json();
      toast.error(d.error || "Chyba");
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full gap-2" />}>
        <BookmarkPlus className="h-4 w-4" />
        Uložit dnešní menu jako šablonu
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Uložit jako šablonu</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Název šablony</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Např. Pondělní klasika" onKeyDown={(e) => e.key === "Enter" && handleSave()} />
          </div>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
            Uložit šablonu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplyDialog({ templateId, templateName, onApply }: { templateId: string; templateName: string; onApply: (id: string, date: string) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <Play className="h-3.5 w-3.5" />
        Použít
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Aplikovat šablonu</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Šablona <strong>&quot;{templateName}&quot;</strong> nahradí denní menu vybraného dne.
          </p>
          <div className="space-y-2">
            <Label>Datum</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button onClick={() => { onApply(templateId, date); setOpen(false); }} className="w-full gap-2">
            <Calendar className="h-4 w-4" />
            Aplikovat na {new Date(date).toLocaleDateString("cs-CZ")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
