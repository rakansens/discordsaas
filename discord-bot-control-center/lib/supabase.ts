// Supabaseクライアント設定

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// 環境変数からSupabase URLとAnon Keyを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabaseクライアントの作成
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ボット関連の型定義
export type Bot = {
  id: number;
  user_id: string;
  name: string;
  client_id: string;
  encrypted_token: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'error';
  settings: Record<string, any>;
  last_active?: string;
  created_at: string;
  updated_at: string;
};

// コマンド関連の型定義
export type Command = {
  id: number;
  bot_id: number;
  name: string;
  description: string;
  options: CommandOption[];
  prompt_id?: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type CommandOption = {
  name: string;
  description: string;
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel';
  required: boolean;
  choices?: { name: string; value: string }[];
};

// プロンプト関連の型定義
export type Prompt = {
  id: number;
  command_id: number;
  content: string;
  variables: string[];
  api_integration: ApiIntegration;
  created_at: string;
  updated_at: string;
};

// API連携関連の型定義
export type ApiIntegration = {
  service?: string;
  settings?: Record<string, any>;
};

// テンプレート関連の型定義
export type Template = {
  id: number;
  name: string;
  description: string;
  category: string;
  command_structure: Partial<Command>;
  prompt_structure?: Partial<Prompt>;
  api_integration_structure?: Partial<ApiIntegration>;
  is_public: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
};

// コマンドログ関連の型定義
export type CommandLog = {
  id: number;
  command_id?: number;
  bot_id?: number;
  user_id: string;
  guild_id: string;
  channel_id: string;
  input: Record<string, any>;
  output?: string;
  status: 'success' | 'error' | 'pending';
  execution_time?: number;
  created_at: string;
};

// ボットCRUD操作
export const botService = {
  // ボット一覧取得
  async getBots() {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Bot[];
  },
  
  // ボット詳細取得
  async getBot(id: number) {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Bot;
  },
  
  // ボット作成
  async createBot(bot: Omit<Bot, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('bots')
      .insert(bot)
      .select()
      .single();
    
    if (error) throw error;
    return data as Bot;
  },
  
  // ボット更新
  async updateBot(id: number, bot: Partial<Bot>) {
    const { data, error } = await supabase
      .from('bots')
      .update(bot)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Bot;
  },
  
  // ボット削除
  async deleteBot(id: number) {
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // ボットステータス更新
  async updateBotStatus(id: number, status: Bot['status']) {
    const { data, error } = await supabase
      .from('bots')
      .update({ status, last_active: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Bot;
  }
};

// コマンドCRUD操作
export const commandService = {
  // コマンド一覧取得
  async getCommands(botId?: number) {
    let query = supabase
      .from('commands')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (botId) {
      query = query.eq('bot_id', botId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Command[];
  },
  
  // コマンド詳細取得
  async getCommand(id: number) {
    const { data, error } = await supabase
      .from('commands')
      .select(`
        *,
        prompts (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Command & { prompts: Prompt[] };
  },
  
  // コマンド作成
  async createCommand(command: Omit<Command, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('commands')
      .insert(command)
      .select()
      .single();
    
    if (error) throw error;
    return data as Command;
  },
  
  // コマンド更新
  async updateCommand(id: number, command: Partial<Command>) {
    const { data, error } = await supabase
      .from('commands')
      .update(command)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Command;
  },
  
  // コマンド削除
  async deleteCommand(id: number) {
    const { error } = await supabase
      .from('commands')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// プロンプトCRUD操作
export const promptService = {
  // プロンプト作成
  async createPrompt(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('prompts')
      .insert(prompt)
      .select()
      .single();
    
    if (error) throw error;
    return data as Prompt;
  },
  
  // プロンプト更新
  async updatePrompt(id: number, prompt: Partial<Prompt>) {
    const { data, error } = await supabase
      .from('prompts')
      .update(prompt)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Prompt;
  },
  
  // プロンプト削除
  async deletePrompt(id: number) {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// テンプレートCRUD操作
export const templateService = {
  // テンプレート一覧取得
  async getTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Template[];
  },
  
  // テンプレート詳細取得
  async getTemplate(id: number) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Template;
  },
  
  // テンプレート作成
  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data as Template;
  },
  
  // テンプレート更新
  async updateTemplate(id: number, template: Partial<Template>) {
    const { data, error } = await supabase
      .from('templates')
      .update(template)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Template;
  },
  
  // テンプレート削除
  async deleteTemplate(id: number) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// コマンドログCRUD操作
export const commandLogService = {
  // コマンドログ一覧取得
  async getCommandLogs(botId?: number, commandId?: number) {
    let query = supabase
      .from('command_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (botId) {
      query = query.eq('bot_id', botId);
    }
    
    if (commandId) {
      query = query.eq('command_id', commandId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as CommandLog[];
  },
  
  // コマンドログ作成
  async createCommandLog(log: Omit<CommandLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('command_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data as CommandLog;
  },
  
  // コマンドログ更新
  async updateCommandLog(id: number, log: Partial<CommandLog>) {
    const { data, error } = await supabase
      .from('command_logs')
      .update(log)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CommandLog;
  }
};

// リアルタイム更新のサブスクリプション
export const subscribeToBotsStatus = (callback: (bot: Bot) => void) => {
  const subscription = supabase
    .channel('public:bots')
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'bots' 
    }, (payload) => {
      callback(payload.new as Bot);
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(subscription);
  };
};

// トークン暗号化/復号化ヘルパー関数
// 注: 実際の実装ではサーバーサイドで行うべき
export const encryptionHelper = {
  // トークン暗号化
  async encryptToken(token: string) {
    // サーバーサイドAPIを呼び出して暗号化
    const response = await fetch('/api/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to encrypt token');
    }
    
    const data = await response.json();
    return data.encryptedToken;
  },
  
  // トークン復号化
  async decryptToken(encryptedToken: string) {
    // サーバーサイドAPIを呼び出して復号化
    const response = await fetch('/api/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encryptedToken }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to decrypt token');
    }
    
    const data = await response.json();
    return data.token;
  }
};
