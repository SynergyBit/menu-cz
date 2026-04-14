import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobOffers, restaurants } from "@/db/schema";
import { and, desc, eq, gt, ilike, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sanitize } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const city = searchParams.get("city")?.trim() || "";
  const country = searchParams.get("country")?.trim() || "";
  const position = searchParams.get("position")?.trim() || "";
  const type = searchParams.get("type")?.trim() || "";

  const conds = [
    eq(jobOffers.isActive, true),
    eq(jobOffers.isApproved, true),
    gt(jobOffers.expiresAt, new Date()),
  ];
  if (city) conds.push(ilike(jobOffers.city, `%${city}%`));
  if (country) conds.push(eq(jobOffers.country, country));
  if (position) conds.push(eq(jobOffers.position, position));
  if (type) conds.push(eq(jobOffers.employmentType, type));

  const rows = await db
    .select({
      id: jobOffers.id,
      title: jobOffers.title,
      position: jobOffers.position,
      employmentType: jobOffers.employmentType,
      city: jobOffers.city,
      country: jobOffers.country,
      salaryFrom: jobOffers.salaryFrom,
      salaryTo: jobOffers.salaryTo,
      salaryCurrency: jobOffers.salaryCurrency,
      salaryPeriod: jobOffers.salaryPeriod,
      isFeatured: jobOffers.isFeatured,
      createdAt: jobOffers.createdAt,
      restaurantId: jobOffers.restaurantId,
      restaurantName: restaurants.name,
      restaurantSlug: restaurants.slug,
      restaurantLogo: restaurants.logoUrl,
    })
    .from(jobOffers)
    .innerJoin(restaurants, eq(jobOffers.restaurantId, restaurants.id))
    .where(and(...conds))
    .orderBy(desc(jobOffers.isFeatured), desc(jobOffers.createdAt))
    .limit(200);

  const filtered = q
    ? rows.filter((r) => {
        const hay = `${r.title} ${r.position} ${r.restaurantName} ${r.city}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
    : rows;

  return NextResponse.json({ jobs: filtered });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = sanitize(body.title).slice(0, 140);
    const description = sanitize(body.description).slice(0, 5000);
    const position = sanitize(body.position).slice(0, 80);
    const employmentType = sanitize(body.employmentType).slice(0, 20);
    const city = sanitize(body.city).slice(0, 120);
    const country = ["CZ", "SK"].includes(body.country) ? body.country : "CZ";
    const salaryFrom = body.salaryFrom ? Number(body.salaryFrom) : null;
    const salaryTo = body.salaryTo ? Number(body.salaryTo) : null;
    const salaryCurrency = ["CZK", "EUR"].includes(body.salaryCurrency)
      ? body.salaryCurrency
      : country === "SK" ? "EUR" : "CZK";
    const salaryPeriod = ["hour", "month"].includes(body.salaryPeriod)
      ? body.salaryPeriod
      : "month";
    const contactEmail = sanitize(body.contactEmail).slice(0, 200) || null;
    const contactPhone = sanitize(body.contactPhone).slice(0, 30) || null;
    const requirements = sanitize(body.requirements).slice(0, 2000) || null;
    const benefits = sanitize(body.benefits).slice(0, 2000) || null;
    const validDays = Math.min(Math.max(Number(body.validDays) || 30, 7), 90);

    if (!title || !description || !position || !employmentType || !city) {
      return NextResponse.json({ error: "Vyplňte všechna povinná pole" }, { status: 400 });
    }
    if (salaryFrom != null && (salaryFrom < 0 || salaryFrom > 10_000_000)) {
      return NextResponse.json({ error: "Neplatná mzda" }, { status: 400 });
    }
    if (salaryTo != null && (salaryTo < 0 || salaryTo > 10_000_000)) {
      return NextResponse.json({ error: "Neplatná mzda" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    const [job] = await db
      .insert(jobOffers)
      .values({
        restaurantId: session.restaurantId,
        title,
        position,
        description,
        employmentType,
        city,
        country,
        salaryFrom,
        salaryTo,
        salaryCurrency,
        salaryPeriod,
        contactEmail,
        contactPhone,
        requirements,
        benefits,
        expiresAt,
      })
      .returning();

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Job create error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
