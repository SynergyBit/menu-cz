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
    .select({ slug: restaurants.slug, name: restaurants.name, plan: restaurants.plan })
    .from(restaurants)
    .where(eq(restaurants.id, session.restaurantId))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurace nenalezena" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "png";
  const color = searchParams.get("color") || "#1a1a1a";
  const bgColor = searchParams.get("bg") || "#ffffff";
  const size = Math.min(Math.max(parseInt(searchParams.get("size") || "512"), 128), 1024);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get("x-forwarded-proto") + "://" + request.headers.get("host");
  const menuUrl = `${baseUrl}/m/${restaurant.slug}`;

  // Only premium can customize colors
  const isPremium = restaurant.plan === "premium";
  const darkColor = isPremium ? color : "#1a1a1a";
  const lightColor = isPremium ? bgColor : "#ffffff";

  if (format === "svg") {
    const svg = await QRCode.toString(menuUrl, {
      type: "svg",
      width: 300,
      margin: 2,
      color: { dark: darkColor, light: lightColor },
    });
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }

  const buffer = await QRCode.toBuffer(menuUrl, {
    width: size,
    margin: 2,
    color: { dark: darkColor, light: lightColor },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="qr-${restaurant.slug}.png"`,
    },
  });
}
