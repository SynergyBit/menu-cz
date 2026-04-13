import type { Metadata } from "next";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [r] = await db.select({ title: recipes.title, description: recipes.description }).from(recipes).where(eq(recipes.slug, slug)).limit(1);
    if (!r) return { title: "Recept nenalezen" };
    return { title: r.title, description: r.description || `Recept: ${r.title}` };
  } catch { return { title: "Kuchařka" }; }
}

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
