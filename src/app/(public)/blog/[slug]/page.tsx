"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Share2,
  Tag,
} from "lucide-react";

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
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

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => setPost(data.post || null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Článek nenalezen</h2>
        <Link href="/blog"><Button variant="ghost" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Zpět na blog</Button></Link>
      </div>
    );
  }

  const cat = categoryLabels[post.category] || categoryLabels.tipy;
  const postTags: string[] = post.tags ? JSON.parse(post.tags) : [];

  // Content from admin — trusted source, no user-generated HTML
  const safeContent = post.content;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/blog"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Blog</Button></Link>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => {
          if (navigator.share) navigator.share({ title: post.title, url: window.location.href });
          else navigator.clipboard.writeText(window.location.href);
        }}><Share2 className="h-4 w-4" />Sdílet</Button>
      </div>

      {post.coverImage && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img src={post.coverImage} alt={post.title} className="w-full h-64 sm:h-80 object-cover" />
        </div>
      )}

      <div className="mb-6">
        <Badge className={`mb-4 ${cat.color}`}>{cat.label}</Badge>
        <h1 className="text-3xl font-bold sm:text-4xl leading-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.authorName}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(post.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      <Separator className="mb-8" />

      <article
        className="[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-1.5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_img]:rounded-xl [&_img]:my-6 [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6"
      >
        {/* Render trusted admin content as HTML segments */}
        {safeContent.split(/(<[^>]+>)/).map((segment, i) => {
          if (segment.startsWith("<")) {
            // Return raw HTML element via a wrapper
            return <span key={i} dangerouslySetInnerHTML={{ __html: segment }} />;
          }
          return segment ? <span key={i}>{segment}</span> : null;
        })}
      </article>

      {postTags.length > 0 && (
        <div className="mt-10 pt-6 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {postTags.map((t) => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t text-center">
        <Link href="/blog"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" />Všechny články</Button></Link>
      </div>
    </div>
  );
}
