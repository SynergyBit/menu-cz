"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Leaf, Calendar, ChefHat } from "lucide-react";

interface SeasonalItem { name: string; description: string; price: string; }
interface SeasonalMenu { id: string; title: string; description: string | null; items: SeasonalItem[]; validFrom: string; validUntil: string; isActive: boolean; }

export default function SezonniMenuPage() {
  const [menus, setMenus] = useState<SeasonalMenu[]>([]);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [mRes, meRes] = await Promise.all([
      fetch("/api/restaurants/me/seasonal-menu").then((r) => r.json()).catch(() => ({ menus: [] })),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setMenus(mRes.menus || []);
    setPlan(meRes.restaurant?.plan || "free");
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function deleteMenu(id: string) {
    await fetch(`/api/restaurants/me/seasonal-menu?id=${id}`, { method: "DELETE" });
    toast.success("Sezónní menu smazáno"); load();
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /></div>;

  const now = new Date();
  const active = menus.filter((m) => m.isActive && new Date(m.validUntil) >= now && new Date(m.validFrom) <= now);
  const upcoming = menus.filter((m) => m.isActive && new Date(m.validFrom) > now);
  const expired = menus.filter((m) => !m.isActive || new Date(m.validUntil) < now);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Sezónní menu</h1><p className="text-sm text-muted-foreground">Časově omezené nabídky</p></div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Sezónní menu" requiredPlan="premium" currentPlan={plan}>
        <AddSeasonalDialog onCreated={load} />

        {menus.length === 0 ? (
          <Card className="py-12 text-center"><CardContent><Leaf className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" /><p className="font-semibold">Žádné sezónní menu</p><p className="mt-1 text-sm text-muted-foreground">Vytvořte speciální nabídku — Vánoční menu, Letní gril...</p></CardContent></Card>
        ) : (<div className="space-y-6">
          {active.length > 0 && (<div><h2 className="mb-3 text-sm font-semibold text-green-600 uppercase tracking-wider flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />Právě aktivní</h2><div className="space-y-3">{active.map((m) => <SeasonalCard key={m.id} m={m} onDelete={deleteMenu} />)}</div></div>)}
          {upcoming.length > 0 && (<div><h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nadcházející</h2><div className="space-y-3">{upcoming.map((m) => <SeasonalCard key={m.id} m={m} onDelete={deleteMenu} />)}</div></div>)}
          {expired.length > 0 && (<div><h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vypršelé</h2><div className="space-y-3 opacity-60">{expired.map((m) => <SeasonalCard key={m.id} m={m} onDelete={deleteMenu} />)}</div></div>)}
        </div>)}
      </PremiumGate>
    </div>
  );
}

function SeasonalCard({ m, onDelete }: { m: SeasonalMenu; onDelete: (id: string) => void }) {
  const now = new Date();
  const isActive = m.isActive && new Date(m.validFrom) <= now && new Date(m.validUntil) >= now;
  return (
    <Card className={`transition-all ${isActive ? "border-green-500/30 bg-green-500/[0.02] hover:shadow-md" : "hover:shadow-sm"}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Leaf className="h-4 w-4 text-green-600" />
              <h3 className="font-semibold">{m.title}</h3>
              {isActive && <Badge className="bg-green-500 text-white text-xs">Aktivní</Badge>}
            </div>
            {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
            <div className="mt-2 space-y-1">
              {m.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><ChefHat className="h-3 w-3" />{item.name}</span>
                  <span className="text-xs font-medium text-primary">{item.price} Kč</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(m.validFrom).toLocaleDateString("cs-CZ")} — {new Date(m.validUntil).toLocaleDateString("cs-CZ")}</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" />}><Trash2 className="h-3.5 w-3.5" /></AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Smazat?</AlertDialogTitle><AlertDialogDescription>&quot;{m.title}&quot; bude smazáno.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Zrušit</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(m.id)}>Smazat</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function AddSeasonalDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [items, setItems] = useState<SeasonalItem[]>([{ name: "", description: "", price: "" }]);

  function addItem() { setItems([...items, { name: "", description: "", price: "" }]); }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter((i) => i.name.trim() && i.price.trim());
    if (!title || !validFrom || !validUntil || validItems.length === 0) { toast.error("Vyplňte název, datum a alespoň 1 položku"); return; }
    setSaving(true);
    const res = await fetch("/api/restaurants/me/seasonal-menu", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, validFrom, validUntil, items: validItems }),
    });
    if (res.ok) { toast.success("Vytvořeno"); setOpen(false); onCreated(); } else { const d = await res.json(); toast.error(d.error || "Chyba"); }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full gap-2" />}><Plus className="h-4 w-4" />Nové sezónní menu</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nové sezónní menu</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Název *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vánoční menu 2026" required /></div>
          <div className="space-y-2"><Label>Popis</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Speciální menu pro vánoční sezónu" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Od *</Label><Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Do *</Label><Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required /></div>
          </div>
          <div className="space-y-2">
            <Label>Položky *</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input value={item.name} onChange={(e) => { const n = [...items]; n[i] = { ...item, name: e.target.value }; setItems(n); }} placeholder="Jídlo" className="flex-1" />
                <Input value={item.price} onChange={(e) => { const n = [...items]; n[i] = { ...item, price: e.target.value }; setItems(n); }} placeholder="Kč" className="w-20" type="number" />
                {items.length > 1 && <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(i)}><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Položka</Button>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4" />}Vytvořit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
