"use client";

import { useState, useEffect, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogEditor } from "@/components/blog-editor";

export default function EditClanekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<{
    id: string; title: string; excerpt: string; content: string;
    coverImage: string | null; category: string; tags: string[];
    authorName: string; isPublished: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((res) => {
        const post = (res.posts || []).find((p: { id: string }) => p.id === id);
        if (post) {
          setData({
            ...post,
            excerpt: post.excerpt || "",
            tags: post.tags ? JSON.parse(post.tags) : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (!data) return <p className="text-center py-12 text-muted-foreground">Článek nenalezen</p>;

  return <BlogEditor initialData={data} />;
}
