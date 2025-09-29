/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { editImage } from '../services/geminiService';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import type { EditedImage } from '../types/index';
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

const ImageEditorScreen: React.FC = () => {
    const { t, lang } = useTranslations();
    const { setImageEditResult, setActiveTool, initialImageForEditor, setInitialImageForEditor } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clearUploader, setClearUploader] = useState(0);

    const suggestions = [
        t.suggestionRemoveBg,
        t.suggestionBw,
        t.suggestionVintage,
        t.suggestionBeachBg,
    ];

    useEffect(() => {
        const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            return new File([blob], fileName, { type: blob.type });
        };

        if (initialImageForEditor) {
            setImagePreview(initialImageForEditor.edited);
            setPrompt(initialImageForEditor.prompt);
            // Convert data URL back to a File object for `editImage` service
            dataUrlToFile(initialImageForEditor.edited, `edited-image-${Date.now()}.png`)
                .then(file => setImageFile(file));
            // Clear the initial state to prevent re-triggering
            setInitialImageForEditor(null);
        }
    }, [initialImageForEditor, setInitialImageForEditor]);


    useEffect(() => {
        if (!imageFile) {
            setImagePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const runImageEdit = async () => {
        if (!imageFile || !prompt) {
            setError('Image and prompt are required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const base64Image = await fileToBase64(imageFile);
            const result = await editImage(base64Image, imageFile.type, prompt, brandPersona, lang);
            
            const resultPayload: EditedImage = {
                original: `data:${imageFile.type};base64,${base64Image}`,
                edited: `data:${imageFile.type};base64,${result.editedImageBase64}`,
                prompt: prompt,
                responseText: result.text || undefined,
            };
            const creation = addCreation('image-editor', resultPayload);
            setImageEditResult({ result: resultPayload, creation });
            incrementToolUsage('image-editor');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runImageEdit();
    };

    const handleClearImage = () => {
        setImageFile(null);
        setClearUploader(c => c + 1);
        setPrompt('');
    };
    
    if (isLoading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} onRetry={runImageEdit} />;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <ToolHeader title={t.imageEditorScreenTitle} onBack={() => setActiveTool(null)} />
            <div className="px-4 sm:px-0">
                {!imagePreview ? (
                    <>
                        <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.imageEditorScreenSubtitle}</p>
                        <ImageUploader onImageUpload={setImageFile} clearTrigger={clearUploader} />
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                 <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Image</h2>
                                <img src={imagePreview} alt="Selected preview" className="rounded-lg w-full object-contain" />
                                 <button
                                    type="button"
                                    onClick={handleClearImage}
                                    className="w-full bg-gray-600/50 hover:bg-gray-700/60 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                >
                                    {t.clearImageButton}
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="prompt" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.imagePromptLabel}</label>
                                    <textarea
                                        id="prompt"
                                        rows={4}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={t.imagePromptPlaceholder}
                                        className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{t.promptSuggestions}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setPrompt(s)}
                                                className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !prompt}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                >
                                    {t.generateImageButton}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
export default ImageEditorScreen;