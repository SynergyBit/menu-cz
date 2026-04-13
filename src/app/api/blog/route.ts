import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and, desc, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");

    if (slug) {
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
        .limit(1);
      return NextResponse.json({ post: post || null });
    }

    const conditions = [eq(blogPosts.isPublished, true)];
    if (category) {
      conditions.push(eq(blogPosts.category, category));
    }

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        category: blogPosts.category,
        tags: blogPosts.tags,
        authorName: blogPosts.authorName,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(50);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Blog API error:", error);
    return NextResponse.json({ posts: [] });
  }
}
