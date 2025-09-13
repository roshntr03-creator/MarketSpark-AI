/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Tool, Campaign, SocialPost, EditedImage, GeneratedImage, GeneratedVideo } from '../types/index';

interface MarketingToolsContextType {
    activeTool: Tool | null;
    setActiveTool: (tool: Tool | null) => void;
    campaignResult: Campaign | null;
    setCampaignResult: (result: Campaign | null) => void;
    socialPostsResult: SocialPost[] | null;
    setSocialPostsResult: (result: SocialPost[] | null) => void;
    imageEditResult: EditedImage | null;
    setImageEditResult: (result: EditedImage | null) => void;
    generatedImageResult: GeneratedImage | null;
    setGeneratedImageResult: (result: GeneratedImage | null) => void;
    videoGenerationResult: GeneratedVideo | null;
    setVideoGenerationResult: (result: GeneratedVideo | null) => void;
}

const MarketingToolsContext = createContext<MarketingToolsContextType | undefined>(undefined);

export const MarketingToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [campaignResult, setCampaignResult] = useState<Campaign | null>(null);
    const [socialPostsResult, setSocialPostsResult] = useState<SocialPost[] | null>(null);
    const [imageEditResult, setImageEditResult] = useState<EditedImage | null>(null);
    const [generatedImageResult, setGeneratedImageResult] = useState<GeneratedImage | null>(null);
    const [videoGenerationResult, setVideoGenerationResult] = useState<GeneratedVideo | null>(null);

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