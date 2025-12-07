import { db } from "./db";
import { templates } from "@shared/schema";
import { sql } from "drizzle-orm";

// Real image URLs for different template categories
const TEMPLATE_IMAGES = {
  // English Learning Templates
  "DevOps Communication Mastery": {
    imageThumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80",
    gridViewImageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80"
  },
  "AI/ML Technical Presentations": {
    imageThumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
    gridViewImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80"
  },
  "Agile Scrum English Fluency": {
    imageThumbnailUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80",
    gridViewImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80"
  },
  
  // Portfolio Templates
  portfolio: [
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&q=80"
    }
  ],
  
  // E-commerce Templates
  ecommerce: [
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80"
    }
  ],
  
  // Blog Templates
  blog: [
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80"
    }
  ],
  
  // SaaS Templates
  saas: [
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80"
    }
  ],
  
  // Landing Page Templates
  landing: [
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
    }
  ],
  
  // Restaurant Templates
  restaurant: [
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80"
    }
  ],
  
  // Corporate Templates
  corporate: [
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80"
    },
    {
      imageThumbnailUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
      gridViewImageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80"
    }
  ]
};

async function updateTemplateImages() {
  console.log("🖼️ Updating template images...");
  
  try {
    // Get all templates
    const allTemplates = await db.select().from(templates);
    console.log(`Found ${allTemplates.length} templates to update`);
    
    let updatedCount = 0;
    const categoryImageIndex: Record<string, number> = {};
    
    for (const template of allTemplates) {
      let imageData: any = null;
      
      // Check if template name has specific images
      if (TEMPLATE_IMAGES[template.name]) {
        imageData = TEMPLATE_IMAGES[template.name];
      } else {
        // Use category-based images
        const category = template.category.toLowerCase();
        const categoryImages = TEMPLATE_IMAGES[category] || TEMPLATE_IMAGES.portfolio; // fallback to portfolio
        
        if (Array.isArray(categoryImages)) {
          // Get the current index for this category
          const currentIndex = categoryImageIndex[category] || 0;
          imageData = categoryImages[currentIndex % categoryImages.length];
          
          // Increment the index for next use
          categoryImageIndex[category] = currentIndex + 1;
        }
      }
      
      if (imageData && (template.imageThumbnailUrl === null || template.imageThumbnailUrl.includes('placeholder'))) {
        // Update the template with real images
        await db.execute(sql`
          UPDATE templates 
          SET 
            image_thumbnail_url = ${imageData.imageThumbnailUrl},
            grid_view_image_url = ${imageData.gridViewImageUrl}
          WHERE id = ${template.id}
        `);
        
        updatedCount++;
        console.log(`✅ Updated template ${template.id}: ${template.name}`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} templates with real images!`);
    
  } catch (error) {
    console.error("❌ Error updating template images:", error);
    throw error;
  }
}

// Run the update
updateTemplateImages()
  .then(() => {
    console.log("✅ Image update completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Image update failed:", error);
    process.exit(1);
  });