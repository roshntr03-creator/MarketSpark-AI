/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import ToolHeader from './ToolHeader';

const SocialPostResultsScreen: React.FC = () => {
    const { socialPostsResult, setSocialPostsResult } = useMarketingTools();
    const { t } = useTranslations();
    const { copy, copiedText } = useCopyToClipboard();

    if (!socialPostsResult) {
        return null;
    }

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
            <ToolHeader title={t.socialPostResultsTitle} onBack={handleStartNew} />

            <div className="space-y-6 px-4 sm:px-0">
                {socialPostsResult.map((post, index) => (
                    <div key={index} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 relative">
                        <div className="flex justify-between items-start mb-3">
                            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300">{post.platform}</h2>
                             <button
                                onClick={() => copy(post.content, `post-${index}`)}
                                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
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