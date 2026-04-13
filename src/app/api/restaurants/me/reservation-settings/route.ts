import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  const [r] = await db.select({
    plan: restaurants.plan,
    reservationsEnabled: restaurants.reservationsEnabled,
    reservationMinHoursAhead: restaurants.reservationMinHoursAhead,
    reservationMaxDaysAhead: restaurants.reservationMaxDaysAhead,
    reservationMaxPartySize: restaurants.reservationMaxPartySize,
    reservationSlotMinutes: restaurants.reservationSlotMinutes,
    reservationNotes: restaurants.reservationNotes,
  }).from(restaurants).where(eq(restaurants.id, session.restaurantId)).limit(1);

  return NextResponse.json({ settings: r || null });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  // Check premium plan
  const [rest] = await db.select({ plan: restaurants.plan }).from(restaurants).where(eq(restaurants.id, session.restaurantId)).limit(1);
  if (!rest || rest.plan === "free") {
    return NextResponse.json({ error: "Rezervace vyžadují plán Standard nebo Premium" }, { status: 403 });
  }

  const body = await request.json();
  await db.update(restaurants).set({
    reservationsEnabled: !!body.reservationsEnabled,
    reservationMinHoursAhead: body.reservationMinHoursAhead ?? 2,
    reservationMaxDaysAhead: body.reservationMaxDaysAhead ?? 30,
    reservationMaxPartySize: body.reservationMaxPartySize ?? 10,
    reservationSlotMinutes: body.reservationSlotMinutes ?? 30,
    reservationNotes: body.reservationNotes || null,
    updatedAt: new Date(),
  }).where(eq(restaurants.id, session.restaurantId));

  return NextResponse.json({ success: true });
}
