/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';
import ScheduleModal from './ScheduleModal';
// FIX: Corrected the import path for the Screen type. It should be imported from '../types/index'.
import type { Screen, CreationHistoryItem } from '../types/index';
import { ChatBubbleLeftRightIcon, SparklesIcon, PlusCircleIcon } from './icons';

interface CampaignResultsScreenProps {
    setActiveScreen: (screen: Screen) => void;
}


const CampaignResultsScreen: React.FC<CampaignResultsScreenProps> = ({ setActiveScreen }) => {
    const { campaignResult, setCampaignResult, setInitialSocialPostTopic, setInitialImageGeneratorPrompt, setActiveTool } = useMarketingTools();
    const { t } = useTranslations();
    const [isScheduling, setIsScheduling] = useState(false);

    if (!campaignResult) {
        return null;
    }

    const { result, creation } = campaignResult;
    const { campaign, sources } = result;

    const handleStartNew = () => {
        setCampaignResult(null);
    };

    const handleCreatePosts = (idea: string) => {
        setInitialSocialPostTopic(idea);
        setActiveTool('social-post-assistant');
        setActiveScreen('tools');
    };

    const handleCreateImage = (idea: string) => {
        setInitialImageGeneratorPrompt(idea);
        setActiveTool('image-generator');
        setActiveScreen('tools');
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            {isScheduling && (
                <ScheduleModal
                    creation={creation}
                    onClose={() => setIsScheduling(false)}
                />
            )}
            <ToolHeader title={t.campaignResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center -mt-4 mb-8">
                    <p className="text-center text-md text-gray-600 dark:text-gray-400">{campaign.productName}</p>
                    <button
                        onClick={() => setIsScheduling(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        {t.addToPlannerButton}
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Tagline */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 text-center">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-2">{t.tagline}</h2>
                        <p className="text-3xl font-semibold text-gray-800 dark:text-gray-200 italic">"{campaign.tagline}"</p>
                    </div>

                    {/* Key Messages */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.keyMessages}</h2>
                        <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                            {campaign.keyMessages.map((message, index) => (
                                <li key={index}>{message}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Target Audience */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.targetAudience}</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{campaign.targetAudience.description}</p>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.demographics}</h3>
                        <div className="flex flex-wrap gap-2">
                            {campaign.targetAudience.demographics.map((demo, index) => (
                                 <span key={index} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-3 py-1 rounded-full">{demo}</span>
                            ))}
                        </div>
                    </div>

                    {/* Channel Suggestions */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.channelSuggestions}</h2>
                        <div className="space-y-6">
                            {campaign.channels.map((channel, index) => (
                                <div key={index} className="border-b border-gray-200 dark:border-gray-700/50 pb-4 last:border-b-0">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{channel.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{channel.contentIdea}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <button
                                            onClick={() => handleCreatePosts(channel.contentIdea)}
                                            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                                        >
                                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                            {t.createPostsForIdea}
                                        </button>
                                        <button
                                            onClick={() => handleCreateImage(channel.contentIdea)}
                                            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                            {t.createImageForIdea}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sources */}
                    {sources && sources.length > 0 && (
                         <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.sources}</h2>
                            <ul className="space-y-2 text-sm">
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 hover:underline">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignResultsScreen;