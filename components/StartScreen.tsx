/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { generateCampaign } from '../services/geminiService';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import ToolHeader from './ToolHeader';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useBrand } from '../contexts/BrandProvider';

const CampaignGeneratorScreen: React.FC = () => {
    const { t } = useTranslations();
    const { setCampaignResult, setActiveTool } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // FIX: Extracted generation logic to a separate function that doesn't take an event.
    const runGenerateCampaign = async () => {
        if (!productName || !productDescription) {
            setError('Product name and description are required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const campaign = await generateCampaign({ name: productName, description: productDescription, targetAudience }, brandPersona);
            const creation = addCreation('campaign-generator', campaign);
            setCampaignResult({ result: campaign, creation });
            incrementToolUsage('campaign-generator');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await runGenerateCampaign();
    };

    if (isLoading) return <LoadingScreen />;
    // FIX: Pass a function without arguments to onRetry to match the expected signature.
    if (error) return <ErrorScreen error={error} onRetry={runGenerateCampaign} />;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.campaignGeneratorScreenTitle} onBack={() => setActiveTool(null)} />
            <div className="px-4 sm:px-0 flex-grow">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.campaignGeneratorScreenSubtitle}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.productNameLabel}</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder={t.productNamePlaceholder}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.productDescriptionLabel}</label>
                        <textarea
                            id="productDescription"
                            rows={4}
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder={t.productDescriptionPlaceholder}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.targetAudienceLabel}</label>
                        <input
                            type="text"
                            id="targetAudience"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder={t.targetAudiencePlaceholder}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {t.generateCampaignButton}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CampaignGeneratorScreen;