/**
 * Custom hook for command management using Supabase MCP
 * Created: 2025/3/16
 * Updated: 2025/3/16 - 型定義を修正し、CommandPromptとの互換性を確保
 */

import { useState, useCallback } from "react";
import { Command, CommandPrompt, CommandOptionType } from "@/types/command";
import { useSupabaseMcp } from "./useSupabaseMcp";
import { useToast } from "@/components/ui/use-toast";

// コマンドとプロンプトを含む拡張型
export interface CommandWithPrompt extends Omit<Command, 'prompt'> {
  promptId: string | null;
  prompt: {
    id: string;
    commandId: string;
    content: string;
    variables: string[];
    apiIntegration: string | null;
    apiSettings: Record<string, any> | null;
  } | null;
}

// プロンプト情報の型
export interface PromptInfo {
  content: string;
  variables: string[];
  apiIntegration: string | null;
  apiSettings?: Record<string, any> | null;
}

// コマンド作成リクエスト型
export interface CreateCommandRequest {
  botId: string;
  name: string;
  description: string;
  options: any[];
  prompt?: PromptInfo;
  apiFlow?: any[];
  enabled?: boolean;
  outputDestination?: any;
}

// コマンド更新リクエスト型
export interface UpdateCommandRequest {
  id: string;
  botId?: string;
  name?: string;
  description?: string;
  options?: any[];
  prompt?: PromptInfo;
  apiFlow?: any[];
  enabled?: boolean;
  outputDestination?: any;
}

interface UseCommandsMcpReturn {
  commands: CommandWithPrompt[];
  loading: boolean;
  error: Error | null;
  selectedCommand: CommandWithPrompt | null;
  fetchCommands: (botId?: number) => Promise<CommandWithPrompt[] | null>;
  fetchCommandById: (id: number) => Promise<CommandWithPrompt | null>;
  addCommand: (command: CreateCommandRequest) => Promise<CommandWithPrompt | null>;
  editCommand: (command: UpdateCommandRequest) => Promise<CommandWithPrompt | null>;
  removeCommand: (id: number) => Promise<boolean>;
  setSelectedCommand: (command: CommandWithPrompt | null) => void;
}

/**
 * Custom hook for managing commands using Supabase MCP
 */
