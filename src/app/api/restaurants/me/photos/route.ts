import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getPhotoLimit } from "@/lib/plans";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(photos)
    .where(eq(photos.restaurantId, session.restaurantId))
    .orderBy(photos.sortOrder);

  return NextResponse.json({ photos: result });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  // Check plan limits
  const [restaurant] = await db
    .select({ plan: restaurants.plan })
    .from(restaurants)
    .where(eq(restaurants.id, session.restaurantId))
    .limit(1);

  const limit = getPhotoLimit(restaurant?.plan || "free");
  if (limit === 0) {
    return NextResponse.json({ error: "Fotogalerie vyžaduje plán Standard nebo Premium" }, { status: 403 });
  }

  const existing = await db
    .select()
    .from(photos)
    .where(eq(photos.restaurantId, session.restaurantId));

  if (existing.length >= limit) {
    return NextResponse.json({ error: `Maximální počet fotek pro váš plán: ${limit}` }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "Žádný soubor" }, { status: 400 });
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "Povolené formáty: JPEG, PNG, WebP" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 2 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const [photo] = await db
      .insert(photos)
      .values({
        restaurantId: session.restaurantId,
        url: dataUrl,
        caption,
        sortOrder: existing.length,
      })
      .returning();

    return NextResponse.json({ photo });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get("id");

  if (!photoId) {
    return NextResponse.json({ error: "Chybí ID" }, { status: 400 });
  }

  await db.delete(photos).where(eq(photos.id, photoId));
  return NextResponse.json({ success: true });
}
