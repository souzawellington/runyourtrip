import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

// Check API configurations
const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const perplexityKey = process.env.PERPLEXITY_API_KEY;

// Initialize APIs only if keys are present
const gemini = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

export function isContentGeneratorConfigured(): boolean {
  return !!(geminiKey && openaiKey && perplexityKey);
}

export interface ContentGenerationRequest {
  topic: string;
  targetAudience: "beginner" | "intermediate" | "advanced";
  contentType: "simulation" | "workshop" | "microlearning" | "coaching" | "portfolio" | "networking";
  duration: number; // in minutes
  includeInteractive: boolean;
  techFocus: string[];
}

export interface GeneratedContent {
  title: string;
  description: string;
  fullContent: string;
  interactiveElements: string[];
  assessments: string[];
  vocabulary: string[];
  code: string;
  thumbnailUrl?: string;
  estimatedPrice: number;
  difficulty: string;
  duration: number;
  techStack: string[];
}

// Perplexity API helper
async function perplexitySearch(query: string): Promise<string> {
  if (!perplexityKey) {
    console.warn("Perplexity API key not configured, skipping search");
    return "";
  }
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a tech education expert. Provide current, accurate information about latest technologies and industry trends."
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "month"
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Perplexity search failed:", error);
    return ""; // Return empty string on failure to allow graceful degradation
  }
}

export async function generateTechEnglishContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  if (!isContentGeneratorConfigured()) {
    throw new Error("Content generation APIs are not fully configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, and PERPLEXITY_API_KEY");
  }
  
  try {
    console.log(`🎯 Generating ${request.contentType} content for ${request.topic}`);

    // Step 1: Use Perplexity to get latest tech trends and information (graceful if fails)
    const trendQuery = `Latest ${request.topic} trends and technologies in 2025, best practices for tech professionals`;
    const currentTrends = await perplexitySearch(trendQuery);

    // Step 2: Use Gemini to generate comprehensive educational content
    if (!gemini) {
      throw new Error("Gemini API not initialized");
    }
    const geminiPrompt = `Create an innovative English learning module for tech professionals focusing on "${request.topic}".

Target Audience: ${request.targetAudience} level
Content Type: ${request.contentType}
Duration: ${request.duration} minutes
Tech Focus: ${request.techFocus.join(", ")}
Include Interactive Elements: ${request.includeInteractive}

Latest Industry Context:
${currentTrends}

Generate a comprehensive learning module that includes:
1. Engaging title and description
2. Complete lesson content with technical vocabulary
3. Interactive exercises and simulations
4. Real-world scenarios and case studies
5. Assessment questions
6. Technical vocabulary list with definitions
7. HTML/CSS/JS code for interactive components

Focus on cutting-edge technologies and make it highly practical for tech professionals.
Respond in JSON format with all components.`;

    const geminiResponse = await gemini.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            fullContent: { type: "string" },
            interactiveElements: { type: "array", items: { type: "string" } },
            assessments: { type: "array", items: { type: "string" } },
            vocabulary: { type: "array", items: { type: "string" } },
            difficulty: { type: "string" },
            techStack: { type: "array", items: { type: "string" } }
          },
          required: ["title", "description", "fullContent", "interactiveElements", "assessments", "vocabulary"]
        }
      },
      contents: geminiPrompt
    });

    const geminiData = JSON.parse(geminiResponse.text || "{}");

    // Step 3: Use OpenAI to generate interactive HTML/CSS/JS code
    const codePrompt = `Create a complete, interactive HTML page for an English learning module titled "${geminiData.title}".

Content: ${geminiData.description}
Target: Tech professionals learning English
Interactive Elements: ${geminiData.interactiveElements?.join(", ")}

Requirements:
- Modern, responsive design with Tailwind CSS
- Interactive exercises and quizzes
- Code syntax highlighting
- Progress tracking
- Audio pronunciation features
- Real-time feedback
- Professional tech-focused design
- Mobile-friendly
- Include all CSS and JavaScript inline

Generate complete HTML code that can be deployed immediately.`;

    if (!openai) {
      throw new Error("OpenAI API not initialized");
    }
    
    const codeResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert web developer specializing in educational technology and interactive learning platforms."
        },
        {
          role: "user",
          content: codePrompt
        }
      ],
      max_tokens: 4000
    });

    const generatedCode = codeResponse.choices[0].message.content || "";

    // Step 4: Generate thumbnail using Gemini image generation
    let thumbnailUrl = "";
    try {
      const imagePrompt = `Professional educational thumbnail for "${geminiData.title}" - modern tech learning interface, clean design, technology icons, English learning elements`;
      
      const imageResponse = await gemini.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
        config: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      });

      // Process image response (simplified for now)
      thumbnailUrl = "generated-thumbnail.png"; // Would be actual generated image
    } catch (error) {
      console.log("Image generation skipped:", error);
    }

    // Step 5: Calculate pricing based on complexity and content
    const basePrice = 49;
    const complexityMultiplier = request.targetAudience === "advanced" ? 1.5 : 
                                request.targetAudience === "intermediate" ? 1.2 : 1.0;
    const durationMultiplier = Math.max(1, request.duration / 60);
    const interactiveMultiplier = request.includeInteractive ? 1.3 : 1.0;
    
    const estimatedPrice = Math.round(basePrice * complexityMultiplier * durationMultiplier * interactiveMultiplier);

    return {
      title: geminiData.title || `${request.topic} for Tech Professionals`,
      description: geminiData.description || `Comprehensive English learning module focusing on ${request.topic}`,
      fullContent: geminiData.fullContent || "",
      interactiveElements: geminiData.interactiveElements || [],
      assessments: geminiData.assessments || [],
      vocabulary: geminiData.vocabulary || [],
      code: generatedCode,
      thumbnailUrl,
      estimatedPrice,
      difficulty: geminiData.difficulty || request.targetAudience,
      duration: request.duration,
      techStack: geminiData.techStack || ["HTML5", "CSS3", "JavaScript", "Tailwind CSS"]
    };

  } catch (error) {
    console.error("Content generation failed:", error);
    throw new Error(`Failed to generate content: ${error}`);
  }
}

