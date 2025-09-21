/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Changed 'VideoGenerator' to the correct exported type 'GeneratedVideo'.
import type { Screen, CreationHistoryItem, Tool, Campaign, SocialPost, GeneratedImage, GeneratedVideo, DashboardSuggestion, CreationResult, WorkflowResult, EditedImage, CompetitorAnalysis, ContentRepurposingResult, ContentStrategy, AssetKit } from '../types/index';
import { useTranslations } from '../contexts/LanguageProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { LightBulbIcon, RocketLaunchIcon, CheckCircleIcon, SparklesIcon, ChatBubbleLeftRightIcon, PhotoIcon, PlayCircleIcon, MagnifyingGlassIcon, DocumentDuplicateIcon, SwatchIcon, WorkflowIcon } from '../components/icons';
// FIX: Imported 'generateMarketingTip' to resolve a 'not found' error.
import { generateMarketingTip, generateMarketingTipForTool, generateDashboardSuggestions } from '../services/geminiService';

const WEEKLY_CREATION_GOAL = 15;

const kebabToCamel = (str: string) => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

const ToolIcon: React.FC<{ tool: Tool, className?: string }> = ({ tool, className }) => {
    const iconMap: Record<Tool, React.ElementType> = {
        'campaign-generator': SparklesIcon,
        'social-post-assistant': ChatBubbleLeftRightIcon,
        'image-editor': PhotoIcon,
        'image-generator': PhotoIcon,
        'video-generator': PlayCircleIcon,
        'competitor-analysis': MagnifyingGlassIcon,
        'content-repurposing': DocumentDuplicateIcon,
        'content-strategist': LightBulbIcon,
        'asset-kit-generator': SwatchIcon,
        'workflow': WorkflowIcon,
    };
    const Icon = iconMap[tool] || SparklesIcon;
    return <Icon className={className} />;
}

const getCreationDetails = (item: CreationHistoryItem): string => {
    const result = item.result;

    // Workflow
    if ('socialPosts' in result && 'campaign' in result) { 
        return `Workflow: ${(result as WorkflowResult).campaign.campaign.productName}`;
    }
    // Campaign
    if ('campaign' in result) {
        return `Campaign: ${(result as Campaign).campaign.productName}`;
    }
    // Social Posts
    if (Array.isArray(result) && result.length > 0 && 'platform' in result[0]) {
        return `${result.length} ${(result as SocialPost[])[0].platform} Posts`;
    }
    // Edited Image
    if ('edited' in result && 'original' in result) {
         return `Image Edit: "${(result as EditedImage).prompt.substring(0, 40)}..."`;
    }
    // Generated Image
    if ('image' in result && 'prompt' in result) {
        return `Image Gen: "${(result as GeneratedImage).prompt.substring(0, 40)}..."`;
    }
    // Generated Video
    if ('videoUri' in result) {
        return `Video Gen: "${(result as GeneratedVideo).prompt.substring(0, 40)}..."`;
    }
    // Competitor Analysis
    if ('competitorName' in result) {
        return `Analysis for: ${(result as CompetitorAnalysis).competitorName}`;
    }
    // Content Repurposing
    if ('twitterThread' in result) {
        return `Repurposed Content`;
    }
    // Content Strategy
    if ('strategyName' in result) {
        return `Strategy: ${(result as ContentStrategy).strategyName}`;
    }
    // Asset Kit
    if ('logoStyles' in result) {
        return `Brand Asset Kit`;
    }
    return 'Creation';
};


const WeeklyGoal: React.FC = () => {
    const { t } = useTranslations();
    const { log } = useUsageStats();

    const creationsThisWeek = useMemo(() => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return log.filter(entry => entry.timestamp >= oneWeekAgo).length;
    }, [log]);
    
    const progress = Math.min(creationsThisWeek / WEEKLY_CREATION_GOAL, 1);
    const circumference = 2 * Math.PI * 52; // 2 * pi * radius
    const strokeDashoffset = circumference - progress * circumference;

    return (
         <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-3">{t.weeklyGoal}</h3>
            <div className="relative w-32 h-32">
                 <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle className="text-gray-200 dark:text-gray-700" strokeWidth="12" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                    <circle 
                        className="text-indigo-500"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="52"
                        cx="60"
                        cy="60"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{creationsThisWeek}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/ {WEEKLY_CREATION_GOAL}</span>
                </div>
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{t.creationsThisWeek}</p>
        </div>
    );
};

