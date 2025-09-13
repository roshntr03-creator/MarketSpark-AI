/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Tool, Campaign, SocialPost } from '../types/index';

interface MarketingToolsContextType {
    activeTool: Tool | null;
    setActiveTool: (tool: Tool | null) => void;
    campaignResult: Campaign | null;
    setCampaignResult: (result: Campaign | null) => void;
    socialPostsResult: SocialPost[] | null;
    setSocialPostsResult: (result: SocialPost[] | null) => void;
}

const MarketingToolsContext = createContext<MarketingToolsContextType | undefined>(undefined);

export const MarketingToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [campaignResult, setCampaignResult] = useState<Campaign | null>(null);
    const [socialPostsResult, setSocialPostsResult] = useState<SocialPost[] | null>(null);

    const value = {
        activeTool,
        setActiveTool,
        campaignResult,
        setCampaignResult,
        socialPostsResult,
        setSocialPostsResult,
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