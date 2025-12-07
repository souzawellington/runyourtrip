import type { InsertTrendingTopic } from "@shared/schema";

export class SocialTrendsService {
  private readonly apiEndpoint: string;

  constructor() {
    this.apiEndpoint = process.env.SOCIAL_API_ENDPOINT || "";
  }

  async fetchTrendingTopics(): Promise<InsertTrendingTopic[]> {
    try {
      if (!this.apiEndpoint) {
        // Return fallback trending topics if no API endpoint is configured
        return [
          { title: "Sustainable Travel", engagement: "1.2k mentions" },
          { title: "Digital Nomads", engagement: "892 mentions" },
          { title: "Adventure Tourism", engagement: "654 mentions" },
          { title: "Eco-Friendly Hotels", engagement: "543 mentions" },
          { title: "Solo Travel", engagement: "432 mentions" }
        ];
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RunYourTrip-AIImageGenerator/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Social API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to match our schema
      return this.transformApiResponse(data);
    } catch (error: any) {
      console.error("Social API error:", error);
      // Return fallback data on error
      return [
        { title: "Sustainable Travel", engagement: "1.2k mentions" },
        { title: "Digital Nomads", engagement: "892 mentions" },
        { title: "Adventure Tourism", engagement: "654 mentions" }
      ];
    }
  }

  async fetchSocialContext(): Promise<string> {
    try {
      const topics = await this.fetchTrendingTopics();
      const topicStrings = topics.map(t => `${t.title} (${t.engagement})`);
      
      return `Current trending travel topics: ${topicStrings.join(", ")}. 
      Focus on modern travel experiences, sustainability, and digital nomad lifestyle.
      Incorporate elements that would resonate with social media audiences.`;
    } catch (error: any) {
      console.error("Social context fetch error:", error);
      return "Focus on modern travel experiences, adventure, and wanderlust that appeals to social media audiences.";
    }
  }

  private transformApiResponse(data: any): InsertTrendingTopic[] {
    // This method should be customized based on the actual API response structure
    if (Array.isArray(data)) {
      return data.map(item => ({
        title: item.title || item.topic || item.name || "Unknown Topic",
        engagement: item.engagement || item.mentions || item.count || "0 mentions"
      }));
    }

    if (data.trends && Array.isArray(data.trends)) {
      return data.trends.map((item: any) => ({
        title: item.title || item.topic || item.name || "Unknown Topic",
        engagement: item.engagement || item.mentions || item.count || "0 mentions"
      }));
    }

    // Fallback if API structure doesn't match expected format
    return [
      { title: "Sustainable Travel", engagement: "1.2k mentions" },
      { title: "Digital Nomads", engagement: "892 mentions" },
      { title: "Adventure Tourism", engagement: "654 mentions" }
    ];
  }
}

export const socialTrendsService = new SocialTrendsService();