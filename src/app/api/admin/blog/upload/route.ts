import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Žádný soubor" }, { status: 400 });
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      return NextResponse.json({ error: "Povolené formáty: JPEG, PNG, WebP, GIF" }, { status: 400 });
    }

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 3 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Blog upload error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
