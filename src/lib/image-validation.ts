import sharp from "sharp";

export type AllowedFormat = "jpeg" | "png" | "webp" | "gif";

export async function validateImageBuffer(
  buffer: Buffer,
  allowed: AllowedFormat[] = ["jpeg", "png", "webp"],
): Promise<{ ok: true; format: AllowedFormat } | { ok: false; error: string }> {
  try {
    const meta = await sharp(buffer).metadata();
    const format = meta.format as AllowedFormat | undefined;
    if (!format || !allowed.includes(format)) {
      return { ok: false, error: `Povolené formáty: ${allowed.join(", ").toUpperCase()}` };
    }
    if (!meta.width || !meta.height || meta.width > 8000 || meta.height > 8000) {
      return { ok: false, error: "Neplatné rozměry obrázku" };
    }
    return { ok: true, format };
  } catch {
    return { ok: false, error: "Soubor není platný obrázek" };
  }
}

export function mimeFromFormat(format: AllowedFormat): string {
  return `image/${format === "jpeg" ? "jpeg" : format}`;
}
