import { db } from "./db";
import { users, templates, projects, analytics, categories } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Create demo user
    const [demoUser] = await db.insert(users).values({
      id: "demo-user",
      email: "demo@runyourtrip.com",
      firstName: "Demo",
      lastName: "User"
    }).returning();

    console.log("✓ Created demo user");

    // Create categories first
    const [travelCategory] = await db.insert(categories).values({
      name: "Travel & Tourism",
      slug: "travel-tourism",
      description: "Travel and tourism related templates"
    }).onConflictDoNothing().returning();

    const [hospitalityCategory] = await db.insert(categories).values({
      name: "Hospitality",
      slug: "hospitality",
      description: "Hotels, resorts, and hospitality templates"
    }).onConflictDoNothing().returning();

    const [contentCategory] = await db.insert(categories).values({
      name: "Content & Media",
      slug: "content-media",
      description: "Blogs, media, and content templates"
    }).onConflictDoNothing().returning();

    // Get category IDs (use existing if conflict)
    const getCategoryId = async (name: string, slug: string) => {
      const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
      return cat?.id || 1; // Default to 1 if not found
    };

    const travelCatId = travelCategory?.id || await getCategoryId("Travel & Tourism", "travel-tourism");
    const hospitalityCatId = hospitalityCategory?.id || await getCategoryId("Hospitality", "hospitality");
    const contentCatId = contentCategory?.id || await getCategoryId("Content & Media", "content-media");

    // Create sample templates with category IDs
    const sampleTemplates = [
      {
        userId: demoUser.id,
        categoryId: travelCatId,
        name: "Adventure Travel Portal",
        description: "A comprehensive travel booking platform designed for adventure seekers. Features interactive maps, booking system, and travel guides.",
        category: "Travel & Tourism",
        price: "49.99",
        code: "<!DOCTYPE html><html><head><title>Adventure Portal</title></head><body><h1>Adventure Travel Portal</h1><p>Your gateway to amazing adventures!</p></body></html>",
        tags: ["travel", "adventure", "booking", "maps"]
      },
      {
        userId: demoUser.id,
        categoryId: hospitalityCatId,
        name: "Luxury Resort Showcase",
        description: "Elegant resort website template with photo galleries, room booking, and amenities showcase. Perfect for high-end hospitality.",
        category: "Hospitality",
        price: "79.99",
        code: "<!DOCTYPE html><html><head><title>Luxury Resort</title></head><body><h1>Luxury Resort</h1><p>Experience luxury like never before.</p></body></html>",
        tags: ["luxury", "resort", "hospitality", "booking"]
      },
      {
        userId: demoUser.id,
        categoryId: contentCatId,
        name: "Travel Blog Platform",
        description: "Modern travel blog template with social features, photo sharing, and travel diary functionality.",
        category: "Content & Media",
        price: "29.99",
        code: "<!DOCTYPE html><html><head><title>Travel Blog</title></head><body><h1>Travel Blog</h1><p>Share your travel stories with the world.</p></body></html>",
        tags: ["blog", "travel", "social", "photos"]
      }
    ];

    const createdTemplates = await db.insert(templates).values(sampleTemplates).returning();
    console.log("✓ Created sample templates");

    // Create analytics data
    const analyticsData = [
      {
        userId: demoUser.id,
        templateId: createdTemplates[0].id,
        views: 1250,
        downloads: 35,
        revenue: "432.50"
      },
      {
        userId: demoUser.id,
        templateId: createdTemplates[1].id,
        views: 890,
        downloads: 28,
        revenue: "665.10"
      },
      {
        userId: demoUser.id,
        templateId: createdTemplates[2].id,
        views: 431,
        downloads: 15,
        revenue: "89.85"
      }
    ];

    await db.insert(analytics).values(analyticsData);
    console.log("✓ Created analytics data");

    console.log("🎉 Database seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };