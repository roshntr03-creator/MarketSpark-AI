/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';
import ScheduleModal from './ScheduleModal';
import { PlusCircleIcon } from './icons';

const VideoGeneratorResultsScreen: React.FC = () => {
    const { videoGenerationResult, setVideoGenerationResult } = useMarketingTools();
    const { t } = useTranslations();
    const [isScheduling, setIsScheduling] = useState(false);

    if (!videoGenerationResult) {
        return null;
    }

    const { result, creation } = videoGenerationResult;
    const { videoUri, prompt } = result;

    const handleStartNew = () => {
        setVideoGenerationResult(null);
    };
    
    const handleDownload = () => {
        if (!videoUri) {
            alert("Video source is not available.");
            return;
        }
        // Since videoUri is now a direct public URL, we can use a simple anchor link to download.
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = videoUri;
        a.download = `generated-video-${Date.now()}.mp4`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            {isScheduling && (
                <ScheduleModal
                    creation={creation}
                    onClose={() => setIsScheduling(false)}
                />
            )}
            <ToolHeader title={t.videoGeneratorResultsTitle} onBack={handleStartNew} />
            
            <div className="space-y-6 px-4 sm:px-0">
                 <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl overflow-hidden p-4">
                    <div className="w-full aspect-video rounded-lg bg-black flex items-center justify-center">
                        {videoUri ? (
                            <video 
                                key={videoUri} // Use key to force re-render when src changes
                                src={videoUri}
                                controls 
                                playsInline
                                className="w-full h-full"
                            />
                        ) : (
                             <div className="text-center text-gray-400 p-4">
                                <p className="font-bold">Video Not Available</p>
                            </div>
                        )}
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
                        disabled={!videoUri}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.downloadVideo}
                    </button>
                </div>
            
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{t.yourPrompt}</h3>
                    <p className="text-gray-700 dark:text-gray-300 italic">"{prompt}"</p>
                </div>
            </div>
        </div>
    );
};

export default VideoGeneratorResultsScreen;