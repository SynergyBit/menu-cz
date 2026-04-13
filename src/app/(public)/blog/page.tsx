"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  FileText,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  tags: string | null;
  authorName: string;
  publishedAt: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  tipy: { label: "Tipy", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  recepty: { label: "Recepty", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
  rozhovory: { label: "Rozhovory", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
  novinky: { label: "Novinky", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  pruvodce: { label: "Průvodce", color: "bg-primary/10 text-primary border-primary/20" },
};

const filterCategories = [
  { value: "", label: "Vše" },
  { value: "tipy", label: "Tipy" },
  { value: "recepty", label: "Recepty" },
  { value: "rozhovory", label: "Rozhovory" },
  { value: "novinky", label: "Novinky" },
  { value: "pruvodce", label: "Průvodce" },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    fetch(`/api/blog?${params}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Blog</h1>
            <p className="text-muted-foreground">Tipy, recepty a novinky ze světa gastronomie</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filterCategories.map((c) => (
          <button
            key={c.value}
            onClick={() => { setCategory(c.value); setLoading(true); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              category === c.value || (!category && !c.value)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Zatím žádné články</h3>
            <p className="mt-2 text-sm text-muted-foreground">Brzy přidáme nový obsah</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const cat = categoryLabels[post.category] || categoryLabels.tipy;
            const postTags: string[] = post.tags ? JSON.parse(post.tags) : [];
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
                  {/* Cover */}
                  <div className="relative h-44 bg-gradient-to-br from-primary/10 to-warm/10 overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-primary/15" />
                      </div>
                    )}
                    <Badge className={`absolute left-3 top-3 text-xs ${cat.color}`}>
                      {cat.label}
                    </Badge>
                  </div>

                  <CardContent className="pt-4">
                    <h2 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {postTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {postTags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
