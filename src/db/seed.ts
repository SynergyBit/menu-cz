import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  const db = drizzle(process.env.DATABASE_URL!);

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gastroo.cz";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  if (existing.length === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log("Admin user already exists");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
