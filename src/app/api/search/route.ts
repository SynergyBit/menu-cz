import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const results = await db
    .select({
      name: restaurants.name,
      slug: restaurants.slug,
      city: restaurants.city,
      cuisineType: restaurants.cuisineType,
      logoUrl: restaurants.logoUrl,
    })
    .from(restaurants)
    .where(
      sql`${restaurants.isActive} = true AND (
        ${restaurants.name} ILIKE ${`%${q}%`} OR
        ${restaurants.city} ILIKE ${`%${q}%`} OR
        ${restaurants.cuisineType} ILIKE ${`%${q}%`}
      )`
    )
    .limit(6);

  return NextResponse.json({ suggestions: results });
}
