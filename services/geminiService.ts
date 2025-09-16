/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type, Modality } from "@google/genai";
// FIX: Added 'GeneratedImage' to the type imports to resolve a type error.
import type { Campaign, SocialPost, EditedImage, GeneratedImage, CompetitorAnalysis, ContentRepurposingResult, ContentStrategy, AssetKit, CreationHistoryItem, DashboardSuggestion, Tool } from '../types/index';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateCampaign = async (product: { name: string; description: string; targetAudience: string }, brandPersona: string, lang: 'en' | 'ar'): Promise<Campaign> => {
    const model = 'gemini-2.5-flash';
    const jsonStructure = `{
        "productName": "string",
        "tagline": "string",
        "keyMessages": ["string"],
        "targetAudience": {
            "description": "string",
            "demographics": ["string"]
        },
        "channels": [
            { "name": "string", "contentIdea": "string" }
        ]
    }`;

    const prompt = `Generate a comprehensive marketing campaign for the following product.
    Product Name: ${product.name}
    Product Description: ${product.description}
    Target Audience: ${product.targetAudience}
    ${brandPersona ? `\nAdhere to the following brand persona: ${brandPersona}`: ''}
    Ground the campaign in real-world marketing principles. Use Google Search to find recent, relevant information.
    IMPORTANT: The entire response must be in ${lang === 'ar' ? 'Arabic' : 'English'}.
    Your response MUST be a single, valid JSON object that conforms to the following structure. Do not include any text or markdown formatting (like \`\`\`json) before or after the JSON object.
    JSON Structure:
    ${jsonStructure}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const campaignDetails = JSON.parse(cleanedJsonText);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title) // Filter out any empty chunks
        .map((web: any) => ({ uri: web.uri, title: web.title })) || [];

    return { campaign: campaignDetails, sources: sources };
};

const socialPostSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        required: ["platform", "content", "hashtags", "predictedEngagement"],
        properties: {
            platform: { type: Type.STRING },
            content: { type: Type.STRING, description: "The full text content of the social media post." },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictedEngagement: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        }
    }
};


export const generateSocialPosts = async (topic: string, platform: string, tone: string, brandPersona: string, lang: 'en' | 'ar'): Promise<SocialPost[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate 3 social media posts for ${platform} about "${topic}".
    The tone should be ${tone}.
    ${brandPersona ? `\nAdhere to the following brand persona: ${brandPersona}`: ''}
    For each post, provide the content, a list of relevant hashtags, and predict the engagement level (High, Medium, or Low).
    Ensure the posts are tailored to the conventions of the ${platform} platform.
    IMPORTANT: The entire response must be in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: socialPostSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SocialPost[];
};


export const editImage = async (base64ImageData: string, mimeType: string, prompt: string, brandPersona: string, lang: 'en' | 'ar'): Promise<{ editedImageBase64: string, text: string | null }> => {
    const model = 'gemini-2.5-flash-image-preview';
    const fullPrompt = `${prompt}. ${brandPersona ? `\nAdhere to the following brand persona: ${brandPersona}`: ''}
    IMPORTANT: If you generate any accompanying text, it must be in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { data: base64ImageData, mimeType } },
                { text: fullPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let editedImageBase64: string | null = null;
    let text: string | null = null;

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            editedImageBase64 = part.inlineData.data;
        } else if (part.text) {
            text = part.text;
        }
    }

    if (!editedImageBase64) {
        throw new Error("API did not return an edited image.");
    }
    
    return { editedImageBase64, text };
};


export const generateImage = async (prompt: string, brandPersona: string): Promise<{ imageBase64: string }> => {
    const model = 'imagen-4.0-generate-001';
    const fullPrompt = `${prompt}. ${brandPersona ? `\nStyle hint: ${brandPersona}`: ''}`;

    const response = await ai.models.generateImages({
        model,
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
        },
    });
    
    const imageBase64 = response.generatedImages[0].image.imageBytes;
    if (!imageBase64) {
        throw new Error("API did not return an image.");
    }

    return { imageBase64 };
};

