/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import ToolHeader from './ToolHeader';
import type { PromptSuggestion, Tool } from '../types/index';
import { SparklesIcon } from './icons';

const kebabToCamel = (str: string) => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

const PromptEnhancerResultsScreen: React.FC = () => {
    const { 
        promptEnhancerResult, setPromptEnhancerResult, setActiveTool,
        setInitialImageGeneratorPrompt, setInitialSocialPostTopic, setInitialCampaignData
    } = useMarketingTools();
    const { t } = useTranslations();
    const { copy, copiedText } = useCopyToClipboard();

    if (!promptEnhancerResult) return null;

    const { result } = promptEnhancerResult;

    const handleStartNew = () => setPromptEnhancerResult(null);

    const handleUsePrompt = (suggestion: PromptSuggestion) => {
        const { promptText, targetTool } = suggestion;
        
        // This is a simplified mapping. A more complex app might have a more robust system.
        if (targetTool === 'image-generator') {
            setInitialImageGeneratorPrompt(promptText);
        } else if (targetTool === 'social-post-assistant') {
            setInitialSocialPostTopic(promptText);
        } else if (targetTool === 'campaign-generator') {
            // Campaign needs more than a simple prompt, we can pre-fill description.
            setInitialCampaignData({ name: '', description: promptText });
        }
        // ... add cases for other tools as needed
        
        setActiveTool(targetTool);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.promptEnhancerResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.enhancementSuggestions}</p>
                <div className="space-y-6">
                    {result.map((suggestion, index) => (
                        <div key={index} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                            <div className="flex justify-between items-start gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Suggestion for <span className="text-indigo-600 dark:text-indigo-300">{t[kebabToCamel(suggestion.targetTool) as keyof typeof t] || suggestion.targetTool}</span></h3>
                                </div>
                                <div className="flex-shrink-0 flex gap-2">
                                     <button
                                        onClick={() => copy(suggestion.promptText, `prompt-${index}`)}
                                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                                    >
                                        {copiedText === `prompt-${index}` ? t.copied : t.copy}
                                    </button>
                                     <button
                                        onClick={() => handleUsePrompt(suggestion)}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                                    >
                                        {t.usePromptButton}
                                    </button>
                                </div>
                            </div>
                             <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{suggestion.promptText}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromptEnhancerResultsScreen;
