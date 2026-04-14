import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sanitize, checkRateLimit } from "@/lib/validation";

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
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!(await checkRateLimit(`contact:${ip}`, 5, 3600000))) {
      return NextResponse.json({ error: "Příliš mnoho zpráv. Zkuste to později." }, { status: 429 });
    }

    const body = await request.json();
    const senderName = sanitize(body.senderName);
    const senderEmail = sanitize(body.senderEmail);
    const senderPhone = sanitize(body.senderPhone);
    const subject = sanitize(body.subject);
    const message = sanitize(body.message);

    if (!senderName || !subject || !message) {
      return NextResponse.json({ error: "Jméno, předmět a zpráva jsou povinné" }, { status: 400 });
    }

    if (message.length > 5000 || senderName.length > 100) {
      return NextResponse.json({ error: "Příliš dlouhý text" }, { status: 400 });
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
