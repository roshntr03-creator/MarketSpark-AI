/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import ToolHeader from './ToolHeader';

const CampaignResultsScreen: React.FC = () => {
    const { campaignResult, setCampaignResult } = useMarketingTools();
    const { t } = useTranslations();

    if (!campaignResult) {
        return null;
    }

    const { campaign, sources } = campaignResult;

    const handleStartNew = () => {
        setCampaignResult(null);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.campaignResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{campaign.productName}</p>
                
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
                        <div className="space-y-4">
                            {campaign.channels.map((channel, index) => (
                                <div key={index} className="border-b border-gray-200 dark:border-gray-700/50 pb-3 last:border-b-0">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{channel.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{channel.contentIdea}</p>
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