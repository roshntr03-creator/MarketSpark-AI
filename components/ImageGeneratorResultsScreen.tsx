/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';

const ImageGeneratorResultsScreen: React.FC = () => {
    const { generatedImageResult, setGeneratedImageResult } = useMarketingTools();
    const { t } = useTranslations();

    if (!generatedImageResult) {
        return null;
    }

    const { image, prompt } = generatedImageResult;

    const handleStartNew = () => {
        setGeneratedImageResult(null);
    };
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.imageGeneratorResultsTitle} onBack={handleStartNew} />
            
            <div className="space-y-4 px-4 sm:px-0">
                 <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4">
                    <img src={image} alt={prompt} className="rounded-lg w-full object-contain max-h-[70vh]" />
                 </div>
                 <button 
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 text-lg"
                >
                    {t.downloadImage}
                </button>
            
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">{t.yourPrompt}</h3>
                    <p className="text-gray-700 dark:text-gray-300 italic">"{prompt}"</p>
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorResultsScreen;