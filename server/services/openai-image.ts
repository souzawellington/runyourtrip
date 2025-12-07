import OpenAI from "openai";
import type { GenerateImageRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

// Brand context for Run Your Trip - Customize these for your platform
const BRAND_CONTEXT = {
  colors: {
    primary: "#0070F3",
    accent: "#F59E0B",
    neutral: "#333333"
  },
  style: "modern, professional, travel-focused, vibrant, clean, trustworthy",
  keywords: ["adventure", "wanderlust", "exploration", "journey", "discovery"],
  tone: "inspiring, professional, approachable"
};

const STYLE_PRESETS = {
  professional: "professional photography style, clean composition, well-lit, corporate travel aesthetic",
  vibrant: "vibrant colors, energetic composition, dynamic lighting, exciting travel atmosphere",
  minimal: "clean minimal design, simple composition, modern aesthetic, uncluttered",
  luxury: "luxury travel aesthetic, premium quality, elegant composition, high-end experience"
};

export class OpenAIImageService {
  async generateImage(request: GenerateImageRequest, socialContext?: string): Promise<{ url: string }> {
    try {
      // Build enhanced prompt with brand context
      let enhancedPrompt = request.prompt;
      
      if (request.includeBrandContext) {
        enhancedPrompt = this.injectBrandContext(enhancedPrompt, request.style);
      }
      
      if (request.includeSocialContext && socialContext) {
        enhancedPrompt = this.injectSocialContext(enhancedPrompt, socialContext);
      }

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: request.size,
        quality: request.quality,
      });

      if (!response.data || response.data.length === 0 || !response.data[0].url) {
        throw new Error("No image URL returned from OpenAI");
      }

      return { url: response.data[0].url };
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Image generation failed: ${error.message || "Unknown error"}`);
    }
  }

  private injectBrandContext(prompt: string, style: string): string {
    const stylePreset = STYLE_PRESETS[style as keyof typeof STYLE_PRESETS];
    
    return `${prompt}. 
    Brand context: Use Run Your Trip brand aesthetic with colors blue (${BRAND_CONTEXT.colors.primary}) and amber (${BRAND_CONTEXT.colors.accent}). 
    Style: ${stylePreset}, ${BRAND_CONTEXT.style}.
    Incorporate elements suggesting ${BRAND_CONTEXT.keywords.join(", ")}.
    Maintain a ${BRAND_CONTEXT.tone} visual approach.`;
  }

  private injectSocialContext(prompt: string, socialContext: string): string {
    return `${prompt}. 
    Social media trends context: ${socialContext}.
    Make it relevant to current travel trends and social media appeal.`;
  }

  async analyzeTrendingContent(content: string): Promise<{
    topics: Array<{ title: string; engagement: string; relevance: number }>;
    keywords: string[];
    sentiment: string;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a travel industry social media analyst. Analyze the provided content and extract trending topics, keywords, and sentiment. Respond with JSON in this format:
            {
              "topics": [{"title": "topic name", "engagement": "formatted engagement count", "relevance": 0-100}],
              "keywords": ["keyword1", "keyword2"],
              "sentiment": "positive/negative/neutral"
            }`
          },
          {
            role: "user",
            content: content
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error("No content returned from OpenAI");
      }

      return JSON.parse(result);
    } catch (error: any) {
      console.error("Content analysis error:", error);
      throw new Error(`Content analysis failed: ${error.message || "Unknown error"}`);
    }
  }
}

export const openaiImageService = new OpenAIImageService();