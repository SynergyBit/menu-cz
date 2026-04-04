import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://menu-app-production-d230.up.railway.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/restaurace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
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

    return [...staticRoutes, ...restaurantUrls];
  } catch {
    return staticRoutes;
  }
}