export function useCommandsMcp(): UseCommandsMcpReturn {
  const [commands, setCommands] = useState<CommandWithPrompt[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<CommandWithPrompt | null>(null);
  const { toast } = useToast();
  
  const {
    getCommands,
    getCommand,
    addCommand: addCommandInSupabase,
    editCommand: editCommandInSupabase,
    removeCommand: removeCommandInSupabase,
    loading,
    error
  } = useSupabaseMcp();

  /**
   * Fetch commands, optionally filtered by bot ID
   */
  const fetchCommands = useCallback(async (botId?: number): Promise<CommandWithPrompt[] | null> => {
    try {
      const data = await getCommands(botId);
      
      if (data) {
        // データベースから取得したコマンドをCommandWithPrompt型に変換
        const commandsWithPrompt: CommandWithPrompt[] = data.map((command: any) => {
          // プロンプトがある場合は含める
          if (command.prompt) {
            return {
              id: command.id.toString(),
              botId: command.bot_id.toString(),
              name: command.name,
              description: command.description,
              options: command.options || [],
              usage: `/${command.name} ${(command.options || [])
                .map((opt: any) => opt.required ? `<${opt.name}>` : `[${opt.name}]`)
                .join(" ")}`,
              promptId: command.prompt_id ? command.prompt_id.toString() : null,
              enabled: command.enabled,
              outputDestination: command.settings?.outputDestination || { type: "global" },
              apiFlow: command.prompt?.api_integration?.flow || null,
              createdAt: command.created_at,
              updatedAt: command.updated_at,
              prompt: {
                id: command.prompt.id.toString(),
                commandId: command.id.toString(),
                content: command.prompt.content,
                variables: command.prompt.variables || [],
                apiIntegration: command.prompt.api_integration?.service || null,
                apiSettings: command.prompt.api_integration?.settings || null
              }
            };
          } else {
            // プロンプトがない場合
            return {
              id: command.id.toString(),
              botId: command.bot_id.toString(),
              name: command.name,
              description: command.description,
              options: command.options || [],
              usage: `/${command.name} ${(command.options || [])
                .map((opt: any) => opt.required ? `<${opt.name}>` : `[${opt.name}]`)
                .join(" ")}`,
              promptId: null,
              enabled: command.enabled,
              outputDestination: command.settings?.outputDestination || { type: "global" },
              apiFlow: null,
              createdAt: command.created_at,
              updatedAt: command.updated_at,
              prompt: null
            };
          }
        });
        
        setCommands(commandsWithPrompt);
        return commandsWithPrompt;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching commands:", err);
      toast({
        title: "エラー",
        description: "コマンドの取得に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [getCommands, toast]);

  /**
   * Fetch a command by ID
   */
  const fetchCommandById = useCallback(async (id: number): Promise<CommandWithPrompt | null> => {
    try {
      const command = await getCommand(id);
      
      if (command) {
        // データベースから取得したコマンドをCommandWithPrompt型に変換
        const commandWithPrompt: CommandWithPrompt = {
          id: command.id.toString(),
          botId: command.bot_id.toString(),
          name: command.name,
          description: command.description,
          options: command.options || [],
          usage: `/${command.name} ${(command.options || [])
            .map((opt: any) => opt.required ? `<${opt.name}>` : `[${opt.name}]`)
            .join(" ")}`,
          promptId: command.prompt_id ? command.prompt_id.toString() : null,
          enabled: command.enabled,
          outputDestination: command.settings?.outputDestination || { type: "global" },
          apiFlow: command.prompt?.api_integration?.flow || null,
          createdAt: command.created_at,
          updatedAt: command.updated_at,
          prompt: command.prompt ? {
            id: command.prompt.id.toString(),
            commandId: command.id.toString(),
            content: command.prompt.content,
            variables: command.prompt.variables || [],
            apiIntegration: command.prompt.api_integration?.service || null,
            apiSettings: command.prompt.api_integration?.settings || null
          } : null
        };
        
        setSelectedCommand(commandWithPrompt);
        return commandWithPrompt;
      }
      
      return null;
    } catch (err) {
      console.error(`Error fetching command with ID ${id}:`, err);
      toast({
        title: "エラー",
        description: "コマンドの取得に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [getCommand, toast]);

  /**
   * Add a new command
   */
  const addCommand = useCallback(async (command: CreateCommandRequest): Promise<CommandWithPrompt | null> => {
    try {
      // ボットIDを数値に変換
      const botId = parseInt(command.botId);
      
      // プロンプトの内容とAPI連携設定を抽出
      const promptContent = command.prompt?.content;
      const promptVariables = command.prompt?.variables;
      const apiIntegration = command.prompt?.apiIntegration ? {
        service: command.prompt.apiIntegration,
        settings: command.prompt.apiSettings || {},
        flow: command.apiFlow
      } : undefined;
      
      // コマンドをSupabaseに作成
      const newCommand = await addCommandInSupabase(
        botId,
        command.name,
        command.description,
        command.options,
        promptContent,
        promptVariables,
        apiIntegration
      );
      
      if (newCommand) {
        // 作成したコマンドをCommandWithPrompt型に変換
        const commandWithPrompt: CommandWithPrompt = {
          id: newCommand.id.toString(),
          botId: newCommand.bot_id.toString(),
          name: newCommand.name,
          description: newCommand.description,
          options: newCommand.options || [],
          usage: `/${newCommand.name} ${(newCommand.options || [])
            .map((opt: any) => opt.required ? `<${opt.name}>` : `[${opt.name}]`)
            .join(" ")}`,
          promptId: newCommand.prompt_id ? newCommand.prompt_id.toString() : null,
          enabled: newCommand.enabled,
          outputDestination: command.outputDestination || { type: "global" },
          apiFlow: command.apiFlow,
          createdAt: newCommand.created_at,
          updatedAt: newCommand.updated_at,
          prompt: newCommand.prompt ? {
            id: newCommand.prompt.id.toString(),
            commandId: newCommand.id.toString(),
            content: newCommand.prompt.content,
            variables: newCommand.prompt.variables || [],
            apiIntegration: command.prompt?.apiIntegration || null,
            apiSettings: command.prompt?.apiSettings || null
          } : null
        };
        
        // コマンド一覧を更新
        setCommands(prevCommands => [...prevCommands, commandWithPrompt]);
        
        toast({
          title: "成功",
          description: "コマンドを作成しました。",
          type: "success"
        });
        
        return commandWithPrompt;
      }
      
      return null;
    } catch (err) {
      console.error("Error creating command:", err);
      toast({
        title: "エラー",
        description: "コマンドの作成に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [addCommandInSupabase, toast]);

  /**
   * Edit an existing command
   */
  const editCommand = useCallback(async (command: UpdateCommandRequest): Promise<CommandWithPrompt | null> => {
    try {
      // コマンドIDを数値に変換
      const id = parseInt(command.id);
      
      // 更新内容を準備
      const updates: any = {};
      
      if (command.name !== undefined) updates.name = command.name;
      if (command.description !== undefined) updates.description = command.description;
      if (command.options !== undefined) updates.options = command.options;
      if (command.enabled !== undefined) updates.enabled = command.enabled;
      if (command.outputDestination !== undefined) {
        updates.settings = {
          ...(updates.settings || {}),
          outputDestination: command.outputDestination
        };
      }
      
      // プロンプト関連の更新
      if (command.prompt) {
        updates.promptContent = command.prompt.content;
        updates.promptVariables = command.prompt.variables;
        
        if (command.prompt.apiIntegration) {
          updates.apiIntegration = {
            service: command.prompt.apiIntegration,
            settings: command.prompt.apiSettings || {},
            flow: command.apiFlow
          };
        }
      }
      
      // コマンドをSupabaseで更新
      const updatedCommand = await editCommandInSupabase(id, updates);
      
      if (updatedCommand) {
        // 更新したコマンドをCommandWithPrompt型に変換
        const commandWithPrompt: CommandWithPrompt = {
          id: updatedCommand.id.toString(),
          botId: updatedCommand.bot_id.toString(),
          name: updatedCommand.name,
          description: updatedCommand.description,
          options: updatedCommand.options || [],
          usage: `/${updatedCommand.name} ${(updatedCommand.options || [])
            .map((opt: any) => opt.required ? `<${opt.name}>` : `[${opt.name}]`)
            .join(" ")}`,
          promptId: updatedCommand.prompt_id ? updatedCommand.prompt_id.toString() : null,
          enabled: updatedCommand.enabled,
          outputDestination: command.outputDestination || { type: "global" },
          apiFlow: command.apiFlow,
          createdAt: updatedCommand.created_at,
          updatedAt: updatedCommand.updated_at,
          prompt: updatedCommand.prompt ? {
            id: updatedCommand.prompt.id.toString(),
            commandId: updatedCommand.id.toString(),
            content: updatedCommand.prompt.content,
            variables: updatedCommand.prompt.variables || [],
            apiIntegration: command.prompt?.apiIntegration || null,
            apiSettings: command.prompt?.apiSettings || null
          } : null
        };
        
        // コマンド一覧を更新
        setCommands(prevCommands => 
          prevCommands.map(c => c.id === commandWithPrompt.id ? commandWithPrompt : c)
        );
        
        // 選択中のコマンドを更新
        if (selectedCommand && selectedCommand.id === commandWithPrompt.id) {
          setSelectedCommand(commandWithPrompt);
        }
        
        toast({
          title: "成功",
          description: "コマンドを更新しました。",
          type: "success"
        });
        
        return commandWithPrompt;
      }
      
      return null;
    } catch (err) {
      console.error(`Error updating command with ID ${command.id}:`, err);
      toast({
        title: "エラー",
        description: "コマンドの更新に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [editCommandInSupabase, selectedCommand, toast]);

  /**
   * Remove a command
   */
  const removeCommand = useCallback(async (id: number): Promise<boolean> => {
    try {
      const result = await removeCommandInSupabase(id);
      
      if (result) {
        // コマンド一覧から削除
        setCommands(prevCommands => 
          prevCommands.filter(c => c.id !== id.toString())
        );
        
        // 選択中のコマンドをクリア
        if (selectedCommand && selectedCommand.id === id.toString()) {
          setSelectedCommand(null);
        }
        
        toast({
          title: "成功",
          description: "コマンドを削除しました。",
          type: "success"
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error(`Error deleting command with ID ${id}:`, err);
      toast({
        title: "エラー",
        description: "コマンドの削除に失敗しました。",
        type: "error"
      });
      return false;
    }
  }, [removeCommandInSupabase, selectedCommand, toast]);

  return {
    commands,
    loading,
    error,
    selectedCommand,
    fetchCommands,
    fetchCommandById,
    addCommand,
    editCommand,
    removeCommand,
    setSelectedCommand
  };
}
