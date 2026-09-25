export interface Advertiser {
  id: string;
  page_name: string;
  fb_page_id?: string;
  follower_count?: number;
  category?: string;
  created_at?: string;
}

export interface Ad {
  id: string;
  advertiser_id: string;
  library_id: string;
  started_running_on: string;
  is_active: boolean;
  has_multiple_versions: boolean;
  platforms: string[];
  creative_url: string;
  creative_type: 'image' | 'video';
  raw_snapshot?: any;
  scraped_at?: string;
}

export interface AdAnalysis {
  id: string;
  ad_id: string;
  hook: string;
  body: string;
  cta: string;
  offer_details?: string | null;
  hashtags?: string[];
  hook_score: number;
  clarity_score: number;
  cta_strength_score: number;
  visual_appeal_score: number;
  offer_strength_score: number;
  creative_quality_score: number;
  analysis_notes: string;
  analyzed_at?: string;
}

export interface AdScore {
  id: string;
  ad_id: string;
  longevity_days: number;
  longevity_score: number;
  iteration_score: number;
  creative_quality_score: number;
  composite_score: number;
  rank?: number;
  computed_at?: string;
}

export interface AdLeaderboardRow {
  ad_id: string;
  library_id: string;
  creative_url?: string | null;
  creative_type: 'image' | 'video';
  platforms?: string[] | null;
  is_active: boolean;
  started_running_on: string;
  has_multiple_versions: boolean;
  hook: string;
  body: string;
  cta: string;
  offer_details?: string | null;
  hashtags?: string[] | null;
  hook_score: number;
  clarity_score: number;
  cta_strength_score: number;
  visual_appeal_score: number;
  offer_strength_score: number;
  creative_quality_score: number;
  analysis_notes: string;
  longevity_days: number;
  longevity_score: number;
  iteration_score: number;
  composite_score: number;
  rank: number;
  page_name?: string;
  follower_count?: number;
  advertiser_category?: string;
  is_mysivi_page?: boolean;
}

export interface MetricsFrameworkItem {
  id: number;
  category: 'Attention' | 'Engagement' | 'Conversion' | 'Cost & ROI' | 'Reach & Delivery' | string;
  metric_name: string;
  description: string;
  requires_api: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  matches?: Array<{
    ad_id: string;
    content: string;
    similarity: number;
  }>;
}
