/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Added 'image-generator' and all other marketing tools to the Tool type to support the full suite of features.
export type Tool =
  | 'campaign-generator'
  | 'social-post-assistant'
  | 'image-editor'
  | 'image-generator'
  | 'video-generator'
  | 'competitor-analysis'
  | 'content-repurposing'
  | 'content-strategist'
  | 'asset-kit-generator';


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
