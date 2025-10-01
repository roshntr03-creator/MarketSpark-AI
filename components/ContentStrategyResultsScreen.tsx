/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { usePlanner } from '../contexts/PlannerProvider';
import ToolHeader from './ToolHeader';
import { PlusCircleIcon } from './icons';
import type { Screen, ContentPlanItem } from '../types/index';

interface ContentStrategyResultsScreenProps {
    setActiveScreen: (screen: Screen) => void;
}

const ContentStrategyResultsScreen: React.FC<ContentStrategyResultsScreenProps> = ({ setActiveScreen }) => {
    const { contentStrategyResult, setContentStrategyResult } = useMarketingTools();
    const { addPlannerItem } = usePlanner();
    const { t } = useTranslations();
    const [isAdded, setIsAdded] = useState(false);

    if (!contentStrategyResult) return null;

    const { result } = contentStrategyResult;
    const { strategyName, overallGoal, contentPlan } = result;

    const handleStartNew = () => setContentStrategyResult(null);

    const handleAddToPlanner = () => {
        const today = new Date();
        contentPlan.forEach(item => {
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + item.day - 1);
            
            // Basic time parsing (e.g., "9:00 AM" -> sets hours and minutes)
            const timeParts = item.suggestedTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeParts) {
                let hour = parseInt(timeParts[1], 10);
                const minute = parseInt(timeParts[2], 10);
                const ampm = timeParts[3];
                if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) {
                    hour += 12;
                }
                if (ampm && ampm.toLowerCase() === 'am' && hour === 12) {
                    hour = 0;
                }
                scheduledDate.setHours(hour, minute, 0, 0);
            }

            addPlannerItem({
                scheduled_date_time: scheduledDate.toISOString(),
                title: item.title,
                platform: item.platform,
                content_idea: item.contentIdea,
                format: item.format,
            });
        });
        setIsAdded(true);
        setTimeout(() => {
            setActiveScreen('planner');
        }, 1500);
    };

    const planByDay = useMemo(() => {
        return contentPlan.reduce((acc, item) => {
            if (!acc[item.day]) {
                acc[item.day] = [];
            }
            acc[item.day].push(item);
            return acc;
        }, {} as Record<number, ContentPlanItem[]>);
    }, [contentPlan]);

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.contentStrategyResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 text-center mb-6">
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-2">{t.overallGoal}</h2>
                    <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">"{overallGoal}"</p>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.contentPlan}</h2>
                    <button
                        onClick={handleAddToPlanner}
                        disabled={isAdded}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:bg-green-500 disabled:cursor-not-allowed"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        {isAdded ? t.addedToPlanner : t.addAllToPlanner}
                    </button>
                </div>

                <div className="space-y-6">
                    {Object.keys(planByDay).sort((a,b) => parseInt(a) - parseInt(b)).map(day => (
                        <div key={day}>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">{t.day} {day}</h3>
                            <div className="space-y-4">
                                {planByDay[parseInt(day)].map((item, index) => (
                                     <div key={index} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4 ml-4 border-l-4 border-indigo-400">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-gray-900 dark:text-gray-100">{item.title}</p>
                                            <div className="flex gap-2 text-xs">
                                                 <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-2 py-1 rounded-full">{item.platform}</span>
                                                 <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-medium px-2 py-1 rounded-full">{item.format}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.contentIdea}</p>
                                     </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContentStrategyResultsScreen;