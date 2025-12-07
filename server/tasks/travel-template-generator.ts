import { storage } from "../storage";
import { generateWebsiteTemplate } from "../services/openai";

interface TravelTemplateConfig {
  name: string;
  description: string;
  category: string;
  categoryId: number;
  price: string;
  tags: string[];
  prompt: string;
}

// Travel Portfolio Templates
const TRAVEL_PORTFOLIO_TEMPLATES: TravelTemplateConfig[] = [
  {
    name: "Mountain Explorer Portfolio",
    description: "Showcase your mountain adventures with stunning photography galleries, trail maps, and gear reviews. Perfect for outdoor photographers and adventure bloggers.",
    category: "Travel Portfolio",
    categoryId: 15, // Travel Portfolio category ID
    price: "99",
    tags: ["portfolio", "mountains", "photography", "adventure", "maps"],
    prompt: "Create a professional travel portfolio website for mountain photographers and adventure enthusiasts. Include: stunning full-screen image galleries with lightbox functionality, interactive trail maps, gear review sections, about page with photographer bio, contact form, blog section for trip reports, responsive design optimized for mobile viewing, social media integration, and SEO optimization. Use earth tones and outdoor-inspired design elements."
  },
  {
    name: "City Explorer Showcase",
    description: "Urban travel portfolio featuring city photography, cultural experiences, and local discovery guides. Ideal for street photographers and urban explorers.",
    category: "Travel Portfolio",
    categoryId: 15,
    price: "89",
    tags: ["portfolio", "urban", "street-photography", "culture", "guides"],
    prompt: "Design a modern urban travel portfolio website for city photographers and cultural explorers. Features: grid-based photo galleries showcasing cityscapes and street photography, interactive city guides with local recommendations, cultural experience blog, about section highlighting photographer's urban exploration journey, contact page, newsletter signup, mobile-first responsive design, dark/light theme toggle, and social proof elements. Use contemporary urban design with bold typography and vibrant colors."
  },
  {
    name: "Beach & Coastal Collection",
    description: "Tropical and coastal travel portfolio with beach photography, island guides, and ocean adventures. Perfect for marine photographers and coastal travelers.",
    category: "Travel Portfolio",
    categoryId: 15,
    price: "95",
    tags: ["portfolio", "beach", "coastal", "ocean", "tropical"],
    prompt: "Build a beautiful coastal travel portfolio for beach and marine photographers. Include: stunning ocean and beach photography galleries, island travel guides, underwater photography sections, surfing and water sports coverage, coastal accommodation reviews, travel tips for beach destinations, weather integration, tide charts, responsive design with fluid animations, and ocean-inspired color palette with blues and sandy tones."
  }
];

// Travel Blog Templates
const TRAVEL_BLOG_TEMPLATES: TravelTemplateConfig[] = [
  {
    name: "Backpacker Diaries",
    description: "Budget travel blog template with expense tracking, hostel reviews, and backpacking tips. Designed for solo travelers and budget adventurers.",
    category: "Travel Blog",
    categoryId: 9, // Travel Blog category ID
    price: "75",
    tags: ["blog", "backpacking", "budget", "solo-travel", "tips"],
    prompt: "Create a comprehensive backpacker travel blog with expense tracking features, hostel and budget accommodation reviews, packing lists, visa information, transportation guides, safety tips for solo travelers, interactive budget calculator, destination guides focused on budget options, community features for backpacker networking, mobile-optimized design for on-the-go posting, and integration with travel planning tools."
  },
  {
    name: "Luxury Travel Journal",
    description: "Elegant travel blog for luxury experiences, fine dining, and premium accommodations. Perfect for high-end travel bloggers and lifestyle influencers.",
    category: "Travel Blog",
    categoryId: 9,
    price: "120",
    tags: ["blog", "luxury", "fine-dining", "hotels", "lifestyle"],
    prompt: "Design an sophisticated luxury travel blog featuring premium accommodation reviews, fine dining experiences, luxury travel guides, spa and wellness reviews, exclusive travel deals, high-end fashion and travel style content, wine and culinary tourism, private tour recommendations, concierge services integration, elegant typography and layout, professional photography showcase, and email newsletter for exclusive content."
  },
  {
    name: "Family Adventure Blog",
    description: "Family-friendly travel blog with kid-friendly destinations, family activities, and travel safety tips for parents traveling with children.",
    category: "Travel Blog",
    categoryId: 9,
    price: "85",
    tags: ["blog", "family", "kids", "safety", "activities"],
    prompt: "Build a comprehensive family travel blog focused on traveling with children. Features: kid-friendly destination guides, family activity recommendations, travel safety tips for parents, packing lists for different ages, accommodation reviews with family amenities, transportation guides for families, educational travel experiences, budget-friendly family activities, health and safety abroad with kids, interactive trip planning tools, and colorful, family-friendly design with engaging visuals."
  }
];

