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
import { supabase } from '../lib/supabaseClient';
import Spinner from './Spinner';

const VideoGeneratorResultsScreen: React.FC = () => {
    const { videoGenerationResult, setVideoGenerationResult } = useMarketingTools();
    const { t } = useTranslations();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [playbackError, setPlaybackError] = useState<string | null>(null);
    const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
    const [isLoadingLocalUrl, setIsLoadingLocalUrl] = useState(false);

    if (!videoGenerationResult) {
        return null;
    }

    const { result, creation } = videoGenerationResult;
    const { videoUri, prompt } = result;

    useEffect(() => {
        let objectUrl: string | null = null;
        
        const loadVideoAsBlob = async () => {
            if (!videoUri) {
                setPlaybackError("The video URI is missing.");
                return;
            };

            // This approach downloads the video as a blob to bypass potential CORS issues
            // when streaming directly from the public URL.
            try {
                setIsLoadingLocalUrl(true);
                setPlaybackError(null);

                // Extract path from the public URL
                const url = new URL(videoUri);
                const path = url.pathname.split('/public/generated_creations/')[1];
                
                if (!path) {
                    throw new Error("Could not parse video path from URL.");
                }

                const { data: blob, error } = await supabase.storage
                    .from('generated_creations')
                    .download(path);

                if (error) throw error;
                if (!blob) throw new Error("Downloaded file is empty.");

                objectUrl = URL.createObjectURL(blob);
                setLocalVideoUrl(objectUrl);

            } catch (err) {
                console.error("Failed to load video as blob:", err);
                // Fallback to trying the direct URL if blob download fails, with an error message.
                setLocalVideoUrl(videoUri); 
                setPlaybackError(`Failed to load video. This is likely a CORS or permissions issue in Supabase Storage settings. Error: ${err.message}`);
            } finally {
                setIsLoadingLocalUrl(false);
            }
        };

        loadVideoAsBlob();

        return () => {
            // Cleanup the object URL to prevent memory leaks
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [videoUri]);

    const handleStartNew = () => {
        setVideoGenerationResult(null);
    };
    
    const handleDownload = async () => {
        if (!videoUri) {
            alert("Video source is not available.");
            return;
        }
        setIsDownloading(true);
        try {
            // Extract path from the public URL
            const url = new URL(videoUri);
            const path = url.pathname.split('/public/generated_creations/')[1];
            if (!path) throw new Error("Could not parse video path from URL.");

            // Use Supabase client to download, which handles auth and bypasses CORS
            const { data: blob, error } = await supabase.storage
                .from('generated_creations')
                .download(path);
            
            if (error) throw error;
            if (!blob) throw new Error("Downloaded file is empty.");

            // Create a temporary link to trigger the download
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = `generated-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            alert(`Failed to download video. Please check the console for details. Error: ${error.message}`);
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
                        {isLoadingLocalUrl ? (
                            <div className="text-center p-4">
                                <Spinner />
                                <p className="mt-4 text-gray-400">Loading video securely...</p>
                            </div>
                        ) : playbackError ? (
                            <div className="text-center text-red-400 p-4">
                                <p className="font-bold">Failed to load video</p>
                                <p className="text-sm">{playbackError}</p>
                            </div>
                        ) : localVideoUrl ? (
                            <video 
                                src={localVideoUrl}
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
                        disabled={isDownloading || !localVideoUrl}
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