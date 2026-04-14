import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pageViews, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/validation";

const ALLOWED_VIEW_TYPES = new Set(["page", "phone", "web", "menu", "qr"]);

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!(await checkRateLimit(`track:${ip}`, 60, 60_000))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { slug, viewType } = await request.json();

    if (!slug || typeof slug !== "string" || slug.length > 200) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }
    const safeViewType =
      typeof viewType === "string" && ALLOWED_VIEW_TYPES.has(viewType)
        ? viewType
        : "page";

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
      viewType: safeViewType,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
