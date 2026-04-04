"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  Soup,
  ChefHat,
  CakeSlice,
  Copy,
} from "lucide-react";

interface DailyMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  type: string;
}

const typeIcons: Record<string, typeof Soup> = {
  soup: Soup,
  main: ChefHat,
  dessert: CakeSlice,
};

const typeLabels: Record<string, string> = {
  soup: "Polévka",
  main: "Hlavní jídlo",
  dessert: "Dezert",
};

export default function DailyMenuPage() {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [items, setItems] = useState<DailyMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  async function loadMenu() {
    const res = await fetch("/api/restaurants/me/daily-menu");
    const data = await res.json();
    setMenuId(data.dailyMenu?.id || null);
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function createMenu() {
    setLoading(true);
    const res = await fetch("/api/restaurants/me/daily-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createMenu" }),
    });
    const data = await res.json();
    setMenuId(data.dailyMenu?.id || null);
    setItems([]);
    setLoading(false);
  }

  async function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!menuId) return;
    setAdding(true);

    const formData = new FormData(e.currentTarget);
    await fetch("/api/restaurants/me/daily-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addItem",
        dailyMenuId: menuId,
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        type: formData.get("type"),
        sortOrder: items.length,
      }),
    });

    e.currentTarget.reset();
    setAdding(false);
    loadMenu();
  }

  async function deleteItem(id: string) {
    await fetch("/api/restaurants/me/daily-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteItem", id }),
    });
    loadMenu();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Denní menu</h1>
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("cs-CZ", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>

      {!menuId ? (
        <Card className="py-12 text-center">
          <CardContent>
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="mb-4 text-muted-foreground">
              Dnešní denní menu ještě nebylo vytvořeno
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={createMenu} className="gap-2">
                <Plus className="h-4 w-4" />
                Vytvořit denní menu
              </Button>
              <Button variant="outline" className="gap-2" onClick={async () => {
                setLoading(true);
                const res = await fetch("/api/restaurants/me/daily-menu", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "copyPrevious" }),
                });
                if (res.ok) {
                  loadMenu();
                } else {
                  const data = await res.json();
                  alert(data.error || "Chyba");
                  setLoading(false);
                }
              }}>
                <Copy className="h-4 w-4" />
                Kopírovat včerejší
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Add item form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Přidat položku</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addItem} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input name="name" placeholder="Název jídla" required />
                  <Select name="type" defaultValue="main">
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soup">Polévka</SelectItem>
                      <SelectItem value="main">Hlavní jídlo</SelectItem>
                      <SelectItem value="dessert">Dezert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input name="description" placeholder="Popis (volitelné)" />
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="Cena"
                    required
                    className="w-24"
                  />
                  <Button type="submit" disabled={adding} className="gap-2">
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Přidat
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Items list */}
          <Card>
            <CardHeader>
              <CardTitle>
                Dnešní nabídka ({items.length}{" "}
                {items.length === 1 ? "položka" : "položek"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Přidejte první položku denního menu
                </p>
              ) : (
                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const Icon = typeIcons[item.type] || ChefHat;
                    return (
                      <div key={item.id}>
                        {idx > 0 && <Separator className="my-2" />}
                        <div className="flex items-center justify-between gap-3 py-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">
                                {typeLabels[item.type]}
                              </span>
                              <p className="font-medium">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">
                              {item.price} Kč
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
