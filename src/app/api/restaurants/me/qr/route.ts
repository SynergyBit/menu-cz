import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const [restaurant] = await db
    .select({ slug: restaurants.slug, name: restaurants.name })
    .from(restaurants)
    .where(eq(restaurants.id, session.restaurantId))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurace nenalezena" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "png";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get("x-forwarded-proto") + "://" + request.headers.get("host");
  const menuUrl = `${baseUrl}/m/${restaurant.slug}`;

  if (format === "svg") {
    const svg = await QRCode.toString(menuUrl, {
      type: "svg",
      width: 300,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }

  // PNG
  const buffer = await QRCode.toBuffer(menuUrl, {
    width: 512,
    margin: 2,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="qr-${restaurant.slug}.png"`,
    },
  });
}
