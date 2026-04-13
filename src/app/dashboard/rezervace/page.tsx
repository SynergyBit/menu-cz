"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import { toast } from "sonner";
import {
  CalendarCheck, Clock, Users, Phone, Mail, MessageSquare,
  Check, X, Save, Loader2, Settings, List, AlertCircle,
} from "lucide-react";

interface Reservation {
  id: string; guestName: string; guestEmail: string | null; guestPhone: string;
  partySize: number; date: string; time: string; note: string | null;
  status: string; adminNote: string | null; createdAt: string;
}

interface Settings {
  plan: string; reservationsEnabled: boolean; reservationMinHoursAhead: number;
  reservationMaxDaysAhead: number; reservationMaxPartySize: number;
  reservationSlotMinutes: number; reservationNotes: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
  pending: { label: "Čekající", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", icon: Clock },
  confirmed: { label: "Potvrzeno", color: "bg-green-500/10 text-green-700 border-green-500/20", icon: Check },
  declined: { label: "Odmítnuto", color: "bg-red-500/10 text-red-700 border-red-500/20", icon: X },
  cancelled: { label: "Zrušeno", color: "bg-muted text-muted-foreground border-border", icon: X },
};

export default function RezervacePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [resRes, setRes] = await Promise.all([
      fetch("/api/restaurants/me/reservations").then((r) => r.json()),
      fetch("/api/restaurants/me/reservation-settings").then((r) => r.json()),
    ]);
    setReservations(resRes.reservations || []);
    setSettings(setRes.settings || null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    const res = await fetch("/api/restaurants/me/reservation-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) toast.success("Nastavení uloženo");
    else { const d = await res.json(); toast.error(d.error || "Chyba"); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/restaurants/me/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    toast.success(status === "confirmed" ? "Rezervace potvrzena" : "Rezervace odmítnuta");
    load();
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  const plan = settings?.plan || "free";
  const today = new Date().toISOString().split("T")[0];
  const upcoming = reservations.filter((r) => r.date.split("T")[0] >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = reservations.filter((r) => r.date.split("T")[0] < today);
  const pendingCount = upcoming.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rezervace</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} čekajících na potvrzení` : "Správa online rezervací"}
          </p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Online rezervace" requiredPlan="standard" currentPlan={plan}>
        <Tabs defaultValue="reservations">
          <TabsList>
            <TabsTrigger value="reservations" className="gap-1.5">
              <List className="h-3.5 w-3.5" />
              Rezervace {pendingCount > 0 && <Badge className="ml-1 h-5 px-1.5 text-[10px]">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Nastavení
            </TabsTrigger>
          </TabsList>

          {/* Reservations list */}
          <TabsContent value="reservations" className="mt-6 space-y-6">
            {!settings?.reservationsEnabled && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="flex items-center gap-3 pt-6">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm">Rezervace jsou <strong>vypnuté</strong>. Zapněte je v nastavení.</p>
                </CardContent>
              </Card>
            )}

            {upcoming.length === 0 && past.length === 0 ? (
              <Card className="py-12 text-center"><CardContent>
                <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-semibold">Žádné rezervace</p>
                <p className="mt-1 text-sm text-muted-foreground">Hosté si budou moci rezervovat přes vaši vizitku</p>
              </CardContent></Card>
            ) : (<>
              {upcoming.length > 0 && (<div>
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nadcházející</h2>
                <div className="space-y-3">
                  {upcoming.map((r) => <ReservationCard key={r.id} r={r} onStatusChange={updateStatus} />)}
                </div>
              </div>)}
              {past.length > 0 && (<div>
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historie</h2>
                <div className="space-y-3">
                  {past.slice(0, 20).map((r) => <ReservationCard key={r.id} r={r} onStatusChange={updateStatus} isPast />)}
                </div>
              </div>)}
            </>)}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="mt-6 space-y-4">
            {settings && (<>
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Online rezervace</p>
                      <p className="text-sm text-muted-foreground">Hosté si mohou rezervovat stůl přes vaši vizitku</p>
                    </div>
                    <Switch checked={settings.reservationsEnabled || false} onCheckedChange={(v) => setSettings({ ...settings, reservationsEnabled: v })} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Min. předstih (hodiny)</Label>
                      <Input type="number" value={settings.reservationMinHoursAhead ?? 2} onChange={(e) => setSettings({ ...settings, reservationMinHoursAhead: Number(e.target.value) })} />
                      <p className="text-xs text-muted-foreground">Kolik hodin dopředu musí host rezervovat</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Max. dopředu (dny)</Label>
                      <Input type="number" value={settings.reservationMaxDaysAhead ?? 30} onChange={(e) => setSettings({ ...settings, reservationMaxDaysAhead: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max. počet osob</Label>
                      <Input type="number" value={settings.reservationMaxPartySize ?? 10} onChange={(e) => setSettings({ ...settings, reservationMaxPartySize: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Časový slot (minuty)</Label>
                      <Input type="number" value={settings.reservationSlotMinutes ?? 30} onChange={(e) => setSettings({ ...settings, reservationSlotMinutes: Number(e.target.value) })} />
                      <p className="text-xs text-muted-foreground">Interval pro výběr času (30 = 18:00, 18:30...)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Poznámka pro hosty</Label>
                    <Textarea value={settings.reservationNotes || ""} onChange={(e) => setSettings({ ...settings, reservationNotes: e.target.value })} placeholder="Např. Maximální doba rezervace je 2 hodiny..." rows={2} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Uložit nastavení
                </Button>
              </div>
            </>)}
          </TabsContent>
        </Tabs>
      </PremiumGate>
    </div>
  );
}

function ReservationCard({ r, onStatusChange, isPast }: { r: Reservation; onStatusChange: (id: string, status: string) => void; isPast?: boolean }) {
  const config = statusConfig[r.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const date = new Date(r.date);

  return (
    <Card className={`transition-all ${isPast ? "opacity-60" : "hover:shadow-md"} ${r.status === "pending" && !isPast ? "border-yellow-500/30 bg-yellow-500/[0.02]" : ""}`}>
      <CardContent className="flex items-start gap-4 pt-4 pb-4">
        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${r.status === "pending" ? "bg-yellow-500/10" : "bg-muted"}`}>
          <span className="text-[10px] font-medium text-muted-foreground uppercase">{date.toLocaleDateString("cs-CZ", { month: "short" })}</span>
          <span className="text-lg font-bold">{date.getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{r.guestName}</h3>
            <Badge className={`text-xs ${config.color} border`}><StatusIcon className="h-3 w-3 mr-1" />{config.label}</Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.partySize} osob</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.guestPhone}</span>
            {r.guestEmail && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{r.guestEmail}</span>}
          </div>
          {r.note && <p className="mt-1.5 text-xs text-muted-foreground italic flex items-start gap-1"><MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />{r.note}</p>}
        </div>
        {r.status === "pending" && !isPast && (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(r.id, "confirmed")}><Check className="h-3.5 w-3.5" />Potvrdit</Button>
            <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive" onClick={() => onStatusChange(r.id, "declined")}><X className="h-3.5 w-3.5" />Odmítnout</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
