/**
 * Command type definitions
 * Created: 2025/3/13
 * Updated: 2025/3/15 - コマンドのアウトプット先（サーバー、チャンネル、スレッド）の設定を追加
 */

import { DiscordId } from "./bot";

// Command option type
export type CommandOptionType = "string" | "integer" | "boolean" | "user" | "channel" | "role" | "mentionable";

// Command option interface
export interface CommandOption {
  name: string;
  description: string;
  type: CommandOptionType;
  required: boolean;
  choices?: { name: string; value: string | number }[];
}

// Command prompt interface
export interface CommandPrompt {
  id: string;
  commandId: string;
  content: string;
  variables: string[];
  apiIntegration: string | null;
}

// コマンドのアウトプット先設定
export interface CommandOutputDestination {
  // アウトプット先の制限タイプ
  type: "global" | "servers" | "channels" | "threads";
  
  // 指定されたサーバーID（type="servers"の場合）
  allowedServers?: DiscordId[];
  
  // 指定されたチャンネルID（type="channels"の場合）
  allowedChannels?: DiscordId[];
  
  // 指定されたスレッドID（type="threads"の場合）
  allowedThreads?: DiscordId[];
}

// Command interface
export interface Command {
  id: string;
  botId: string;
  name: string;
  description: string;
  usage: string;
  options: CommandOption[];
  promptId: string | null;
  enabled: boolean;
  outputDestination: CommandOutputDestination; // アウトプット先を追加
  createdAt: string;
  updatedAt: string;
}

// Command with prompt interface
export interface CommandWithPrompt extends Command {
  prompt?: CommandPrompt;
}

// Command creation request
export interface CreateCommandRequest {
  botId: string;
  name: string;
  description: string;
  usage: string;
  options: CommandOption[];
  prompt?: {
    content: string;
    variables: string[];
    apiIntegration?: string | null;
  };
  enabled?: boolean;
  outputDestination?: CommandOutputDestination; // アウトプット先を追加
}

// Command update request
export interface UpdateCommandRequest {
  id: string;
  name?: string;
  description?: string;
  usage?: string;
  options?: CommandOption[];
  prompt?: {
    content: string;
    variables: string[];
    apiIntegration?: string | null;
  } | null;
  enabled?: boolean;
  outputDestination?: CommandOutputDestination; // アウトプット先を追加
}
