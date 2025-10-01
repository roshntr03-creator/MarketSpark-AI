/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';

const VirtualAmbassadorResultsScreen: React.FC = () => {
    const { virtualAmbassadorResult, setVirtualAmbassadorResult } = useMarketingTools();
    const { t } = useTranslations();

    if (!virtualAmbassadorResult) {
        return null;
    }

    const { result: ambassador } = virtualAmbassadorResult;

    const handleStartNew = () => {
        setVirtualAmbassadorResult(null);
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto pb-8">
            <ToolHeader title={t.virtualAmbassadorResultsTitle} onBack={handleStartNew} />
            
            <div className="space-y-6 px-4 sm:px-0">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-4">{t.virtualAmbassadorResultsSubtitle}</p>
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 text-center">
                     <img src={ambassador.faceImageUrl} alt={ambassador.name} className="w-40 h-40 rounded-full mx-auto object-cover mb-4 border-4 border-white dark:border-gray-700 shadow-lg" />
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{ambassador.name}</h2>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t.ambassadorBackstory}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{ambassador.backstory}</p>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t.ambassadorCommunicationStyle}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{ambassador.communicationStyle}</p>
                    </div>
                </div>
                 <button 
                    onClick={handleStartNew}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
                >
                    {t.createAnother}
                </button>
            </div>
        </div>
    );
};

export default VirtualAmbassadorResultsScreen;