"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UtensilsCrossed,
  Crown,
  ExternalLink,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminRestaurant {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  cuisineType: string | null;
  isActive: boolean;
  isPremium: boolean;
  plan: string;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
}

export default function AdminRestauracePage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRestaurants() {
    const res = await fetch("/api/admin/restaurants");
    const data = await res.json();
    setRestaurants(data.restaurants || []);
    setLoading(false);
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function changePlan(id: string, plan: string) {
    await fetch("/api/admin/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, plan, isPremium: plan === "premium" }),
    });
    loadRestaurants();
  }

  async function toggleField(
    id: string,
    field: "isActive" | "isPremium",
    value: boolean
  ) {
    await fetch("/api/admin/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    loadRestaurants();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const activeCount = restaurants.filter((r) => r.isActive).length;
  const premiumCount = restaurants.filter((r) => r.isPremium).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Správa restaurací</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{restaurants.length}</p>
              <p className="text-sm text-muted-foreground">Celkem</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Aktivní</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{premiumCount}</p>
              <p className="text-sm text-muted-foreground">Premium</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrované restaurace</CardTitle>
        </CardHeader>
        <CardContent>
          {restaurants.length === 0 ? (
            <div className="py-8 text-center">
              <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Zatím žádné registrované restaurace
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurace</TableHead>
                  <TableHead>Majitel</TableHead>
                  <TableHead>Město</TableHead>
                  <TableHead>Kuchyně</TableHead>
                  <TableHead>Plán</TableHead>
                  <TableHead>Aktivní</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{r.ownerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.ownerEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{r.city || "—"}</TableCell>
                    <TableCell>{r.cuisineType || "—"}</TableCell>
                    <TableCell>
                      <Select
                        value={r.plan || "free"}
                        onValueChange={(v) => v && changePlan(r.id, v)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Zdarma</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={r.isActive}
                        onCheckedChange={(v) =>
                          toggleField(r.id, "isActive", v)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {r.isActive && (
                        <Link
                          href={`/restaurace/${r.slug}`}
                          target="_blank"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
