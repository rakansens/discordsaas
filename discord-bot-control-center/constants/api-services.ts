"use client";

/**
 * APIサービス情報と各サービスのモデル定義
 * Created: 2025/3/14
 * 
 * このファイルは、APIサービスの表示情報とモデル定義を提供します。
 */

import React from "react";
import { 
  Settings, 
  MessageSquare, 
  Image as ImageIcon, 
  Search,
  Music,
  Globe,
  Sparkles
} from "lucide-react";
import { ApiService } from "@/types/api-config";

type ApiServiceInfo = {
  name: string;
  icon: React.ReactNode;
  description: string;
};

// APIサービスの表示名とアイコンのマッピング
export const apiServiceInfo: Record<ApiService, ApiServiceInfo> = {
  "none": { 
    name: "なし", 
    icon: React.createElement(Settings, { className: "h-4 w-4" }),
    description: "API連携なし"
  },
  "openai": { 
    name: "OpenAI", 
    icon: React.createElement(MessageSquare, { className: "h-4 w-4" }),
    description: "AIテキスト生成・画像生成"
  },
  "perplexity": { 
    name: "Perplexity", 
    icon: React.createElement(Search, { className: "h-4 w-4" }),
    description: "AI検索エンジン"
  },
  "stability": { 
    name: "Stability AI", 
    icon: React.createElement(ImageIcon, { className: "h-4 w-4" }),
    description: "AI画像生成"
  },
  "anthropic": { 
    name: "Anthropic", 
    icon: React.createElement(MessageSquare, { className: "h-4 w-4" }),
    description: "AIテキスト生成"
  },
  "deepl": { 
    name: "DeepL", 
    icon: React.createElement(Globe, { className: "h-4 w-4" }),
    description: "翻訳サービス"
  },
  "spotify": { 
    name: "Spotify", 
    icon: React.createElement(Music, { className: "h-4 w-4" }),
    description: "音楽ストリーミング"
  },
  "youtube": { 
    name: "YouTube", 
    icon: React.createElement(Music, { className: "h-4 w-4" }),
    description: "動画プラットフォーム"
  }
};

// OpenAIモデルの定義
export const openaiModels = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "dall-e-3", name: "DALL-E 3 (画像生成)" }
];

// Anthropicモデルの定義
export const anthropicModels = [
  { id: "claude-3-opus", name: "Claude 3 Opus" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "claude-2", name: "Claude 2" }
];

// Stability AIモデルの定義
export const stabilityModels = [
  { id: "stable-diffusion-xl", name: "Stable Diffusion XL" },
  { id: "stable-diffusion-3", name: "Stable Diffusion 3" }
];
