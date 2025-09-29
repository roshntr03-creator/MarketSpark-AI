import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';
import ScheduleModal from './ScheduleModal';
import { PlusCircleIcon } from './icons';

const ImageEditorResultsScreen: React.FC = () => {
    const { imageEditResult, setImageEditResult, setInitialImageForEditor } = useMarketingTools();
    const { t } = useTranslations();
    const [isScheduling, setIsScheduling] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    if (!imageEditResult) {
        return null;
    }

    const { result, creation } = imageEditResult;
    const { original, edited, prompt, responseText } = result;

    const handleStartNew = () => {
        setImageEditResult(null);
    };

    const handleEditAgain = () => {
        if (imageEditResult) {
            setInitialImageForEditor(imageEditResult.result);
            setImageEditResult(null);
        }
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
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            {isScheduling && (
                <ScheduleModal
                    creation={creation}
                    onClose={() => setIsScheduling(false)}
                />
            )}
            <ToolHeader title={t.imageEditorResultsTitle} onBack={handleStartNew} />

            <div className="px-4 sm:px-0">
                <div className="space-y-4">
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-4 space-y-4">
                        <div className="relative group">
                            <img 
                                src={showOriginal ? original : edited} 
                                alt={showOriginal ? "Original" : "Edited"} 
                                className="rounded-lg w-full object-contain max-h-[70vh] transition-all duration-300" 
                            />
                            <button
                                onClick={() => setShowOriginal(!showOriginal)}
                                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white font-semibold py-2 px-4 rounded-full transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
                            >
                                {showOriginal ? t.showEdited : t.showOriginal}
                            </button>
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button 
                            onClick={handleEditAgain}
                            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
                        >
                            {t.editAgain}
                        </button>
                        <button
                            onClick={() => setIsScheduling(true)}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold py-3 px-6 rounded-lg transition-colors text-lg"
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

                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">{t.yourPrompt}</h3>
                        <p className="text-gray-700 dark:text-gray-300 italic">"{prompt}"</p>
                    </div>

                    {responseText && (
                        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-5">
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