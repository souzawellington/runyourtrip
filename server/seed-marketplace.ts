import { db } from "./db";
import { categories, templates, users, reviews, analyticsEvents, revenueMetrics } from "@shared/schema";
import { eq } from "drizzle-orm";

const TEMPLATE_IMAGES = {
  travel: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
    "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
  ],
  hotel: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  ],
  tour: [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
  ],
  booking: [
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80",
  ],
  adventure: [
    "https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&q=80",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  ],
};

async function seedMarketplace() {
  console.log("🌍 Seeding marketplace database...");

  try {
    // 1. Create categories
    console.log("📁 Creating categories...");
    const categoryData = [
      { name: "Travel Blog", slug: "travel-blog", description: "Beautiful travel blog templates", icon: "MapPin", displayOrder: 1 },
      { name: "Tour Agency", slug: "tour-agency", description: "Professional tour agency websites", icon: "Globe", displayOrder: 2 },
      { name: "Booking Platform", slug: "booking-platform", description: "Complete booking solutions", icon: "ShoppingCart", displayOrder: 3 },
      { name: "Travel Guide", slug: "travel-guide", description: "Interactive travel guide templates", icon: "Map", displayOrder: 4 },
      { name: "Adventure Tours", slug: "adventure-tours", description: "Adventure and outdoor tour sites", icon: "Zap", displayOrder: 5 },
      { name: "Hotel Website", slug: "hotel-website", description: "Elegant hotel and resort templates", icon: "Building", displayOrder: 6 },
      { name: "Travel Portfolio", slug: "travel-portfolio", description: "Travel photographer portfolios", icon: "Camera", displayOrder: 7 },
    ];

    // Check for existing categories
    const existingCategories = await db.select().from(categories);
    let insertedCategories;
    
    if (existingCategories.length > 0) {
      console.log(`📋 Using existing ${existingCategories.length} categories`);
      insertedCategories = existingCategories;
    } else {
      insertedCategories = await db.insert(categories).values(categoryData).returning();
    }
    console.log(`✅ Created ${insertedCategories.length} categories`);

    // 2. Get or create demo users
    console.log("👥 Setting up demo users...");
    // Use existing user IDs from the database
    const existingUsers = await db.select().from(users).limit(3);
    const demoUserIds = existingUsers.map(u => u.id);
    
    // If we don't have enough users, use the default demo user
    while (demoUserIds.length < 3) {
      demoUserIds.push("1"); // Use the demo@runyourtrip.com user ID
    }

    // 3. Create templates
    console.log("🎨 Creating templates...");
    const templateData = [
      // Travel Blog Templates
      {
        userId: demoUserIds[0],
        categoryId: insertedCategories[0].id,
        name: "Wanderlust Chronicles",
        description: "A stunning travel blog template with beautiful galleries, maps integration, and story-telling features perfect for travel bloggers",
        category: "Travel Blog",
        price: "79",
        code: "<!-- Travel blog template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[0],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[0],
        previewUrl: "https://wanderlust-demo.netlify.app",
        status: "published",
        trendingScore: 95,
        featured: true,
        sales: 342,
        downloads: 1250,
        rating: "4.8",
        tags: ["blog", "travel", "responsive", "maps", "gallery"],
      },
      {
        userId: demoUserIds[1],
        categoryId: insertedCategories[0].id,
        name: "Digital Nomad Journal",
        description: "Modern minimalist blog template designed for digital nomads with expense tracking and location mapping",
        category: "Travel Blog",
        price: "69",
        code: "<!-- Digital nomad template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[1],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[1],
        previewUrl: "https://nomad-journal-demo.netlify.app",
        status: "published",
        trendingScore: 78,
        sales: 215,
        downloads: 890,
        rating: "4.7",
        tags: ["blog", "minimal", "tracking", "nomad"],
      },
      {
        userId: demoUserIds[2],
        categoryId: insertedCategories[0].id,
        name: "Adventure Tales",
        description: "Dynamic travel blog with video backgrounds and immersive storytelling features",
        category: "Travel Blog",
        price: "89",
        code: "<!-- Adventure tales template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[2],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[2],
        previewUrl: "https://adventure-tales-demo.netlify.app",
        status: "published",
        trendingScore: 65,
        sales: 180,
        downloads: 720,
        rating: "4.9",
        tags: ["blog", "video", "storytelling", "adventure"],
      },

      // Tour Agency Templates
      {
        userId: demoUserIds[0],
        categoryId: insertedCategories[1].id,
        name: "Global Tours Pro",
        description: "Professional tour agency template with booking system, tour packages, and customer reviews",
        category: "Tour Agency",
        price: "149",
        code: "<!-- Tour agency template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.tour[0],
        gridViewImageUrl: TEMPLATE_IMAGES.tour[0],
        previewUrl: "https://global-tours-demo.netlify.app",
        status: "published",
        trendingScore: 88,
        featured: true,
        sales: 425,
        downloads: 1580,
        rating: "4.9",
        tags: ["agency", "booking", "tours", "professional"],
      },
      {
        userId: demoUserIds[1],
        categoryId: insertedCategories[1].id,
        name: "EcoTours Agency",
        description: "Sustainable tourism agency template with eco-friendly design and carbon offset calculator",
        category: "Tour Agency",
        price: "129",
        code: "<!-- EcoTours template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.tour[1],
        gridViewImageUrl: TEMPLATE_IMAGES.tour[1],
        previewUrl: "https://ecotours-demo.netlify.app",
        status: "published",
        trendingScore: 72,
        sales: 290,
        downloads: 1100,
        rating: "4.8",
        tags: ["eco", "sustainable", "green", "tours"],
      },
      {
        userId: demoUserIds[2],
        categoryId: insertedCategories[1].id,
        name: "Luxury Escapes",
        description: "Premium tour agency template for luxury travel with elegant design and exclusive packages",
        category: "Tour Agency",
        price: "199",
        code: "<!-- Luxury escapes template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.tour[2],
        gridViewImageUrl: TEMPLATE_IMAGES.tour[2],
        previewUrl: "https://luxury-escapes-demo.netlify.app",
        status: "published",
        trendingScore: 82,
        sales: 198,
        downloads: 650,
        rating: "5.0",
        tags: ["luxury", "premium", "exclusive", "elegant"],
      },

      // Booking Platform Templates
      {
        userId: demoUserIds[0],
        categoryId: insertedCategories[2].id,
        name: "BookIt Pro",
        description: "Complete booking platform with real-time availability, payment integration, and multi-language support",
        category: "Booking Platform",
        price: "299",
        code: "<!-- Booking platform template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.booking[0],
        gridViewImageUrl: TEMPLATE_IMAGES.booking[0],
        previewUrl: "https://bookit-pro-demo.netlify.app",
        status: "published",
        trendingScore: 92,
        featured: true,
        sales: 567,
        downloads: 2100,
        rating: "4.9",
        tags: ["booking", "payment", "platform", "multilingual"],
      },
      {
        userId: demoUserIds[1],
        categoryId: insertedCategories[2].id,
        name: "TravelHub Booking",
        description: "Modern booking system with AI-powered recommendations and price comparison features",
        category: "Booking Platform",
        price: "249",
        code: "<!-- TravelHub template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.booking[1],
        gridViewImageUrl: TEMPLATE_IMAGES.booking[1],
        previewUrl: "https://travelhub-demo.netlify.app",
        status: "published",
        trendingScore: 75,
        sales: 312,
        downloads: 1350,
        rating: "4.7",
        tags: ["AI", "booking", "comparison", "smart"],
      },

      // Travel Guide Templates
      {
        userId: demoUserIds[2],
        categoryId: insertedCategories[3].id,
        name: "City Explorer Guide",
        description: "Interactive city guide with maps, attractions, restaurants, and local tips",
        category: "Travel Guide",
        price: "99",
        code: "<!-- City guide template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[3],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[3],
        previewUrl: "https://city-explorer-demo.netlify.app",
        status: "published",
        trendingScore: 80,
        sales: 445,
        downloads: 1890,
        rating: "4.8",
        tags: ["guide", "city", "maps", "interactive"],
      },
      {
        userId: demoUserIds[0],
        categoryId: insertedCategories[3].id,
        name: "Hidden Gems Guide",
        description: "Discover off-the-beaten-path destinations with this unique travel guide template",
        category: "Travel Guide",
        price: "79",
        code: "<!-- Hidden gems template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[4],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[4],
        previewUrl: "https://hidden-gems-demo.netlify.app",
        status: "published",
        trendingScore: 68,
        sales: 267,
        downloads: 980,
        rating: "4.6",
        tags: ["guide", "unique", "discovery", "hidden"],
      },

      // Adventure Tours Templates
      {
        userId: demoUserIds[1],
        categoryId: insertedCategories[4].id,
        name: "Extreme Adventures",
        description: "Action-packed adventure tour template with booking system and equipment rental",
        category: "Adventure Tours",
        price: "139",
        code: "<!-- Extreme adventures template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.adventure[0],
        gridViewImageUrl: TEMPLATE_IMAGES.adventure[0],
        previewUrl: "https://extreme-adventures-demo.netlify.app",
        status: "published",
        trendingScore: 85,
        featured: true,
        sales: 378,
        downloads: 1420,
        rating: "4.9",
        tags: ["adventure", "extreme", "booking", "sports"],
      },
      {
        userId: demoUserIds[2],
        categoryId: insertedCategories[4].id,
        name: "Mountain Trek Tours",
        description: "Specialized template for hiking and trekking tours with elevation profiles and gear guides",
        category: "Adventure Tours",
        price: "119",
        code: "<!-- Mountain trek template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.adventure[1],
        gridViewImageUrl: TEMPLATE_IMAGES.adventure[1],
        previewUrl: "https://mountain-trek-demo.netlify.app",
        status: "published",
        trendingScore: 70,
        sales: 234,
        downloads: 890,
        rating: "4.8",
        tags: ["hiking", "trekking", "mountain", "outdoor"],
      },

      // Hotel Website Templates
      {
        userId: demoUserIds[0],
        categoryId: insertedCategories[5].id,
        name: "Luxury Resort Paradise",
        description: "Elegant hotel template with room booking, spa services, and virtual tours",
        category: "Hotel Website",
        price: "189",
        code: "<!-- Luxury resort template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.hotel[0],
        gridViewImageUrl: TEMPLATE_IMAGES.hotel[0],
        previewUrl: "https://luxury-resort-demo.netlify.app",
        status: "published",
        trendingScore: 90,
        featured: true,
        sales: 512,
        downloads: 1980,
        rating: "5.0",
        tags: ["hotel", "luxury", "resort", "booking"],
      },
      {
        userId: demoUserIds[1],
        categoryId: insertedCategories[5].id,
        name: "Boutique Hotel Charm",
        description: "Cozy boutique hotel template with personalized services and local experiences",
        category: "Hotel Website",
        price: "149",
        code: "<!-- Boutique hotel template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.hotel[1],
        gridViewImageUrl: TEMPLATE_IMAGES.hotel[1],
        previewUrl: "https://boutique-hotel-demo.netlify.app",
        status: "published",
        trendingScore: 76,
        sales: 345,
        downloads: 1230,
        rating: "4.7",
        tags: ["boutique", "hotel", "cozy", "personal"],
      },
      {
        userId: demoUserIds[2],
        categoryId: insertedCategories[5].id,
        name: "Beach Resort Bliss",
        description: "Tropical beach resort template with activities booking and weather integration",
        category: "Hotel Website",
        price: "169",
        code: "<!-- Beach resort template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.hotel[2],
        gridViewImageUrl: TEMPLATE_IMAGES.hotel[2],
        previewUrl: "https://beach-resort-demo.netlify.app",
        status: "published",
        trendingScore: 83,
        sales: 423,
        downloads: 1560,
        rating: "4.9",
        tags: ["beach", "resort", "tropical", "activities"],
      },

      // Travel Portfolio Templates
      {
        userId: demoUserIds[0],
        categoryId: insertedCategories[6].id,
        name: "Wandering Lens",
        description: "Stunning photography portfolio for travel photographers with gallery and blog",
        category: "Travel Portfolio",
        price: "89",
        code: "<!-- Photography portfolio template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[0],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[0],
        previewUrl: "https://wandering-lens-demo.netlify.app",
        status: "published",
        trendingScore: 77,
        sales: 289,
        downloads: 1120,
        rating: "4.8",
        tags: ["portfolio", "photography", "gallery", "travel"],
      },
      {
        userId: demoUserIds[1],
        categoryId: insertedCategories[6].id,
        name: "Travel Filmmaker Pro",
        description: "Video-focused portfolio template for travel filmmakers with showreel features",
        category: "Travel Portfolio",
        price: "109",
        code: "<!-- Filmmaker portfolio template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[1],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[1],
        previewUrl: "https://filmmaker-pro-demo.netlify.app",
        status: "published",
        trendingScore: 71,
        sales: 198,
        downloads: 780,
        rating: "4.7",
        tags: ["portfolio", "video", "filmmaker", "showreel"],
      },
      {
        userId: demoUserIds[2],
        categoryId: insertedCategories[6].id,
        name: "Adventure Photographer",
        description: "Dynamic portfolio for adventure and outdoor photographers with story maps",
        category: "Travel Portfolio",
        price: "99",
        code: "<!-- Adventure photographer template code -->",
        imageThumbnailUrl: TEMPLATE_IMAGES.travel[2],
        gridViewImageUrl: TEMPLATE_IMAGES.travel[2],
        previewUrl: "https://adventure-photo-demo.netlify.app",
        status: "published",
        trendingScore: 74,
        sales: 256,
        downloads: 920,
        rating: "4.9",
        tags: ["portfolio", "adventure", "photography", "maps"],
      },
    ];

    const insertedTemplates = await db.insert(templates).values(templateData).returning();
    console.log(`✅ Created ${insertedTemplates.length} templates`);

    // 4. Add sample reviews
    console.log("⭐ Creating reviews...");
    const reviewData = [];
    const reviewComments = [
      "Amazing template! Exactly what I needed for my travel blog.",
      "Great design and easy to customize. Highly recommended!",
      "Perfect for my tour agency. The booking system works flawlessly.",
      "Beautiful template with excellent support. Worth every penny!",
      "Clean code and responsive design. My clients love it!",
      "This template helped me launch my travel business quickly.",
      "Stunning visuals and great functionality. 5 stars!",
      "Easy to set up and looks professional. Very satisfied.",
    ];

    for (const template of insertedTemplates.slice(0, 10)) {
      // Add 2-5 reviews per template
      const numReviews = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < numReviews; i++) {
        reviewData.push({
          userId: demoUserIds[Math.floor(Math.random() * demoUserIds.length)],
          templateId: template.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          verified: true,
        });
      }
    }

    await db.insert(reviews).values(reviewData);
    console.log(`✅ Created ${reviewData.length} reviews`);

    // 5. Add analytics events
    console.log("📊 Creating analytics events...");
    const eventData = [];
    const eventTypes = ["view", "download", "purchase", "share"];
    
    for (const template of insertedTemplates) {
      // Add random events for each template
      const numEvents = Math.floor(Math.random() * 20) + 10;
      for (let i = 0; i < numEvents; i++) {
        eventData.push({
          userId: demoUserIds[Math.floor(Math.random() * demoUserIds.length)],
          templateId: template.id,
          eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          eventData: { source: "marketplace", device: "desktop" },
        });
      }
    }

    await db.insert(analyticsEvents).values(eventData);
    console.log(`✅ Created ${eventData.length} analytics events`);

    // 6. Add revenue metrics
    console.log("💰 Creating revenue metrics...");
    const revenueData = [];
    const today = new Date();
    
    for (const template of insertedTemplates.slice(0, 8)) {
      // Add revenue data for the last 7 days
      for (let days = 0; days < 7; days++) {
        const date = new Date(today);
        date.setDate(date.getDate() - days);
        
        revenueData.push({
          userId: template.userId,
          templateId: template.id,
          date: date,
          revenue: (Math.random() * 500 + 100).toFixed(2),
          sales: Math.floor(Math.random() * 10) + 1,
          views: Math.floor(Math.random() * 200) + 50,
          downloads: Math.floor(Math.random() * 50) + 5,
          conversionRate: (Math.random() * 5 + 1).toFixed(2),
        });
      }
    }

    await db.insert(revenueMetrics).values(revenueData);
    console.log(`✅ Created ${revenueData.length} revenue metrics`);

    console.log("\n🎉 Marketplace database seeded successfully!");
    console.log("📋 Summary:");
    console.log(`   - ${insertedCategories.length} categories`);
    console.log(`   - ${insertedTemplates.length} templates`);
    console.log(`   - ${reviewData.length} reviews`);
    console.log(`   - ${eventData.length} analytics events`);
    console.log(`   - ${revenueData.length} revenue metrics`);

  } catch (error) {
    console.error("❌ Error seeding marketplace:", error);
    throw error;
  }
}

// Run the seeding
seedMarketplace()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });