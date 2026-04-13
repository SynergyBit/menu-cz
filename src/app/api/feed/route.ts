import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, events, happyHours, reviews, dailyMenus, dailyMenuItems } from "@/db/schema";
import { eq, and, desc, gte, inArray } from "drizzle-orm";

interface FeedItem {
  id: string;
  type: "new_restaurant" | "event" | "happy_hour" | "review" | "daily_menu";
  timestamp: string;
  restaurant: {
    name: string;
    slug: string;
    city: string | null;
    logoUrl: string | null;
    cuisineType: string | null;
  };
  data: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);

    // Get active restaurants
    const activeRests = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        city: restaurants.city,
        logoUrl: restaurants.logoUrl,
        cuisineType: restaurants.cuisineType,
        createdAt: restaurants.createdAt,
      })
      .from(restaurants)
      .where(eq(restaurants.isActive, true));

    let filteredRests = activeRests;
    if (city) {
      filteredRests = activeRests.filter((r) => r.city?.toLowerCase().includes(city.toLowerCase()));
    }
    const restIds = filteredRests.map((r) => r.id);
    const restMap = new Map(filteredRests.map((r) => [r.id, { name: r.name, slug: r.slug, city: r.city, logoUrl: r.logoUrl, cuisineType: r.cuisineType }]));

    if (restIds.length === 0) {
      return NextResponse.json({ feed: [], cities: [] });
    }

    const feedItems: FeedItem[] = [];

    // 1. New restaurants (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const r of filteredRests) {
      if (new Date(r.createdAt) >= thirtyDaysAgo) {
        feedItems.push({
          id: `rest-${r.id}`,
          type: "new_restaurant",
          timestamp: new Date(r.createdAt).toISOString(),
          restaurant: restMap.get(r.id)!,
          data: { cuisineType: r.cuisineType },
        });
      }
    }

    // 2. Events (upcoming)
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingEvents = await db
      .select()
      .from(events)
      .where(and(inArray(events.restaurantId, restIds), eq(events.isPublished, true), gte(events.eventDate, now)))
      .orderBy(events.eventDate)
      .limit(20);

    for (const e of upcomingEvents) {
      const rest = restMap.get(e.restaurantId);
      if (rest) {
        feedItems.push({
          id: `evt-${e.id}`,
          type: "event",
          timestamp: new Date(e.createdAt).toISOString(),
          restaurant: rest,
          data: { title: e.title, eventDate: e.eventDate, eventTime: e.eventTime, eventType: e.eventType, description: e.description },
        });
      }
    }

    // 3. Happy hours (active)
    const activeHH = await db
      .select()
      .from(happyHours)
      .where(and(inArray(happyHours.restaurantId, restIds), eq(happyHours.isActive, true)));

    for (const hh of activeHH) {
      const rest = restMap.get(hh.restaurantId);
      if (rest) {
        feedItems.push({
          id: `hh-${hh.id}`,
          type: "happy_hour",
          timestamp: new Date(hh.createdAt).toISOString(),
          restaurant: rest,
          data: { title: hh.title, discount: hh.discount, startTime: hh.startTime, endTime: hh.endTime, daysOfWeek: hh.daysOfWeek },
        });
      }
    }

    // 4. Recent reviews (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentReviews = await db
      .select()
      .from(reviews)
      .where(and(inArray(reviews.restaurantId, restIds), eq(reviews.isApproved, true), gte(reviews.createdAt, twoWeeksAgo)))
      .orderBy(desc(reviews.createdAt))
      .limit(15);

    for (const r of recentReviews) {
      const rest = restMap.get(r.restaurantId);
      if (rest) {
        feedItems.push({
          id: `rev-${r.id}`,
          type: "review",
          timestamp: new Date(r.createdAt).toISOString(),
          restaurant: rest,
          data: { authorName: r.authorName, rating: r.rating, comment: r.comment },
        });
      }
    }

    // 5. Today's daily menus
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMenus = await db
      .select()
      .from(dailyMenus)
      .where(and(inArray(dailyMenus.restaurantId, restIds), gte(dailyMenus.date, today)));

    if (todayMenus.length > 0) {
      const menuIds = todayMenus.map((m) => m.id);
      const menuItems = await db.select().from(dailyMenuItems).where(inArray(dailyMenuItems.dailyMenuId, menuIds));

      for (const m of todayMenus) {
        const rest = restMap.get(m.restaurantId);
        if (rest) {
          const items = menuItems.filter((i) => i.dailyMenuId === m.id);
          feedItems.push({
            id: `dm-${m.id}`,
            type: "daily_menu",
            timestamp: new Date(m.createdAt).toISOString(),
            restaurant: rest,
            data: { itemCount: items.length, items: items.slice(0, 4).map((i) => ({ name: i.name, price: i.price, type: i.type })) },
          });
        }
      }
    }

    // Sort by timestamp desc
    feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const cities = [...new Set(activeRests.map((r) => r.city).filter(Boolean))] as string[];

    return NextResponse.json({ feed: feedItems.slice(0, limit), cities });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ feed: [], cities: [] });
  }
}
