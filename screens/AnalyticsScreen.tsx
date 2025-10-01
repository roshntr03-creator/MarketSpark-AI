/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Screen } from '../types/index';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { useTranslations } from '../contexts/LanguageProvider';

interface AnalyticsScreenProps {
  setActiveScreen: (screen: Screen) => void;
}

const kebabToCamel = (str: string) => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ setActiveScreen }) => {
    const { t } = useTranslations();
    const { rawStats, recentActivity } = useUsageStats();

    // FIX: The values from Object.values(rawStats) can be undefined or inferred as 'unknown'.
    // Use a `typeof` check to ensure the reduce operation works correctly on numbers.
    const totalCreations = Object.values(rawStats).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
    // FIX: The values from Object.entries(rawStats) can be undefined or inferred as 'unknown',
    // so we use a `typeof` check to ensure the sort function performs a valid numeric comparison.
    const sortedTools = Object.entries(rawStats).sort(([, a], [, b]) => (typeof b === 'number' ? b : 0) - (typeof a === 'number' ? a : 0));

    const maxActivity = Math.max(...recentActivity.map(a => a.value), 0) || 1;

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.analyticsScreenTitle}</h1>
                    <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.analyticsScreenSubtitle}</p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tool Usage Breakdown */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.toolUsage}</h2>
                        <div className="space-y-4">
                            {sortedTools.length > 0 ? sortedTools.map(([tool, count]) => (
                                <div key={tool}>
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t[kebabToCamel(tool) as keyof typeof t] || tool.replace(/-/g, ' ')}</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{count}</p>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div 
                                            className="bg-indigo-500 h-2.5 rounded-full" 
                                            // FIX: The 'count' can be undefined or inferred as 'unknown'. Use a `typeof` check for the calculation.
                                            // Also, guard against division by zero if totalCreations is 0.
                                            style={{ width: `${(((typeof count === 'number' ? count : 0) / (totalCreations || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No usage data yet.</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Weekly Activity */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.usageThisWeek}</h2>
                        <div className="flex justify-around items-end h-48 border-b border-l border-gray-300 dark:border-gray-600 pb-2 px-1">
                            {recentActivity.map(({ date, value }, index) => (
                                <div key={index} className="flex flex-col items-center justify-end h-full group" style={{ width: '12%' }}>
                                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{value}</div>
                                    <div 
                                        className="w-full bg-indigo-500 rounded-t-md group-hover:bg-violet-500 transition-all"
                                        style={{ height: `${(value / maxActivity) * 90}%` }}
                                    ></div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {date.toLocaleDateString(undefined, { weekday: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsScreen;