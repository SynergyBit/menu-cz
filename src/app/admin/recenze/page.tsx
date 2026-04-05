"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/star-rating";
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  restaurantName: string | null;
  restaurantSlug: string | null;
}

export default function AdminRecenzePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadReviews() {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => { loadReviews(); }, []);

  async function toggleApproval(id: string, isApproved: boolean) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isApproved }),
    });
    loadReviews();
  }

  async function deleteReview(id: string) {
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    toast.success("Recenze smazána");
    loadReviews();
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Správa recenzí</h1>

      <Card>
        <CardContent className="p-0">
          {reviews.length === 0 ? (
            <div className="py-12 text-center">
              <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground">Žádné recenze</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Autor</TableHead>
                  <TableHead>Restaurace</TableHead>
                  <TableHead>Hodnocení</TableHead>
                  <TableHead>Komentář</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Schváleno</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.authorName}</TableCell>
                    <TableCell>{r.restaurantName || "—"}</TableCell>
                    <TableCell><StarRating rating={r.rating} size="sm" /></TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {r.comment || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("cs-CZ")}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={r.isApproved}
                        onCheckedChange={(v) => toggleApproval(r.id, v)}
                      />
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" />
                        }>
                          <Trash2 className="h-3.5 w-3.5" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Smazat recenzi?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Recenze od {r.authorName} bude trvale smazána.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Zrušit</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteReview(r.id)}>
                              Smazat
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
