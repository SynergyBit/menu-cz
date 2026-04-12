"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { eventTypes, getEventType } from "@/lib/event-types";
import {
  Plus,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  CalendarPlus,
  Sparkles,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endTime: string | null;
  eventType: string;
  isPublished: boolean;
}

export default function AkcePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    const res = await fetch("/api/restaurants/me/events");
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }

  useEffect(() => { loadEvents(); }, []);

  async function deleteEvent(id: string) {
    await fetch(`/api/restaurants/me/events?id=${id}`, { method: "DELETE" });
    toast.success("Akce smazána");
    loadEvents();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const upcoming = events.filter((e) => new Date(e.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0)));
  const past = events.filter((e) => new Date(e.eventDate) < new Date(new Date().setHours(0, 0, 0, 0)));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Akce a události</h1>
          <p className="text-sm text-muted-foreground">
            {upcoming.length} nadcházejících akcí
          </p>
        </div>
        <AddEventDialog onCreated={loadEvents} />
      </div>

      {/* Upcoming */}
      {upcoming.length === 0 && past.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <CalendarPlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-semibold">Zatím žádné akce</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Přidejte první akci — degustaci, živou hudbu nebo tematický večer
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nadcházející</h2>
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} onDelete={deleteEvent} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Proběhlé</h2>
              {past.map((event) => (
                <EventCard key={event.id} event={event} onDelete={deleteEvent} isPast />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, onDelete, isPast }: { event: Event; onDelete: (id: string) => void; isPast?: boolean }) {
  const type = getEventType(event.eventType);
  const date = new Date(event.eventDate);

  return (
    <Card className={`transition-all ${isPast ? "opacity-60" : "hover:shadow-md"}`}>
      <CardContent className="flex items-start gap-4 pt-4 pb-4">
        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${isPast ? "bg-muted" : "bg-primary/10"}`}>
          <span className="text-[10px] font-medium text-muted-foreground uppercase">
            {date.toLocaleDateString("cs-CZ", { month: "short" })}
          </span>
          <span className={`text-lg font-bold ${isPast ? "text-muted-foreground" : "text-primary"}`}>
            {date.getDate()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{event.title}</h3>
            <Badge variant="outline" className="shrink-0 text-xs gap-1">
              <span>{type.emoji}</span>
              {type.label}
            </Badge>
          </div>
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {date.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            {event.eventTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.eventTime}{event.endTime ? ` — ${event.endTime}` : ""}
              </span>
            )}
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger render={
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" />
          }>
            <Trash2 className="h-3.5 w-3.5" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Smazat akci?</AlertDialogTitle>
              <AlertDialogDescription>Akce &quot;{event.title}&quot; bude trvale smazána.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Zrušit</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(event.id)}>Smazat</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function AddEventDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    endTime: "",
    eventType: "other",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.eventDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/restaurants/me/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Akce vytvořena");
        setForm({ title: "", description: "", eventDate: "", eventTime: "", endTime: "", eventType: "other" });
        setOpen(false);
        onCreated();
      } else {
        toast.error("Chyba při vytváření");
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
        Nová akce
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nová akce</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Název akce *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Např. Vinná degustace"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Typ</Label>
            <Select value={form.eventType} onValueChange={(v) => v && setForm({ ...form, eventType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Datum *</Label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Od</Label>
              <Input
                type="time"
                value={form.eventTime}
                onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Do</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Popis</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Podrobnosti o akci..."
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Vytvořit akci
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