const SmartSuggestions: React.FC<{ setActiveScreen: (s: Screen) => void }> = ({ setActiveScreen }) => {
    const { t, lang } = useTranslations();
    const { history } = useCreationHistory();
    const { setActiveTool, setInitialSocialPostTopic, setInitialImageGeneratorPrompt } = useMarketingTools();
    const [suggestions, setSuggestions] = useState<DashboardSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const lastCreation = history[0];
        if (!lastCreation) {
            setIsLoading(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                setIsLoading(true);
                const result = await generateDashboardSuggestions(lastCreation, lang);
                setSuggestions(result);
            } catch (error) {
                console.error("Failed to fetch dashboard suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [history, lang]);

    const handleSuggestionClick = (suggestion: DashboardSuggestion) => {
        if (suggestion.tool === 'social-post-assistant' && suggestion.promptData) {
            setInitialSocialPostTopic(suggestion.promptData);
        }
        if (suggestion.tool === 'image-generator' && suggestion.promptData) {
            setInitialImageGeneratorPrompt(suggestion.promptData);
        }
        setActiveTool(suggestion.tool);
        setActiveScreen('tools');
    };

    return (
        <div className="md:col-span-2 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                <RocketLaunchIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                {t.smartSuggestions}
            </h2>
            {isLoading ? (
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{t.smartSuggestionsLoading}</p>
            ) : suggestions.length > 0 ? (
                <>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{t.smartSuggestionsSubtitle}</p>
                    <div className="mt-4 space-y-3">
                        {suggestions.map((s, i) => (
                             <button key={i} onClick={() => handleSuggestionClick(s)} className="w-full text-left p-3 flex items-center gap-3 bg-indigo-500/5 dark:bg-indigo-500/10 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-colors">
                                <ToolIcon tool={s.tool} className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                <span className="font-semibold text-indigo-800 dark:text-indigo-200">{s.title}</span>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Create something to get personalized suggestions!</p>
            )}
        </div>
    );
};

const MarketingTip: React.FC = () => {
    const { t, lang } = useTranslations();
    const { rawStats } = useUsageStats();
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const mostUsedTool = useMemo(() => {
        if (Object.keys(rawStats).length === 0) return null;
        return Object.entries(rawStats).sort(([, a], [, b]) => (b || 0) - (a || 0))[0][0] as Tool;
    }, [rawStats]);

    useEffect(() => {
        const fetchTip = async () => {
            try {
                setIsLoading(true);
                const generatedTip = mostUsedTool
                    ? await generateMarketingTipForTool(mostUsedTool, lang)
                    : await generateMarketingTip(lang);
                setTip(generatedTip);
            } catch (error) {
                console.error("Failed to fetch marketing tip:", error);
                setTip(t.marketingTipError);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTip();
    }, [lang, t.marketingTipError, mostUsedTool]);

    return (
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 flex-grow">
            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                <LightBulbIcon className="w-6 h-6 text-yellow-400" />
                {t.marketingTipTitle}
            </h3>
            <div className="mt-2 text-gray-800 dark:text-gray-200 min-h-[6rem] flex items-center">
                {isLoading ? (
                    <p className="italic text-gray-500">{t.marketingTipLoading}</p>
                ) : (
                    <p className="text-sm">{tip}</p>
                )}
            </div>
        </div>
    );
};

const DashboardScreen: React.FC<{ setActiveScreen: (screen: Screen) => void }> = ({ setActiveScreen }) => {
    const { t } = useTranslations();
    const { history } = useCreationHistory();
    const recentCreations = history.slice(0, 5);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t.dashboardGoodMorning;
        if (hour < 18) return t.dashboardGoodAfternoon;
        return t.dashboardGoodEvening;
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getGreeting()}</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.dashboardSubtitle}</p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SmartSuggestions setActiveScreen={setActiveScreen} />
                    
                    <div className="flex flex-col gap-6">
                        <WeeklyGoal />
                        <MarketingTip />
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.recentCreations}</h2>
                     <div className="mt-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4 space-y-2">
                        {recentCreations.length > 0 ? (
                            recentCreations.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <ToolIcon tool={item.tool} className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{t[kebabToCamel(item.tool) as keyof typeof t] || item.tool.replace(/-/g, ' ')}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {getCreationDetails(item)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No creations yet. Go to the Tools screen to get started!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;