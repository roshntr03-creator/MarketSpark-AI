/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { Campaign, CampaignDetails, SocialPost, Source, CompetitorAnalysisResult, RepurposedContent, ContentStrategy } from '../types/index';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateDailyTip(language: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a short, insightful marketing tip of the day. The tip should be concise and practical. Language: ${language}.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error generating daily tip:', error);
        throw new Error('Failed to generate daily tip. Please try again.');
    }
}

export async function generateCampaign(product: {
    name: string;
    description: string;
    targetAudience?: string;
}, brandPersona?: string): Promise<Campaign> {
    const model = 'gemini-2.5-flash';
    const personaInstruction = brandPersona ? `\nAdhere strictly to this brand persona: "${brandPersona}"` : '';
    const prompt = `
        Generate a comprehensive marketing campaign for the following product.
        Product Name: ${product.name}
        Description: ${product.description}
        ${product.targetAudience ? `Target Audience Hint: ${product.targetAudience}` : ''}
        ${personaInstruction}

        Use Google Search to find recent, relevant marketing trends to inform the campaign strategy, especially for channel suggestions.
        
        Return your response as a single JSON object with the following structure:
        {
          "productName": "string",
          "tagline": "string",
          "keyMessages": ["string"],
          "targetAudience": {
            "description": "string",
            "demographics": ["string"]
          },
          "channels": [
            {
              "name": "string",
              "contentIdea": "string"
            }
          ]
        }
        Do not include any text outside of this JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: Source[] = groundingChunks.map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        })).filter((source: Source) => source.uri && source.title);
        
        const textResponse = response.text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
        const campaignDetails = JSON.parse(textResponse) as CampaignDetails;

        return { campaign: campaignDetails, sources: sources };
    } catch (error) {
        console.error('Error generating campaign:', error);
        throw new Error('Failed to generate campaign. Please check the response format or try again.');
    }
}


const socialPostSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            platform: { type: Type.STRING },
            content: { type: Type.STRING },
            hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
            predictedEngagement: {
                type: Type.STRING,
                description: "Predicted engagement level: 'High', 'Medium', or 'Low'.",
            },
        },
        required: ['platform', 'content', 'hashtags', 'predictedEngagement'],
    },
};

export async function generateSocialPosts(topic: string, platform: string, tone: string, brandPersona?: string): Promise<SocialPost[]> {
    const model = 'gemini-2.5-flash';
    const personaInstruction = brandPersona ? `\n- Adhere to this brand persona: "${brandPersona}"` : '';
    const prompt = `
        Generate 3 social media posts about "${topic}".
        - Target Platform: ${platform}
        - Tone: ${tone}${personaInstruction}
        - Each post should include relevant hashtags and a predicted engagement level ('High', 'Medium', or 'Low').
        - Ensure the content is engaging and tailored to the specified platform.
        - Return the output as a JSON array of objects, following the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: socialPostSchema,
            },
        });

        return JSON.parse(response.text) as SocialPost[];
    } catch (error) {
        console.error('Error generating social posts:', error);
        throw new Error('Failed to generate social posts. Please try again.');
    }
}

export async function editImage(base64Image: string, mimeType: string, prompt: string, brandPersona?: string): Promise<{ editedImageBase64: string, text: string | null }> {
    const model = 'gemini-2.5-flash-image-preview';
    const personaInstruction = brandPersona ? `\n(Keep in mind the brand persona: "${brandPersona}")` : '';
    const finalPrompt = `${prompt} ${personaInstruction}`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: finalPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let editedImageBase64: string | undefined;
        let text: string | null = null;
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                editedImageBase64 = part.inlineData.data;
            } else if (part.text) {
                text = (text || '') + part.text;
            }
        }
        
        if (!editedImageBase64) {
            throw new Error(text ?? "The AI did not return an edited image. It may have refused the request.");
        }
        
        return { editedImageBase64, text };

    } catch (error) {
        console.error('Error editing image:', error);
        if (error instanceof Error) {
           throw new Error(`Failed to edit image: ${error.message}`);
        }
        throw new Error('An unknown error occurred while editing the image.');
    }
}

