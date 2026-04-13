import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  try {
    const { title, excerpt, content, coverImage, category, tags, authorName, isPublished } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Název a obsah jsou povinné" }, { status: 400 });
    }

    let slug = generateSlug(title);
    const existing = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const [post] = await db
      .insert(blogPosts)
      .values({
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        category: category || "tipy",
        tags: tags ? JSON.stringify(tags) : null,
        authorName: authorName || "Gastroo",
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Blog create error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  try {
    const { id, title, excerpt, content, coverImage, category, tags, authorName, isPublished } = await request.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (content !== undefined) updates.content = content;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = JSON.stringify(tags);
    if (authorName !== undefined) updates.authorName = authorName;
    if (isPublished !== undefined) {
      updates.isPublished = isPublished;
      if (isPublished) updates.publishedAt = new Date();
    }

    const [post] = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Blog update error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
  return NextResponse.json({ success: true });
}
