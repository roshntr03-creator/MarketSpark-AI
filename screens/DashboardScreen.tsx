/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { WrenchScrewdriverIcon } from '../components/icons';
// FIX: Corrected the import path for the Screen and Tool types. They are defined in types/index.ts.
import type { Screen, Tool } from '../types/index';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { generateDailyTip } from '../services/geminiService';

interface DashboardScreenProps {
    setActiveScreen: (screen: Screen) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveScreen }) => {
    const { t, lang } = useTranslations();
    const { rawStats } = useUsageStats();
    const [tip, setTip] = useState<string>('');
    const [isTipLoading, setIsTipLoading] = useState(true);

    const stats = useMemo(() => {
        const campaignsCreated = rawStats['campaign-generator'] || 0;
        const assetsGenerated = Object.entries(rawStats).reduce((total, [tool, count]) => {
            if (tool !== 'campaign-generator') {
                return total + (count || 0);
            }
            return total;
        }, 0);
        
        const mostUsedToolEntry = Object.keys(rawStats).length > 0
            ? Object.entries(rawStats).sort((a, b) => (b[1] || 0) - (a[1] || 0))[0]
            : null;

        const mostUsedToolKey = mostUsedToolEntry ? mostUsedToolEntry[0] as Tool : null;
        
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
        const mostUsedTool = mostUsedToolKey ? toolKeyMap[mostUsedToolKey] : 'N/A';

        return { campaignsCreated, assetsGenerated, mostUsedTool };
    }, [rawStats, t]);

    useEffect(() => {
        const fetchTip = async () => {
            setIsTipLoading(true);
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const cachedTipData = localStorage.getItem('dailyMarketingTip');
            
            if (cachedTipData) {
                try {
                    const { date, tip, language } = JSON.parse(cachedTipData);
                    if (date === today && language === lang) {
                        setTip(tip);
                        setIsTipLoading(false);
                        return;
                    }
                } catch (e) {
                     console.error("Failed to parse cached tip", e);
                }
            }
            
            try {
                const newTip = await generateDailyTip(lang);
                setTip(newTip);
                localStorage.setItem('dailyMarketingTip', JSON.stringify({ date: today, tip: newTip, language: lang }));
            } catch (error) {
                console.error("Failed to fetch new marketing tip:", error);
                setTip(t.dashboardTipContent); // Fallback to default tip
            } finally {
                setIsTipLoading(false);
            }
        };

        fetchTip();
    }, [lang, t.dashboardTipContent]);


    return (
        <div className="animate-fade-in space-y-8 p-4 sm:p-6 md:p-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.dashboardWelcome}</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.dashboardTipTitle}</p>
            </div>

            {/* Daily Tip Card */}
            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 min-h-[6rem] flex items-center justify-center">
                <p className="text-gray-700 dark:text-gray-300 text-center">
                    {isTipLoading ? '...' : tip}
                </p>
            </div>

            {/* Featured Tool Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-900/50 dark:to-transparent border border-indigo-200 dark:border-indigo-700/50 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                    <div className="p-4 bg-indigo-500/20 rounded-full">
                        <WrenchScrewdriverIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />
                    </div>
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.dashboardFeaturedToolTitle}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{t.dashboardFeaturedToolDesc}</p>
                </div>
                <button 
                    onClick={() => setActiveScreen('tools')}
                    className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5">
                    {t.dashboardFeaturedToolButton}
                </button>
            </div>
            
            {/* Stats Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.dashboardStatsTitle}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.dashboardAssetsGenerated}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.assetsGenerated.toLocaleString(lang)}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.dashboardCampaignsCreated}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.campaignsCreated.toLocaleString(lang)}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.dashboardMostUsedTool}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">{stats.mostUsedTool}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardScreen;