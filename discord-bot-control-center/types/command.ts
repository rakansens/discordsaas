/**
 * コマンド関連の型定義
 * Created: 2025/3/14
 * Updated: 2025/3/15 - ApiFlowSteps型を追加
 * Updated: 2025/3/15 - CommandOutputDestination型を拡張
 * 
 * このファイルは、Discordボットコマンドに関する型定義を提供します。
 */

import { ApiConfig } from "./api-config";
import { ApiFlowStep } from "@/components/command/api-flow-builder";

// コマンドの型定義
export interface Command {
  id: string;
  botId: string;
  name: string;
  description: string;
  usage?: string;
  options: CommandOption[];
  prompt?: CommandPrompt;
  apiFlow?: ApiFlowStep[]; // 複数APIの連携フロー
  enabled: boolean;
  outputDestination: CommandOutputDestination;
  createdAt: Date;
  updatedAt: Date;
}

// コマンドオプションの型定義
export interface CommandOption {
  id: string;
  name: string;
  description: string;
  type: CommandOptionType;
  required: boolean;
  choices?: { name: string; value: string }[];
  subOptions?: CommandOption[]; // サブオプション（ネストされたオプション）
}

// コマンドオプションのタイプ
export type CommandOptionType = 
  | "string" 
  | "integer" 
  | "boolean" 
  | "user" 
  | "channel" 
  | "role" 
  | "mentionable" 
  | "number" 
  | "attachment";

// コマンドプロンプトの型定義
export interface CommandPrompt {
  content: string;
  variables: string[];
  apiIntegration: string | null;
}

// コマンド出力先の型定義
export type CommandOutputDestination = 
  | { type: "global" } // 制限なし
  | { type: "channel"; channelIds: string[] } // 特定のチャンネルのみ
  | { type: "dm" } // DMのみ
  | { type: "thread" } // スレッドのみ
  | { type: "threads"; allowedThreads: string[] } // 複数の特定スレッドのみ
  | { type: "servers"; allowedServers: string[] } // 複数の特定サーバーのみ
  | { type: "ephemeral" }; // 一時メッセージ（本人のみ表示）
