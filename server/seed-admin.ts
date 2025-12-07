import { db } from "./db";
import { adminUsers } from "@shared/admin-schema";
import { hashPassword } from "./middleware/admin-auth";
import { ADMIN_CONFIG } from "./config/replit-env";

export async function seedAdminUser() {
  try {
    console.log("🔐 Checking for admin user...");
    
    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, ADMIN_CONFIG.defaultAdmin.email));
    
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }
    
    // Create admin user
    const hashedPassword = await hashPassword(ADMIN_CONFIG.defaultAdmin.password);
    
    await db.insert(adminUsers).values({
      email: ADMIN_CONFIG.defaultAdmin.email,
      password: hashedPassword,
      firstName: ADMIN_CONFIG.defaultAdmin.firstName,
      lastName: ADMIN_CONFIG.defaultAdmin.lastName,
      role: ADMIN_CONFIG.defaultAdmin.role,
      isActive: true,
      permissions: {
        all: true,
        manageUsers: true,
        manageContent: true,
        viewAnalytics: true,
        systemSettings: true
      }
    });
    
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", ADMIN_CONFIG.defaultAdmin.email);
    console.log("🔑 Default password:", ADMIN_CONFIG.defaultAdmin.password);
    console.log("⚠️  IMPORTANT: Change this password after first login!");
    
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
}

// Import eq function
import { eq } from "drizzle-orm";