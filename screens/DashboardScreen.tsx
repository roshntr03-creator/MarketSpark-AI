/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Screen } from '../types/index';
import { useTranslations } from '../contexts/LanguageProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { WrenchScrewdriverIcon } from '../components/icons';

interface DashboardScreenProps {
  setActiveScreen: (screen: Screen) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveScreen }) => {
    const { t } = useTranslations();
    const { rawStats, recentActivity } = useUsageStats();
    const { history } = useCreationHistory();
    
    const totalCreations = Object.values(rawStats).reduce((sum, count) => sum + (count || 0), 0);
    const recentCreations = history.slice(0, 5);

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.dashboardTitle}</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.dashboardSubtitle}</p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main CTA */}
                    <div className="md:col-span-2 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                         <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full mb-4">
                            <WrenchScrewdriverIcon className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ready to create?</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Jump into our suite of AI tools and start building your next marketing masterpiece.</p>
                        <button 
                            onClick={() => setActiveScreen('tools')}
                            className="mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
                        >
                            Explore Tools
                        </button>
                    </div>

                    {/* Total Creations */}
                     <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">{t.totalCreations}</h3>
                        <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 mt-2">{totalCreations}</p>
                     </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.recentCreations}</h2>
                     <div className="mt-4 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4 space-y-3">
                        {recentCreations.length > 0 ? (
                            recentCreations.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{t[item.tool as keyof typeof t] || item.tool.replace(/-/g, ' ')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveScreen('tools')}
                                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Create again
                                    </button>
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
