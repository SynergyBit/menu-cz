"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Ticket, Copy, Check, Calendar, Percent } from "lucide-react";

interface Coupon {
  id: string; title: string; description: string | null; code: string;
  discountType: string; discountValue: string | null; validFrom: string;
  validUntil: string; maxUses: number | null; currentUses: number; isActive: boolean;
}

export default function KuponyPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [cRes, meRes] = await Promise.all([
      fetch("/api/restaurants/me/coupons").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setItems(cRes.coupons || []);
    setPlan(meRes.restaurant?.plan || "free");
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function deleteCoupon(id: string) {
    await fetch(`/api/restaurants/me/coupons?id=${id}`, { method: "DELETE" });
    toast.success("Kupón smazán"); load();
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /></div>;

  const now = new Date();
  const active = items.filter((c) => c.isActive && new Date(c.validUntil) >= now);
  const expired = items.filter((c) => !c.isActive || new Date(c.validUntil) < now);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Slevové kupóny</h1><p className="text-sm text-muted-foreground">Vytvořte slevy a akce pro hosty</p></div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Slevové kupóny" requiredPlan="standard" currentPlan={plan}>
        <AddCouponDialog onCreated={load} />

        {items.length === 0 ? (
          <Card className="py-12 text-center"><CardContent><Ticket className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" /><p className="font-semibold">Žádné kupóny</p><p className="mt-1 text-sm text-muted-foreground">Vytvořte slevový kupón pro hosty</p></CardContent></Card>
        ) : (<div className="space-y-6">
          {active.length > 0 && (<div><h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Aktivní</h2><div className="space-y-3">{active.map((c) => <CouponCard key={c.id} c={c} onDelete={deleteCoupon} />)}</div></div>)}
          {expired.length > 0 && (<div><h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vypršelé</h2><div className="space-y-3 opacity-60">{expired.map((c) => <CouponCard key={c.id} c={c} onDelete={deleteCoupon} />)}</div></div>)}
        </div>)}
      </PremiumGate>
    </div>
  );
}

function CouponCard({ c, onDelete }: { c: Coupon; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const isExpired = new Date(c.validUntil) < new Date();

  return (
    <Card className={`transition-all ${!isExpired ? "hover:shadow-md" : ""}`}>
      <CardContent className="flex items-start gap-4 pt-4 pb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Ticket className="h-6 w-6 text-primary" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{c.title}</h3>
            {c.discountValue && <Badge className="bg-green-500/90 text-white text-xs">{c.discountType === "percent" ? `${c.discountValue}%` : c.discountValue}</Badge>}
          </div>
          {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <button onClick={() => { navigator.clipboard.writeText(c.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1 font-mono bg-muted px-2 py-0.5 rounded hover:bg-muted/80 transition-colors">
              {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              {c.code}
            </button>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.validFrom).toLocaleDateString("cs-CZ")} — {new Date(c.validUntil).toLocaleDateString("cs-CZ")}</span>
            {c.maxUses && <span>{c.currentUses}/{c.maxUses} použití</span>}
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" />}><Trash2 className="h-3.5 w-3.5" /></AlertDialogTrigger>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Smazat kupón?</AlertDialogTitle><AlertDialogDescription>&quot;{c.title}&quot; bude smazán.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Zrušit</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(c.id)}>Smazat</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function AddCouponDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", code: "", discountType: "percent", discountValue: "", validFrom: new Date().toISOString().split("T")[0], validUntil: "", maxUses: "" });

  function generateCode() { setForm({ ...form, code: Math.random().toString(36).substring(2, 8).toUpperCase() }); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/restaurants/me/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success("Kupón vytvořen"); setOpen(false); onCreated(); } else { const d = await res.json(); toast.error(d.error || "Chyba"); }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full gap-2" />}><Plus className="h-4 w-4" />Nový kupón</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nový slevový kupón</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Název *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Jarní sleva 20%" required /></div>
          <div className="space-y-2"><Label>Popis</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Sleva na celý účet" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Kód *</Label><div className="flex gap-2"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="JARO20" required className="font-mono" /><Button type="button" variant="outline" size="sm" onClick={generateCode}>Generovat</Button></div></div>
            <div className="space-y-2"><Label>Typ slevy</Label>
              <Select value={form.discountType} onValueChange={(v) => v && setForm({ ...form, discountType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percent">Procenta (%)</SelectItem><SelectItem value="fixed">Pevná částka (Kč)</SelectItem><SelectItem value="freebie">Dárek zdarma</SelectItem></SelectContent></Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Hodnota slevy</Label><Input value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === "percent" ? "20" : form.discountType === "fixed" ? "50" : "Dezert zdarma"} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Platí od *</Label><Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Platí do *</Label><Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required /></div>
          </div>
          <div className="space-y-2"><Label>Max. použití</Label><Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Neomezeno" /></div>
          <Button type="submit" className="w-full gap-2" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}Vytvořit kupón</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