// Booking Platform Templates
const BOOKING_PLATFORM_TEMPLATES: TravelTemplateConfig[] = [
  {
    name: "Adventure Tours Booking",
    description: "Complete booking platform for adventure tour operators with online reservations, equipment rental, and group management features.",
    category: "Booking Platform",
    categoryId: 11, // Booking Platform category ID
    price: "199",
    tags: ["booking", "adventure", "tours", "reservations", "equipment"],
    prompt: "Create a comprehensive adventure tour booking platform with real-time availability calendar, online payment processing, equipment rental system, group booking management, customer profiles, tour guide assignments, weather integration, safety waiver management, automatic confirmation emails, mobile-responsive booking flow, multi-language support, and integration with popular payment gateways. Include admin dashboard for tour operators."
  },
  {
    name: "Accommodation Booking Hub",
    description: "Multi-property booking system for hotels, hostels, and vacation rentals with channel management and revenue optimization.",
    category: "Booking Platform",
    categoryId: 11,
    price: "249",
    tags: ["booking", "hotels", "accommodation", "revenue", "management"],
    prompt: "Build a sophisticated accommodation booking platform with multi-property management, dynamic pricing, channel manager integration, revenue optimization tools, guest communication system, property management features, housekeeping coordination, maintenance tracking, review management, analytics dashboard, mobile check-in/out, contactless payments, and comprehensive reporting tools for property managers and hotel chains."
  },
  {
    name: "Experience Marketplace",
    description: "Local experience booking platform connecting travelers with authentic local activities, tours, and cultural experiences.",
    category: "Booking Platform",
    categoryId: 11,
    price: "179",
    tags: ["booking", "experiences", "local", "marketplace", "cultural"],
    prompt: "Design a local experience marketplace platform where travelers can book authentic local activities. Features: experience provider registration and verification, booking calendar with time slots, instant and request-based bookings, multilingual support, review and rating system, location-based search, category filtering (food, culture, adventure, etc.), secure payment processing, commission management, dispute resolution, mobile app integration, and social sharing capabilities."
  }
];

export class TravelTemplateGenerator {
  
  async generateTravelPortfolios(): Promise<void> {
    console.log("🏔️ Generating Travel Portfolio templates...");
    
    for (const config of TRAVEL_PORTFOLIO_TEMPLATES) {
      try {
        console.log(`Generating: ${config.name}`);
        
        // Generate template code using OpenAI
        const generatedTemplate = await generateWebsiteTemplate({
          description: config.prompt,
          category: config.category,
          targetPrice: `$${config.price}`
        });

        // Create template in database
        await storage.createTemplate({
          userId: "1", // Demo user ID
          categoryId: config.categoryId,
          name: config.name,
          description: config.description,
          category: config.category,
          price: config.price,
          code: generatedTemplate.code,
          preview: generatedTemplate.description || "",
          previewUrl: `https://${config.name.toLowerCase().replace(/\s+/g, '-')}-demo.netlify.app`,
          imageThumbnailUrl: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80`,
          gridViewImageUrl: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80`,
          status: "published",
          trendingScore: Math.floor(Math.random() * 50) + 50,
          featured: Math.random() > 0.7,
          tags: config.tags,
        });
        
        console.log(`✅ Created: ${config.name}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${config.name}:`, error);
      }
    }
  }

  async generateTravelBlogs(): Promise<void> {
    console.log("📝 Generating Travel Blog templates...");
    
    for (const config of TRAVEL_BLOG_TEMPLATES) {
      try {
        console.log(`Generating: ${config.name}`);
        
        const generatedTemplate = await generateWebsiteTemplate({
          description: config.prompt,
          category: config.category,
          targetPrice: `$${config.price}`
        });

        await storage.createTemplate({
          userId: "1",
          categoryId: config.categoryId,
          name: config.name,
          description: config.description,
          category: config.category,
          price: config.price,
          code: generatedTemplate.code,
          preview: generatedTemplate.description || "",
          previewUrl: `https://${config.name.toLowerCase().replace(/\s+/g, '-')}-demo.netlify.app`,
          imageThumbnailUrl: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80`,
          gridViewImageUrl: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`,
          status: "published",
          trendingScore: Math.floor(Math.random() * 60) + 40,
          featured: Math.random() > 0.6,
          tags: config.tags,
        });
        
        console.log(`✅ Created: ${config.name}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${config.name}:`, error);
      }
    }
  }

  async generateBookingPlatforms(): Promise<void> {
    console.log("🏨 Generating Booking Platform templates...");
    
    for (const config of BOOKING_PLATFORM_TEMPLATES) {
      try {
        console.log(`Generating: ${config.name}`);
        
        const generatedTemplate = await generateWebsiteTemplate({
          description: config.prompt,
          category: config.category,
          targetPrice: `$${config.price}`
        });

        await storage.createTemplate({
          userId: "1",
          categoryId: config.categoryId,
          name: config.name,
          description: config.description,
          category: config.category,
          price: config.price,
          code: generatedTemplate.code,
          preview: generatedTemplate.description || "",
          previewUrl: `https://${config.name.toLowerCase().replace(/\s+/g, '-')}-demo.netlify.app`,
          imageThumbnailUrl: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80`,
          gridViewImageUrl: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80`,
          status: "published",
          trendingScore: Math.floor(Math.random() * 70) + 30,
          featured: Math.random() > 0.5,
          tags: config.tags,
        });
        
        console.log(`✅ Created: ${config.name}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${config.name}:`, error);
      }
    }
  }

  async generateAllTravelTemplates(): Promise<void> {
    console.log("🌍 Starting Travel Template Generation...");
    
    try {
      await this.generateTravelPortfolios();
      await this.generateTravelBlogs(); 
      await this.generateBookingPlatforms();
      
      console.log("🎉 All travel templates generated successfully!");
    } catch (error) {
      console.error("❌ Travel template generation failed:", error);
      throw error;
    }
  }
}

export const travelTemplateGenerator = new TravelTemplateGenerator();