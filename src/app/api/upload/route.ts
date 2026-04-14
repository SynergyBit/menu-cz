import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateImageBuffer, mimeFromFormat } from "@/lib/image-validation";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // 'logo' | 'cover'

    if (!file) {
      return NextResponse.json({ error: "Žádný soubor" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Maximální velikost souboru je 2 MB" },
        { status: 400 }
      );
    }

    if (type !== "logo" && type !== "cover") {
      return NextResponse.json(
        { error: "Neplatný typ: logo nebo cover" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = await validateImageBuffer(buffer, ["jpeg", "png", "webp"]);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeFromFormat(validation.format)};base64,${base64}`;

    const updateField = type === "logo" ? { logoUrl: dataUrl } : { coverUrl: dataUrl };
    await db
      .update(restaurants)
      .set({ ...updateField, updatedAt: new Date() })
      .where(eq(restaurants.id, session.restaurantId));

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Chyba při nahrávání" }, { status: 500 });
  }
}
