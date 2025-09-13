/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { generateSocialPosts } from '../services/geminiService';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import ToolHeader from './ToolHeader';

const platforms = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn'];
const tones = ['Professional', 'Casual', 'Humorous', 'Informative', 'Excited'];

const SocialPostAssistantScreen: React.FC = () => {
    const { t } = useTranslations();
    const { setSocialPostsResult, setActiveTool } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState(platforms[0]);
    const [tone, setTone] = useState(tones[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // FIX: Extracted generation logic to a separate function that doesn't take an event.
    const runGeneratePosts = async () => {
        if (!topic) {
            setError('Post topic is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const posts = await generateSocialPosts(topic, platform, tone);
            setSocialPostsResult(posts);
            incrementToolUsage('social-post-assistant', posts.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await runGeneratePosts();
    };

    if (isLoading) return <LoadingScreen />;
    // FIX: Pass a function without arguments to onRetry to match the expected signature.
    if (error) return <ErrorScreen error={error} onRetry={runGeneratePosts} />;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.socialPostAssistantScreenTitle} onBack={() => setActiveTool(null)} />
            <div className="px-4 sm:px-0 flex-grow">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.socialPostAssistantScreenSubtitle}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.socialPostTopicLabel}</label>
                        <textarea
                            id="topic"
                            rows={3}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t.socialPostTopicPlaceholder}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.platformLabel}</label>
                            <select
                                id="platform"
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                            >
                                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.toneLabel}</label>
                            <select
                                id="tone"
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                            >
                                {tones.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {t.generatePostsButton}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SocialPostAssistantScreen;