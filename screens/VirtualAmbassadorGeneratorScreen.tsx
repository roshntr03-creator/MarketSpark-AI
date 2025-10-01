/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { startVideoGeneration, checkVideoGenerationStatus } from '../services/geminiService';
import ErrorScreen from '../components/ErrorScreen';
import ToolHeader from '../components/ToolHeader';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useBrand } from '../contexts/BrandProvider';
import type { GeneratedVideo } from '../types/index';
import { avatars } from '../lib/avatars'; // Placeholder for avatar library

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number; }> = ({ currentStep, totalSteps }) => (
    <div className="flex justify-center items-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
            <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${index < currentStep ? 'bg-indigo-500 w-8' : 'bg-gray-300 dark:bg-gray-600 w-2'}`}
            ></div>
        ))}
    </div>
);

const VideoLoadingScreen: React.FC = () => {
    const { t } = useTranslations();
    const messages = [t.videoLoadingSubtitle1, t.videoLoadingSubtitle2, t.videoLoadingSubtitle3];
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 7000);

        return () => clearInterval(intervalId);
    }, [messages.length]);

    return (
        <div className="text-center animate-fade-in flex flex-col items-center justify-center h-full py-16">
            <div className="loader mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{t.loadingTitle}</h2>
            <p className="text-md text-gray-600 dark:text-gray-400 max-w-md mt-2">{messages[messageIndex]}</p>
        </div>
    );
};


const UGCVideoGeneratorScreen: React.FC = () => {
    const { t, lang } = useTranslations();
    const { setVideoGenerationResult, setActiveTool } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();

    const [step, setStep] = useState(1);
    const [script, setScript] = useState('');
    const [voiceStyle, setVoiceStyle] = useState(t.styleFriendly);
    const [background, setBackground] = useState(t.bgHomeOffice);
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number | null>(null);

    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);

     useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

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
                    prompt: script, // Use script as the prompt for context
                };
                const creation = addCreation('virtual-ambassador-generator', resultPayload);
                setVideoGenerationResult({ result: resultPayload, creation });
                incrementToolUsage('virtual-ambassador-generator');
            } else {
                setError("Video generation finished, but no video was returned. The request may have been refused or the prompt was unsafe.");
            }
        }

        return () => clearTimeout(timeoutId);

    }, [isPolling, operation, script, setVideoGenerationResult, incrementToolUsage, addCreation]);

    const handleGenerateVideo = async () => {
        if (selectedAvatarIndex === null || !script) {
            setError('Script and avatar selection are required.');
            return;
        }
        setIsPolling(true);
        setError(null);

        const selectedAvatar = avatars[selectedAvatarIndex];
        const avatarDescription = lang === 'ar' ? selectedAvatar.description_ar : selectedAvatar.description;
        const audioLanguage = lang === 'ar' ? 'Arabic' : 'English';

        const fullPrompt = lang === 'ar'
            ? `أنشئ فيديو UGC رأسي بنسبة 9:16 يظهر شخصًا واقعيًا. الشخص هو: ${avatarDescription}. يتحدث مباشرة إلى الكاميرا في ${background}. نبرة صوته ${voiceStyle}. يقول النص التالي: "${script}". يجب أن يبدو الفيديو أصيلًا، كشخص حقيقي يشارك تجربته. يجب أن يكون الصوت كلامًا واضحًا وطبيعيًا باللغة العربية.`
            : `Create a 9:16 vertical UGC-style video featuring a realistic person. The person is: ${avatarDescription}. They are speaking directly to the camera in a ${background}. Their tone is ${voiceStyle}. They are saying the following script: "${script}". The video should feel authentic, like a real person sharing their experience. The audio must be clear, natural-sounding speech in ${audioLanguage}.`;


        try {
            const imagePayload = {
                base64: selectedAvatar.base64,
                mimeType: selectedAvatar.mimeType,
            };
            const initialOp = await startVideoGeneration(fullPrompt, imagePayload, brandPersona, lang);
            setOperation(initialOp);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsPolling(false);
        }
    };
    
    const scriptTemplates = [
        { name: t.ugcScriptTemplate1.substring(0,15), value: t.ugcScriptTemplate1 },
        { name: t.ugcScriptTemplate2.substring(0,15), value: t.ugcScriptTemplate2 },
        { name: t.ugcScriptTemplate3.substring(0,15), value: t.ugcScriptTemplate3 },
    ];

    if (isPolling) return <VideoLoadingScreen />;
    if (error) return <ErrorScreen error={error} onRetry={() => { setError(null); setIsPolling(false); }} />;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.ugcVideoGeneratorScreenTitle} onBack={() => step === 1 ? setActiveTool(null) : setStep(1)} />
            <div className="px-4 sm:px-0 flex-grow">
                <StepIndicator currentStep={step} totalSteps={2} />

                {step === 1 && (
                    <div className="animate-fade-in space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.step1UgcTitle}</h2>
                        <p className="text-md text-gray-600 dark:text-gray-400 -mt-4">{t.step1UgcSubtitle}</p>
                        <div>
                            <label htmlFor="script" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.videoScriptLabel}</label>
                            <textarea id="script" rows={5} value={script} onChange={(e) => setScript(e.target.value)} placeholder={t.videoScriptPlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition text-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.scriptSuggestions}</label>
                            <div className="flex flex-wrap gap-2">
                                {scriptTemplates.map(template => (
                                    <button key={template.name} type="button" onClick={() => setScript(template.value)} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900">
                                        {template.name}...
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="voiceStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.voiceStyleLabel}</label>
                                <select id="voiceStyle" value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition text-lg">
                                    <option>{t.styleFriendly}</option>
                                    <option>{t.styleConfident}</option>
                                    <option>{t.styleInformative}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="background" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.backgroundLabel}</label>
                                <select id="background" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition text-lg">
                                    <option>{t.bgHomeOffice}</option>
                                    <option>{t.bgStudio}</option>
                                    <option>{t.bgModernCafe}</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} disabled={!script} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 text-lg">
                            {t.nextStepButton}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.step2UgcTitle}</h2>
                        <p className="text-md text-gray-600 dark:text-gray-400 mb-6">{t.step2UgcSubtitle}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {avatars.map((avatar, index) => (
                                <div key={avatar.id} onClick={() => setSelectedAvatarIndex(index)} className={`rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${selectedAvatarIndex === index ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-indigo-400'}`}>
                                    <img src={avatar.dataUri} alt={avatar.description} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleGenerateVideo} disabled={selectedAvatarIndex === null} className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 text-lg">
                            {t.generateUgcVideoButton}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UGCVideoGeneratorScreen;