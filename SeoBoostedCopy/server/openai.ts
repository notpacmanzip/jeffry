import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ProductDescriptionRequest {
  productName: string;
  features: string[];
  category: string;
  keywords: string[];
  tone: "professional" | "casual" | "enthusiastic";
  length: "short" | "medium" | "long";
}

export interface GeneratedDescription {
  content: string;
  seoScore: number;
  wordCount: number;
  keywordDensity: number;
  suggestedKeywords: string[];
}

export async function generateProductDescription(
  request: ProductDescriptionRequest
): Promise<GeneratedDescription> {
  try {
    const lengthMap = {
      short: "50-100 words",
      medium: "100-200 words",
      long: "200-300 words"
    };

    const prompt = `Generate an SEO-optimized product description for an eCommerce store with the following requirements:

Product Name: ${request.productName}
Category: ${request.category}
Key Features: ${request.features.join(", ")}
Target Keywords: ${request.keywords.join(", ")}
Tone: ${request.tone}
Length: ${lengthMap[request.length]}

Requirements:
1. Create a compelling, ${request.tone} product description
2. Naturally incorporate the target keywords for SEO optimization
3. Highlight the key features and benefits
4. Use persuasive language that encourages purchase
5. Structure the content for readability
6. Ensure the description is ${lengthMap[request.length]} long

Please respond with a JSON object containing:
- content: the generated description
- seoScore: a score from 1-10 based on SEO optimization
- wordCount: number of words in the description
- keywordDensity: percentage of target keywords in the content
- suggestedKeywords: array of 3-5 additional relevant keywords

Make sure the description is unique, engaging, and optimized for search engines.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert eCommerce copywriter and SEO specialist. Generate high-converting, SEO-optimized product descriptions that drive sales and improve search rankings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      content: result.content || "",
      seoScore: Math.max(1, Math.min(10, Math.round(result.seoScore || 5))),
      wordCount: result.wordCount || 0,
      keywordDensity: Math.max(0, Math.min(100, result.keywordDensity || 0)),
      suggestedKeywords: result.suggestedKeywords || [],
    };
  } catch (error: any) {
    console.error("Error generating product description:", error);
    
    // Check if it's a quota/billing issue
    if (error.status === 429 && error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please add billing information to your OpenAI account at https://platform.openai.com/account/billing to continue generating descriptions.');
    }
    
    throw new Error("Failed to generate product description: " + (error as Error).message);
  }
}

export async function suggestKeywords(productName: string, category: string): Promise<string[]> {
  try {
    const prompt = `Suggest 10 relevant SEO keywords for a product named "${productName}" in the ${category} category. 
    Focus on keywords that potential customers would search for when looking for this type of product.
    Include a mix of short-tail and long-tail keywords.
    
    Respond with a JSON object containing:
    - keywords: array of 10 relevant keywords`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an SEO keyword research expert. Provide relevant, high-traffic keywords that will help products rank better in search engines.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.keywords || [];
  } catch (error) {
    console.error("Error suggesting keywords:", error);
    throw new Error("Failed to suggest keywords: " + (error as Error).message);
  }
}

export async function calculateSEOScore(description: string, keywords: string[]): Promise<number> {
  try {
    const prompt = `Analyze the following product description for SEO optimization and provide a score from 1-10:

Description: "${description}"
Target Keywords: ${keywords.join(", ")}

Evaluate based on:
- Keyword usage and density
- Content quality and readability
- Length and structure
- Persuasive language
- Search engine optimization best practices

Respond with a JSON object containing:
- score: number from 1-10
- feedback: brief explanation of the score`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an SEO analysis expert. Evaluate product descriptions for search engine optimization effectiveness.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return Math.max(1, Math.min(10, Math.round(result.score || 5)));
  } catch (error) {
    console.error("Error calculating SEO score:", error);
    return 5; // Default score if analysis fails
  }
}
