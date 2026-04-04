import type { Metadata } from "next";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const [restaurant] = await db
    .select({ name: restaurants.name, city: restaurants.city, cuisineType: restaurants.cuisineType })
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1);

  if (!restaurant) {
    return { title: "Menu — MenuCZ" };
  }

  return {
    title: `${restaurant.name} — Menu | MenuCZ`,
    description: `Jídelní lístek a denní menu — ${restaurant.name}${restaurant.city ? `, ${restaurant.city}` : ""}`,
  };
}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
