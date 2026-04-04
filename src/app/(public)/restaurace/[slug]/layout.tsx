import type { Metadata } from "next";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const [restaurant] = await db
    .select({
      name: restaurants.name,
      description: restaurants.description,
      city: restaurants.city,
      cuisineType: restaurants.cuisineType,
      tagline: restaurants.tagline,
    })
    .from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.isActive, true)))
    .limit(1);

  if (!restaurant) {
    return { title: "Restaurace nenalezena — MenuCZ" };
  }

  const title = `${restaurant.name}${restaurant.city ? ` — ${restaurant.city}` : ""} | MenuCZ`;
  const description =
    restaurant.tagline ||
    restaurant.description ||
    `${restaurant.name} — jídelní lístek, denní menu a otevírací doba${restaurant.cuisineType ? `. ${restaurant.cuisineType} kuchyně` : ""}.`;

  return {
    title,
    description,
    openGraph: {
      title: restaurant.name,
      description,
      type: "website",
    },
  };
}

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
