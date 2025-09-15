/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import type { Screen, PlannerItem, CreationResult } from '../types/index';
import { usePlanner } from '../contexts/PlannerProvider';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useTranslations } from '../contexts/LanguageProvider';

interface PlannerScreenProps {
  setActiveScreen: (screen: Screen) => void;
}

const PlannerCard: React.FC<{ item: PlannerItem; creation: CreationResult | undefined }> = ({ item, creation }) => {
    const { t } = useTranslations();
    
    let title = item.title || 'Scheduled Item';
    let description = item.contentIdea || 'No details available.';
    let toolName = 'Unknown';
    
    if (item.creationId && creation) {
        if ('campaign' in creation) {
            title = creation.campaign.productName + ' Campaign';
            description = creation.campaign.tagline;
            toolName = t.campaignGenerator;
        } else if (Array.isArray(creation) && 'platform' in creation[0]) {
            title = `${creation[0].platform} Posts`;
            description = creation[0].content.substring(0, 100) + '...';
            toolName = t.socialPostAssistant;
        } else if ('edited' in creation) {
            title = 'Edited Image';
            description = `Prompt: ${creation.prompt}`;
            toolName = t.imageEditor;
        } else if ('image' in creation) {
            title = 'Generated Image';
            description = `Prompt: ${creation.prompt}`;
            toolName = t.imageGenerator;
        } else if ('videoUri' in creation) {
            title = 'Generated Video';
            description = `Prompt: ${creation.prompt}`;
            toolName = t.videoGenerator;
        }
    } else {
        toolName = t.contentStrategist;
    }

    return (
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4 ml-4 border-l-4 border-indigo-400">
            <p className="font-bold text-gray-900 dark:text-gray-100">{title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            <div className="mt-2 text-xs">
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-medium px-2 py-1 rounded-full">{toolName}</span>
                {item.platform && <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-2 py-1 rounded-full">{item.platform}</span>}
            </div>
        </div>
    );
}

const PlannerScreen: React.FC<PlannerScreenProps> = ({ setActiveScreen }) => {
    const { t } = useTranslations();
    const { plannerItems } = usePlanner();
    const { getCreationById } = useCreationHistory();

    const groupedItems = useMemo(() => {
        return plannerItems.reduce((acc, item) => {
            const date = new Date(item.scheduledDateTime).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {} as Record<string, PlannerItem[]>);
    }, [plannerItems]);

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.plannerScreenTitle}</h1>
                    <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.plannerScreenSubtitle}</p>
                </div>
                
                <div className="mt-8 space-y-8">
                    {Object.keys(groupedItems).length > 0 ? Object.keys(groupedItems).map(date => (
                        <div key={date}>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">{date}</h2>
                            <div className="space-y-4">
                                {groupedItems[date].map(item => {
                                    const creation = item.creationId ? getCreationById(item.creationId)?.result : undefined;
                                    return <PlannerCard key={item.id} item={item} creation={creation} />
                                })}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your planner is empty.</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Create content with our tools and schedule it here.</p>
                            <button
                                onClick={() => setActiveScreen('tools')}
                                className="mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
                            >
                                Go to Tools
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlannerScreen;
