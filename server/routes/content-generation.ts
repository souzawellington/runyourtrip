import { Router } from "express";
import { z } from "zod";
import { generateTechEnglishContent, generateCourseOutline, enhanceContentWithAI, ContentGenerationRequest } from "../services/content-generator";
import { insertTemplateSchema, templates } from "@shared/schema";
import { db } from "../db";

const router = Router();

const generateContentSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  targetAudience: z.enum(["beginner", "intermediate", "advanced"]),
  contentType: z.enum(["simulation", "workshop", "microlearning", "coaching", "portfolio", "networking"]),
  duration: z.number().min(5).max(480), // 5 minutes to 8 hours
  includeInteractive: z.boolean().default(true),
  techFocus: z.array(z.string()).default([]),
});

const generateCourseSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  duration: z.number().min(1).max(200), // 1 to 200 hours
});

const enhanceContentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  enhancementType: z.enum(["vocabulary", "pronunciation", "grammar", "cultural"]),
});

// Generate tech English learning content
router.post("/generate-content", async (req, res) => {
  try {
    const validatedData = generateContentSchema.parse(req.body);
    
    console.log("🎓 Generating tech English content:", validatedData.topic);
    
    const generatedContent = await generateTechEnglishContent(validatedData);
    
    res.json({
      success: true,
      content: generatedContent,
      message: "Content generated successfully"
    });
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate content"
    });
  }
});

// Generate complete course outline
router.post("/generate-course", async (req, res) => {
  try {
    const validatedData = generateCourseSchema.parse(req.body);
    
    console.log("📚 Generating course outline:", validatedData.topic);
    
    const courseOutline = await generateCourseOutline(validatedData.topic, validatedData.duration);
    
    res.json({
      success: true,
      course: courseOutline,
      message: "Course outline generated successfully"
    });
  } catch (error) {
    console.error("Course generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate course"
    });
  }
});

// Enhance existing content
router.post("/enhance-content", async (req, res) => {
  try {
    const validatedData = enhanceContentSchema.parse(req.body);
    
    console.log("✨ Enhancing content:", validatedData.enhancementType);
    
    const enhancedContent = await enhanceContentWithAI(
      validatedData.content, 
      validatedData.enhancementType
    );
    
    res.json({
      success: true,
      enhancedContent,
      message: "Content enhanced successfully"
    });
  } catch (error) {
    console.error("Content enhancement error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to enhance content"
    });
  }
});

// Create marketplace template from generated content
router.post("/create-template", async (req, res) => {
  try {
    const { content, userId, categoryId } = req.body;
    
    if (!content || !userId) {
      return res.status(400).json({
        success: false,
        error: "Content and userId are required"
      });
    }

    // Create template data
    const templateData = {
      userId: userId,
      categoryId: categoryId || 1, // Default to first category
      name: content.title,
      description: content.description,
      category: "English Learning",
      price: content.estimatedPrice.toString(),
      code: content.code,
      preview: content.code,
      previewUrl: null,
      imageThumbnailUrl: content.thumbnailUrl || null,
      gridViewImageUrl: content.thumbnailUrl || null,
      status: "published",
      trendingScore: Math.floor(Math.random() * 50) + 50,
      featured: content.estimatedPrice > 75,
      tags: [
        content.difficulty,
        content.contentType || "learning",
        ...content.techStack.slice(0, 3)
      ],
    };

    const insertedTemplate = await db
      .insert(templates)
      .values(templateData)
      .returning();

    res.json({
      success: true,
      template: insertedTemplate[0],
      message: "Template created successfully"
    });
  } catch (error) {
    console.error("Template creation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create template"
    });
  }
});

// Get predefined content ideas
router.get("/content-ideas", (req, res) => {
  const contentIdeas = [
    {
      id: 1,
      title: "Interactive Technical Simulations",
      description: "Real-world tech scenarios like server configuration, debugging, cloud deployments",
      topics: ["DevOps", "Cloud Computing", "System Administration", "Network Security"],
      difficulty: "intermediate",
      estimatedDuration: 45
    },
    {
      id: 2,
      title: "Role-Playing Virtual Labs",
      description: "Technical interviews, client pitches, scrum meetings with AI feedback",
      topics: ["Communication", "Project Management", "Leadership", "Presentations"],
      difficulty: "advanced",
      estimatedDuration: 60
    },
    {
      id: 3,
      title: "Microlearning Tech Vocabulary",
      description: "Daily 3-5 minute lessons on technical terms and professional idioms",
      topics: ["Programming", "Data Science", "AI/ML", "Cybersecurity"],
      difficulty: "beginner",
      estimatedDuration: 5
    },
    {
      id: 4,
      title: "Cross-Cultural Communication",
      description: "High-context vs low-context communication for global tech teams",
      topics: ["Cultural Intelligence", "Remote Work", "Team Collaboration"],
      difficulty: "intermediate",
      estimatedDuration: 30
    },
    {
      id: 5,
      title: "Professional Portfolio Development",
      description: "Creating technical portfolios, documentation, and presentations",
      topics: ["GitHub", "Documentation", "Technical Writing", "Personal Branding"],
      difficulty: "intermediate",
      estimatedDuration: 90
    },
    {
      id: 6,
      title: "Industry Expert Sessions",
      description: "Live webinars with global tech experts and Q&A sessions",
      topics: ["Industry Trends", "Career Development", "Networking", "Thought Leadership"],
      difficulty: "advanced",
      estimatedDuration: 75
    }
  ];

  res.json({
    success: true,
    ideas: contentIdeas
  });
});

export default router;