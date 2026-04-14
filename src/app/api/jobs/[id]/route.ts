import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobOffers, restaurants } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sanitize } from "@/lib/validation";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: jobOffers.id,
      title: jobOffers.title,
      position: jobOffers.position,
      description: jobOffers.description,
      employmentType: jobOffers.employmentType,
      city: jobOffers.city,
      country: jobOffers.country,
      salaryFrom: jobOffers.salaryFrom,
      salaryTo: jobOffers.salaryTo,
      salaryCurrency: jobOffers.salaryCurrency,
      salaryPeriod: jobOffers.salaryPeriod,
      contactEmail: jobOffers.contactEmail,
      contactPhone: jobOffers.contactPhone,
      requirements: jobOffers.requirements,
      benefits: jobOffers.benefits,
      isActive: jobOffers.isActive,
      isApproved: jobOffers.isApproved,
      isFeatured: jobOffers.isFeatured,
      expiresAt: jobOffers.expiresAt,
      createdAt: jobOffers.createdAt,
      restaurantId: jobOffers.restaurantId,
      restaurantName: restaurants.name,
      restaurantSlug: restaurants.slug,
      restaurantLogo: restaurants.logoUrl,
      restaurantAddress: restaurants.address,
      restaurantWebsite: restaurants.website,
    })
    .from(jobOffers)
    .innerJoin(restaurants, eq(jobOffers.restaurantId, restaurants.id))
    .where(eq(jobOffers.id, id))
    .limit(1);

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const publicFacing = row.isActive && row.isApproved && row.expiresAt > new Date();
  const session = await getSession();
  const isOwner = session?.restaurantId === row.restaurantId;
  const isAdmin = session?.role === "admin";
  if (!publicFacing && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ job: row });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const [existing] = await db
      .select({ restaurantId: jobOffers.restaurantId })
      .from(jobOffers)
      .where(eq(jobOffers.id, id))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.restaurantId !== session.restaurantId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) patch.title = sanitize(body.title).slice(0, 140);
    if (body.description !== undefined) patch.description = sanitize(body.description).slice(0, 5000);
    if (body.position !== undefined) patch.position = sanitize(body.position).slice(0, 80);
    if (body.employmentType !== undefined) patch.employmentType = sanitize(body.employmentType).slice(0, 20);
    if (body.city !== undefined) patch.city = sanitize(body.city).slice(0, 120);
    if (body.country !== undefined && ["CZ", "SK"].includes(body.country)) patch.country = body.country;
    if (body.salaryFrom !== undefined) patch.salaryFrom = body.salaryFrom ? Number(body.salaryFrom) : null;
    if (body.salaryTo !== undefined) patch.salaryTo = body.salaryTo ? Number(body.salaryTo) : null;
    if (body.salaryCurrency !== undefined && ["CZK", "EUR"].includes(body.salaryCurrency)) patch.salaryCurrency = body.salaryCurrency;
    if (body.salaryPeriod !== undefined && ["hour", "month"].includes(body.salaryPeriod)) patch.salaryPeriod = body.salaryPeriod;
    if (body.contactEmail !== undefined) patch.contactEmail = sanitize(body.contactEmail).slice(0, 200) || null;
    if (body.contactPhone !== undefined) patch.contactPhone = sanitize(body.contactPhone).slice(0, 30) || null;
    if (body.requirements !== undefined) patch.requirements = sanitize(body.requirements).slice(0, 2000) || null;
    if (body.benefits !== undefined) patch.benefits = sanitize(body.benefits).slice(0, 2000) || null;
    if (body.isActive !== undefined) patch.isActive = !!body.isActive;
    if (body.extendDays) {
      const d = Math.min(Math.max(Number(body.extendDays) || 0, 1), 90);
      patch.expiresAt = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
    }

    const [updated] = await db
      .update(jobOffers)
      .set(patch)
      .where(eq(jobOffers.id, id))
      .returning();
    return NextResponse.json({ job: updated });
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.restaurantId && session?.role !== "admin") {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const where = session?.role === "admin"
    ? eq(jobOffers.id, id)
    : and(eq(jobOffers.id, id), eq(jobOffers.restaurantId, session!.restaurantId!));

  await db.delete(jobOffers).where(where);
  return NextResponse.json({ success: true });
}
