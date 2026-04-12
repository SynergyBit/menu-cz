import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gastroo.cz";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/restaurace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/dnes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cenik`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/registrace`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/registrace-host`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const { db } = await import("@/db");
    const { restaurants } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const activeRestaurants = await db
      .select({ slug: restaurants.slug, updatedAt: restaurants.updatedAt })
      .from(restaurants)
      .where(eq(restaurants.isActive, true));

    const restaurantUrls = activeRestaurants.map((r) => ({
      url: `${baseUrl}/restaurace/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // City pages
    const { sql, count } = await import("drizzle-orm");
    const cities = await db
      .select({ city: restaurants.city })
      .from(restaurants)
      .where(eq(restaurants.isActive, true))
      .groupBy(restaurants.city);

    const cityUrls = cities
      .filter((c) => c.city)
      .map((c) => ({
        url: `${baseUrl}/restaurace/mesto/${c.city!.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...restaurantUrls, ...cityUrls];
  } catch {
    return staticRoutes;
  }
}
