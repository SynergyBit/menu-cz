import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pageViews, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { slug, viewType } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const [restaurant] = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.slug, slug))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.insert(pageViews).values({
      restaurantId: restaurant.id,
      viewType: viewType || "page",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
