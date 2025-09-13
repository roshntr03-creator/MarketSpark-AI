/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import ToolCard from '../components/ToolCard';
import { WrenchScrewdriverIcon, ChatBubbleLeftRightIcon, PhotoIcon, VideoCameraIcon, SparklesIcon } from '../components/icons';
import CampaignGeneratorScreen from '../components/StartScreen';
import SocialPostAssistantScreen from '../components/SocialPostAssistantScreen';
import CampaignResultsScreen from '../components/ResultsScreen';
import SocialPostResultsScreen from '../components/SocialPostResultsScreen';
import ImageEditorScreen from './ImageEditorScreen';
import ImageEditorResultsScreen from '../components/ImageEditorResultsScreen';
import ImageGeneratorScreen from './ImageGeneratorScreen';
import ImageGeneratorResultsScreen from '../components/ImageGeneratorResultsScreen';
import VideoGeneratorScreen from './VideoGeneratorScreen';
import VideoGeneratorResultsScreen from '../components/VideoGeneratorResultsScreen';
import type { Tool } from '../types/index';

const ToolsScreen: React.FC = () => {
    const { t } = useTranslations();
    const { activeTool, setActiveTool, campaignResult, socialPostsResult, imageEditResult, generatedImageResult, videoGenerationResult } = useMarketingTools();

    if (activeTool) {
        if (activeTool === 'campaign-generator') {
            return campaignResult ? <CampaignResultsScreen /> : <CampaignGeneratorScreen />;
        }
        if (activeTool === 'social-post-assistant') {
            return socialPostsResult ? <SocialPostResultsScreen /> : <SocialPostAssistantScreen />;
        }
        if (activeTool === 'image-editor') {
            return imageEditResult ? <ImageEditorResultsScreen /> : <ImageEditorScreen />;
        }
        if (activeTool === 'image-generator') {
            return generatedImageResult ? <ImageGeneratorResultsScreen /> : <ImageGeneratorScreen />;
        }
        if (activeTool === 'video-generator') {
            return videoGenerationResult ? <VideoGeneratorResultsScreen /> : <VideoGeneratorScreen />;
        }
        return (
            <div>
                <button onClick={() => setActiveTool(null)} className="mb-4 text-blue-500 dark:text-blue-400">
                    &larr; Back to Tools
                </button>
                <p>Tool screen for {activeTool}</p>
            </div>
        );
    }
    
    const tools: { id: Tool; title: string; description: string; Icon: React.ElementType; disabled: boolean }[] = [
        {
            id: 'campaign-generator',
            title: t.campaignGeneratorTitle,
            description: t.campaignGeneratorDescription,
            Icon: WrenchScrewdriverIcon,
            disabled: false,
        },
        {
            id: 'social-post-assistant',
            title: t.socialPostAssistantTitle,
            description: t.socialPostAssistantDescription,
            Icon: ChatBubbleLeftRightIcon,
            disabled: false,
        },
        {
            id: 'image-editor',
            title: t.imageEditorTitle,
            description: t.imageEditorDescription,
            Icon: PhotoIcon,
            disabled: false,
        },
        {
            id: 'image-generator',
            title: t.imageGeneratorTitle,
            description: t.imageGeneratorDescription,
            Icon: SparklesIcon,
            disabled: false,
        },
        {
            id: 'video-generator',
            title: t.videoGeneratorTitle,
            description: t.videoGeneratorDescription,
            Icon: VideoCameraIcon,
            disabled: false,
        },
    ];

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.toolsTitle}</h1>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.toolsSubtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {tools.map(tool => (
                    <ToolCard
                        key={tool.id}
                        title={tool.title}
                        description={tool.description}
                        Icon={tool.Icon}
                        onClick={() => setActiveTool(tool.id)}
                        disabled={tool.disabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToolsScreen;