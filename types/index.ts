/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Screen = 'dashboard' | 'tools' | 'analytics' | 'planner' | 'settings';

export type Tool =
  | 'campaign-generator'
  | 'social-post-assistant'
  | 'image-editor'
  | 'image-generator'
  | 'video-generator'
  | 'competitor-analysis'
  | 'content-repurposing'
  | 'content-strategist'
  | 'asset-kit-generator'
  | 'workflow';

export interface Source {
  uri: string;
  title: string;
}

export interface TargetAudience {
  description: string;
  demographics: string[];
}

export interface ChannelSuggestion {
  name: string;
  contentIdea: string;
}

export interface CampaignDetails {
  productName: string;
  tagline: string;
  keyMessages: string[];
  targetAudience: TargetAudience;
  channels: ChannelSuggestion[];
}

export interface Campaign {
  campaign: CampaignDetails;
  sources: Source[];
}

export interface SocialPost {
  platform: string;
  content: string;
  hashtags: string[];
  predictedEngagement: 'High' | 'Medium' | 'Low';
}

export interface EditedImage {
  original: string; // base64 data URL
  edited: string; // base64 data URL
  prompt: string;
  responseText?: string;
}

export interface GeneratedImage {
    image: string; // base64 data URL
    prompt: string;
}

export interface GeneratedImageWithPost extends GeneratedImage {
  forPostContent: string;
}

export interface GeneratedVideo {
    videoUri: string;
    prompt: string;
}

export interface CompetitorAnalysis {
    competitorName: string;
    analysisSummary: string;
    toneOfVoice: string;
    keyMarketingMessages: string[];
    contentStrengths: string[];
    contentWeaknesses: string[];
    differentiationOpportunities: string[];
    sources: Source[];
}

export interface ContentRepurposingResult {
    twitterThread: string[];
    instagramCarousel: { imageIdea: string; caption: string }[];
    linkedInPost: string;
    videoReelScript: string;
}

export interface ContentPlanItem {
    day: number;
    title: string;
    platform: string;
    format: string;
    contentIdea: string;
    suggestedTime: string;
}

export interface ContentStrategy {
    strategyName: string;
    overallGoal: string;
    contentPlan: ContentPlanItem[];
}

export interface ColorPalette {
    hex: string;
    name: string;
}
export interface LogoStyle {
    style: string;
    description: string;
}

export interface AssetKit {
    logoStyles: LogoStyle[];
    colorPalette: ColorPalette[];
    fontPairings: {
        headline: string;
        body: string;
    }[];
    imageStyles: string[];
}

export interface WorkflowResult {
  campaign: Campaign;
  socialPosts: SocialPost[];
  images: GeneratedImageWithPost[];
}

export interface DashboardSuggestion {
  title: string;
  tool: Tool;
  promptData?: string;
}

export type CreationResult = Campaign | SocialPost[] | EditedImage | GeneratedImage | GeneratedVideo | CompetitorAnalysis | ContentRepurposingResult | ContentStrategy | AssetKit | WorkflowResult;

export interface CreationHistoryItem {
  id: string;
  tool: Tool;
  timestamp: number;
  result: CreationResult;
}

export interface PlannerItem {
    id: string;
    creationId?: string; // For linking back to a full creation
    scheduledDateTime: string;
    // For content strategy items that are not full creations yet
    title?: string;
    platform?: string;
    contentIdea?: string;
    format?: string;
}

export interface UsageLogEntry {
    tool: Tool;
    timestamp: number;
}

export interface RecentActivity {
    date: Date;
    value: number;
}