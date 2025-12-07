import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// Check if API key is valid
export function isOpenAIConfigured(): boolean {
  return !(!apiKey || apiKey === "your-openai-key-here" || apiKey === "sk-dummy-key");
}

if (!isOpenAIConfigured()) {
  console.warn("⚠️ OpenAI API key not configured. AI features will not work. Please set OPENAI_API_KEY in environment variables.");
}

const openai = isOpenAIConfigured() ? new OpenAI({ apiKey }) : null;

export interface TemplateGenerationRequest {
  description: string;
  category: string;
  targetPrice: string;
}

export interface GeneratedTemplate {
  name: string;
  description: string;
  code: string;
  features: string[];
  techStack: string[];
  estimatedPrice: string;
}

export async function generateWebsiteTemplate(request: TemplateGenerationRequest): Promise<GeneratedTemplate> {
  // Check if OpenAI is properly configured
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in environment variables.");
  }
  
  try {
    const prompt = `You are an expert web developer and template creator. Generate a complete website template based on the following requirements:

Description: ${request.description}
Category: ${request.category}
Target Price Range: ${request.targetPrice}

Please create:
1. A catchy name for the template
2. A detailed description highlighting key features and benefits
3. Complete HTML/CSS/JS code for a modern, responsive website
4. List of key features included
5. Tech stack used
6. Suggested price based on complexity and market value

The template should be:
- Fully responsive and mobile-friendly
- Modern and professional design
- Include proper semantic HTML
- Use modern CSS (flexbox/grid)
- Include basic JavaScript functionality
- Be production-ready

Please respond with JSON in this exact format:
{
  "name": "Template Name",
  "description": "Detailed description of the template",
  "code": "Complete HTML code with embedded CSS and JS",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "techStack": ["HTML5", "CSS3", "JavaScript"],
  "estimatedPrice": "$XX"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert web developer who creates high-quality, production-ready website templates. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      name: result.name || "Generated Template",
      description: result.description || "AI-generated website template",
      code: result.code || "<!DOCTYPE html><html><head><title>Template</title></head><body><h1>Generated Template</h1></body></html>",
      features: result.features || ["Responsive Design", "Modern UI"],
      techStack: result.techStack || ["HTML5", "CSS3", "JavaScript"],
      estimatedPrice: result.estimatedPrice || "$49"
    };
  } catch (error) {
    console.error("Failed to generate template:", error);
    throw new Error("Failed to generate template with AI. Please check your OpenAI API configuration.");
  }
}

export async function enhanceTemplateDescription(description: string): Promise<string> {
  if (!isOpenAIConfigured() || !openai) {
    console.warn("OpenAI not configured, returning original description");
    return description;
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a marketing copywriter who specializes in writing compelling descriptions for website templates. Make descriptions engaging and highlight key benefits."
        },
        {
          role: "user",
          content: `Enhance this template description to be more engaging and marketable: ${description}`
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || description;
  } catch (error) {
    console.error("Failed to enhance description:", error);
    return description;
  }
}

// Additional OpenAI interfaces and functions
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface ModerationRequest {
  input: string | string[];
}

export interface AudioTranscriptionRequest {
  audioFile: Buffer;
  filename: string;
  model?: string;
}

// Chat Completions
export async function createChatCompletion(request: ChatCompletionRequest) {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: request.messages,
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    });

    return {
      message: response.choices[0].message.content,
      usage: response.usage,
      finishReason: response.choices[0].finish_reason,
    };
  } catch (error) {
    console.error("Chat completion failed:", error);
    throw new Error("Failed to create chat completion");
  }
}

// Image Generation
export async function generateImage(request: ImageGenerationRequest) {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: request.prompt,
      size: request.size || "1024x1024",
      quality: request.quality || "standard",
      style: request.style || "vivid",
      n: 1,
    });

    return {
      url: response.data?.[0]?.url || "",
      revisedPrompt: response.data?.[0]?.revised_prompt || "",
    };
  } catch (error) {
    console.error("Image generation failed:", error);
    throw new Error("Failed to generate image");
  }
}

// Text Embeddings
export async function createEmbedding(request: EmbeddingRequest) {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    const response = await openai.embeddings.create({
      model: request.model || "text-embedding-3-small",
      input: request.input,
    });

    return {
      embeddings: response.data.map(item => item.embedding),
      usage: response.usage,
    };
  } catch (error) {
    console.error("Embedding creation failed:", error);
    throw new Error("Failed to create embeddings");
  }
}

// Content Moderation
export async function moderateContent(request: ModerationRequest) {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    const response = await openai.moderations.create({
      input: request.input,
    });

    return {
      results: response.results.map(result => ({
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
      })),
    };
  } catch (error) {
    console.error("Content moderation failed:", error);
    throw new Error("Failed to moderate content");
  }
}

// Audio Transcription
export async function transcribeAudio(request: AudioTranscriptionRequest) {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([request.audioFile], request.filename),
      model: request.model || "whisper-1",
    });

    return {
      text: response.text,
    };
  } catch (error) {
    console.error("Audio transcription failed:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// Text-to-Speech
export async function synthesizeSpeech(text: string, voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy") {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    return response;
  } catch (error) {
    console.error("Speech synthesis failed:", error);
    throw new Error("Failed to synthesize speech");
  }
}
