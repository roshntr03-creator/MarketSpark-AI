/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { usePlanner } from '../contexts/PlannerProvider';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import type { PlannerItem, CreationHistoryItem, Tool, Screen } from '../types/index';
// FIX: Import missing icons.
import { ArrowLeftIcon, WrenchScrewdriverIcon, ChatBubbleLeftRightIcon, PhotoIcon, SparklesIcon, VideoCameraIcon, CalendarDaysIcon, MagnifyingGlassIcon, DocumentDuplicateIcon, LightBulbIcon } from '../components/icons';

interface PlannerScreenProps {
    setActiveScreen: (screen: Screen) => void;
}

const PlannerScreen: React.FC<PlannerScreenProps> = ({ setActiveScreen }) => {
    const { t, lang } = useTranslations();
    const { plannerItems } = usePlanner();
    const { getCreationById } = useCreationHistory();
    const { setActiveTool, setInitialSocialPostTopic, setInitialImageGeneratorPrompt } = useMarketingTools();
    const [currentDate, setCurrentDate] = useState(new Date());

    const { month, year, daysInMonth, firstDayOfMonth } = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return {
            month: date.getMonth(),
            year: date.getFullYear(),
            daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
            firstDayOfMonth: date.getDay(),
        };
    }, [currentDate]);

    const monthName = useMemo(() => 
        new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(currentDate),
    [currentDate, lang]);

    const weekdays = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(lang, { weekday: 'short' });
        return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2023, 0, i + 1)));
    }, [lang]);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const scheduledItemsByDay = useMemo(() => {
        const map = new Map<number, PlannerItem[]>();
        plannerItems.forEach(item => {
            const itemDate = new Date(item.scheduledDateTime);
            if (itemDate.getFullYear() === year && itemDate.getMonth() === month) {
                const day = itemDate.getDate();
                if (!map.has(day)) map.set(day, []);
                map.get(day)?.push(item);
            }
        });
        return map;
    }, [plannerItems, year, month]);

    const toolIcons: { [key in Tool]: React.ElementType } = {
        'campaign-generator': WrenchScrewdriverIcon,
        'social-post-assistant': ChatBubbleLeftRightIcon,
        'image-editor': PhotoIcon,
        'image-generator': SparklesIcon,
        'video-generator': VideoCameraIcon,
        'competitor-analysis': MagnifyingGlassIcon,
        'content-repurposing': DocumentDuplicateIcon,
        'content-strategist': LightBulbIcon,
    };
    
    const toolColors: { [key in Tool]: string } = {
        'campaign-generator': 'bg-indigo-500',
        'social-post-assistant': 'bg-purple-500',
        'image-editor': 'bg-pink-500',
        'image-generator': 'bg-orange-500',
        'video-generator': 'bg-teal-500',
        'competitor-analysis': 'bg-sky-500',
        'content-repurposing': 'bg-violet-500',
        'content-strategist': 'bg-amber-500',
    };

    const handleGenerateFromIdea = (item: PlannerItem) => {
        if (!item.contentIdea) return;
        
        let tool: Tool | null = null;
        switch(item.format) {
            case 'Post':
            case 'Story':
                tool = 'social-post-assistant';
                setInitialSocialPostTopic(item.contentIdea);
                break;
            case 'Video':
                tool = 'video-generator';
                // You might need a way to set initial prompt for video too
                break;
            case 'Article': // Let's map Article to an image for now
            default:
                tool = 'image-generator';
                setInitialImageGeneratorPrompt(item.contentIdea);
                break;
        }

        if (tool) {
            setActiveTool(tool);
            setActiveScreen('tools');
        }
    };

    const today = new Date();
    const isToday = (day: number) => 
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8 h-full flex flex-col">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.plannerTitle}</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.plannerSubtitle}</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <ArrowLeftIcon className={`w-6 h-6 ${lang === 'ar' ? 'transform rotate-180' : ''}`} />
                    </button>
                    <h2 className="text-xl font-bold">{monthName}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                         <ArrowLeftIcon className={`w-6 h-6 ${lang === 'ar' ? '' : 'transform rotate-180'}`} />
                    </button>
                </div>

                {plannerItems.length === 0 ? (
                     <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                        <CalendarDaysIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-300">{t.plannerEmptyState}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{t.plannerEmptyStateDesc}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-gray-600 dark:text-gray-400">
                            {weekdays.map(day => <div key={day} className="py-2">{day}</div>)}
                        </div>
                        
                        <div className="grid grid-cols-7 grid-rows-5 gap-1 flex-grow">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="border-t border-gray-200/80 dark:border-white/10"></div>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                                const day = dayIndex + 1;
                                const items = scheduledItemsByDay.get(day) || [];
                                return (
                                    <div key={day} className={`border-t border-gray-200/80 dark:border-white/10 p-2 relative ${isToday(day) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                        <span className={`font-medium ${isToday(day) ? 'text-indigo-600 dark:text-indigo-300 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{day}</span>
                                        <div className="mt-1 space-y-1">
                                            {items.map((item) => {
                                                const creation = item.creationId ? getCreationById(item.creationId) : null;
                                                const time = new Date(item.scheduledDateTime).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false});
                                                
                                                if (creation) {
                                                    const Icon = toolIcons[creation.tool];
                                                    return (
                                                        <div key={item.id} className={`${toolColors[creation.tool]} text-white text-xs rounded-md px-2 py-1 flex items-center gap-1.5`}>
                                                            <Icon className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate">{time}</span>
                                                        </div>
                                                    );
                                                } else { // It's a planned idea
                                                    return (
                                                        <div key={item.id} className="group relative border-2 border-dashed border-gray-400/70 dark:border-gray-500/70 rounded-md p-1.5 text-xs text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/10" onClick={() => handleGenerateFromIdea(item)}>
                                                            <p className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{t.plannerIdea}</p>
                                                            <p className="text-gray-500 dark:text-gray-400 truncate">{item.title}</p>
                                                            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex-col items-center justify-center hidden group-hover:flex">
                                                                <span className="font-bold text-indigo-500">{t.generateButton} &rarr;</span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlannerScreen;