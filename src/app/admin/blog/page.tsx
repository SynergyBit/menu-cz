"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Eye, FileText, ExternalLink } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  tipy: "Tipy", recepty: "Recepty", rozhovory: "Rozhovory", novinky: "Novinky", pruvodce: "Průvodce",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/blog");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deletePost(id: string) {
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    toast.success("Článek smazán");
    load();
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Link href="/admin/blog/novy">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nový článek
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-semibold">Žádné články</p>
            <p className="mt-1 text-sm text-muted-foreground">Vytvořte první článek na blog</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Článek</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryLabels[post.category] || post.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Publikováno" : "Koncept"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString("cs-CZ")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {post.isPublished && (
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/blog/${post.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" />
                          }>
                            <Trash2 className="h-3.5 w-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Smazat článek?</AlertDialogTitle>
                              <AlertDialogDescription>Článek &quot;{post.title}&quot; bude trvale smazán.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Zrušit</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePost(post.id)}>Smazat</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
