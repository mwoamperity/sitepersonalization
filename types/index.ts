// Amperity Personalization Agent - Type Definitions
// Based on PRD Data Models (Appendix C)

// =============================================================================
// ID Types
// =============================================================================

export type IdType = 'email' | 'amperity_id' | 'cookie_id' | 'maid' | 'custom';

export type WidgetType = 'hero_banner' | 'inline_block';

export type AnimationType = 'none' | 'fade' | 'slide';

export type LoadingBehavior = 'skeleton' | 'spinner' | 'none';

export type TransformType = 'uppercase' | 'lowercase' | 'titlecase' | 'date_format';

export type ConditionOperator = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

// =============================================================================
// API Configuration
// =============================================================================

export interface ApiConfig {
  tenant_id: string;
  api_endpoint: string;
  bearer_token: string; // ENCRYPTED in storage
  id_type: IdType;
  custom_id_field?: string;
}

// =============================================================================
// Field Mapping & Conditions
// =============================================================================

export interface FieldMapping {
  api_field: string;
  display_name: string;
  fallback_value: string;
  transform?: TransformType;
  date_format?: string;
}

export interface FieldCondition {
  field: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

// =============================================================================
// Content Assets
// =============================================================================

export interface CopyVariant {
  id: string;
  headline: string; // Supports {{field_name}} placeholders
  subheadline?: string;
  body?: string;
  conditions?: FieldCondition[];
}

export interface ImageAsset {
  id: string;
  url: string;
  alt_text: string;
  unsplash_id?: string; // For attribution
  photographer?: string;
  photographer_url?: string;
  conditions?: FieldCondition[];
}

export interface FallbackContent {
  headline: string;
  subheadline?: string;
  body?: string;
  image_url: string;
  image_alt: string;
}

// =============================================================================
// Personalization Strategy
// =============================================================================

export interface PersonalizationStrategy {
  goal: string;
  fields_used: string[];
  field_mappings: Record<string, FieldMapping>;
  copy_variants: CopyVariant[];
  image_assets: ImageAsset[];
  fallback_content: FallbackContent;
}

// =============================================================================
// Widget Configuration
// =============================================================================

export interface WidgetConfig {
  type: WidgetType;
  width: string;
  height: string;
  max_width: number;
  border_radius: number;
  background_color: string;
  text_color: string;
  cta_text: string;
  cta_url: string;
  animation: AnimationType;
  loading_behavior: LoadingBehavior;
}

// =============================================================================
// Identity Configuration
// =============================================================================

export interface IdentityConfig {
  data_layer_path?: string; // e.g., "dataLayer.user.email"
  static_identity?: string; // For demo/testing
  allowed_domains: string[]; // CORS allowlist
}

// =============================================================================
// Main Configuration (stored in DB)
// =============================================================================

export interface PersonalizationConfig {
  id: string; // cfg_[a-z0-9]{12}
  created_at: string;
  updated_at: string;
  api_config: ApiConfig;
  personalization: PersonalizationStrategy;
  widget_config: WidgetConfig;
  identity_config: IdentityConfig;
}

// =============================================================================
// AI Analysis & Recommendations
// =============================================================================

export interface FieldAnalysis {
  null_rate: number;
  personalization_value: ConfidenceLevel;
  use_cases: string[];
  sample_values: (string | number | boolean | null)[];
  data_type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
}

export interface PersonalizationRecommendation {
  id: string;
  name: string;
  fields_used: string[];
  strategy: 'single' | 'compound';
  description: string;
  example_output: string;
  goal_alignment: string;
  confidence: ConfidenceLevel;
}

export interface AnalysisResult {
  recommendations: PersonalizationRecommendation[];
  field_analysis: Record<string, FieldAnalysis>;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface CreateConfigRequest {
  api_config: ApiConfig;
  personalization: PersonalizationStrategy;
  widget_config: WidgetConfig;
  identity_config?: IdentityConfig;
}

export interface CreateConfigResponse {
  config_id: string;
  snippet: string;
  preview_url: string;
}

export interface ProfileLookupResponse {
  personalization_data: Record<string, unknown>;
  has_identity: boolean;
}

export interface TestConnectionRequest {
  tenant_id: string;
  api_endpoint: string;
  bearer_token: string;
  id_type: IdType;
  test_value: string;
}

export interface TestConnectionResponse {
  success: boolean;
  field_count?: number;
  sample_fields?: string[];
  error?: string;
}

export interface AnalyzeDataRequest {
  profiles: Record<string, unknown>[];
  goal: string;
}

export interface GenerateCopyRequest {
  fields: Array<{
    name: string;
    description: string;
    sample_value: string;
  }>;
  goal: string;
  brand_name?: string;
  tone?: string;
}

export interface GenerateCopyResponse {
  headlines: string[];
  subheadlines: string[];
  cta_suggestions: string[];
}

export interface SearchImagesRequest {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  count?: number;
}

export interface UnsplashImage {
  id: string;
  url: string;
  thumb_url: string;
  alt_description: string;
  photographer: string;
  photographer_url: string;
  download_url: string;
}

export interface SearchImagesResponse {
  images: UnsplashImage[];
}

// =============================================================================
// Wizard State
// =============================================================================

export interface WizardState {
  currentStep: number;
  api_config: Partial<ApiConfig>;
  sample_ids: string[];
  sample_profiles: Record<string, unknown>[];
  goal: string;
  selected_recommendation?: PersonalizationRecommendation;
  analysis_result?: AnalysisResult;
  copy_variants: CopyVariant[];
  selected_images: ImageAsset[];
  fallback_content?: FallbackContent;
  widget_config: Partial<WidgetConfig>;
}

// =============================================================================
// Widget Runtime Types
// =============================================================================

export interface WidgetIdentity {
  type: IdType;
  value: string;
}

export interface WidgetRenderData {
  config: PersonalizationConfig;
  personalization_data: Record<string, unknown> | null;
  has_identity: boolean;
}
