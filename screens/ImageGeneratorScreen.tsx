/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { generateImage } from '../services/geminiService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import type { GeneratedImage } from '../types/index';
import ToolHeader from '../components/ToolHeader';

const ImageGeneratorScreen: React.FC = () => {
    const { t } = useTranslations();
    const { setGeneratedImageResult, setActiveTool } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runGenerateImage = async () => {
        if (!prompt) {
            setError('Prompt is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateImage(prompt);
            
            const resultPayload: GeneratedImage = {
                image: `data:image/png;base64,${result.imageBase64}`,
                prompt: prompt,
            };
            setGeneratedImageResult(resultPayload);
            incrementToolUsage('image-generator');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runGenerateImage();
    };

    if (isLoading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} onRetry={runGenerateImage} />;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.imageGeneratorScreenTitle} onBack={() => setActiveTool(null)} />
            <div className="px-4 sm:px-0 flex-grow">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.imageGeneratorScreenSubtitle}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.imageGeneratorPromptLabel}</label>
                        <textarea
                            id="prompt"
                            rows={5}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t.imageGeneratorPromptPlaceholder}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !prompt}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {t.generateImageButton}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ImageGeneratorScreen;