import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, menuCategories, menuItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { allergens as allergenList } from "@/lib/allergens";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, session.restaurantId))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
  }

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurant.id))
    .orderBy(menuCategories.sortOrder);

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurant.id))
    .orderBy(menuItems.sortOrder);

  const categoriesWithItems = categories.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.categoryId === cat.id),
  }));

  // Generate HTML for PDF
  const allergenLegend = items
    .flatMap((i) => (i.allergens || "").split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)))
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b)
    .map((id) => allergenList.find((a) => a.id === id))
    .filter(Boolean);

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>${restaurant.name} — Jídelní lístek</title>
<style>
  @page { margin: 20mm 15mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5; }

  .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e5e5; }
  .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  .header .tagline { font-size: 14px; color: #666; font-style: italic; }
  .header .info { font-size: 12px; color: #888; margin-top: 8px; }

  .category { margin-bottom: 24px; page-break-inside: avoid; }
  .category h2 { font-size: 18px; font-weight: 700; color: #c2410c; padding-bottom: 6px; border-bottom: 1px solid #f0e0d0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

  .item { display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; }
  .item + .item { border-top: 1px dotted #e5e5e5; }
  .item-info { flex: 1; padding-right: 16px; }
  .item-name { font-size: 14px; font-weight: 600; }
  .item-desc { font-size: 12px; color: #666; margin-top: 1px; }
  .item-allergens { font-size: 10px; color: #999; margin-top: 2px; }
  .item-price { font-size: 14px; font-weight: 700; color: #c2410c; white-space: nowrap; }

  .legend { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e5e5e5; }
  .legend h3 { font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .legend-items { display: flex; flex-wrap: wrap; gap: 8px; }
  .legend-item { font-size: 10px; color: #666; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }

  .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #aaa; }
</style>
</head>
<body>
  <div class="header">
    <h1>${restaurant.name}</h1>
    ${restaurant.tagline ? `<p class="tagline">${restaurant.tagline}</p>` : ""}
    <p class="info">
      ${[restaurant.address, restaurant.city].filter(Boolean).join(", ")}
      ${restaurant.phone ? ` | ${restaurant.phone}` : ""}
    </p>
  </div>

  ${categoriesWithItems.map((cat) => `
    <div class="category">
      <h2>${cat.name}</h2>
      ${cat.items.map((item) => `
        <div class="item">
          <div class="item-info">
            <div class="item-name">${item.name}${!item.isAvailable ? ' <span style="color:#999;font-weight:400;font-size:11px">(nedostupné)</span>' : ""}</div>
            ${item.description ? `<div class="item-desc">${item.description}</div>` : ""}
            ${item.allergens ? `<div class="item-allergens">Alergeny: ${item.allergens}</div>` : ""}
          </div>
          <div class="item-price">${item.price} Kč</div>
        </div>
      `).join("")}
    </div>
  `).join("")}

  ${allergenLegend.length > 0 ? `
    <div class="legend">
      <h3>Alergeny</h3>
      <div class="legend-items">
        ${allergenLegend.map((a) => `<span class="legend-item">${a!.id} — ${a!.name}</span>`).join("")}
      </div>
    </div>
  ` : ""}

  <div class="footer">
    Jídelní lístek vygenerován přes Gastroo.cz | ${new Date().toLocaleDateString("cs-CZ")}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="menu-${restaurant.slug}.html"`,
    },
  });
}
