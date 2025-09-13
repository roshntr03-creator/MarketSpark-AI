/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { Campaign, CampaignDetails, SocialPost, Source } from '../types/index';

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
}): Promise<Campaign> {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Generate a comprehensive marketing campaign for the following product.
        Product Name: ${product.name}
        Description: ${product.description}
        ${product.targetAudience ? `Target Audience Hint: ${product.targetAudience}` : ''}

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
        },
        required: ['platform', 'content', 'hashtags'],
    },
};

export async function generateSocialPosts(topic: string, platform: string, tone: string): Promise<SocialPost[]> {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Generate 3 social media posts about "${topic}".
        - Target Platform: ${platform}
        - Tone: ${tone}
        - Each post should include relevant hashtags.
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

export async function editImage(base64Image: string, mimeType: string, prompt: string): Promise<{ editedImageBase64: string, text: string | null }> {
    const model = 'gemini-2.5-flash-image-preview';
    
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
                        text: prompt,
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

export async function generateImage(prompt: string): Promise<{ imageBase64: string }> {
    const model = 'imagen-4.0-generate-001';
    
    // Add a prefix to guide the model, especially for non-English prompts.
    const finalPrompt = `A high-quality, photorealistic image of: ${prompt}`;

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

export async function startVideoGeneration(prompt: string, image?: { base64: string, mimeType: string }): Promise<any> {
    const model = 'veo-2.0-generate-001';
    
    const imagePart = image ? {
        imageBytes: image.base64,
        mimeType: image.mimeType,
    } : undefined;

    try {
        const operation = await ai.models.generateVideos({
            model: model,
            prompt: prompt,
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