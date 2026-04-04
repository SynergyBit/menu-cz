import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  // Check plan
  const [restaurant] = await db
    .select({ plan: restaurants.plan })
    .from(restaurants)
    .where(eq(restaurants.id, session.restaurantId))
    .limit(1);

  if (!restaurant || restaurant.plan === "free") {
    return NextResponse.json(
      { error: "Tato funkce vyžaduje plán Standard nebo Premium" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      tagline,
      facebook,
      instagram,
      tiktok,
      googleMaps,
      specialties,
      acceptsReservations,
      hasDelivery,
      hasTakeaway,
      hasParking,
      hasWifi,
      hasOutdoorSeating,
      hasLiveMusic,
      themeColor,
    } = body;

    const updateData: Record<string, unknown> = {
      tagline,
      facebook,
      instagram,
      tiktok,
      googleMaps,
      specialties: specialties ? JSON.stringify(specialties) : null,
      acceptsReservations: !!acceptsReservations,
      hasDelivery: !!hasDelivery,
      hasTakeaway: !!hasTakeaway,
      hasParking: !!hasParking,
      hasWifi: !!hasWifi,
      hasOutdoorSeating: !!hasOutdoorSeating,
      hasLiveMusic: !!hasLiveMusic,
      updatedAt: new Date(),
    };

    // Theme color only for premium
    if (restaurant.plan === "premium" && themeColor) {
      updateData.themeColor = themeColor;
    }

    const [updated] = await db
      .update(restaurants)
      .set(updateData)
      .where(eq(restaurants.id, session.restaurantId))
      .returning();

    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    console.error("Vizitka update error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
