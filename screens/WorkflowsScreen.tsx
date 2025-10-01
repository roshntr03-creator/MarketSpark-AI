/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useUsageStats } from '../contexts/UsageStatsProvider';
import { generateCampaign, generateSocialPosts, generateImage, repurposeContent } from '../services/geminiService';
import ErrorScreen from '../components/ErrorScreen';
import ToolHeader from '../components/ToolHeader';
import ToolCard from '../components/ToolCard';
import { useCreationHistory } from '../contexts/CreationHistoryProvider';
import { useBrand } from '../contexts/BrandProvider';
import type { NewProductLaunchWorkflowResult, BlogPostRepurposingWorkflowResult, GeneratedImage } from '../types/index';
import { WorkflowIcon, RocketLaunchIcon, DocumentDuplicateIcon } from '../components/icons';

const WorkflowLoadingScreen: React.FC<{ message: string }> = ({ message }) => {
    const { t } = useTranslations();
    return (
        <div className="text-center animate-fade-in flex flex-col items-center justify-center h-full">
            <div className="loader mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{t.loadingTitle}</h2>
            <p className="text-md text-gray-600 dark:text-gray-400 max-w-md mt-2">{message}</p>
        </div>
    );
};

const NewProductLaunchWorkflow: React.FC = () => {
    const { t, lang } = useTranslations();
    const { setWorkflowResult } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();

    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const runWorkflow = async () => {
        if (!productName || !productDescription) {
            setError('Product name and description are required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            setLoadingMessage('Step 1/3: Generating marketing campaign...');
            const campaign = await generateCampaign({ name: productName, description: productDescription, targetAudience }, brandPersona, lang);

            setLoadingMessage('Step 2/3: Creating social media posts...');
            const socialPostTopic = `A new product launch for ${productName}. Tagline: "${campaign.campaign.tagline}". Key Messages: ${campaign.campaign.keyMessages.join(', ')}`;
            const socialPosts = await generateSocialPosts(socialPostTopic, 'Instagram', 'Excited', brandPersona, lang);

            setLoadingMessage('Step 3/3: Designing images for each post...');
            const imagePromises = socialPosts.map(post => {
                const imagePrompt = `An eye-catching, high-quality image for an Instagram post about a new product. The post's caption is: "${post.content}". The image should be visually appealing and relevant to the caption.`;
                return generateImage(imagePrompt, brandPersona).then(imgResult => ({ ...imgResult, forPostContent: post.content }));
            });
            const imageResults = await Promise.all(imagePromises);
            
            const images = imageResults.map(res => ({
                image: `data:image/png;base64,${res.imageBase64}`,
                prompt: res.forPostContent,
                forPostContent: res.forPostContent,
            }));

            const result: NewProductLaunchWorkflowResult = { campaign, socialPosts, images };
            const creation = addCreation('workflow', result);
            setWorkflowResult({ result, creation });
            incrementToolUsage('workflow');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during the workflow.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runWorkflow();
    };

    if (isLoading) return <WorkflowLoadingScreen message={loadingMessage} />;
    if (error) return <ErrorScreen error={error} onRetry={runWorkflow} />;

    return (
        <div className="px-4 sm:px-0 flex-grow">
             <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg">
                        <RocketLaunchIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.newProductLaunchWorkflow}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.newProductLaunchWorkflowDesc}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.productNameLabel}</label>
                    <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t.productNamePlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm" />
                </div>
                <div>
                    <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.productDescriptionLabel}</label>
                    <textarea id="productDescription" rows={4} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder={t.productDescriptionPlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm" />
                </div>
                <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.targetAudienceLabel}</label>
                    <input type="text" id="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder={t.targetAudiencePlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg">{t.runWorkflow}</button>
            </form>
        </div>
    );
}

const BlogPostRepurposingWorkflow: React.FC = () => {
    const { t, lang } = useTranslations();
    const { setWorkflowResult } = useMarketingTools();
    const { incrementToolUsage } = useUsageStats();
    const { addCreation } = useCreationHistory();
    const { brandPersona } = useBrand();

    const [blogPost, setBlogPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const runWorkflow = async () => {
        if (!blogPost) {
            setError('Blog post content is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            setLoadingMessage('Step 1/2: Repurposing content into multiple formats...');
            const repurposedContent = await repurposeContent(blogPost, brandPersona, lang);

            setLoadingMessage('Step 2/2: Generating images for Instagram carousel...');
            const imagePromises = repurposedContent.instagramCarousel.map(slide => {
                return generateImage(slide.imageIdea, brandPersona);
            });
            const imageResults = await Promise.all(imagePromises);

            const carouselImages: GeneratedImage[] = imageResults.map((res, index) => ({
                image: `data:image/png;base64,${res.imageBase64}`,
                prompt: repurposedContent.instagramCarousel[index].imageIdea,
            }));

            const result: BlogPostRepurposingWorkflowResult = { repurposedContent, carouselImages };
            const creation = addCreation('workflow', result);
            setWorkflowResult({ result, creation });
            incrementToolUsage('workflow');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during the workflow.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runWorkflow();
    };

    if (isLoading) return <WorkflowLoadingScreen message={loadingMessage} />;
    if (error) return <ErrorScreen error={error} onRetry={runWorkflow} />;

    return (
        <div className="px-4 sm:px-0 flex-grow">
            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg">
                        <DocumentDuplicateIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.blogPostPowerUpWorkflow}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.blogPostPowerUpWorkflowDesc}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="blogPost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.originalBlogPost}</label>
                    <textarea id="blogPost" rows={10} value={blogPost} onChange={(e) => setBlogPost(e.target.value)} placeholder={t.originalBlogPostPlaceholder} className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg backdrop-blur-sm" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg">{t.runPowerUp}</button>
            </form>
        </div>
    );
};

const WorkflowsScreen: React.FC = () => {
    const { t } = useTranslations();
    const { setActiveTool } = useMarketingTools();
    const [selectedWorkflow, setSelectedWorkflow] = useState<'new-product' | 'blog-post' | null>(null);

    const renderContent = () => {
        if (selectedWorkflow === 'new-product') {
            return <NewProductLaunchWorkflow />;
        }
        if (selectedWorkflow === 'blog-post') {
            return <BlogPostRepurposingWorkflow />;
        }
        // Hub view
        return (
            <div className="px-4 sm:px-0">
                <p className="text-center text-md text-gray-600 dark:text-gray-400 -mt-4 mb-8">{t.workflowsScreenSubtitle}</p>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToolCard
                        title={t.newProductLaunchWorkflow}
                        description={t.newProductLaunchWorkflowDesc}
                        Icon={RocketLaunchIcon}
                        onClick={() => setSelectedWorkflow('new-product')}
                    />
                     <ToolCard
                        title={t.blogPostPowerUpWorkflow}
                        description={t.blogPostPowerUpWorkflowDesc}
                        Icon={DocumentDuplicateIcon}
                        onClick={() => setSelectedWorkflow('blog-post')}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto h-full flex flex-col">
            <ToolHeader title={t.workflowsScreenTitle} onBack={() => selectedWorkflow ? setSelectedWorkflow(null) : setActiveTool(null)} />
            {renderContent()}
        </div>
    );
};

export default WorkflowsScreen;