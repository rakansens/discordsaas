/**
 * Custom hook for Supabase operations
 * Created: 2025/3/16
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  botService, 
  commandService, 
  promptService, 
  templateService, 
  commandLogService 
} from '../lib/supabase';

/**
 * Supabaseを使用するためのカスタムフック
 * 
 * @returns Supabase関連の関数と状態
 */
export const useSupabase = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * 関数実行のラッパー
   * 
   * @param fn 実行する関数
   * @param args 関数の引数
   * @returns 関数の実行結果
   */
  const executeWithErrorHandling = async <T, A extends any[]>(
    fn: (...args: A) => Promise<T>,
    ...args: A
  ): Promise<T | null> => {
    // テンプレート関連の関数はセッションチェックをスキップ
    // 関数の文字列表現を使用して判断
    const fnString = fn.toString();
    const isTemplateFunction = 
      fnString.includes('templates') || // テンプレート関連の関数
      process.env.SKIP_AUTH === 'true'; // 認証スキップが有効
    
    if (!session && !isTemplateFunction) {
      setError(new Error('認証されていません。ログインしてください。'));
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      console.error('Supabase error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // ボット関連の操作
  const getBots = useCallback(
    () => executeWithErrorHandling(botService.getBots),
    [session]
  );
  
  const getBot = useCallback(
    (id: number) => executeWithErrorHandling(botService.getBot, id),
    [session]
  );
  
  const addBot = useCallback(
    (name: string, clientId: string, encryptedToken: string, userId: string, avatarUrl?: string) => 
      executeWithErrorHandling(botService.createBot, {
        name,
        client_id: clientId,
        encrypted_token: encryptedToken,
        user_id: userId,
        avatar_url: avatarUrl,
        status: 'offline',
        settings: {}
      }),
    [session]
  );
  
  const editBot = useCallback(
    (id: number, updates: { name?: string, client_id?: string, encrypted_token?: string, avatar_url?: string, status?: 'online' | 'offline' | 'error', settings?: Record<string, any> }) => 
      executeWithErrorHandling(botService.updateBot, id, updates),
    [session]
  );
  
  const removeBot = useCallback(
    (id: number) => executeWithErrorHandling(botService.deleteBot, id),
    [session]
  );
  
  // コマンド関連の操作
  const getCommands = useCallback(
    (botId?: number) => executeWithErrorHandling(commandService.getCommands, botId),
    [session]
  );
  
  const getCommand = useCallback(
    (id: number) => executeWithErrorHandling(commandService.getCommand, id),
    [session]
  );
  
  const addCommand = useCallback(
    (botId: number, name: string, description: string, options: any[] = [], promptContent?: string, promptVariables?: string[], apiIntegration?: Record<string, any>) => {
      // まずコマンドを作成
      return executeWithErrorHandling(async () => {
        const command = await commandService.createCommand({
          bot_id: botId,
          name,
          description,
          options,
          enabled: true
        });
        
        // プロンプトがある場合は作成
        if (promptContent && command) {
          const prompt = await promptService.createPrompt({
            command_id: command.id,
            content: promptContent,
            variables: promptVariables || [],
            api_integration: apiIntegration || {}
          });
          
          // コマンドを更新してプロンプトIDを設定
          if (prompt) {
            await commandService.updateCommand(command.id, {
              prompt_id: prompt.id
            });
            
            // 更新されたコマンドを取得
            return await commandService.getCommand(command.id);
          }
        }
        
        return command;
      });
    },
    [session]
  );
  
  const editCommand = useCallback(
    (id: number, updates: {
      name?: string,
      description?: string,
      options?: any[],
      enabled?: boolean,
      promptContent?: string,
      promptVariables?: string[],
      apiIntegration?: Record<string, any>
    }) => {
      return executeWithErrorHandling(async () => {
        // コマンド情報を取得
        const command = await commandService.getCommand(id);
        
        if (!command) {
          throw new Error(`Command with id ${id} not found`);
        }
        
        // コマンド更新用のデータを準備
        const commandUpdateData: any = {};
        
        if (updates.name !== undefined) commandUpdateData.name = updates.name;
        if (updates.description !== undefined) commandUpdateData.description = updates.description;
        if (updates.options !== undefined) commandUpdateData.options = updates.options;
        if (updates.enabled !== undefined) commandUpdateData.enabled = updates.enabled;
        
        // コマンドを更新
        if (Object.keys(commandUpdateData).length > 0) {
          await commandService.updateCommand(id, commandUpdateData);
        }
        
        // プロンプト関連の更新がある場合
        if (updates.promptContent !== undefined || updates.promptVariables !== undefined || updates.apiIntegration !== undefined) {
          if (command.prompts && command.prompts.length > 0) {
            // プロンプトがある場合は更新
            const promptId = command.prompts[0].id;
            const promptUpdateData: any = {};
            
            if (updates.promptContent !== undefined) promptUpdateData.content = updates.promptContent;
            if (updates.promptVariables !== undefined) promptUpdateData.variables = updates.promptVariables;
            if (updates.apiIntegration !== undefined) promptUpdateData.api_integration = updates.apiIntegration;
            
            if (Object.keys(promptUpdateData).length > 0) {
              await promptService.updatePrompt(promptId, promptUpdateData);
            }
          } else if (updates.promptContent) {
            // プロンプトがない場合は作成
            const prompt = await promptService.createPrompt({
              command_id: id,
              content: updates.promptContent,
              variables: updates.promptVariables || [],
              api_integration: updates.apiIntegration || {}
            });
            
            // コマンドを更新してプロンプトIDを設定
            if (prompt) {
              await commandService.updateCommand(id, {
                prompt_id: prompt.id
              });
            }
          }
        }
        
        // 更新されたコマンドを取得
        return await commandService.getCommand(id);
      });
    },
    [session]
  );
  
  const removeCommand = useCallback(
    (id: number) => executeWithErrorHandling(commandService.deleteCommand, id),
    [session]
  );
  
  // テンプレート関連の操作
  const getTemplates = useCallback(
    () => executeWithErrorHandling(templateService.getTemplates),
    [session]
  );
  
  const getTemplatesByCategory = useCallback(
    (category: string) => executeWithErrorHandling(async () => {
      const templates = await templateService.getTemplates();
      return templates.filter(template => template.category === category);
    }),
    [session]
  );
  
  const getTemplate = useCallback(
    (id: number) => executeWithErrorHandling(templateService.getTemplate, id),
    [session]
  );
  
  const addTemplate = useCallback(
    (templateData: {
      name: string;
      description: string;
      category: string;
      commandStructure: Record<string, any>;
      promptStructure?: Record<string, any>;
      apiIntegrationStructure?: Record<string, any>;
      isPublic?: boolean;
      userId?: string;
    }) => {
      // 必須パラメータのnullチェック
      if (!templateData.name || !templateData.description || !templateData.category) {
        throw new Error('Name, description, and category are required');
      }
      
      return executeWithErrorHandling(templateService.createTemplate, {
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        command_structure: templateData.commandStructure,
        prompt_structure: templateData.promptStructure,
        api_integration_structure: templateData.apiIntegrationStructure,
        is_public: templateData.isPublic ?? false,
        user_id: templateData.userId
      });
    },
    [session]
  );
  
  const editTemplate = useCallback(
    (id: number, updates: {
      name?: string,
      description?: string,
      category?: string,
      commandStructure?: Record<string, any>,
      promptStructure?: Record<string, any> | null,
      apiIntegrationStructure?: Record<string, any> | null,
      isPublic?: boolean
    }) => {
      const templateUpdateData: any = {};
      
      if (updates.name !== undefined) templateUpdateData.name = updates.name;
      if (updates.description !== undefined) templateUpdateData.description = updates.description;
      if (updates.category !== undefined) templateUpdateData.category = updates.category;
      if (updates.commandStructure !== undefined) templateUpdateData.command_structure = updates.commandStructure;
      if (updates.promptStructure !== undefined) templateUpdateData.prompt_structure = updates.promptStructure;
      if (updates.apiIntegrationStructure !== undefined) templateUpdateData.api_integration_structure = updates.apiIntegrationStructure;
      if (updates.isPublic !== undefined) templateUpdateData.is_public = updates.isPublic;
      
      return executeWithErrorHandling(templateService.updateTemplate, id, templateUpdateData);
    },
    [session]
  );
  
  const removeTemplate = useCallback(
    (id: number) => executeWithErrorHandling(templateService.deleteTemplate, id),
    [session]
  );
  
  // コマンドログ関連の操作
  const getCommandLogs = useCallback(
    (botId?: number, commandId?: number) => 
      executeWithErrorHandling(commandLogService.getCommandLogs, botId, commandId),
    [session]
  );
  
  const createCommandLog = useCallback(
    (commandId: number | undefined, botId: number | undefined, userId: string, guildId: string, channelId: string, input: Record<string, any>, status: 'success' | 'error' | 'pending' = 'pending') => 
      executeWithErrorHandling(commandLogService.createCommandLog, {
        command_id: commandId,
        bot_id: botId,
        user_id: userId,
        guild_id: guildId,
        channel_id: channelId,
        input,
        status
      }),
    [session]
  );
  
  const updateCommandLog = useCallback(
    (id: number, updates: {
      output?: string,
      status?: 'success' | 'error' | 'pending',
      execution_time?: number
    }) => executeWithErrorHandling(commandLogService.updateCommandLog, id, updates),
    [session]
  );
  
  return {
    // 状態
    loading,
    error,
    
    // ボット操作
    getBots,
    getBot,
    addBot,
    editBot,
    removeBot,
    
    // コマンド操作
    getCommands,
    getCommand,
    addCommand,
    editCommand,
    removeCommand,
    
    // テンプレート操作
    getTemplates,
    getTemplatesByCategory,
    getTemplate,
    addTemplate,
    editTemplate,
    removeTemplate,
    
    // コマンドログ操作
    getCommandLogs,
    createCommandLog,
    updateCommandLog
  };
};
