import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';
import ScheduleModal from './ScheduleModal';
import { PlusCircleIcon } from './icons';

const ImageEditorResultsScreen: React.FC = () => {
    const { imageEditResult, setImageEditResult } = useMarketingTools();
    const { t } = useTranslations();
    const [isScheduling, setIsScheduling] = useState(false);

    if (!imageEditResult) {
        return null;
    }

    const { result, creation } = imageEditResult;
    const { original, edited, prompt, responseText } = result;

    const handleStartNew = () => {
        setImageEditResult(null);
    };
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = edited;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-8">
            {isScheduling && (
                <ScheduleModal
                    creation={creation}
                    onClose={() => setIsScheduling(false)}
                />
            )}
            <ToolHeader title={t.imageEditorResultsTitle} onBack={handleStartNew} />

            <div className="px-4 sm:px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Original Image */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-300">{t.originalImage}</h2>
                        <img src={original} alt="Original" className="rounded-lg w-full object-contain" />
                    </div>
                    {/* Edited Image */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-300">{t.editedImage}</h2>
                        <img src={edited} alt="Edited" className="rounded-lg w-full object-contain" />
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
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

                <div className="space-y-4 max-w-4xl mx-auto mt-8">
                    {/* Prompt */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">{t.yourPrompt}</h3>
                        <p className="text-gray-700 dark:text-gray-300 italic">"{prompt}"</p>
                    </div>
                    {/* AI Text Response */}
                    {responseText && (
                        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">{t.aiResponse}</h3>
                            <p className="text-gray-700 dark:text-gray-300">{responseText}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditorResultsScreen;