import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobSeekers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sanitize } from "@/lib/validation";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [row] = await db.select().from(jobSeekers).where(eq(jobSeekers.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const publicFacing = row.isActive && row.isApproved && row.expiresAt > new Date();
  const session = await getSession();
  const isOwner = session?.userId === row.userId;
  const isAdmin = session?.role === "admin";
  if (!publicFacing && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ seeker: row });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  const [existing] = await db
    .select({ userId: jobSeekers.userId })
    .from(jobSeekers)
    .where(eq(jobSeekers.id, id))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) patch.name = sanitize(body.name).slice(0, 80);
  if (body.position !== undefined) patch.position = sanitize(body.position).slice(0, 80);
  if (body.headline !== undefined) patch.headline = sanitize(body.headline).slice(0, 160);
  if (body.description !== undefined) patch.description = sanitize(body.description).slice(0, 5000);
  if (body.employmentType !== undefined) patch.employmentType = sanitize(body.employmentType).slice(0, 20);
  if (body.city !== undefined) patch.city = sanitize(body.city).slice(0, 120);
  if (body.country !== undefined && ["CZ", "SK"].includes(body.country)) patch.country = body.country;
  if (body.yearsExperience !== undefined) patch.yearsExperience = body.yearsExperience ? Number(body.yearsExperience) : null;
  if (body.expectedSalaryFrom !== undefined) patch.expectedSalaryFrom = body.expectedSalaryFrom ? Number(body.expectedSalaryFrom) : null;
  if (body.expectedSalaryCurrency !== undefined && ["CZK", "EUR"].includes(body.expectedSalaryCurrency)) patch.expectedSalaryCurrency = body.expectedSalaryCurrency;
  if (body.expectedSalaryPeriod !== undefined && ["hour", "month"].includes(body.expectedSalaryPeriod)) patch.expectedSalaryPeriod = body.expectedSalaryPeriod;
  if (body.contactEmail !== undefined) patch.contactEmail = sanitize(body.contactEmail).slice(0, 200);
  if (body.contactPhone !== undefined) patch.contactPhone = sanitize(body.contactPhone).slice(0, 30) || null;
  if (body.skills !== undefined) patch.skills = sanitize(body.skills).slice(0, 500) || null;
  if (body.languages !== undefined) patch.languages = sanitize(body.languages).slice(0, 200) || null;
  if (body.availableFrom !== undefined) patch.availableFrom = body.availableFrom ? new Date(body.availableFrom) : null;
  if (body.isActive !== undefined) patch.isActive = !!body.isActive;
  if (body.extendDays) {
    const d = Math.min(Math.max(Number(body.extendDays) || 0, 1), 90);
    patch.expiresAt = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
  }

  const [updated] = await db
    .update(jobSeekers)
    .set(patch)
    .where(eq(jobSeekers.id, id))
    .returning();
  return NextResponse.json({ seeker: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  const [existing] = await db
    .select({ userId: jobSeekers.userId })
    .from(jobSeekers)
    .where(eq(jobSeekers.id, id))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(jobSeekers).where(eq(jobSeekers.id, id));
  return NextResponse.json({ success: true });
}
