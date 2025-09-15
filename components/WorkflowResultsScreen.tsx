/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { usePlanner } from '../contexts/PlannerProvider';
import ToolHeader from './ToolHeader';
import { PlusCircleIcon } from './icons';
import type { Screen } from '../types/index';

interface WorkflowResultsScreenProps {
    setActiveScreen: (screen: Screen) => void;
}

const WorkflowResultsScreen: React.FC<WorkflowResultsScreenProps> = ({ setActiveScreen }) => {
    const { workflowResult, setWorkflowResult } = useMarketingTools();
    const { addPlannerItem } = usePlanner();
    const { t } = useTranslations();
    const [isAdded, setIsAdded] = useState(false);

    if (!workflowResult) return null;

    const { result } = workflowResult;
    const { campaign, socialPosts, images } = result;

    const handleStartNew = () => setWorkflowResult(null);

    const handleAddToPlanner = () => {
        const today = new Date();
        socialPosts.forEach((post, index) => {
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + index + 1); // Schedule one post per day, starting tomorrow
            scheduledDate.setHours(10, 0, 0, 0); // Default to 10:00 AM

            addPlannerItem({
                scheduledDateTime: scheduledDate.toISOString(),
                title: `${campaign.campaign.productName} - Social Post`,
                platform: post.platform,
                contentIdea: post.content,
                format: 'Social Media Post with Image',
            });
        });
        setIsAdded(true);
        setTimeout(() => {
            setActiveScreen('planner');
        }, 1500);
    };

    const getImageForPost = (postContent: string) => {
        return images.find(img => img.forPostContent === postContent);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.workflowResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-4">{t.workflowResultsSubtitle}</p>
                
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleAddToPlanner}
                        disabled={isAdded}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:bg-green-500 disabled:cursor-not-allowed"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        {isAdded ? t.addedToPlanner : t.addAllToPlanner}
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Campaign */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.generatedCampaign}</h2>
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.tagline}</h3>
                            <p className="text-2xl text-gray-800 dark:text-gray-200 italic">"{campaign.campaign.tagline}"</p>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t.keyMessages}</h3>
                            <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                                {campaign.campaign.keyMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                            </ul>
                        </div>
                    </div>

                    {/* Social Posts & Images */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.generatedSocialPosts} & {t.generatedImages}</h2>
                        <div className="space-y-8">
                            {socialPosts.map((post, index) => {
                                const postImage = getImageForPost(post.content);
                                return (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-b border-gray-200 dark:border-gray-700/50 pb-6 last:border-0 last:pb-0">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{post.platform} Post</h3>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {post.hashtags.map((tag, tagIndex) => (
                                                    <span key={tagIndex} className="text-indigo-500 dark:text-indigo-400 text-sm">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            {postImage ? (
                                                <img src={postImage.image} alt={`Generated for post ${index + 1}`} className="rounded-lg w-full object-cover aspect-square" />
                                            ) : (
                                                <div className="rounded-lg w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <p className="text-gray-500">Image not available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowResultsScreen;