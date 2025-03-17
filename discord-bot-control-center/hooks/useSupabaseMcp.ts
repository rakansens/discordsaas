// Supabase MCPカスタムフック

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  enableDatabaseWriteMode,
  getDatabaseSchemas,
  getTables,
  getTableSchema,
  executeSqlQuery,
  fetchBots,
  fetchBot,
  createBot,
  updateBot,
  deleteBot,
  fetchCommands,
  fetchCommand,
  createCommand,
  updateCommand,
  deleteCommand,
  fetchTemplates,
  fetchTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchCommandLogs
} from '../lib/supabase-mcp';

/**
 * Supabase MCPサーバーを使用するためのカスタムフック
 * 
 * @returns Supabase MCP関連の関数と状態
 */
export const useSupabaseMcp = () => {
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
    // 認証チェックを一時的に無効化（デバッグ用）
    // if (!session) {
    //   setError(new Error('認証されていません。ログインしてください。'));
    //   return null;
    // }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      console.error('Supabase MCP error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // データベース書き込みモードの有効化
  const enableWriteMode = useCallback(
    () => executeWithErrorHandling(enableDatabaseWriteMode),
    [session]
  );
  
  // データベーススキーマの取得
  const getSchemas = useCallback(
    () => executeWithErrorHandling(getDatabaseSchemas),
    [session]
  );
  
  // テーブル一覧の取得
  const getTableList = useCallback(
    (schemaName: string) => executeWithErrorHandling(getTables, schemaName),
    [session]
  );
  
  // テーブルスキーマの取得
  const getSchema = useCallback(
    (schemaName: string, tableName: string) => executeWithErrorHandling(getTableSchema, schemaName, tableName),
    [session]
  );
  
  // SQLクエリの実行
  const executeQuery = useCallback(
    (query: string) => executeWithErrorHandling(executeSqlQuery, query),
    [session]
  );
  
  // ボット関連の操作
  const getBots = useCallback(
    () => executeWithErrorHandling(fetchBots),
    [session]
  );
  
  const getBot = useCallback(
    (id: number) => executeWithErrorHandling(fetchBot, id),
    [session]
  );
  
  const addBot = useCallback(
    (name: string, clientId: string, encryptedToken: string, userId: string, avatarUrl?: string) => 
      executeWithErrorHandling(createBot, name, clientId, encryptedToken, userId, avatarUrl),
    [session]
  );
  
  const editBot = useCallback(
    (id: number, updates: { name?: string, client_id?: string, encrypted_token?: string, avatar_url?: string, status?: string, settings?: Record<string, any> }) => 
      executeWithErrorHandling(updateBot, id, updates),
    [session]
  );
  
  const removeBot = useCallback(
    (id: number) => executeWithErrorHandling(deleteBot, id),
    [session]
  );
  
  // コマンド関連の操作
  const getCommands = useCallback(
    (botId?: number) => executeWithErrorHandling(fetchCommands, botId),
    [session]
  );
  
  const getCommand = useCallback(
    (id: number) => executeWithErrorHandling(fetchCommand, id),
    [session]
  );
  
  const addCommand = useCallback(
    (botId: number, name: string, description: string, options: any[] = [], promptContent?: string, promptVariables?: string[], apiIntegration?: Record<string, any>) => 
      executeWithErrorHandling(createCommand, botId, name, description, options, promptContent, promptVariables, apiIntegration),
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
    }) => executeWithErrorHandling(updateCommand, id, updates),
    [session]
  );
  
  const removeCommand = useCallback(
    (id: number) => executeWithErrorHandling(deleteCommand, id),
    [session]
  );
  
  // テンプレート関連の操作
  const getTemplates = useCallback(
    (category?: string) => executeWithErrorHandling(fetchTemplates, category),
    [session]
  );
  
  const getTemplate = useCallback(
    (id: number) => executeWithErrorHandling(fetchTemplate, id),
    [session]
  );
  
  const addTemplate = useCallback(
    (name: string, description: string, category: string, commandStructure: Record<string, any>, promptStructure?: Record<string, any>, apiIntegrationStructure?: Record<string, any>, isPublic: boolean = false, userId?: string) => 
      executeWithErrorHandling(createTemplate, name, description, category, commandStructure, promptStructure, apiIntegrationStructure, isPublic, userId),
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
    }) => executeWithErrorHandling(updateTemplate, id, updates),
    [session]
  );
  
  const removeTemplate = useCallback(
    (id: number) => executeWithErrorHandling(deleteTemplate, id),
    [session]
  );
  
  // コマンドログ関連の操作
  const getCommandLogs = useCallback(
    (botId?: number, commandId?: number, limit: number = 50) => 
      executeWithErrorHandling(fetchCommandLogs, botId, commandId, limit),
    [session]
  );
  
  return {
    // 状態
    loading,
    error,
    
    // データベース操作
    enableWriteMode,
    getSchemas,
    getTableList,
    getSchema,
    executeQuery,
    
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
    getTemplate,
    addTemplate,
    editTemplate,
    removeTemplate,
    
    // コマンドログ操作
    getCommandLogs
  };
};
