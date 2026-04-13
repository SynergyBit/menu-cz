"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getCategory, getDifficulty } from "@/lib/recipe-types";
import { Plus, Trash2, Pencil, ExternalLink, ChefHat } from "lucide-react";

interface Recipe { id: string; title: string; slug: string; category: string; difficulty: string; isPublished: boolean; publishedAt: string | null; createdAt: string; }

export default function AdminKucharkaPage() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() { const r = await fetch("/api/admin/recipes"); const d = await r.json(); setItems(d.recipes || []); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function deleteRecipe(id: string) { await fetch(`/api/admin/recipes?id=${id}`, { method: "DELETE" }); toast.success("Recept smazán"); load(); }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kuchařka</h1>
        <Link href="/admin/kucharka/novy"><Button className="gap-2"><Plus className="h-4 w-4" />Nový recept</Button></Link>
      </div>

      {items.length === 0 ? (
        <Card className="py-12 text-center"><CardContent><ChefHat className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" /><p className="font-semibold">Žádné recepty</p></CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Recept</TableHead><TableHead>Kategorie</TableHead><TableHead>Obtížnost</TableHead><TableHead>Stav</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((r) => { const cat = getCategory(r.category); const diff = getDifficulty(r.difficulty); return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell><Badge variant="outline">{cat.emoji} {cat.label}</Badge></TableCell>
                  <TableCell><Badge className={diff.color + " border-0 text-xs"}>{diff.emoji} {diff.label}</Badge></TableCell>
                  <TableCell><Badge variant={r.isPublished ? "default" : "secondary"}>{r.isPublished ? "Publikováno" : "Koncept"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.isPublished && <Link href={`/kucharka/${r.slug}`} target="_blank"><Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-3.5 w-3.5" /></Button></Link>}
                      <Link href={`/admin/kucharka/${r.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button></Link>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" />}><Trash2 className="h-3.5 w-3.5" /></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Smazat recept?</AlertDialogTitle><AlertDialogDescription>&quot;{r.title}&quot; bude smazán.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Zrušit</AlertDialogCancel><AlertDialogAction onClick={() => deleteRecipe(r.id)}>Smazat</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ); })}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  );
}
