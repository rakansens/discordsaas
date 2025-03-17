/**
 * Command Wizard Types
 * Created: 2025/3/15
 * Updated: 2025/3/15 - stepInfoオブジェクトを追加
 * Updated: 2025/3/16 - onSaveプロパティの型を更新し、Supabase MCPサーバーとの連携に対応
 * 
 * このファイルには、コマンドウィザードで使用される型定義とユーティリティ関数が含まれています。
 */

import { Command, CommandOption, CommandOutputDestination } from "@/types/command"
import { ApiConfig } from "@/types/api-config"
import { CreateCommandRequest, UpdateCommandRequest } from "@/hooks/useCommandsMcp"

// ウィザードのステップ
export type WizardStep = "basic" | "api" | "api-flow" | "options" | "output" | "prompt" | "review";

// ステップの情報の型定義
export interface StepInfo {
  title: string;
  description: string;
  iconName: string;
}

// 各ステップの情報
export const stepInfo: Record<WizardStep, StepInfo> = {
  "basic": {
    title: "基本情報",
    description: "コマンドの基本情報とAPI連携の選択",
    iconName: "Terminal"
  },
  "api": {
    title: "API設定",
    description: "選択したAPIの詳細設定",
    iconName: "Braces"
  },
  "api-flow": {
    title: "複数API連携",
    description: "複数のAPIサービスを連携させるフローを設定",
    iconName: "Braces"
  },
  "options": {
    title: "オプション設定",
    description: "コマンドのオプションを設定してください",
    iconName: "ListPlus"
  },
  "output": {
    title: "アウトプット先",
    description: "コマンドの出力先を設定してください",
    iconName: "Bot"
  },
  "prompt": {
    title: "プロンプト設定",
    description: "コマンドの応答プロンプトを設定してください",
    iconName: "MessageSquare"
  },
  "review": {
    title: "確認・保存",
    description: "設定内容を確認して保存してください",
    iconName: "Check"
  }
};

// 空のコマンドを作成する関数
export const createEmptyCommand = (): Partial<Command> => ({
  name: "",
  description: "",
  usage: "",
  options: [],
  enabled: true,
  outputDestination: { type: "global" } // デフォルトはグローバル（制限なし）
});

// コマンドウィザードのプロパティ
export interface CommandWizardProps {
  bots: { id: string; name: string }[];
  initialCommand?: Partial<Command>;
  initialApiConfig?: ApiConfig | null;
  initialPromptContent?: string;
  onSave: (command: Partial<Command> | CreateCommandRequest | UpdateCommandRequest) => void;
  onCancel: () => void;
}

// 各ステップコンポーネントの共通プロパティ
export interface StepProps {
  command: Partial<Command>;
  updateCommand: (updates: Partial<Command>) => void;
  errors: Record<string, string>;
  apiConfig: ApiConfig | null;
  updateApiConfig: (config: ApiConfig) => void;
  promptContent: string;
  promptVariables: string[];
  updatePrompt: (content: string, variables: string[]) => void;
  bots: { id: string; name: string }[];
}
