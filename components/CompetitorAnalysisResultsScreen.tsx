/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';

const CompetitorAnalysisResultsScreen: React.FC = () => {
    const { competitorAnalysisResult, setCompetitorAnalysisResult } = useMarketingTools();
    const { t } = useTranslations();

    if (!competitorAnalysisResult) {
        return null;
    }

    const { result } = competitorAnalysisResult;
    const { 
        competitorName, 
        analysisSummary, 
        toneOfVoice, 
        keyMarketingMessages, 
        contentStrengths, 
        contentWeaknesses, 
        differentiationOpportunities,
        sources 
    } = result;

    const handleStartNew = () => {
        setCompetitorAnalysisResult(null);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.competitorAnalysisResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{competitorName}</p>
                
                <div className="space-y-6">
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.analysisSummary}</h2>
                        <p className="text-gray-700 dark:text-gray-300">{analysisSummary}</p>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.toneOfVoice}</h2>
                        <p className="text-gray-700 dark:text-gray-300 italic">"{toneOfVoice}"</p>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.keyMarketingMessages}</h2>
                        <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                            {keyMarketingMessages.map((message, index) => <li key={index}>{message}</li>)}
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-green-500/20 dark:border-green-500/40 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-3">{t.contentStrengths}</h2>
                            <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                                {contentStrengths.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                         <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-red-500/20 dark:border-red-500/40 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">{t.contentWeaknesses}</h2>
                            <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                                {contentWeaknesses.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.differentiationOpportunities}</h2>
                        <ul className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                            {differentiationOpportunities.map((item, index) => <li key={index} className="pl-2">{item}</li>)}
                        </ul>
                    </div>

                     {sources && sources.length > 0 && (
                         <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">{t.sources}</h2>
                            <ul className="space-y-2 text-sm">
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 hover:underline">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompetitorAnalysisResultsScreen;