import { pgTable, text, timestamp, integer, boolean, uuid, time, numeric, serial, doublePrecision } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("restaurant"), // 'admin' | 'restaurant'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  cuisineType: text("cuisine_type"), // česká, italská, asijská...
  priceRange: integer("price_range").default(2), // 1-4
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  isActive: boolean("is_active").default(false).notNull(),
  plan: text("plan").notNull().default("free"), // 'free' | 'standard' | 'premium'
  planExpiresAt: timestamp("plan_expires_at"),
  isPremium: boolean("is_premium").default(false).notNull(),
  // Vizitka fields
  tagline: text("tagline"), // krátký slogan
  facebook: text("facebook"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  googleMaps: text("google_maps"),
  specialties: text("specialties"), // JSON array of specialties
  acceptsReservations: boolean("accepts_reservations").default(false),
  hasDelivery: boolean("has_delivery").default(false),
  hasTakeaway: boolean("has_takeaway").default(false),
  hasParking: boolean("has_parking").default(false),
  hasWifi: boolean("has_wifi").default(false),
  hasOutdoorSeating: boolean("has_outdoor_seating").default(false),
  hasLiveMusic: boolean("has_live_music").default(false),
  themeColor: text("theme_color"), // hex color for vizitka
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").notNull().references(() => menuCategories.id, { onDelete: "cascade" }),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true).notNull(),
  allergens: text("allergens"), // comma separated: 1,3,7
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const dailyMenus = pgTable("daily_menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyMenuItems = pgTable("daily_menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  dailyMenuId: uuid("daily_menu_id").notNull().references(() => dailyMenus.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull().default("main"), // 'soup' | 'main' | 'dessert'
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const openingHours = pgTable("opening_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Po, 1=Út... 6=Ne
  openTime: time("open_time"),
  closeTime: time("close_time"),
  isClosed: boolean("is_closed").default(false).notNull(),
});

export const photos = pgTable("photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
