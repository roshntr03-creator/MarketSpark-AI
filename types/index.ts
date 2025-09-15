/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export type Screen = 'dashboard' | 'tools' | 'analytics' | 'settings' | 'planner';

export type Tool = 'campaign-generator' | 'social-post-assistant' | 'image-editor' | 'image-generator' | 'video-generator' | 'competitor-analysis' | 'content-repurposing' | 'content-strategist';

export interface UsageLogEntry {
  tool: Tool;
  timestamp: number; // UTC milliseconds
}

export interface RecentActivity {
    date: Date;
    value: number;
}

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
  original: string; // base64
  edited: string; // base64
  prompt: string;
  responseText?: string;
}

export interface GeneratedImage {
  image: string; // base64 data URL
  prompt: string;
}

export interface GeneratedVideo {
  videoUri: string; // The URI to fetch the video from
  prompt: string;
}

export interface CompetitorAnalysisResult {
    competitorName: string;
    analysisSummary: string;
    toneOfVoice: string;
    keyMarketingMessages: string[];
    contentStrengths: string[];
    contentWeaknesses: string[];
    differentiationOpportunities: string[];
    sources: Source[];
}

export interface RepurposedContent {
    twitterThread: string[];
    instagramCarousel: {
        imageIdea: string;
        caption: string;
    }[];
    linkedInPost: string;
    videoReelScript: string;
}

export interface ContentPlanItem {
  day: number;
  platform: string;
  format: 'Post' | 'Story' | 'Video' | 'Article';
  title: string;
  contentIdea: string;
  suggestedTime: string;
}

export interface ContentStrategy {
  strategyName: string;
  overallGoal: string;
  contentPlan: ContentPlanItem[];
}


export type CreationResult = Campaign | SocialPost[] | EditedImage | GeneratedImage | GeneratedVideo | CompetitorAnalysisResult | RepurposedContent | ContentStrategy;

export interface CreationHistoryItem {
  id: string; // timestamp as string
  tool: Tool;
  timestamp: number;
  result: CreationResult;
}

export interface PlannerItem {
    id: string; // unique id
    scheduledDateTime: string; // ISO string
    creationId?: string; // id from CreationHistoryItem
    // New fields for planned ideas from the strategist
    title?: string;
    platform?: string;
    contentIdea?: string;
    format?: 'Post' | 'Story' | 'Video' | 'Article';
}
