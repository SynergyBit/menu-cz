import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, reservations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sanitize, checkRateLimit } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [r] = await db.select({
    reservationsEnabled: restaurants.reservationsEnabled,
    reservationMinHoursAhead: restaurants.reservationMinHoursAhead,
    reservationMaxDaysAhead: restaurants.reservationMaxDaysAhead,
    reservationMaxPartySize: restaurants.reservationMaxPartySize,
    reservationSlotMinutes: restaurants.reservationSlotMinutes,
    reservationNotes: restaurants.reservationNotes,
    plan: restaurants.plan,
  }).from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.isActive, true)))
    .limit(1);

  if (!r || r.plan === "free" || !r.reservationsEnabled) {
    return NextResponse.json({ available: false });
  }

  return NextResponse.json({
    available: true,
    minHoursAhead: r.reservationMinHoursAhead,
    maxDaysAhead: r.reservationMaxDaysAhead,
    maxPartySize: r.reservationMaxPartySize,
    slotMinutes: r.reservationSlotMinutes,
    notes: r.reservationNotes,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`reserve:${ip}`, 5, 3600000)) {
    return NextResponse.json({ error: "Příliš mnoho pokusů" }, { status: 429 });
  }

  const [restaurant] = await db.select({ id: restaurants.id, reservationsEnabled: restaurants.reservationsEnabled, plan: restaurants.plan })
    .from(restaurants).where(and(eq(restaurants.slug, slug), eq(restaurants.isActive, true))).limit(1);

  if (!restaurant || restaurant.plan === "free" || !restaurant.reservationsEnabled) {
    return NextResponse.json({ error: "Rezervace nejsou dostupné" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const guestName = sanitize(body.guestName);
    const guestPhone = sanitize(body.guestPhone);
    const guestEmail = sanitize(body.guestEmail);
    const note = sanitize(body.note);

    if (!guestName || !guestPhone || !body.date || !body.time || !body.partySize) {
      return NextResponse.json({ error: "Jméno, telefon, datum, čas a počet osob jsou povinné" }, { status: 400 });
    }

    const [reservation] = await db.insert(reservations).values({
      restaurantId: restaurant.id,
      guestName,
      guestEmail: guestEmail || null,
      guestPhone,
      partySize: Number(body.partySize),
      date: new Date(body.date),
      time: body.time,
      note: note || null,
    }).returning();

    return NextResponse.json({ success: true, reservation: { id: reservation.id, status: reservation.status } });
  } catch (error) {
    console.error("Reserve error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
