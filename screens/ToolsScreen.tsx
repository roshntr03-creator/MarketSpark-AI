/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolCard from '../components/ToolCard';
import { SparklesIcon, ChatBubbleLeftRightIcon, PhotoIcon, PlayCircleIcon, MagnifyingGlassIcon, DocumentDuplicateIcon, LightBulbIcon, SwatchIcon, WorkflowIcon } from '../components/icons';
import type { Tool, Screen } from '../types/index';

// Tool-specific screen components
import CampaignGeneratorScreen from '../components/StartScreen'; // Renamed to avoid conflict, this is the campaign generator
import CampaignResultsScreen from '../components/ResultsScreen'; // This is the campaign results screen
import SocialPostAssistantScreen from '../components/SocialPostAssistantScreen';
import SocialPostResultsScreen from '../components/SocialPostResultsScreen';
import ImageEditorScreen from './ImageEditorScreen';
import ImageEditorResultsScreen from '../components/ImageEditorResultsScreen';
import ImageGeneratorScreen from './ImageGeneratorScreen';
import ImageGeneratorResultsScreen from '../components/ImageGeneratorResultsScreen';
import VideoGeneratorScreen from './VideoGeneratorScreen';
import VideoGeneratorResultsScreen from '../components/VideoGeneratorResultsScreen';
import CompetitorAnalysisScreen from './CompetitorAnalysisScreen';
import CompetitorAnalysisResultsScreen from '../components/CompetitorAnalysisResultsScreen';
import ContentRepurposingScreen from './ContentRepurposingScreen';
import ContentRepurposingResultsScreen from '../components/ContentRepurposingResultsScreen';
import ContentStrategistScreen from './ContentStrategistScreen';
import ContentStrategyResultsScreen from '../components/ContentStrategyResultsScreen';
import AssetKitGeneratorScreen from './AssetKitGeneratorScreen';
import AssetKitResultsScreen from '../components/AssetKitResultsScreen';
import WorkflowsScreen from './WorkflowsScreen';
import WorkflowResultsScreen from '../components/WorkflowResultsScreen';
import PromptEnhancerScreen from './PromptEnhancerScreen';
import PromptEnhancerResultsScreen from '../components/PromptEnhancerResultsScreen';


interface ToolsScreenProps {
    setActiveScreen: (screen: Screen) => void;
}

const ToolsScreen: React.FC<ToolsScreenProps> = ({ setActiveScreen }) => {
    const { t } = useTranslations();
    const { 
        activeTool, setActiveTool, 
        campaignResult, socialPostsResult, imageEditResult, generatedImageResult, videoGenerationResult,
        competitorAnalysisResult, contentRepurposingResult, contentStrategyResult, assetKitResult, workflowResult,
        promptEnhancerResult
    } = useMarketingTools();

    const tools: { id: Tool; title: string; description: string; Icon: React.ElementType; disabled?: boolean }[] = [
        { id: 'workflow', title: t.workflow, description: t.workflowDesc, Icon: WorkflowIcon },
        { id: 'prompt-enhancer', title: t.promptEnhancer, description: t.promptEnhancerDesc, Icon: SparklesIcon },
        { id: 'campaign-generator', title: t.campaignGenerator, description: t.campaignGeneratorDesc, Icon: SparklesIcon },
        { id: 'social-post-assistant', title: t.socialPostAssistant, description: t.socialPostAssistantDesc, Icon: ChatBubbleLeftRightIcon },
        { id: 'image-generator', title: t.imageGenerator, description: t.imageGeneratorDesc, Icon: PhotoIcon },
        { id: 'image-editor', title: t.imageEditor, description: t.imageEditorDesc, Icon: PhotoIcon },
        { id: 'video-generator', title: t.videoGenerator, description: t.videoGeneratorDesc, Icon: PlayCircleIcon },
        { id: 'content-strategist', title: t.contentStrategist, description: t.contentStrategistDesc, Icon: LightBulbIcon },
        { id: 'competitor-analysis', title: t.competitorAnalysis, description: t.competitorAnalysisDesc, Icon: MagnifyingGlassIcon },
        { id: 'content-repurposing', title: t.contentRepurposing, description: t.contentRepurposingDesc, Icon: DocumentDuplicateIcon },
        { id: 'asset-kit-generator', title: t.assetKitGenerator, description: t.assetKitGeneratorDesc, Icon: SwatchIcon },
    ];
    
    const renderActiveTool = () => {
        switch (activeTool) {
            case 'campaign-generator':
                return campaignResult ? <CampaignResultsScreen setActiveScreen={setActiveScreen} /> : <CampaignGeneratorScreen />;
            case 'social-post-assistant':
                return socialPostsResult ? <SocialPostResultsScreen /> : <SocialPostAssistantScreen />;
            case 'image-editor':
                return imageEditResult ? <ImageEditorResultsScreen /> : <ImageEditorScreen />;
            case 'image-generator':
                return generatedImageResult ? <ImageGeneratorResultsScreen /> : <ImageGeneratorScreen />;
            case 'video-generator':
                return videoGenerationResult ? <VideoGeneratorResultsScreen /> : <VideoGeneratorScreen />;
            case 'competitor-analysis':
                return competitorAnalysisResult ? <CompetitorAnalysisResultsScreen /> : <CompetitorAnalysisScreen />;
            case 'content-repurposing':
                return contentRepurposingResult ? <ContentRepurposingResultsScreen /> : <ContentRepurposingScreen />;
            case 'content-strategist':
                return contentStrategyResult ? <ContentStrategyResultsScreen setActiveScreen={setActiveScreen} /> : <ContentStrategistScreen />;
            case 'asset-kit-generator':
                return assetKitResult ? <AssetKitResultsScreen /> : <AssetKitGeneratorScreen />;
            case 'workflow':
                return workflowResult ? <WorkflowResultsScreen setActiveScreen={setActiveScreen} /> : <WorkflowsScreen />;
            case 'prompt-enhancer':
                return promptEnhancerResult ? <PromptEnhancerResultsScreen /> : <PromptEnhancerScreen />;
            default:
                return null;
        }
    };
    
    if (activeTool) {
        return renderActiveTool();
    }

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Marketing Tools</h1>
                    <p className="text-md text-gray-600 dark:text-gray-400 mt-1">Your AI-powered creative suite.</p>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    );
};

export default ToolsScreen;