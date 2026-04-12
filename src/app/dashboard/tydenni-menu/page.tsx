"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Soup,
  ChefHat,
  CakeSlice,
  Check,
} from "lucide-react";

interface DayMenuItem {
  name: string;
  description: string;
  price: string;
  type: string;
}

interface WeekDay {
  date: string;
  dayName: string;
  dayIndex: number;
  menu: { id: string } | null;
  items: { id: string; name: string; description: string | null; price: string; type: string }[];
}

const typeIcons: Record<string, typeof Soup> = { soup: Soup, main: ChefHat, dessert: CakeSlice };

export default function TydenniMenuPage() {
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<DayMenuItem[]>([]);
  const [copying, setCopying] = useState(false);

  async function loadWeek(offset: number) {
    setLoading(true);
    const res = await fetch(`/api/restaurants/me/weekly-menu?week=${offset}`);
    const data = await res.json();
    setWeekData(data.week || []);
    setLoading(false);
  }

  useEffect(() => {
    loadWeek(weekOffset);
  }, [weekOffset]);

  function startEdit(day: WeekDay) {
    setEditingDay(day.date);
    setEditItems(
      day.items.length > 0
        ? day.items.map((i) => ({ name: i.name, description: i.description || "", price: i.price, type: i.type }))
        : [{ name: "", description: "", price: "", type: "main" }]
    );
  }

  function addItem() {
    setEditItems([...editItems, { name: "", description: "", price: "", type: "main" }]);
  }

  function removeItem(idx: number) {
    setEditItems(editItems.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof DayMenuItem, value: string) {
    setEditItems(editItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  async function saveDay(date: string) {
    const validItems = editItems.filter((i) => i.name.trim() && i.price.trim());
    setSavingDay(date);
    try {
      const res = await fetch("/api/restaurants/me/weekly-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveDay", date, items: validItems }),
      });
      if (res.ok) {
        toast.success(`Menu uloženo`);
        setEditingDay(null);
        loadWeek(weekOffset);
      } else {
        toast.error("Chyba při ukládání");
      }
    } catch {
      toast.error("Chyba připojení");
    }
    setSavingDay(null);
  }

  async function copyLastWeek() {
    setCopying(true);
    try {
      const res = await fetch("/api/restaurants/me/weekly-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "copyWeek", sourceWeek: weekOffset - 1 }),
      });
      if (res.ok) {
        toast.success("Týden zkopírován");
        loadWeek(weekOffset);
      } else {
        const data = await res.json();
        toast.error(data.error || "Chyba");
      }
    } catch {
      toast.error("Chyba připojení");
    }
    setCopying(false);
  }

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Týdenní menu</h1>
          <p className="text-sm text-muted-foreground">Naplánujte denní menu na celý týden</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={copyLastWeek}
            disabled={copying}
          >
            {copying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
            Kopírovat minulý týden
          </Button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-3">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(weekOffset - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-semibold">
            {weekData.length > 0
              ? `${new Date(weekData[0].date).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })} — ${new Date(weekData[6].date).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", year: "numeric" })}`
              : "..."}
          </p>
          {weekOffset === 0 && (
            <Badge variant="secondary" className="mt-1 text-xs">Tento týden</Badge>
          )}
          {weekOffset === 1 && (
            <Badge variant="outline" className="mt-1 text-xs">Příští týden</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {weekData.map((day) => {
          const isToday = day.date === today;
          const isPast = day.date < today;
          const isEditing = editingDay === day.date;

          return (
            <Card
              key={day.date}
              className={`transition-all ${isToday ? "border-primary/30 bg-primary/[0.02]" : ""} ${isPast ? "opacity-60" : ""}`}
            >
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                      isToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {new Date(day.date).getDate()}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                        {day.dayName}
                        {isToday && <span className="ml-2 text-xs font-normal">(dnes)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.items.length > 0 ? `${day.items.length} položek` : "Prázdné"}
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => startEdit(day)} className="gap-1.5">
                      {day.items.length > 0 ? "Upravit" : <><Plus className="h-3.5 w-3.5" />Přidat</>}
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Display items (non-editing) */}
              {!isEditing && day.items.length > 0 && (
                <CardContent className="pt-0 pb-3 px-4">
                  <div className="space-y-1">
                    {day.items.map((item) => {
                      const Icon = typeIcons[item.type] || ChefHat;
                      return (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-primary/50" />
                            <span>{item.name}</span>
                            {item.description && (
                              <span className="text-xs text-muted-foreground">— {item.description}</span>
                            )}
                          </div>
                          <span className="font-semibold text-primary">{item.price} Kč</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}

              {/* Edit mode */}
              {isEditing && (
                <CardContent className="pt-0 pb-4 px-4 space-y-3">
                  <Separator />
                  {editItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Select
                        value={item.type}
                        onValueChange={(v) => v && updateItem(idx, "type", v)}
                      >
                        <SelectTrigger className="w-28 h-9 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soup">Polévka</SelectItem>
                          <SelectItem value="main">Hlavní</SelectItem>
                          <SelectItem value="dessert">Dezert</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                        placeholder="Název jídla"
                        className="h-9"
                      />
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Popis"
                        className="h-9 hidden sm:block"
                      />
                      <Input
                        value={item.price}
                        onChange={(e) => updateItem(idx, "price", e.target.value)}
                        placeholder="Kč"
                        className="h-9 w-20 shrink-0"
                        type="number"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <Button variant="ghost" size="sm" onClick={addItem} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Položka
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingDay(null)}>
                        Zrušit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveDay(day.date)}
                        disabled={savingDay === day.date}
                        className="gap-1.5"
                      >
                        {savingDay === day.date ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Uložit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
