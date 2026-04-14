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
  cuisineType: text("cuisine_type"),
  priceRange: integer("price_range").default(2),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  isActive: boolean("is_active").default(false).notNull(),
  plan: text("plan").notNull().default("free"),
  planExpiresAt: timestamp("plan_expires_at"),
  isPremium: boolean("is_premium").default(false).notNull(),
  tagline: text("tagline"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  googleMaps: text("google_maps"),
  specialties: text("specialties"),
  acceptsReservations: boolean("accepts_reservations").default(false),
  hasDelivery: boolean("has_delivery").default(false),
  hasTakeaway: boolean("has_takeaway").default(false),
  hasParking: boolean("has_parking").default(false),
  hasWifi: boolean("has_wifi").default(false),
  hasOutdoorSeating: boolean("has_outdoor_seating").default(false),
  hasLiveMusic: boolean("has_live_music").default(false),
  themeColor: text("theme_color"),
  // Reservation settings
  reservationsEnabled: boolean("reservations_enabled").default(false),
  reservationMinHoursAhead: integer("reservation_min_hours_ahead").default(2),
  reservationMaxDaysAhead: integer("reservation_max_days_ahead").default(30),
  reservationMaxPartySize: integer("reservation_max_party_size").default(10),
  reservationSlotMinutes: integer("reservation_slot_minutes").default(30),
  reservationNotes: text("reservation_notes"), // zobrazí se hostům
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
  allergens: text("allergens"),
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
  type: text("type").notNull().default("main"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const openingHours = pgTable("opening_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
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

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email"),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pageViews = pgTable("page_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  viewType: text("view_type").notNull().default("page"), // 'page' | 'qr' | 'menu' | 'daily_menu'
  date: timestamp("date").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email"),
  senderPhone: text("sender_phone"),
  subject: text("subject").notNull(), // 'reservation' | 'question' | 'feedback'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  eventTime: text("event_time"), // "19:00"
  endTime: text("end_time"), // "23:00"
  eventType: text("event_type").notNull().default("other"), // 'live_music' | 'tasting' | 'theme_night' | 'special_menu' | 'happy_hour' | 'other'
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const happyHours = pgTable("happy_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // "Happy Hour", "Polední akce"
  description: text("description"), // "Pivo za polovic!"
  discount: text("discount"), // "-50%", "2+1 zdarma", "-30 Kč"
  startTime: text("start_time").notNull(), // "15:00"
  endTime: text("end_time").notNull(), // "17:00"
  daysOfWeek: text("days_of_week").notNull().default("0,1,2,3,4"), // comma-separated: 0=Po..6=Ne
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  category: text("category").notNull().default("tipy"),
  tags: text("tags"), // JSON array
  authorName: text("author_name").notNull().default("Gastroo"),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone").notNull(),
  partySize: integer("party_size").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(), // "19:00"
  note: text("note"),
  status: text("status").notNull().default("pending"), // 'pending' | 'confirmed' | 'declined' | 'cancelled'
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuTemplates = pgTable("menu_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  items: text("items").notNull(), // JSON: [{name, description, price, type}]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  discountType: text("discount_type").notNull().default("percent"), // 'percent' | 'fixed' | 'freebie'
  discountValue: text("discount_value"), // "20", "50 Kč", "Dezert zdarma"
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  maxUses: integer("max_uses"), // null = unlimited
  currentUses: integer("current_uses").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seasonalMenus = pgTable("seasonal_menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  items: text("items").notNull(), // JSON [{name, description, price}]
  coverImage: text("cover_image"),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  ingredients: text("ingredients").notNull(), // JSON array: [{amount, unit, name}]
  instructions: text("instructions").notNull(), // HTML postup
  coverImage: text("cover_image"),
  category: text("category").notNull().default("hlavni-jidla"),
  cuisine: text("cuisine"), // česká, italská...
  difficulty: text("difficulty").notNull().default("stredni"), // snadne, stredni, narocne
  prepTime: integer("prep_time"), // minuty
  cookTime: integer("cook_time"), // minuty
  servings: integer("servings").default(4),
  tags: text("tags"), // JSON array
  authorName: text("author_name").notNull().default("Gastroo"),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobOffers = pgTable("job_offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: text("position").notNull(), // kuchař, servírka, pomocný personál, barman, apod.
  description: text("description").notNull(),
  employmentType: text("employment_type").notNull(), // "full_time" | "part_time" | "brigada" | "dohoda"
  city: text("city").notNull(),
  country: text("country").notNull().default("CZ"), // "CZ" | "SK"
  salaryFrom: integer("salary_from"), // Kč/EUR
  salaryTo: integer("salary_to"),
  salaryCurrency: text("salary_currency").notNull().default("CZK"), // "CZK" | "EUR"
  salaryPeriod: text("salary_period").notNull().default("month"), // "hour" | "month"
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  isActive: boolean("is_active").default(true).notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at").notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  dietaryPreferences: text("dietary_preferences"), // JSON: ["vegetarian", "gluten-free", ...]
  favoritesCuisines: text("favorites_cuisines"), // JSON: ["česká", "italská", ...]
  defaultCity: text("default_city"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
