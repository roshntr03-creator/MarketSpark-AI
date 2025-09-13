/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export type Tool = 'campaign-generator' | 'social-post-assistant' | 'image-editor' | 'image-generator' | 'video-generator';

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