import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, menuItems, reviews, users } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const [restCount] = await db.select({ count: count() }).from(restaurants).where(eq(restaurants.isActive, true));
    const [itemCount] = await db.select({ count: count() }).from(menuItems);
    const [reviewCount] = await db.select({ count: count() }).from(reviews);
    const [userCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "user"));

    return NextResponse.json({
      restaurants: restCount.count,
      menuItems: itemCount.count,
      reviews: reviewCount.count,
      users: userCount.count,
    });
  } catch {
    return NextResponse.json({ restaurants: 0, menuItems: 0, reviews: 0, users: 0 });
  }
}
