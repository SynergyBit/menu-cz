import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET() {
  try {
    const cities = await db
      .select({
        city: restaurants.city,
        count: count(),
      })
      .from(restaurants)
      .where(eq(restaurants.isActive, true))
      .groupBy(restaurants.city)
      .orderBy(sql`count(*) DESC`);

    return NextResponse.json({
      cities: cities.filter((c) => c.city).map((c) => ({
        name: c.city,
        slug: c.city!.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
        count: c.count,
      })),
    });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
