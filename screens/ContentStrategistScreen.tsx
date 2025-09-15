/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { generateContentStrategy } from '../services/geminiService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import ToolHeader from '../components/ToolHeader';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useBrand } from '../contexts/BrandProvider';

const durations = ['1 Week', '2 Weeks', '1 Month'];

const ContentStrategistScreen: React.FC = () => {
    const { t } = useTranslations();
    const { setContentStrategyResult, setActiveTool } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();

    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState(durations[0]);
    const [audience, setAudience] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runGenerateStrategy = async () => {
        if (!goal) {
            setError('Marketing goal is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateContentStrategy({ goal, duration, audience, keywords }, brandPersona);
            const creation = addCreation('content-strategist', result);
            setContentStrategyResult({ result, creation });
            incrementToolUsage('content-strategist');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runGenerateStrategy();
    };

    if (isLoading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} onRetry={runGenerateStrategy} />;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.contentStrategistScreenTitle} onBack={() => setActiveTool(null)} />
            <div className="px-4 sm:px-0 flex-grow">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.contentStrategistScreenSubtitle}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.marketingGoalLabel}</label>
                        <textarea
                            id="goal"
                            rows={4}
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder={t.marketingGoalPlaceholder}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.durationLabel}</label>
                        <select
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                        >
                            {durations.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.targetAudienceLabel}</label>
                            <input
                                type="text"
                                id="audience"
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                placeholder={t.targetAudiencePlaceholder}
                                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.keywordsLabel}</label>
                            <input
                                type="text"
                                id="keywords"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder={t.keywordsPlaceholder}
                                className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {t.generateStrategyButton}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContentStrategistScreen;
