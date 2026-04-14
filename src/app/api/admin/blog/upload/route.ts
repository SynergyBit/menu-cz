import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validateImageBuffer, mimeFromFormat } from "@/lib/image-validation";

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

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 3 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = await validateImageBuffer(buffer, ["jpeg", "png", "webp", "gif"]);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeFromFormat(validation.format)};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Blog upload error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
