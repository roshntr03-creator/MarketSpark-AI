/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { startVideoGeneration, checkVideoGenerationStatus } from '../services/geminiService';
import ErrorScreen from '../components/ErrorScreen';
import type { GeneratedVideo } from '../types/index';
import ToolHeader from '../components/ToolHeader';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useBrand } from '../contexts/BrandProvider';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const VideoLoadingScreen: React.FC = () => {
    const { t } = useTranslations();
    const messages = [t.videoLoadingSubtitle1, t.videoLoadingSubtitle2, t.videoLoadingSubtitle3];
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 7000); // Change message every 7 seconds

        return () => clearInterval(intervalId);
    }, [messages.length]);

    return (
        <div className="text-center animate-fade-in flex flex-col items-center justify-center h-full">
            <div className="loader mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{t.loadingTitle}</h2>
            <p className="text-md text-gray-600 dark:text-gray-400 max-w-md mt-2">{messages[messageIndex]}</p>
        </div>
    );
};

const VideoGeneratorScreen: React.FC = () => {
    const { t } = useTranslations();
    const { setVideoGenerationResult, setActiveTool } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();

    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);
    
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const poll = async (op: any) => {
            try {
                const updatedOp = await checkVideoGenerationStatus(op);
                setOperation(updatedOp);
            } catch (err) {
                 setError(err instanceof Error ? err.message : 'An unknown error occurred during polling.');
                 setIsPolling(false);
            }
        };

        if (isPolling && operation && !operation.done) {
            timeoutId = setTimeout(() => poll(operation), 10000); // Poll every 10 seconds
        } else if (operation && operation.done) {
            setIsPolling(false);
            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                const resultPayload: GeneratedVideo = {
                    videoUri: operation.response.generatedVideos[0].video.uri,
                    prompt: prompt,
                };
                const creation = addCreation('video-generator', resultPayload);
                setVideoGenerationResult({ result: resultPayload, creation });
                incrementToolUsage('video-generator');
            } else {
                setError("Video generation finished, but no video was returned. The request may have been refused.");
            }
        }

        return () => clearTimeout(timeoutId);

    }, [isPolling, operation, prompt, setVideoGenerationResult, incrementToolUsage, addCreation]);

    const runGenerateVideo = async () => {
        if (!prompt) {
            setError('Prompt is required.');
            return;
        }
        setIsPolling(true);
        setError(null);
        try {
            let imagePayload;
            if (imageFile) {
                const base64 = await fileToBase64(imageFile);
                imagePayload = { base64, mimeType: imageFile.type };
            }
            const initialOp = await startVideoGeneration(prompt, imagePayload, brandPersona);
            setOperation(initialOp);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsPolling(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runGenerateVideo();
    };

    if (isPolling) return <VideoLoadingScreen />;
    if (error) return <ErrorScreen error={error} onRetry={runGenerateVideo} />;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.videoGeneratorScreenTitle} onBack={() => setActiveTool(null)} />
            <div className="px-4 sm:px-0 flex-grow">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.videoGeneratorScreenSubtitle}</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.videoGeneratorPromptLabel}</label>
                        <textarea
                            id="prompt"
                            rows={5}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t.videoGeneratorPromptPlaceholder}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.videoGeneratorImagePrompt}</label>
                        <ImageUploader onImageUpload={setImageFile} />
                    </div>
                    <button
                        type="submit"
                        disabled={isPolling || !prompt}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {t.generateVideoButton}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VideoGeneratorScreen;