export async function generateImage(prompt: string, brandPersona?: string): Promise<{ imageBase64: string }> {
    const model = 'imagen-4.0-generate-001';
    
    const personaInstruction = brandPersona ? `in a style that is ${brandPersona}, ` : '';
    const finalPrompt = `A high-quality, photorealistic image, ${personaInstruction}of: ${prompt}`;

    try {
        const response = await ai.models.generateImages({
            model: model,
            prompt: finalPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const imageBase64 = response.generatedImages[0].image.imageBytes;
            return { imageBase64 };
        } else {
            throw new Error("The AI did not return an image. It may have refused the request.");
        }

    } catch (error) {
        console.error('Error generating image:', error);
        if (error instanceof Error) {
           throw new Error(`Failed to generate image: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating the image.');
    }
}

export async function startVideoGeneration(prompt: string, image?: { base64: string, mimeType: string }, brandPersona?: string): Promise<any> {
    const model = 'veo-2.0-generate-001';
    
    const imagePart = image ? {
        imageBytes: image.base64,
        mimeType: image.mimeType,
    } : undefined;

    const personaInstruction = brandPersona ? ` (style: ${brandPersona})` : '';
    const finalPrompt = `${prompt}${personaInstruction}`;

    try {
        const operation = await ai.models.generateVideos({
            model: model,
            prompt: finalPrompt,
            image: imagePart,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error('Error starting video generation:', error);
        throw new Error('Failed to start video generation.');
    }
}

export async function checkVideoGenerationStatus(operation: any): Promise<any> {
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        console.error('Error checking video generation status:', error);
        throw new Error('Failed to check video generation status.');
    }
}

export async function analyzeCompetitor(url: string): Promise<CompetitorAnalysisResult> {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Analyze the marketing strategy of the brand at this URL: ${url}.
        Use Google Search to find information about their website, and social media presence.
        Provide a concise analysis.

        Return your response as a single JSON object with the following structure:
        {
          "competitorName": "string",
          "analysisSummary": "string (A brief, one-paragraph summary of their overall strategy)",
          "toneOfVoice": "string (Describe their brand voice, e.g., 'Professional and authoritative')",
          "keyMarketingMessages": ["string"],
          "contentStrengths": ["string"],
          "contentWeaknesses": ["string"],
          "differentiationOpportunities": ["string (3 actionable ways our brand can stand out)"]
        }
        Do not include any text outside of this JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: Source[] = groundingChunks.map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        })).filter((source: Source) => source.uri && source.title);
        
        const textResponse = response.text.trim().replace(/^```json\s*/, '').replace(/```$/, '');
        const analysisDetails = JSON.parse(textResponse);

        return { ...analysisDetails, sources };
    } catch (error) {
        console.error('Error analyzing competitor:', error);
        throw new Error('Failed to analyze competitor. Please check the response format or try again.');
    }
}

const repurposedContentSchema = {
    type: Type.OBJECT,
    properties: {
        twitterThread: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A thread of 3-5 tweets."
        },
        instagramCarousel: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    imageIdea: { type: Type.STRING, description: "A description of a visual for one slide." },
                    caption: { type: Type.STRING, description: "The caption for that slide." }
                },
                required: ['imageIdea', 'caption'],
            },
            description: "Ideas for 3-5 Instagram carousel slides."
        },
        linkedInPost: {
            type: Type.STRING,
            description: "A professional post for LinkedIn."
        },
        videoReelScript: {
            type: Type.STRING,
            description: "A short, engaging script for a TikTok/Instagram Reel, including visual cues."
        },
    },
    required: ['twitterThread', 'instagramCarousel', 'linkedInPost', 'videoReelScript'],
};


export async function repurposeContent(content: string, brandPersona?: string): Promise<RepurposedContent> {
    const model = 'gemini-2.5-flash';
    const personaInstruction = brandPersona ? `\n- Adhere to this brand persona: "${brandPersona}"` : '';
    const prompt = `
        Take the following content and repurpose it for multiple social media platforms.
        
        Original Content: "${content}"
        
        - Create a thread for Twitter.
        - Create ideas for an Instagram Carousel.
        - Create a professional post for LinkedIn.
        - Create a script for a short video (Reel/TikTok).
        ${personaInstruction}
        - Return the output as a JSON object, following the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: repurposedContentSchema,
            },
        });

        return JSON.parse(response.text) as RepurposedContent;
    } catch (error) {
        console.error('Error repurposing content:', error);
        throw new Error('Failed to repurpose content. Please try again.');
    }
}

const contentStrategySchema = {
    type: Type.OBJECT,
    properties: {
        strategyName: { type: Type.STRING },
        overallGoal: { type: Type.STRING },
        contentPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER },
                    platform: { type: Type.STRING },
                    format: { type: Type.STRING },
                    title: { type: Type.STRING },
                    contentIdea: { type: Type.STRING },
                    suggestedTime: { type: Type.STRING },
                },
                required: ['day', 'platform', 'format', 'title', 'contentIdea', 'suggestedTime'],
            },
        },
    },
    required: ['strategyName', 'overallGoal', 'contentPlan'],
};


export async function generateContentStrategy(
    { goal, duration, audience, keywords }: { goal: string; duration: string; audience?: string; keywords?: string; },
    brandPersona?: string
): Promise<ContentStrategy> {
    const model = 'gemini-2.5-flash';
    const personaInstruction = brandPersona ? `\n- The strategy must strictly adhere to this brand persona: "${brandPersona}"` : '';
    const prompt = `
        Create a detailed content marketing strategy based on the following inputs.
        
        - Main Goal: ${goal}
        - Duration: ${duration}
        ${audience ? `- Target Audience: ${audience}` : ''}
        ${keywords ? `- Key SEO Keywords: ${keywords}` : ''}
        ${personaInstruction}
        
        Generate a day-by-day content plan. The plan should include a variety of content formats (Post, Story, Video, Article) and suggest platforms (e.g., Instagram, Twitter, Blog, LinkedIn, TikTok). Each content idea should be actionable and directly support the main goal.
        
        Return the output as a JSON object, following the provided schema. Ensure 'day' is a number representing the day in the plan (e.g., 1, 3, 7).
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: contentStrategySchema,
            },
        });

        return JSON.parse(response.text) as ContentStrategy;
    } catch (error) {
        console.error('Error generating content strategy:', error);
        throw new Error('Failed to generate content strategy. Please try again.');
    }
}