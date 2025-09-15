/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
// FIX: Consolidated type imports and corrected the path for the Screen type.
import type { Screen, Tool, CreationHistoryItem, Campaign, SocialPost, EditedImage, GeneratedImage, GeneratedVideo, ContentStrategy } from '../types/index';
import { ClockIcon, WrenchScrewdriverIcon, ChatBubbleLeftRightIcon, PhotoIcon, SparklesIcon, VideoCameraIcon, LightBulbIcon } from '../components/icons';

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;

    const segments = data.map(item => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const result = { ...item, percentage, offset: cumulative };
        cumulative += percentage;
        return result;
    });

    return (
        <div className="w-48 h-48 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="15.915" fill="transparent" strokeWidth="4" className="stroke-gray-200 dark:stroke-gray-700" />
                {segments.map(segment => (
                    <circle
                        key={segment.label}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth="4"
                        strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                        strokeDashoffset={-segment.offset}
                        transform="rotate(-90 18 18)"
                        className="transition-all duration-500"
                    />
                ))}
            </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            </div>
        </div>
    );
};

interface AnalyticsScreenProps {
    setActiveScreen: (screen: Screen) => void;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ setActiveScreen }) => {
    const { t, lang } = useTranslations();
    const { rawStats, recentActivity } = useUsageStats();
    const { history } = useCreationHistory();
    const { 
        setActiveTool,
        setCampaignResult,
        setSocialPostsResult,
        setImageEditResult,
        setGeneratedImageResult,
        setVideoGenerationResult,
        setContentStrategyResult,
    } = useMarketingTools();

    // FIX: Add missing tool definitions to satisfy the Tool type.
    const toolKeyMap: { [key in Tool]: string } = {
        'campaign-generator': t.campaignGeneratorTitle,
        'social-post-assistant': t.socialPostAssistantTitle,
        'image-editor': t.imageEditorTitle,
        'image-generator': t.imageGeneratorTitle,
        'video-generator': t.videoGeneratorTitle,
        'competitor-analysis': t.competitorAnalysisTitle,
        'content-repurposing': t.contentRepurposingTitle,
        'content-strategist': t.contentStrategistTitle,
    };
    // FIX: Add missing tool definitions to satisfy the Tool type.
    const toolColors: { [key in Tool]: string } = {
        'campaign-generator': '#6366f1', // indigo-500
        'social-post-assistant': '#a855f7', // purple-500
        'image-editor': '#ec4899', // pink-500
        'image-generator': '#f97316', // orange-500
        'video-generator': '#14b8a6', // teal-500
        'competitor-analysis': '#0ea5e9', // sky-500
        'content-repurposing': '#8b5cf6', // violet-500
        'content-strategist': '#f59e0b', // amber-500
    };

    const { totalAssets, chartData } = useMemo(() => {
        const total = Object.values(rawStats).reduce((sum, count) => sum + (count || 0), 0);
        const data = (Object.keys(toolKeyMap) as Tool[]).map(key => ({
            label: toolKeyMap[key],
            value: rawStats[key] || 0,
            color: toolColors[key],
        })).sort((a,b) => b.value - a.value);

        return { totalAssets: total, chartData: data };
    }, [rawStats, t, toolKeyMap, toolColors]);
    
    const dayFormatter = useMemo(() => new Intl.DateTimeFormat(lang, { weekday: 'short' }), [lang]);
    const maxActivity = Math.max(...recentActivity.map(d => d.value), 1);
    
    const timeFormatter = useMemo(() => new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }), [lang]);

    const handleViewCreation = (creation: CreationHistoryItem) => {
        switch (creation.tool) {
            case 'campaign-generator':
                setCampaignResult({ result: creation.result as Campaign, creation });
                break;
            case 'social-post-assistant':
                setSocialPostsResult({ result: creation.result as SocialPost[], creation });
                break;
            case 'image-editor':
                setImageEditResult({ result: creation.result as EditedImage, creation });
                break;
            case 'image-generator':
                setGeneratedImageResult({ result: creation.result as GeneratedImage, creation });
                break;
            case 'video-generator':
                setVideoGenerationResult({ result: creation.result as GeneratedVideo, creation });
                break;
            case 'content-strategist':
                setContentStrategyResult({ result: creation.result as ContentStrategy, creation });
                break;
        }
        setActiveTool(creation.tool);
        setActiveScreen('tools');
    };

    const getCreationDetails = (creation: CreationHistoryItem) => {
        const details: { icon: React.ElementType, title: string } = {
            icon: SparklesIcon,
            title: 'Creation'
        };

        switch (creation.tool) {
            case 'campaign-generator':
                details.icon = WrenchScrewdriverIcon;
                const productName = (creation.result as Campaign)?.campaign?.productName || '';
                details.title = t.analyticsCreationTitleCampaign.replace('{productName}', productName);
                break;
            case 'social-post-assistant':
                details.icon = ChatBubbleLeftRightIcon;
                const count = (creation.result as SocialPost[])?.length || 0;
                details.title = t.analyticsCreationTitleSocial.replace('{count}', count.toString());
                break;
            case 'image-editor':
                details.icon = PhotoIcon;
                details.title = t.analyticsCreationTitleImageEdit;
                break;
            case 'image-generator':
                details.icon = SparklesIcon;
                details.title = t.analyticsCreationTitleImageGen;
                break;
            case 'video-generator':
                details.icon = VideoCameraIcon;
                details.title = t.analyticsCreationTitleVideoGen;
                break;
             case 'content-strategist':
                details.icon = LightBulbIcon;
                details.title = (creation.result as ContentStrategy)?.strategyName || 'Content Strategy';
                break;
        }
        return details;
    };
    
    const formatTimeSince = (timestamp: number) => {
        const seconds = Math.round((timestamp - Date.now()) / 1000);
        if (Math.abs(seconds) < 60) return timeFormatter.format(seconds, 'second');
        const minutes = Math.round(seconds / 60);
        if (Math.abs(minutes) < 60) return timeFormatter.format(minutes, 'minute');
        const hours = Math.round(minutes / 60);
        if (Math.abs(hours) < 24) return timeFormatter.format(hours, 'hour');
        const days = Math.round(hours / 24);
        return timeFormatter.format(days, 'day');
    };

    return (
        <div className="animate-fade-in space-y-8 p-4 sm:p-6 md:p-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.analyticsTitle}</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.analyticsSubtitle}</p>
            </div>
            
            {totalAssets === 0 ? (
                <div className="text-center bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-12">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.analyticsNoCreations}</h2>
                     <p className="text-gray-600 dark:text-gray-400 mt-2">Start using the tools to see your analytics here!</p>
                </div>
            ) : (
                <>
                    {/* Main Stats Card */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.analyticsToolDistribution}</h2>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <DonutChart data={chartData} />
                            <div className="flex-grow w-full">
                                <ul className="space-y-3">
                                    {chartData.map(item => (
                                        item.value > 0 &&
                                        <li key={item.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                                            </div>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.analyticsActivity}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.analyticsLast7Days}</p>
                        <div className="flex justify-between items-end h-48 space-x-2">
                            {recentActivity.map(day => (
                                <div key={day.date.toISOString()} className="flex-1 flex flex-col items-center justify-end gap-2">
                                    <div 
                                        className="w-full bg-indigo-500/80 dark:bg-indigo-500 rounded-t-md transition-all duration-500"
                                        style={{ height: `${(day.value / maxActivity) * 100}%` }}
                                        title={`${day.value} assets`}
                                    ></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{dayFormatter.format(day.date)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

             {/* Recent Creations Card */}
            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.analyticsRecentCreations}</h2>
                {history.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.analyticsNoCreations}</p>
                ) : (
                    <ul className="divide-y divide-gray-200/80 dark:divide-white/10">
                        {history.map(creation => {
                            const { icon: Icon, title } = getCreationDetails(creation);
                            return (
                                <li key={creation.id} className="py-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-grow min-w-0">
                                        <Icon className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{title}</p>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{formatTimeSince(creation.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewCreation(creation)}
                                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex-shrink-0"
                                    >
                                        {t.analyticsViewButton}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AnalyticsScreen;