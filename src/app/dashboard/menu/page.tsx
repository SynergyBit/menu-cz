"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Loader2,
  FolderPlus,
  UtensilsCrossed,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  allergens: string | null;
  isAvailable: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  async function loadMenu() {
    const res = await fetch("/api/restaurants/me/menu");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function addCategory() {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    await fetch("/api/restaurants/me/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addCategory",
        name: newCatName.trim(),
        sortOrder: categories.length,
      }),
    });
    setNewCatName("");
    setAddingCat(false);
    loadMenu();
  }

  async function deleteCategory(id: string) {
    await fetch("/api/restaurants/me/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteCategory", id }),
    });
    loadMenu();
  }

  async function addItem(categoryId: string, formData: FormData) {
    await fetch("/api/restaurants/me/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addItem",
        categoryId,
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        allergens: formData.get("allergens"),
      }),
    });
    loadMenu();
  }

  async function deleteItem(id: string) {
    await fetch("/api/restaurants/me/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteItem", id }),
    });
    loadMenu();
  }

  async function toggleAvailability(id: string, isAvailable: boolean) {
    await fetch("/api/restaurants/me/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateItem", id, isAvailable }),
    });
    loadMenu();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jídelní lístek</h1>
      </div>

      {/* Add category */}
      <Card>
        <CardContent className="flex gap-2 pt-6">
          <Input
            placeholder="Název nové kategorie (např. Předkrmy, Hlavní jídla...)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <Button onClick={addCategory} disabled={addingCat} className="gap-2 shrink-0">
            {addingCat ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FolderPlus className="h-4 w-4" />
            )}
            Přidat kategorii
          </Button>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Zatím nemáte žádné kategorie. Přidejte první kategorii výše.
            </p>
          </CardContent>
        </Card>
      ) : (
        categories.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{cat.name}</CardTitle>
              <div className="flex gap-2">
                <AddItemDialog categoryId={cat.id} onAdd={addItem} />
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" />}>
                    <Trash2 className="h-4 w-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Smazat kategorii?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tím smažete kategorii &quot;{cat.name}&quot; a všechny její položky.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Zrušit</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCategory(cat.id)}>
                        Smazat
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              {cat.items.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Zatím žádné položky
                </p>
              ) : (
                <div className="space-y-1">
                  {cat.items.map((item, idx) => (
                    <div key={item.id}>
                      {idx > 0 && <Separator className="my-2" />}
                      <div className="flex items-center justify-between gap-4 py-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.name}</p>
                            {!item.isAvailable && (
                              <Badge variant="secondary" className="text-xs">
                                Nedostupné
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          {item.allergens && (
                            <p className="text-xs text-muted-foreground">
                              Alergeny: {item.allergens}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 font-semibold text-primary">
                          {item.price} Kč
                        </span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.isAvailable}
                            onCheckedChange={(v) =>
                              toggleAvailability(item.id, v)
                            }
                          />
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function AddItemDialog({
  categoryId,
  onAdd,
}: {
  categoryId: string;
  onAdd: (categoryId: string, formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    const formData = new FormData(e.currentTarget);
    await onAdd(categoryId, formData);
    setAdding(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Plus className="h-3.5 w-3.5" />
        Položka
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Přidat položku menu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Název</Label>
            <Input id="item-name" name="name" required placeholder="Svíčková na smetaně" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-desc">Popis</Label>
            <Input id="item-desc" name="description" placeholder="s houskovým knedlíkem" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-price">Cena (Kč)</Label>
              <Input id="item-price" name="price" type="number" step="0.01" required placeholder="189" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-allergens">Alergeny</Label>
              <Input id="item-allergens" name="allergens" placeholder="1,3,7" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={adding}>
            {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Přidat
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
