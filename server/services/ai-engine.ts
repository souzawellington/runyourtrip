import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

/**
 * Multi-modal AI Engine with Fallback Chain
 * 
 * Tries AI providers in sequence: OpenAI → Gemini → Perplexity
 * If one fails, automatically falls back to the next provider.
 */

// Provider configuration
const PROVIDERS = {
    openai: {
        name: 'OpenAI',
        enabled: !!process.env.OPENAI_API_KEY,
        timeout: 30000,
    },
    gemini: {
        name: 'Google Gemini',
        enabled: !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_AI_API_KEY,
        timeout: 30000,
    },
    perplexity: {
        name: 'Perplexity',
        enabled: !!process.env.PERPLEXITY_API_KEY,
        timeout: 30000,
    },
};

// Initialize clients lazily
let openaiClient: OpenAI | null = null;
let geminiClient: GoogleGenAI | null = null;

function getOpenAI(): OpenAI {
    if (!openaiClient && process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient!;
}

function getGemini(): GoogleGenAI {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (apiKey) {
            geminiClient = new GoogleGenAI({ apiKey });
        }
    }
    return geminiClient!;
}

/**
 * Standardized AI response
 */
export interface AIResponse {
    content: string;
    provider: string;
    model: string;
    tokensUsed?: number;
    error?: string;
}

/**
 * Chat completion request
 */
export interface ChatRequest {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
}

/**
 * Text generation request (simpler interface)
 */
export interface GenerateRequest {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
}

/**
 * Create a promise that rejects after timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number, providerName: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`${providerName} timeout after ${ms}ms`)), ms)
        ),
    ]);
}

/**
 * Try OpenAI for chat completion
 */
async function tryOpenAI(request: ChatRequest): Promise<AIResponse> {
    const openai = getOpenAI();
    if (!openai) throw new Error('OpenAI not configured');

    const response = await withTimeout(
        openai.chat.completions.create({
            model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
            messages: request.messages,
            max_tokens: request.maxTokens || 2000,
            temperature: request.temperature || 0.7,
        }),
        PROVIDERS.openai.timeout,
        'OpenAI'
    );

    return {
        content: response.choices[0]?.message?.content || '',
        provider: 'OpenAI',
        model: 'gpt-4o',
        tokensUsed: response.usage?.total_tokens,
    };
}

/**
 * Try Google Gemini for chat completion
 */
async function tryGemini(request: ChatRequest): Promise<AIResponse> {
    const gemini = getGemini();
    if (!gemini) throw new Error('Gemini not configured');

    // Convert messages to Gemini format
    const contents = request.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

    // Add system prompt as first user message if exists
    const systemMessage = request.messages.find(m => m.role === 'system');
    if (systemMessage) {
        contents.unshift({
            role: 'user',
            parts: [{ text: `System instruction: ${systemMessage.content}` }],
        });
    }

    const response = await withTimeout(
        gemini.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents,
        }),
        PROVIDERS.gemini.timeout,
        'Gemini'
    );

    const text = response.text || '';

    return {
        content: text,
        provider: 'Google Gemini',
        model: 'gemini-2.0-flash-exp',
    };
}

/**
 * Try Perplexity for chat completion
 */
async function tryPerplexity(request: ChatRequest): Promise<AIResponse> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error('Perplexity not configured');

    const response = await withTimeout(
        fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-large-128k-online',
                messages: request.messages,
                max_tokens: request.maxTokens || 2000,
                temperature: request.temperature || 0.7,
            }),
        }).then(res => res.json()),
        PROVIDERS.perplexity.timeout,
        'Perplexity'
    );

    if (response.error) {
        throw new Error(response.error.message || 'Perplexity API error');
    }

    return {
        content: response.choices?.[0]?.message?.content || '',
        provider: 'Perplexity',
        model: 'llama-3.1-sonar-large-128k-online',
        tokensUsed: response.usage?.total_tokens,
    };
}

/**
 * Main chat completion with automatic fallback
 * 
 * Tries providers in order: OpenAI → Gemini → Perplexity
 * Returns result from first successful provider
 */
export async function chatCompletion(request: ChatRequest): Promise<AIResponse> {
    const errors: string[] = [];
    const providerOrder = [
        { name: 'openai', fn: tryOpenAI, config: PROVIDERS.openai },
        { name: 'gemini', fn: tryGemini, config: PROVIDERS.gemini },
        { name: 'perplexity', fn: tryPerplexity, config: PROVIDERS.perplexity },
    ];

    for (const provider of providerOrder) {
        if (!provider.config.enabled) {
            console.log(`⏭️ Skipping ${provider.config.name} (not configured)`);
            continue;
        }

        try {
            console.log(`🤖 Trying ${provider.config.name}...`);
            const result = await provider.fn(request);
            console.log(`✅ ${provider.config.name} succeeded`);
            return result;
        } catch (error: any) {
            const errorMsg = `${provider.config.name}: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
        }
    }

    // All providers failed
    throw new Error(`All AI providers failed:\n${errors.join('\n')}`);
}

/**
 * Simple text generation with fallback
 */
export async function generateText(request: GenerateRequest): Promise<AIResponse> {
    const messages: ChatRequest['messages'] = [];

    if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
    }

    messages.push({ role: 'user', content: request.prompt });

    return chatCompletion({
        messages,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
    });
}

/**
 * Generate structured JSON response
 */
export async function generateJSON<T = any>(
    prompt: string,
    schema?: string
): Promise<{ data: T; provider: string }> {
    const systemPrompt = schema
        ? `You are a helpful assistant that responds ONLY in valid JSON format. Follow this schema: ${schema}`
        : 'You are a helpful assistant that responds ONLY in valid JSON format.';

    const response = await generateText({
        prompt,
        systemPrompt,
        temperature: 0.3, // Lower temperature for more consistent JSON
    });

    try {
        // Try to extract JSON from response
        const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]) as T;
            return { data, provider: response.provider };
        }
        throw new Error('No valid JSON found in response');
    } catch (parseError: any) {
        throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }
}

/**
 * Generate travel-specific content
 */
export async function generateTravelContent(
    type: 'itinerary' | 'description' | 'tips' | 'template',
    context: Record<string, any>
): Promise<AIResponse> {
    const prompts: Record<string, string> = {
        itinerary: `Create a detailed travel itinerary for ${context.destination} for ${context.days} days. Include activities, restaurants, and transportation tips.`,
        description: `Write an engaging travel description for ${context.destination}. Include highlights, best time to visit, and what makes it unique.`,
        tips: `Provide practical travel tips for visiting ${context.destination}. Include local customs, safety, currency, and insider recommendations.`,
        template: `Generate a modern travel website template structure for a ${context.type} website. Include sections, color scheme suggestions, and content placeholders.`,
    };

    return generateText({
        prompt: prompts[type] || context.prompt,
        systemPrompt: 'You are an expert travel content writer with deep knowledge of destinations worldwide.',
        maxTokens: 2000,
    });
}

/**
 * Get available providers status
 */
export function getProvidersStatus(): Record<string, { enabled: boolean; name: string }> {
    return {
        openai: { enabled: PROVIDERS.openai.enabled, name: PROVIDERS.openai.name },
        gemini: { enabled: PROVIDERS.gemini.enabled, name: PROVIDERS.gemini.name },
        perplexity: { enabled: PROVIDERS.perplexity.enabled, name: PROVIDERS.perplexity.name },
    };
}

// Export singleton-like AI engine
export const aiEngine = {
    chatCompletion,
    generateText,
    generateJSON,
    generateTravelContent,
    getProvidersStatus,
};
