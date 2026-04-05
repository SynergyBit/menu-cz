import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { geocodeAddress } from "@/lib/geocode";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name, description, address, city, phone, email, website, cuisineType, priceRange,
      tagline, acceptsReservations, hasDelivery, hasTakeaway, hasParking, hasWifi, hasOutdoorSeating, hasLiveMusic,
    } = body;

    // Geocode if address or city changed
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (address && city) {
      const coords = await geocodeAddress(address, city);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    const updateData: Record<string, unknown> = {
      name: name || undefined,
      description,
      address,
      city,
      phone,
      email,
      website,
      cuisineType,
      priceRange: priceRange ? Number(priceRange) : undefined,
      tagline: tagline || null,
      acceptsReservations: !!acceptsReservations,
      hasDelivery: !!hasDelivery,
      hasTakeaway: !!hasTakeaway,
      hasParking: !!hasParking,
      hasWifi: !!hasWifi,
      hasOutdoorSeating: !!hasOutdoorSeating,
      hasLiveMusic: !!hasLiveMusic,
      updatedAt: new Date(),
    };

    if (latitude !== null && longitude !== null) {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    }

    const [updated] = await db
      .update(restaurants)
      .set(updateData)
      .where(eq(restaurants.id, session.restaurantId))
      .returning();

    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    console.error("Update restaurant error:", error);
    return NextResponse.json({ error: "Chyba při aktualizaci" }, { status: 500 });
  }
}
