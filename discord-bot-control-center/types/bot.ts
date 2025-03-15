/**
 * Bot type definitions
 * Created: 2025/3/13
 * Updated: 2025/3/15 - サーバー、チャンネル、スレッドの設定を追加
 */

// Discord ID型
export type DiscordId = string;

// スレッド設定
export interface ThreadSettings {
  enabled: boolean;
  allowedThreads: DiscordId[]; // 特定のスレッドのみ許可する場合
}

// チャンネル設定
export interface ChannelSettings {
  id: DiscordId;
  name?: string; // 表示用
  enabled: boolean;
  threadSettings: ThreadSettings;
}

// サーバー設定
export interface ServerSettings {
  id: DiscordId;
  name?: string; // 表示用
  enabled: boolean;
  channels: ChannelSettings[];
}

// Bot settings interface
export interface BotSettings {
  prefix: string;
  autoRestart: boolean;
  logLevel: string;
  [key: string]: any; // Allow additional settings
}

// Bot status type
export type BotStatus = "online" | "offline" | "error" | "starting" | "stopping";

// Bot interface
export interface Bot {
  id: string;
  userId: string;
  name: string;
  clientId: string;
  encryptedToken: string;
  avatarUrl: string | null;
  status: BotStatus;
  settings: BotSettings;
  servers: ServerSettings[]; // サーバー設定を追加
  lastActive: string | null;
  createdAt: string;
  updatedAt: string;
}

// Bot without token (for API responses)
export type BotWithoutToken = Omit<Bot, "encryptedToken">;

// Bot creation request
export interface CreateBotRequest {
  name: string;
  clientId: string;
  token: string;
  avatarUrl?: string | null;
  settings?: Partial<BotSettings>;
  servers?: ServerSettings[]; // サーバー設定を追加
}

// Bot update request
export interface UpdateBotRequest {
  id: string;
  name?: string;
  clientId?: string;
  token?: string;
  avatarUrl?: string | null;
  settings?: Partial<BotSettings>;
  servers?: ServerSettings[]; // サーバー設定を追加
  status?: BotStatus;
}
