/**
 * API設定の型定義
 * Created: 2025/3/14
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
}

// Perplexity設定の型定義
export interface PerplexitySettings {
  mode?: "search" | "answer";
  detailLevel?: "concise" | "detailed";
}

// Stability設定の型定義
export interface StabilitySettings {
  model?: string;
  steps?: number;
  cfgScale?: number;
  width?: number;
  height?: number;
}

// Anthropic設定の型定義
export interface AnthropicSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// DeepL設定の型定義
export interface DeepLSettings {
  targetLang?: string;
  formality?: "default" | "more" | "less";
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
}

// デフォルトのAPI設定
export const defaultApiConfig: ApiConfig = {
  service: "none",
  settings: {
    openai: {
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: ""
    },
    perplexity: {
      mode: "answer",
      detailLevel: "detailed"
    },
    stability: {
      model: "stable-diffusion-xl",
      steps: 30,
      cfgScale: 7,
      width: 1024,
      height: 1024
    },
    anthropic: {
      model: "claude-3-haiku",
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: ""
    },
    deepl: {
      targetLang: "JA",
      formality: "default"
    },
    spotify: {
      type: "track",
      market: "JP",
      limit: 10
    },
    youtube: {
      type: "video",
      order: "relevance",
      maxResults: 10
    }
  }
};
