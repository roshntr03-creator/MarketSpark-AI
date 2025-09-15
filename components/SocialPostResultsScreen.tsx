/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import ToolHeader from './ToolHeader';
import ScheduleModal from './ScheduleModal';
import { PlusCircleIcon, FireIcon, ThumbUpIcon, ChatBubbleBottomCenterTextIcon } from './icons';

const EngagementIndicator: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    const { t } = useTranslations();
    
    const levels = {
        High: {
            text: t.engagementHigh,
            Icon: FireIcon,
            colorClasses: 'text-red-500 dark:text-red-400 bg-red-500/10',
        },
        Medium: {
            text: t.engagementMedium,
            Icon: ThumbUpIcon,
            colorClasses: 'text-yellow-500 dark:text-yellow-400 bg-yellow-500/10',
        },
        Low: {
            text: t.engagementLow,
            Icon: ChatBubbleBottomCenterTextIcon,
            colorClasses: 'text-blue-500 dark:text-blue-400 bg-blue-500/10',
        },
    };

    const { text, Icon, colorClasses } = levels[level] || levels.Medium;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${colorClasses}`}>
            <Icon className="w-4 h-4" />
            <span>{text}</span>
        </div>
    );
};

const SocialPostResultsScreen: React.FC = () => {
    const { socialPostsResult, setSocialPostsResult } = useMarketingTools();
    const { t } = useTranslations();
    const { copy, copiedText } = useCopyToClipboard();
    const [isScheduling, setIsScheduling] = useState(false);

    if (!socialPostsResult) {
        return null;
    }

    const { result, creation } = socialPostsResult;

    const handleStartNew = () => {
        setSocialPostsResult(null);
    };

    const formatContent = (content: string) => {
        return content.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            {isScheduling && (
                <ScheduleModal
                    creation={creation}
                    onClose={() => setIsScheduling(false)}
                />
            )}
            <ToolHeader title={t.socialPostResultsTitle} onBack={handleStartNew} />

            <div className="px-4 sm:px-0 mb-6 flex justify-end">
                 <button
                    onClick={() => setIsScheduling(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    {t.addToPlannerButton}
                </button>
            </div>

            <div className="space-y-6 px-4 sm:px-0">
                {result.map((post, index) => (
                    <div key={index} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 relative">
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                                <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300">{post.platform}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.predictedEngagement}</p>
                                <EngagementIndicator level={post.predictedEngagement} />
                            </div>
                             <button
                                onClick={() => copy(post.content, `post-${index}`)}
                                className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                            >
                                {copiedText === `post-${index}` ? t.copied : t.copy}
                            </button>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{formatContent(post.content)}</p>
                        <div className="flex flex-wrap gap-2">
                            {post.hashtags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="text-indigo-500 dark:text-indigo-400 text-sm">{tag}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocialPostResultsScreen;