import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';
import ScheduleModal from './ScheduleModal';
import { PlusCircleIcon } from './icons';

const ImageGeneratorResultsScreen: React.FC = () => {
    const { generatedImageResult, setGeneratedImageResult } = useMarketingTools();
    const { t } = useTranslations();
    const [isScheduling, setIsScheduling] = useState(false);

    if (!generatedImageResult) {
        return null;
    }

    const { result, creation } = generatedImageResult;
    const { image, prompt } = result;

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
            {isScheduling && (
                <ScheduleModal
                    creation={creation}
                    onClose={() => setIsScheduling(false)}
                />
            )}
            <ToolHeader title={t.imageGeneratorResultsTitle} onBack={handleStartNew} />
            
            <div className="space-y-6 px-4 sm:px-0">
                 <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4 space-y-4">
                    <img src={image} alt={prompt} className="rounded-lg w-full object-contain max-h-[70vh]" />
                     <div>
                        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{t.yourPrompt}</h3>
                        <p className="text-gray-700 dark:text-gray-300 italic">"{prompt}"</p>
                    </div>
                 </div>
                <div className="flex flex-col-reverse sm:flex-row gap-4">
                    <button
                        onClick={() => setIsScheduling(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                        <span>{t.addToPlannerButton}</span>
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 text-lg"
                    >
                        {t.downloadImage}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorResultsScreen;