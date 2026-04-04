import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [restaurant] = await db
    .select({ id: restaurants.id, plan: restaurants.plan })
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
  }

  if (restaurant.plan === "free") {
    return NextResponse.json({ error: "Kontaktní formulář není dostupný" }, { status: 403 });
  }

  try {
    const { senderName, senderEmail, senderPhone, subject, message } = await request.json();

    if (!senderName || !subject || !message) {
      return NextResponse.json({ error: "Jméno, předmět a zpráva jsou povinné" }, { status: 400 });
    }

    const [msg] = await db
      .insert(messages)
      .values({
        restaurantId: restaurant.id,
        senderName,
        senderEmail: senderEmail || null,
        senderPhone: senderPhone || null,
        subject,
        message,
      })
      .returning();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
