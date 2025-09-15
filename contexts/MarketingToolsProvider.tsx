/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Tool, Campaign, SocialPost, EditedImage, GeneratedImage, GeneratedVideo, CreationHistoryItem, CompetitorAnalysisResult, RepurposedContent, ContentStrategy } from '../types/index';

interface MarketingToolsContextType {
    activeTool: Tool | null;
    setActiveTool: (tool: Tool | null) => void;
    campaignResult: { result: Campaign, creation: CreationHistoryItem } | null;
    setCampaignResult: (data: { result: Campaign, creation: CreationHistoryItem } | null) => void;
    socialPostsResult: { result: SocialPost[], creation: CreationHistoryItem } | null;
    setSocialPostsResult: (data: { result: SocialPost[], creation: CreationHistoryItem } | null) => void;
    imageEditResult: { result: EditedImage, creation: CreationHistoryItem } | null;
    setImageEditResult: (data: { result: EditedImage, creation: CreationHistoryItem } | null) => void;
    generatedImageResult: { result: GeneratedImage, creation: CreationHistoryItem } | null;
    setGeneratedImageResult: (data: { result: GeneratedImage, creation: CreationHistoryItem } | null) => void;
    videoGenerationResult: { result: GeneratedVideo, creation: CreationHistoryItem } | null;
    setVideoGenerationResult: (data: { result: GeneratedVideo, creation: CreationHistoryItem } | null) => void;
    competitorAnalysisResult: { result: CompetitorAnalysisResult, creation: CreationHistoryItem } | null;
    setCompetitorAnalysisResult: (data: { result: CompetitorAnalysisResult, creation: CreationHistoryItem } | null) => void;
    contentRepurposingResult: { result: RepurposedContent, creation: CreationHistoryItem } | null;
    setContentRepurposingResult: (data: { result: RepurposedContent, creation: CreationHistoryItem } | null) => void;
    contentStrategyResult: { result: ContentStrategy, creation: CreationHistoryItem } | null;
    setContentStrategyResult: (data: { result: ContentStrategy, creation: CreationHistoryItem } | null) => void;
    initialSocialPostTopic: string | null;
    setInitialSocialPostTopic: (topic: string | null) => void;
    initialImageGeneratorPrompt: string | null;
    setInitialImageGeneratorPrompt: (prompt: string | null) => void;
}

const MarketingToolsContext = createContext<MarketingToolsContextType | undefined>(undefined);

export const MarketingToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [campaignResult, setCampaignResult] = useState<{ result: Campaign, creation: CreationHistoryItem } | null>(null);
    const [socialPostsResult, setSocialPostsResult] = useState<{ result: SocialPost[], creation: CreationHistoryItem } | null>(null);
    const [imageEditResult, setImageEditResult] = useState<{ result: EditedImage, creation: CreationHistoryItem } | null>(null);
    const [generatedImageResult, setGeneratedImageResult] = useState<{ result: GeneratedImage, creation: CreationHistoryItem } | null>(null);
    const [videoGenerationResult, setVideoGenerationResult] = useState<{ result: GeneratedVideo, creation: CreationHistoryItem } | null>(null);
    const [competitorAnalysisResult, setCompetitorAnalysisResult] = useState<{ result: CompetitorAnalysisResult, creation: CreationHistoryItem } | null>(null);
    const [contentRepurposingResult, setContentRepurposingResult] = useState<{ result: RepurposedContent, creation: CreationHistoryItem } | null>(null);
    const [contentStrategyResult, setContentStrategyResult] = useState<{ result: ContentStrategy, creation: CreationHistoryItem } | null>(null);
    const [initialSocialPostTopic, setInitialSocialPostTopic] = useState<string | null>(null);
    const [initialImageGeneratorPrompt, setInitialImageGeneratorPrompt] = useState<string | null>(null);


    const value = {
        activeTool,
        setActiveTool,
        campaignResult,
        setCampaignResult,
        socialPostsResult,
        setSocialPostsResult,
        imageEditResult,
        setImageEditResult,
        generatedImageResult,
        setGeneratedImageResult,
        videoGenerationResult,
        setVideoGenerationResult,
        competitorAnalysisResult,
        setCompetitorAnalysisResult,
        contentRepurposingResult,
        setContentRepurposingResult,
        contentStrategyResult,
        setContentStrategyResult,
        initialSocialPostTopic,
        setInitialSocialPostTopic,
        initialImageGeneratorPrompt,
        setInitialImageGeneratorPrompt,
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