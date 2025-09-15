/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Tool, Campaign, SocialPost, EditedImage, GeneratedImage, GeneratedVideo, CompetitorAnalysis, ContentRepurposingResult, ContentStrategy, AssetKit, CreationHistoryItem } from '../types/index';

interface ResultWithCreation<T> {
    result: T;
    creation: CreationHistoryItem;
}

interface MarketingToolsContextType {
    activeTool: Tool | null;
    setActiveTool: (tool: Tool | null) => void;
    
    campaignResult: ResultWithCreation<Campaign> | null;
    setCampaignResult: (result: ResultWithCreation<Campaign> | null) => void;
    
    socialPostsResult: ResultWithCreation<SocialPost[]> | null;
    setSocialPostsResult: (result: ResultWithCreation<SocialPost[]> | null) => void;

    imageEditResult: ResultWithCreation<EditedImage> | null;
    setImageEditResult: (result: ResultWithCreation<EditedImage> | null) => void;

    generatedImageResult: ResultWithCreation<GeneratedImage> | null;
    setGeneratedImageResult: (result: ResultWithCreation<GeneratedImage> | null) => void;

    videoGenerationResult: ResultWithCreation<GeneratedVideo> | null;
    setVideoGenerationResult: (result: ResultWithCreation<GeneratedVideo> | null) => void;

    competitorAnalysisResult: ResultWithCreation<CompetitorAnalysis> | null;
    setCompetitorAnalysisResult: (result: ResultWithCreation<CompetitorAnalysis> | null) => void;

    contentRepurposingResult: ResultWithCreation<ContentRepurposingResult> | null;
    setContentRepurposingResult: (result: ResultWithCreation<ContentRepurposingResult> | null) => void;

    contentStrategyResult: ResultWithCreation<ContentStrategy> | null;
    setContentStrategyResult: (result: ResultWithCreation<ContentStrategy> | null) => void;

    assetKitResult: ResultWithCreation<AssetKit> | null;
    setAssetKitResult: (result: ResultWithCreation<AssetKit> | null) => void;

    initialSocialPostTopic: string | null;
    setInitialSocialPostTopic: (topic: string | null) => void;

    initialImageGeneratorPrompt: string | null;
    setInitialImageGeneratorPrompt: (prompt: string | null) => void;
}

const MarketingToolsContext = createContext<MarketingToolsContextType | undefined>(undefined);

export const MarketingToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [campaignResult, setCampaignResult] = useState<ResultWithCreation<Campaign> | null>(null);
    const [socialPostsResult, setSocialPostsResult] = useState<ResultWithCreation<SocialPost[]> | null>(null);
    const [imageEditResult, setImageEditResult] = useState<ResultWithCreation<EditedImage> | null>(null);
    const [generatedImageResult, setGeneratedImageResult] = useState<ResultWithCreation<GeneratedImage> | null>(null);
    const [videoGenerationResult, setVideoGenerationResult] = useState<ResultWithCreation<GeneratedVideo> | null>(null);
    const [competitorAnalysisResult, setCompetitorAnalysisResult] = useState<ResultWithCreation<CompetitorAnalysis> | null>(null);
    const [contentRepurposingResult, setContentRepurposingResult] = useState<ResultWithCreation<ContentRepurposingResult> | null>(null);
    const [contentStrategyResult, setContentStrategyResult] = useState<ResultWithCreation<ContentStrategy> | null>(null);
    const [assetKitResult, setAssetKitResult] = useState<ResultWithCreation<AssetKit> | null>(null);

    const [initialSocialPostTopic, setInitialSocialPostTopic] = useState<string | null>(null);
    const [initialImageGeneratorPrompt, setInitialImageGeneratorPrompt] = useState<string | null>(null);

    const value = {
        activeTool, setActiveTool,
        campaignResult, setCampaignResult,
        socialPostsResult, setSocialPostsResult,
        imageEditResult, setImageEditResult,
        generatedImageResult, setGeneratedImageResult,
        videoGenerationResult, setVideoGenerationResult,
        competitorAnalysisResult, setCompetitorAnalysisResult,
        contentRepurposingResult, setContentRepurposingResult,
        contentStrategyResult, setContentStrategyResult,
        assetKitResult, setAssetKitResult,
        initialSocialPostTopic, setInitialSocialPostTopic,
        initialImageGeneratorPrompt, setInitialImageGeneratorPrompt,
    };

    return (
        <MarketingToolsContext.Provider value={value}>
            {children}
        </MarketingToolsContext.Provider>
    );
};

export const useMarketingTools = () => {
    const context = useContext(MarketingToolsContext);
    if (context === undefined) {
        throw new Error('useMarketingTools must be used within a MarketingToolsProvider');
    }
    return context;
};
