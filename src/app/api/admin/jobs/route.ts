import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobOffers, restaurants } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  // auth enforced by proxy.ts on /api/admin/*
  const rows = await db
    .select({
      id: jobOffers.id,
      title: jobOffers.title,
      position: jobOffers.position,
      employmentType: jobOffers.employmentType,
      city: jobOffers.city,
      country: jobOffers.country,
      isActive: jobOffers.isActive,
      isApproved: jobOffers.isApproved,
      isFeatured: jobOffers.isFeatured,
      expiresAt: jobOffers.expiresAt,
      createdAt: jobOffers.createdAt,
      restaurantName: restaurants.name,
      restaurantSlug: restaurants.slug,
    })
    .from(jobOffers)
    .innerJoin(restaurants, eq(jobOffers.restaurantId, restaurants.id))
    .orderBy(desc(jobOffers.createdAt))
    .limit(500);

  return NextResponse.json({ jobs: rows });
}
