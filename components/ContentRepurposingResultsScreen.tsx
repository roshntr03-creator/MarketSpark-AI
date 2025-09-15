/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import ToolHeader from './ToolHeader';

type Tab = 'twitter' | 'instagram' | 'linkedin' | 'video';

const ContentRepurposingResultsScreen: React.FC = () => {
    const { contentRepurposingResult, setContentRepurposingResult } = useMarketingTools();
    const { t } = useTranslations();
    const { copy, copiedText } = useCopyToClipboard();
    const [activeTab, setActiveTab] = useState<Tab>('twitter');

    if (!contentRepurposingResult) return null;

    const { result } = contentRepurposingResult;
    const { twitterThread, instagramCarousel, linkedInPost, videoReelScript } = result;

    const handleStartNew = () => setContentRepurposingResult(null);

    const tabs: { id: Tab; label: string }[] = [
        { id: 'twitter', label: t.twitterThread },
        { id: 'instagram', label: t.instagramCarousel },
        { id: 'linkedin', label: t.linkedInPost },
        { id: 'video', label: t.videoReelScript },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'twitter':
                return (
                    <div className="space-y-4">
                        {twitterThread.map((tweet, i) => (
                            <div key={i} className="border-b border-gray-200/80 dark:border-white/10 pb-4 last:pb-0 last:border-0">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{tweet}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'instagram':
                 return (
                    <div className="space-y-4">
                        {instagramCarousel.map((slide, i) => (
                             <div key={i} className="border-b border-gray-200/80 dark:border-white/10 pb-4 last:pb-0 last:border-0">
                                <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">Slide {i+1} Image Idea:</p>
                                <p className="text-gray-600 dark:text-gray-400 italic mb-2">"{slide.imageIdea}"</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">Caption:</p>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{slide.caption}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'linkedin':
                return <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{linkedInPost}</p>;
            case 'video':
                return <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{videoReelScript}</p>;
            default:
                return null;
        }
    };
    
    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.contentRepurposingResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <div className="mb-4 border-b border-gray-200/80 dark:border-white/10">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${
                                    activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                            >
                            {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 min-h-[300px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ContentRepurposingResultsScreen;