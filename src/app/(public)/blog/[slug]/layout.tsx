import type { Metadata } from "next";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const [post] = await db
      .select({ title: blogPosts.title, excerpt: blogPosts.excerpt })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (!post) return { title: "Článek nenalezen" };

    return {
      title: post.title,
      description: post.excerpt || `Článek na blogu Gastroo: ${post.title}`,
    };
  } catch {
    return { title: "Blog" };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
