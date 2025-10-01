/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { generateAmbassadorFaces, generateAmbassadorProfile, saveAmbassador, generateAmbassadorPerformance } from '../services/geminiService';
import ErrorScreen from '../components/ErrorScreen';
import ToolHeader from '../components/ToolHeader';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useBrand } from '../contexts/BrandProvider';
import Spinner from '../components/Spinner';

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number; }> = ({ currentStep, totalSteps }) => (
    <div className="flex justify-center items-center gap-2 mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
            <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${index < currentStep ? 'bg-indigo-500 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2'}`}
            ></div>
        ))}
    </div>
);

const VirtualAmbassadorGeneratorScreen: React.FC = () => {
    const { t, lang } = useTranslations();
    const { setVirtualAmbassadorResult, setActiveTool } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();

    const [step, setStep] = useState(1);
    const [description, setDescription] = useState('');
    const [audience, setAudience] = useState('');
    const [generatedFaces, setGeneratedFaces] = useState<string[]>([]);
    const [selectedFace, setSelectedFace] = useState<string | null>(null);
    const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
    const [profile, setProfile] = useState<{ name: string, backstory: string, communicationStyle: string, voiceDescription: string } | null>(null);
    const [performanceContent, setPerformanceContent] = useState('');
    const [performanceResult, setPerformanceResult] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGenerateFaces = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            setError('Ambassador description is required.');
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Generating appearances...');
        setError(null);
        try {
            const result = await generateAmbassadorFaces(`${description}, targeted for ${audience}`, brandPersona, lang);
            setGeneratedFaces(result.faces);
            setStep(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateProfile = async () => {
        if (selectedFace === null) return;
        setIsLoading(true);
        setLoadingMessage('Building profile...');
        setError(null);
        try {
            const result = await generateAmbassadorProfile(description, brandPersona, lang);
            setProfile(result);
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePerformancePreview = async () => {
        if (!profile || !performanceContent) return;
        setIsLoading(true);
        setLoadingMessage('Generating performance preview...');
        setError(null);
        try {
            const result = await generateAmbassadorPerformance(profile, performanceContent, lang);
            setPerformanceResult(result.performanceText);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveAmbassador = async () => {
        if (!profile || !selectedFace) return;
        setIsLoading(true);
        setLoadingMessage('Saving your new ambassador...');
        setError(null);
        try {
            const finalAmbassador = await saveAmbassador({
                name: profile.name,
                backstory: profile.backstory,
                communicationStyle: profile.communicationStyle,
                voiceDescription: profile.voiceDescription,
                bodyImageBase64: selectedFace,
                coreDescription: description,
            });
            const creation = addCreation('virtual-ambassador-generator', finalAmbassador);
            setVirtualAmbassadorResult({ result: finalAmbassador, creation });
            incrementToolUsage('virtual-ambassador-generator');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.step1Title}</h2>
                        <p className="text-md text-gray-600 dark:text-gray-400 mb-6">{t.step1Subtitle}</p>
                        <form onSubmit={handleGenerateFaces} className="space-y-6">
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.ambassadorDescriptionLabel}</label>
                                <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.ambassadorDescriptionPlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition text-lg" required />
                            </div>
                             <div>
                                <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.ambassadorAudienceLabel}</label>
                                <input type="text" id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t.ambassadorAudiencePlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition text-lg" required />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 text-lg">
                                {t.generateFacesButton}
                            </button>
                        </form>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.step2Title}</h2>
                        <p className="text-md text-gray-600 dark:text-gray-400 mb-6">{t.step2Subtitle}</p>
                        <div className="grid grid-cols-2 gap-4">
                            {generatedFaces.map((face, index) => (
                                <div key={index} onClick={() => { setSelectedFace(face); setSelectedFaceIndex(index); }} className={`rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${selectedFaceIndex === index ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-indigo-400'}`}>
                                    <img src={`data:image/png;base64,${face}`} alt={`Generated face ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleGenerateProfile} disabled={selectedFace === null || isLoading} className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 text-lg">
                            {t.confirmFaceButton}
                        </button>
                    </div>
                );
            case 3:
                return (
                     <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.step3Title}</h2>
                        <p className="text-md text-gray-600 dark:text-gray-400 mb-6">{t.step3Subtitle}</p>
                        <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t.ambassadorName}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.name}</h3>
                            </div>
                             <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t.ambassadorBackstory}</p>
                                <p className="text-gray-700 dark:text-gray-400">{profile?.backstory}</p>
                            </div>
                             <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t.ambassadorCommunicationStyle}</p>
                                <p className="text-gray-700 dark:text-gray-400">{profile?.communicationStyle}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t.ambassadorVoice}</p>
                                <p className="text-gray-700 dark:text-gray-400">{profile?.voiceDescription}</p>
                            </div>
                        </div>
                        <button onClick={() => setStep(4)} className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 text-lg">
                            {t.continueButton}
                        </button>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.step4Title}</h2>
                        <p className="text-md text-gray-600 dark:text-gray-400 mb-6">{t.step4Subtitle}</p>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="performance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.performancePrompt}</label>
                                <textarea id="performance" rows={3} value={performanceContent} onChange={(e) => setPerformanceContent(e.target.value)} placeholder={t.performancePromptPlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition text-lg" />
                            </div>
                            <button onClick={handlePerformancePreview} disabled={isLoading || !performanceContent} className="w-full bg-indigo-500/80 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 text-md">
                                {t.generatePreviewButton}
                            </button>
                            {performanceResult && (
                                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
                                     <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.performanceResult}</h3>
                                     <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{performanceResult}</blockquote>
                                </div>
                            )}
                        </div>
                        <button onClick={handleSaveAmbassador} disabled={isLoading} className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 text-lg">
                            {t.saveAmbassadorButton}
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    if (error) return <ErrorScreen error={error} onRetry={() => { setError(null); setIsLoading(false); }} />;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.virtualAmbassadorGeneratorScreenTitle} onBack={() => step === 1 ? setActiveTool(null) : setStep(s => s - 1)} />
            <div className="px-4 sm:px-0 flex-grow">
                <StepIndicator currentStep={step} totalSteps={4} />
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-96">
                        <Spinner />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">{loadingMessage}</p>
                    </div>
                ) : renderStep()}
            </div>
        </div>
    );
};

export default VirtualAmbassadorGeneratorScreen;