export const startVideoGeneration = async (prompt: string, image: { base64: string, mimeType: string } | undefined, brandPersona: string) => {
    const model = 'veo-2.0-generate-001';
    const fullPrompt = `${prompt}. ${brandPersona ? `\nStyle hint: ${brandPersona}`: ''}`;
    
    let operation;
    if (image) {
        operation = await ai.models.generateVideos({
            model,
            prompt: fullPrompt,
            image: { imageBytes: image.base64, mimeType: image.mimeType },
            config: { numberOfVideos: 1 }
        });
    } else {
        operation = await ai.models.generateVideos({
            model,
            prompt: fullPrompt,
            config: { numberOfVideos: 1 }
        });
    }
    return operation;
};

export const checkVideoGenerationStatus = async (operation: any) => {
    return await ai.operations.getVideosOperation({ operation });
};

export const analyzeCompetitor = async (url: string, lang: 'en' | 'ar'): Promise<CompetitorAnalysis> => {
    const model = 'gemini-2.5-flash';
    const jsonStructure = `{
        "competitorName": "string",
        "analysisSummary": "string",
        "toneOfVoice": "string",
        "keyMarketingMessages": ["string"],
        "contentStrengths": ["string"],
        "contentWeaknesses": ["string"],
        "differentiationOpportunities": ["string"]
    }`;

    const prompt = `Analyze the marketing strategy of the company at this URL: ${url}. 
    Provide a detailed analysis covering their tone of voice, key marketing messages, content strengths and weaknesses, and potential differentiation opportunities for a competitor.
    Use Google Search to gather information about the company and its marketing.
    IMPORTANT: The entire response must be in ${lang === 'ar' ? 'Arabic' : 'English'}.
    Your response MUST be a single, valid JSON object that conforms to the following structure. Do not include any text or markdown formatting (like \`\`\`json) before or after the JSON object.
    JSON Structure:
    ${jsonStructure}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const analysisDetails = JSON.parse(cleanedJsonText);

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title) // Filter out any empty chunks
        .map((web: any) => ({ uri: web.uri, title: web.title })) || [];

    return { ...analysisDetails, sources: sources };
};

const repurposingSchema = {
    type: Type.OBJECT,
    properties: {
        twitterThread: { type: Type.ARRAY, items: { type: Type.STRING } },
        instagramCarousel: { 
            type: Type.ARRAY, 
            items: { 
                type: Type.OBJECT, 
                properties: { 
                    imageIdea: { type: Type.STRING }, 
                    caption: { type: Type.STRING } 
                } 
            } 
        },
        linkedInPost: { type: Type.STRING },
        videoReelScript: { type: Type.STRING },
    }
};

export const repurposeContent = async (content: string, brandPersona: string, lang: 'en' | 'ar'): Promise<ContentRepurposingResult> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Repurpose the following content into different formats.
    Original Content: "${content}"
    ${brandPersona ? `\nAdhere to the following brand persona: ${brandPersona}`: ''}
    Generate:
    1. A Twitter thread (3-5 tweets).
    2. An Instagram carousel (3 slides with image ideas and captions).
    3. A professional LinkedIn post.
    4. A short video reel script (30-60 seconds).
    IMPORTANT: The entire response must be in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: repurposingSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ContentRepurposingResult;
};

const strategySchema = {
    type: Type.OBJECT,
    properties: {
        strategyName: { type: Type.STRING },
        overallGoal: { type: Type.STRING },
        contentPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    format: { type: Type.STRING },
                    contentIdea: { type: Type.STRING },
                    suggestedTime: { type: Type.STRING },
                }
            }
        }
    }
};

export const generateContentStrategy = async (details: { goal: string; duration: string; audience: string; keywords: string; }, brandPersona: string, lang: 'en' | 'ar'): Promise<ContentStrategy> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Create a content strategy with the following details:
    Marketing Goal: ${details.goal}
    Duration: ${details.duration}
    Target Audience: ${details.audience || 'General Audience'}
    Keywords: ${details.keywords || 'Not specified'}
    ${brandPersona ? `\nAdhere to the following brand persona: ${brandPersona}`: ''}
    Provide a strategy name, restate the overall goal, and create a day-by-day content plan with a title, platform, format, content idea, and suggested posting time for each piece of content.
    IMPORTANT: The entire response must be in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: strategySchema,
        }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ContentStrategy;
};

const assetKitSchema = {
    type: Type.OBJECT,
    properties: {
        logoStyles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    style: { type: Type.STRING },
                    description: { type: Type.STRING },
                }
            }
        },
        colorPalette: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                }
            }
        },
        fontPairings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING },
                }
            }
        },
        imageStyles: { type: Type.ARRAY, items: { type: Type.STRING } },
    }
};

export const generateAssetKit = async (description: string, keywords: string, lang: 'en' | 'ar'): Promise<AssetKit> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a brand asset kit based on this description: "${description}" and these keywords: "${keywords}".
    Provide suggestions for:
    - 2-3 Logo styles with descriptions.
    - A color palette with 5-6 colors (hex codes and names).
    - 2 font pairings (headline and body fonts).
    - A description of recommended image styles.
    IMPORTANT: The entire response must be in ${lang === 'ar' ? 'Arabic' : 'English'}. All descriptions, names, and styles must be in this language.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: assetKitSchema,
        }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AssetKit;
};

export const generateMarketingTip = async (lang: 'en' | 'ar'): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a short, actionable marketing tip of the day. The tip should be relevant to modern digital marketing (social media, content marketing, SEO, etc.). Keep it concise and to the point.
    IMPORTANT: The entire response must be a single paragraph and in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text;
};


export const generateMarketingTipForTool = async (tool: Tool, lang: 'en' | 'ar'): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a short, actionable marketing tip of the day specifically related to the following marketing tool or concept: "${tool.replace(/-/g, ' ')}". Keep it concise and to the point.
    IMPORTANT: The entire response must be a single paragraph and in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text;
};

const dashboardSuggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            tool: { type: Type.STRING, enum: ['campaign-generator', 'social-post-assistant', 'image-editor', 'image-generator', 'video-generator', 'competitor-analysis', 'content-repurposing', 'content-strategist', 'asset-kit-generator', 'workflow'] },
            promptData: { type: Type.STRING },
        },
    }
}

export const generateDashboardSuggestions = async (lastCreation: CreationHistoryItem, lang: 'en' | 'ar'): Promise<DashboardSuggestion[]> => {
    const model = 'gemini-2.5-flash';
    let creationDetails = '';

    // Create a detailed description of the last creation
    switch (lastCreation.tool) {
        case 'campaign-generator':
            const camp = lastCreation.result as Campaign;
            creationDetails = `They just created a marketing campaign for a product called "${camp.campaign.productName}" with the tagline "${camp.campaign.tagline}".`;
            break;
        case 'social-post-assistant':
            const posts = lastCreation.result as SocialPost[];
            creationDetails = `They just generated social media posts, including this one: "${posts[0].content}".`;
            break;
        case 'image-generator':
            const img = lastCreation.result as GeneratedImage;
            creationDetails = `They just generated an image with the prompt: "${img.prompt}".`;
            break;
        default:
            creationDetails = `Their last action was using the "${lastCreation.tool.replace(/-/g, ' ')}" tool.`;
    }

    const prompt = `A user in a marketing AI app just performed an action. Based on this, suggest 2-3 logical next steps to continue their workflow.
    Their last action: ${creationDetails}

    For each suggestion, provide a short, actionable title, the corresponding tool ID to use, and a "promptData" string that the next tool can use.
    - If suggesting 'social-post-assistant', the promptData should be a good topic for the posts.
    - If suggesting 'image-generator', the promptData should be a good prompt for the image.
    - If suggesting other tools, make the title descriptive (e.g., "Analyze a competitor").

    Example response format:
    [
      { "title": "Create social posts for [Product Name]", "tool": "social-post-assistant", "promptData": "Posts about the launch of [Product Name]" },
      { "title": "Generate an image for the campaign", "tool": "image-generator", "promptData": "An image for [Product Name] with tagline '[Tagline]'" }
    ]

    IMPORTANT: The entire response must be in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: dashboardSuggestionsSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as DashboardSuggestion[];
};