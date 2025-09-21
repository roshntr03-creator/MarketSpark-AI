/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { supabase } from '../lib/supabaseClient';
import type { Campaign, SocialPost, CompetitorAnalysis, ContentRepurposingResult, ContentStrategy, AssetKit, CreationHistoryItem, DashboardSuggestion, Tool } from '../types/index';

// A generic function to handle Supabase function invocation and error handling.
const invokeFunction = async <T>(functionName: string, body: object): Promise<T> => {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    if (error) {
        // Attempt to parse a more specific error message from the response if available
        if (error instanceof Error && 'context' in error && typeof error.context === 'object' && error.context !== null && 'details' in error.context) {
             throw new Error(String(error.context.details) || `Function ${functionName} failed with an unknown error.`);
        }
        throw new Error(error.message || `Function ${functionName} failed with an unknown error.`);
    }
    return data as T;
};

export const generateCampaign = (product: { name: string; description: string; targetAudience: string }, brandPersona: string, lang: 'en' | 'ar'): Promise<Campaign> => {
    return invokeFunction('generate-campaign', { product, brandPersona, lang });
};

export const generateSocialPosts = (topic: string, platform: string, tone: string, brandPersona: string, lang: 'en' | 'ar'): Promise<SocialPost[]> => {
    return invokeFunction('generate-social-posts', { topic, platform, tone, brandPersona, lang });
};

export const editImage = (base64ImageData: string, mimeType: string, prompt: string, brandPersona: string, lang: 'en' | 'ar'): Promise<{ editedImageBase64: string, text: string | null }> => {
    return invokeFunction('edit-image', { base64ImageData, mimeType, prompt, brandPersona, lang });
};

export const generateImage = (prompt: string, brandPersona: string): Promise<{ imageBase64: string }> => {
    return invokeFunction('generate-image', { prompt, brandPersona });
};

export const startVideoGeneration = (prompt: string, image: { base64: string, mimeType: string } | undefined, brandPersona: string): Promise<any> => {
    return invokeFunction('start-video-generation', { prompt, image, brandPersona });
};

export const checkVideoGenerationStatus = (operation: any): Promise<any> => {
    return invokeFunction('check-video-status', { operation });
};

export const analyzeCompetitor = (url: string, lang: 'en' | 'ar'): Promise<CompetitorAnalysis> => {
    return invokeFunction('analyze-competitor', { url, lang });
};

export const repurposeContent = (content: string, brandPersona: string, lang: 'en' | 'ar'): Promise<ContentRepurposingResult> => {
    return invokeFunction('repurpose-content', { content, brandPersona, lang });
};

export const generateContentStrategy = (details: { goal: string; duration: string; audience: string; keywords: string; }, brandPersona: string, lang: 'en' | 'ar'): Promise<ContentStrategy> => {
    return invokeFunction('generate-content-strategy', { details, brandPersona, lang });
};

export const generateAssetKit = (description: string, keywords: string, lang: 'en' | 'ar'): Promise<AssetKit> => {
    return invokeFunction('generate-asset-kit', { description, keywords, lang });
};

export const generateMarketingTip = (lang: 'en' | 'ar'): Promise<string> => {
    return invokeFunction('generate-marketing-tip', { lang });
};

export const generateMarketingTipForTool = (tool: Tool, lang: 'en' | 'ar'): Promise<string> => {
    return invokeFunction('generate-marketing-tip-for-tool', { tool, lang });
};

export const generateDashboardSuggestions = (lastCreationSummary: any, lang: 'en' | 'ar'): Promise<DashboardSuggestion[]> => {
    return invokeFunction('generate-dashboard-suggestions', { lastCreation: lastCreationSummary, lang });
};