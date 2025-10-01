/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';
import ScheduleModal from './ScheduleModal';
import { PlusCircleIcon } from './icons';
import Spinner from './Spinner';

const VideoGeneratorResultsScreen: React.FC = () => {
    const { videoGenerationResult, setVideoGenerationResult } = useMarketingTools();
    const { t } = useTranslations();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [isLoadingVideo, setIsLoadingVideo] = useState(true);
    const [videoError, setVideoError] = useState<string | null>(null);

    if (!videoGenerationResult) {
        return null;
    }

    const { result, creation } = videoGenerationResult;
    const { videoUri, prompt } = result;

    useEffect(() => {
        if (!videoUri) {
            setVideoError("Video URI is missing.");
            setIsLoadingVideo(false);
            return;
        }

        const processVideoUri = async () => {
            setIsLoadingVideo(true);
            setVideoError(null);
            try {
                // The backend now returns a data URI. We can use it directly for the src
                // and fetch it to create a blob for the download functionality.
                if (videoUri.startsWith('data:')) {
                    setVideoSrc(videoUri); 
                    
                    const response = await fetch(videoUri);
                    const blob = await response.blob();
                    setVideoBlob(blob);
                } else {
                    // Fallback for unexpected formats, though it shouldn't happen
                    throw new Error("Received an unexpected video URI format.");
                }
            } catch (error) {
                console.error("Failed to load video for playback:", error);
                setVideoError(error instanceof Error ? error.message : "Could not load video.");
            } finally {
                setIsLoadingVideo(false);
            }
        };

        processVideoUri();

    }, [videoUri]);


    const handleStartNew = () => {
        setVideoGenerationResult(null);
    };
    
    const handleDownload = async () => {
        if (!videoBlob) {
            alert("Video data is not available for download.");
            return;
        }
        setIsDownloading(true);
        try {
            const url = window.URL.createObjectURL(videoBlob);
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
            
            <div className="space-y-6 px-4 sm:px-0">
                 <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl overflow-hidden p-4">
                    <div className="w-full aspect-video rounded-lg bg-black flex items-center justify-center">
                        {isLoadingVideo ? (
                            <div className="text-center">
                                <Spinner />
                                <p className="text-gray-300 mt-4">Loading video...</p>
                            </div>
                        ) : videoError ? (
                            <div className="text-center text-red-400 p-4">
                                <p className="font-bold">Failed to load video</p>
                                <p className="text-sm">{videoError}</p>
                            </div>
                        ) : (
                            <video 
                                src={videoSrc || ''}
                                controls 
                                playsInline
                                className="w-full h-full"
                            />
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
                        disabled={isDownloading || !videoBlob}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? `${t.loadingTitle}...` : t.downloadVideo}
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