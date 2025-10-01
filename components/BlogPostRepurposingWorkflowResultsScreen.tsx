/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';
import type { Screen, BlogPostRepurposingWorkflowResult } from '../types/index';

interface BlogPostRepurposingWorkflowResultsScreenProps {
    setActiveScreen: (screen: Screen) => void;
}

const BlogPostRepurposingWorkflowResultsScreen: React.FC<BlogPostRepurposingWorkflowResultsScreenProps> = ({ setActiveScreen }) => {
    const { workflowResult, setWorkflowResult } = useMarketingTools();
    const { t } = useTranslations();

    if (!workflowResult || !('repurposedContent' in workflowResult.result)) return null;

    const { result } = workflowResult;
    const { repurposedContent, carouselImages } = result as BlogPostRepurposingWorkflowResult;

    const handleStartNew = () => setWorkflowResult(null);

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.workflowResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-6">Content has been repurposed into multiple formats!</p>
                
                <div className="space-y-6">
                    {/* Repurposed Content */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.generatedRepurposedContent}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.twitterThread}</h3>
                                <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{repurposedContent.twitterThread.join('\n\n---\n\n')}</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.linkedInPost}</h3>
                                <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{repurposedContent.linkedInPost}</div>
                            </div>
                        </div>
                    </div>

                    {/* Instagram Carousel & Images */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.instagramCarousel}</h2>
                        <div className="space-y-6">
                            {repurposedContent.instagramCarousel.map((slide, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-b border-gray-200 dark:border-gray-700/50 pb-6 last:border-0 last:pb-0">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Slide {index + 1}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">"{slide.imageIdea}"</p>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{slide.caption}</p>
                                    </div>
                                    <div>
                                        {carouselImages[index] ? (
                                            <img src={carouselImages[index].image} alt={carouselImages[index].prompt} className="rounded-lg w-full object-cover aspect-square" />
                                        ) : (
                                            <div className="rounded-lg w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <p className="text-gray-500">Image not available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPostRepurposingWorkflowResultsScreen;