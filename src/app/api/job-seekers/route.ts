import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobSeekers } from "@/db/schema";
import { and, desc, eq, gt, ilike } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sanitize, isValidEmail, checkRateLimit } from "@/lib/validation";
import { clientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const city = searchParams.get("city")?.trim() || "";
  const country = searchParams.get("country")?.trim() || "";
  const position = searchParams.get("position")?.trim() || "";
  const type = searchParams.get("type")?.trim() || "";

  const conds = [
    eq(jobSeekers.isActive, true),
    eq(jobSeekers.isApproved, true),
    gt(jobSeekers.expiresAt, new Date()),
  ];
  if (city) conds.push(ilike(jobSeekers.city, `%${city}%`));
  if (country) conds.push(eq(jobSeekers.country, country));
  if (position) conds.push(eq(jobSeekers.position, position));
  if (type) conds.push(eq(jobSeekers.employmentType, type));

  const rows = await db
    .select({
      id: jobSeekers.id,
      name: jobSeekers.name,
      headline: jobSeekers.headline,
      position: jobSeekers.position,
      employmentType: jobSeekers.employmentType,
      city: jobSeekers.city,
      country: jobSeekers.country,
      yearsExperience: jobSeekers.yearsExperience,
      expectedSalaryFrom: jobSeekers.expectedSalaryFrom,
      expectedSalaryCurrency: jobSeekers.expectedSalaryCurrency,
      expectedSalaryPeriod: jobSeekers.expectedSalaryPeriod,
      availableFrom: jobSeekers.availableFrom,
      languages: jobSeekers.languages,
      skills: jobSeekers.skills,
      isFeatured: jobSeekers.isFeatured,
      createdAt: jobSeekers.createdAt,
    })
    .from(jobSeekers)
    .where(and(...conds))
    .orderBy(desc(jobSeekers.isFeatured), desc(jobSeekers.createdAt))
    .limit(200);

  const filtered = q
    ? rows.filter((r) =>
        `${r.name} ${r.headline} ${r.position} ${r.city} ${r.skills || ""}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
    : rows;

  return NextResponse.json({ seekers: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request.headers);
    if (!(await checkRateLimit(`seeker:${ip}`, 3, 3600_000))) {
      return NextResponse.json({ error: "Příliš mnoho pokusů, zkuste to později." }, { status: 429 });
    }

    const session = await getSession();
    const body = await request.json();

    const name = sanitize(body.name).slice(0, 80);
    const position = sanitize(body.position).slice(0, 80);
    const headline = sanitize(body.headline).slice(0, 160);
    const description = sanitize(body.description).slice(0, 5000);
    const employmentType = sanitize(body.employmentType).slice(0, 20);
    const city = sanitize(body.city).slice(0, 120);
    const country = ["CZ", "SK"].includes(body.country) ? body.country : "CZ";
    const contactEmail = sanitize(body.contactEmail).slice(0, 200);
    const contactPhone = sanitize(body.contactPhone).slice(0, 30) || null;
    const skills = sanitize(body.skills).slice(0, 500) || null;
    const languages = sanitize(body.languages).slice(0, 200) || null;
    const yearsExperience = body.yearsExperience ? Math.max(0, Math.min(60, Number(body.yearsExperience))) : null;
    const expectedSalaryFrom = body.expectedSalaryFrom ? Number(body.expectedSalaryFrom) : null;
    const expectedSalaryCurrency = ["CZK", "EUR"].includes(body.expectedSalaryCurrency)
      ? body.expectedSalaryCurrency
      : country === "SK" ? "EUR" : "CZK";
    const expectedSalaryPeriod = ["hour", "month"].includes(body.expectedSalaryPeriod)
      ? body.expectedSalaryPeriod
      : "month";
    const availableFrom = body.availableFrom ? new Date(body.availableFrom) : null;

    if (!name || !position || !headline || !description || !employmentType || !city || !contactEmail) {
      return NextResponse.json({ error: "Vyplňte všechna povinná pole" }, { status: 400 });
    }
    if (!isValidEmail(contactEmail)) {
      return NextResponse.json({ error: "Neplatný email" }, { status: 400 });
    }
    if (expectedSalaryFrom != null && (expectedSalaryFrom < 0 || expectedSalaryFrom > 10_000_000)) {
      return NextResponse.json({ error: "Neplatná mzda" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days

    const [seeker] = await db
      .insert(jobSeekers)
      .values({
        userId: session?.userId || null,
        name,
        position,
        headline,
        description,
        employmentType,
        city,
        country,
        yearsExperience,
        expectedSalaryFrom,
        expectedSalaryCurrency,
        expectedSalaryPeriod,
        availableFrom,
        contactEmail,
        contactPhone,
        skills,
        languages,
        expiresAt,
      })
      .returning();

    return NextResponse.json({ seeker });
  } catch (error) {
    console.error("Seeker create error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