export async function generateCourseOutline(topic: string, duration: number): Promise<any> {
  try {
    // Use Perplexity to get current industry insights
    const industryQuery = `${topic} current industry standards, skills requirements, and learning path for tech professionals 2025`;
    const industryInsights = await perplexitySearch(industryQuery);

    // Use Gemini to create comprehensive course structure
    const prompt = `Create a comprehensive English course outline for tech professionals on "${topic}".
    
Duration: ${duration} hours total
Industry Context: ${industryInsights}

Generate a detailed course structure with:
1. Course overview and objectives
2. Module breakdown with learning outcomes
3. Progressive skill development
4. Assessment strategies
5. Real-world project ideas
6. Technology integration points

Format as JSON with detailed structure.`;

    if (!gemini) {
      throw new Error("Gemini API not initialized");
    }
    
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json"
      },
      contents: prompt
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Course outline generation failed:", error);
    throw new Error(`Failed to generate course outline: ${error}`);
  }
}

export async function enhanceContentWithAI(content: string, enhancementType: "vocabulary" | "pronunciation" | "grammar" | "cultural"): Promise<string> {
  try {
    let prompt = "";
    
    switch (enhancementType) {
      case "vocabulary":
        prompt = `Enhance this tech English content with advanced vocabulary, technical terms, and professional idioms: ${content}`;
        break;
      case "pronunciation":
        prompt = `Add pronunciation guides and phonetic notations for difficult technical terms in this content: ${content}`;
        break;
      case "grammar":
        prompt = `Improve the grammatical complexity and add explanations for advanced grammar patterns used in tech communication: ${content}`;
        break;
      case "cultural":
        prompt = `Add cultural context and cross-cultural communication tips relevant to international tech teams: ${content}`;
        break;
    }

    if (!openai) {
      console.warn("OpenAI not configured, returning original content");
      return content;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert English language instructor specializing in technical communication for international professionals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000
    });

    return response.choices[0].message.content || content;
  } catch (error) {
    console.error("Content enhancement failed:", error);
    return content;
  }
}