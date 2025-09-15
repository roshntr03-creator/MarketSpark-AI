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
    const [isDownloading, setIsDownloading] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);

    if (!videoGenerationResult) {
        return null;
    }

    const { result, creation } = videoGenerationResult;
    const { videoUri, prompt } = result;
    // The API key must be appended to the video URI to fetch it
    const videoUrl = `${videoUri}&key=${process.env.API_KEY}`;

    const handleStartNew = () => {
        setVideoGenerationResult(null);
    };
    
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `generated-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download video.");
        } finally {
            setIsDownloading(false);
        }
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
            
            <div className="space-y-4 px-4 sm:px-0">
                 <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl overflow-hidden">
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay
                        loop
                        className="w-full max-h-[70vh]"
                    />
                 </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? `${t.loadingTitle}...` : t.downloadVideo}
                    </button>
                    <button
                        onClick={() => setIsScheduling(true)}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                        {t.addToPlannerButton}
                    </button>
                </div>
            
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                    <h3 className="text-end text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t.yourPrompt}</h3>
                    <p className="text-center text-xl text-gray-800 dark:text-gray-200 mt-2 italic">"{prompt}"</p>
                </div>
            </div>
        </div>
    );
};

export default VideoGeneratorResultsScreen;