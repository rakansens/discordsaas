/**
 * テンプレート型定義
 * Created: 2025/3/14
 * Updated: 2025/3/15 - コマンドのアウトプット先設定を追加
 * Updated: 2025/3/15 - 複数API連携フローカテゴリとタグを追加
 * Updated: 2025/3/15 - CommandOptionの型を修正
 * 
 * このファイルは、コマンドテンプレートに関連する型定義を提供します。
 */

import { ApiService } from "./api-config";
import { CommandOutputDestination } from "./command";
import { ApiFlowStep } from "@/components/command/api-flow-builder";

// テンプレートカテゴリ
export type TemplateCategory = 
  | "information" // 情報収集・分析
  | "conversation" // 対話・質問応答
  | "media" // メディア処理
  | "utility" // ユーティリティ
  | "api-flow"; // 複数API連携フロー

// テンプレートの難易度
export type TemplateDifficulty = "beginner" | "intermediate" | "advanced";

// テンプレートのタグ
export type TemplateTag = 
  | "ai" 
  | "analysis" 
  | "chat" 
  | "voice" 
  | "image" 
  | "search" 
  | "summary" 
  | "moderation"
  | "utility"
  | "fun"
  | "visualization"
  | "translation"
  | "business"
  | "generation"
  | "media";

// テンプレート用コマンドオプション（idは自動生成されるため省略可能）
export interface TemplateCommandOption {
  id?: string;
  name: string;
  description: string;
  type: string;
  required: boolean;
  choices?: { name: string; value: string }[];
  subOptions?: TemplateCommandOption[];
}

// テンプレートインターフェース
export interface CommandTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: TemplateTag[];
  popular: boolean;
  thumbnail?: string;
  defaultCommand: {
    name: string;
    description: string;
    options: TemplateCommandOption[];
    apiService?: ApiService;
    apiSettings?: Record<string, any>;
    promptTemplate?: string;
    apiFlow?: ApiFlowStep[]; // 複数API連携フロー
    outputDestination?: CommandOutputDestination; // アウトプット先設定
  };
  requiredPermissions?: string[];
}

// テンプレートカテゴリ情報
export interface CategoryInfo {
  id: TemplateCategory;
  name: string;
  description: string;
  icon: string;
}
