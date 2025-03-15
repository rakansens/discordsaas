/**
 * API設定の型定義
 * Created: 2025/3/14
 * Updated: 2025/3/15 - 各APIサービスの設定項目を拡張
 * 
 * このファイルは、API連携設定に関する型定義を提供します。
 */

// APIサービスの定義
export type ApiService = 
  | "none" 
  | "openai" 
  | "perplexity" 
  | "stability" 
  | "anthropic" 
  | "deepl" 
  | "spotify" 
  | "youtube";

// API設定の型定義
export interface ApiConfig {
  service: ApiService;
  settings: {
    openai?: OpenAISettings;
    perplexity?: PerplexitySettings;
    stability?: StabilitySettings;
    anthropic?: AnthropicSettings;
    deepl?: DeepLSettings;
    spotify?: SpotifySettings;
    youtube?: YouTubeSettings;
  };
}

// OpenAI設定の型定義
export interface OpenAISettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  // 拡張設定
  language?: string;
  prompt?: string;
  responseFormat?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Perplexity設定の型定義
export interface PerplexitySettings {
  mode?: "search" | "answer";
  detailLevel?: "concise" | "detailed";
  // 拡張設定
  maxTokens?: number;
  temperature?: number;
  focus?: string;
  language?: string;
  safeSearch?: boolean;
}

// Stability設定の型定義
export interface StabilitySettings {
  model?: string;
  steps?: number;
  cfgScale?: number;
  width?: number;
  height?: number;
  // 拡張設定
  seed?: number;
  stylePreset?: string;
  clipGuidancePreset?: string;
  sampler?: string;
  diffusion?: string;
}

// Anthropic設定の型定義
export interface AnthropicSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  // 拡張設定
  topP?: number;
  topK?: number;
}

// DeepL設定の型定義
export interface DeepLSettings {
  targetLang?: string;
  formality?: "default" | "more" | "less";
  // 拡張設定
  glossary?: string;
  tagHandling?: string;
  preserveFormatting?: boolean;
  outlineDetection?: boolean;
}

// Spotify設定の型定義
export interface SpotifySettings {
  type?: "track" | "album" | "artist" | "playlist";
  market?: string;
  limit?: number;
}

// YouTube設定の型定義
export interface YouTubeSettings {
  type?: "video" | "channel" | "playlist";
  order?: "relevance" | "date" | "rating" | "viewCount";
  maxResults?: number;
  // 拡張設定
  captionLanguage?: string;
  region?: string;
  includeTranscript?: boolean;
  includeMetadata?: boolean;
  includeComments?: boolean;
}

// デフォルトのAPI設定
export const defaultApiConfig: ApiConfig = {
  service: "none",
  settings: {
    openai: {
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: "",
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    perplexity: {
      mode: "answer",
      detailLevel: "detailed",
      temperature: 0.5,
      maxTokens: 2000,
      focus: "comprehensive",
      language: "japanese"
    },
    stability: {
      model: "stable-diffusion-xl",
      steps: 30,
      cfgScale: 7,
      width: 1024,
      height: 1024,
      seed: -1,
      stylePreset: "photographic"
    },
    anthropic: {
      model: "claude-3-haiku",
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: "",
      topP: 0.9,
      topK: 50
    },
    deepl: {
      targetLang: "JA",
      formality: "default",
      preserveFormatting: true,
      outlineDetection: true
    },
    spotify: {
      type: "track",
      market: "JP",
      limit: 10
    },
    youtube: {
      type: "video",
      order: "relevance",
      maxResults: 10,
      region: "JP",
      includeTranscript: true,
      includeMetadata: true
    }
  }
};
