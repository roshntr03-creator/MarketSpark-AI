/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import type { Tool } from '../types';

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


const AnalyticsScreen: React.FC = () => {
    const { t, lang } = useTranslations();
    const { rawStats, recentActivity } = useUsageStats();

    const toolKeyMap: { [key in Tool]: string } = {
        'campaign-generator': t.campaignGeneratorTitle,
        'social-post-assistant': t.socialPostAssistantTitle,
        'image-editor': t.imageEditorTitle,
        'image-generator': t.imageGeneratorTitle,
        'video-generator': t.videoGeneratorTitle,
    };
    const toolColors: { [key in Tool]: string } = {
        'campaign-generator': '#6366f1', // indigo-500
        'social-post-assistant': '#a855f7', // purple-500
        'image-editor': '#ec4899', // pink-500
        'image-generator': '#f97316', // orange-500
        'video-generator': '#14b8a6', // teal-500
    };

    const { totalAssets, chartData } = useMemo(() => {
        const total = Object.values(rawStats).reduce((sum, count) => sum + (count || 0), 0);
        const data = (Object.keys(toolKeyMap) as Tool[]).map(key => ({
            label: toolKeyMap[key],
            value: rawStats[key] || 0,
            color: toolColors[key],
        })).sort((a,b) => b.value - a.value);

        return { totalAssets: total, chartData: data };
    }, [rawStats, t]);
    
    const dayFormatter = useMemo(() => new Intl.DateTimeFormat(lang, { weekday: 'short' }), [lang]);
    const maxActivity = Math.max(...recentActivity.map(d => d.value), 1);

    return (
        <div className="animate-fade-in space-y-8 p-4 sm:p-6 md:p-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.analyticsTitle}</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.analyticsSubtitle}</p>
            </div>
            
            {totalAssets === 0 ? (
                <div className="text-center bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-12">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Activity Yet</h2>
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
        </div>
    );
};

export default AnalyticsScreen;