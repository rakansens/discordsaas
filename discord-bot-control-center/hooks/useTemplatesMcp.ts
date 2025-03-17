/**
 * Custom hook for template management using Supabase MCP
 * Created: 2025/3/16
 */

import { useState, useCallback } from "react";
import { CommandTemplate, TemplateCategory } from "@/types/template";
import { useSupabaseMcp } from "./useSupabaseMcp";
import { useToast } from "@/components/ui/use-toast";
import { getAllTemplates, getTemplatesByCategory, getTemplateById } from "@/lib/api";

// テンプレートとデータベースの型の変換用インターフェース
export interface TemplateWithId extends CommandTemplate {
  id: string;
  isPublic: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

// テンプレート作成リクエスト型
export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  defaultCommand: {
    name: string;
    description: string;
    options: any[];
    apiService?: string;
    apiSettings?: Record<string, any>;
    promptTemplate?: string;
    apiFlow?: any[];
    outputDestination?: any;
    requiredPermissions?: string[];
  };
  tags: string[];
  difficulty: string;
  popular: boolean;
  thumbnail?: string;
  isPublic?: boolean;
}

// テンプレート更新リクエスト型
export interface UpdateTemplateRequest {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  defaultCommand?: {
    name?: string;
    description?: string;
    options?: any[];
    apiService?: string;
    apiSettings?: Record<string, any>;
    promptTemplate?: string;
    apiFlow?: any[];
    outputDestination?: any;
    requiredPermissions?: string[];
  };
  tags?: string[];
  difficulty?: string;
  popular?: boolean;
  thumbnail?: string;
  isPublic?: boolean;
}

interface UseTemplatesMcpReturn {
  templates: TemplateWithId[];
  loading: boolean;
  error: Error | null;
  selectedTemplate: TemplateWithId | null;
  fetchTemplates: (category?: string) => Promise<TemplateWithId[] | null>;
  fetchTemplateById: (id: number) => Promise<TemplateWithId | null>;
  addTemplate: (template: CreateTemplateRequest) => Promise<TemplateWithId | null>;
  editTemplate: (template: UpdateTemplateRequest) => Promise<TemplateWithId | null>;
  removeTemplate: (id: number) => Promise<boolean>;
  setSelectedTemplate: (template: TemplateWithId | null) => void;
  applyTemplateToBots: (templateId: number, botIds: number[]) => Promise<boolean>;
}

/**
 * Custom hook for managing templates using Supabase MCP
 */
export function useTemplatesMcp(): UseTemplatesMcpReturn {
  const [templates, setTemplates] = useState<TemplateWithId[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithId | null>(null);
  const { toast } = useToast();
  
  const {
    getTemplates,
    getTemplate,
    addTemplate: addTemplateInSupabase,
    editTemplate: editTemplateInSupabase,
    removeTemplate: removeTemplateInSupabase,
    addCommand,
    loading,
    error
  } = useSupabaseMcp();

  /**
   * データベースのテンプレートをフロントエンド用の型に変換
   */
  const convertDbTemplateToFrontend = (dbTemplate: any): TemplateWithId => {
    // コマンド構造を解析
    const commandStructure = dbTemplate.command_structure || {};
    
    // プロンプト構造を解析
    const promptStructure = dbTemplate.prompt_structure || {};
    
    // API連携構造を解析
    const apiIntegrationStructure = dbTemplate.api_integration_structure || {};
    
    return {
      id: dbTemplate.id.toString(),
      name: dbTemplate.name,
      description: dbTemplate.description,
      category: dbTemplate.category,
      difficulty: commandStructure.difficulty || "beginner",
      tags: commandStructure.tags || [],
      popular: commandStructure.popular || false,
      thumbnail: commandStructure.thumbnail,
      defaultCommand: {
        name: commandStructure.name || "",
        description: commandStructure.description || "",
        options: commandStructure.options || [],
        apiService: apiIntegrationStructure.service,
        apiSettings: apiIntegrationStructure.settings,
        promptTemplate: promptStructure.content,
        apiFlow: apiIntegrationStructure.flow,
        outputDestination: commandStructure.outputDestination,
        requiredPermissions: commandStructure.requiredPermissions || []
      },
      isPublic: dbTemplate.is_public,
      userId: dbTemplate.user_id,
      createdAt: dbTemplate.created_at,
      updatedAt: dbTemplate.updated_at
    };
  };

  /**
   * フロントエンドのテンプレートをデータベース用の型に変換
   */
  const convertFrontendTemplateToDb = (template: CreateTemplateRequest | UpdateTemplateRequest): {
    name?: string;
    description?: string;
    category?: string;
    commandStructure: Record<string, any>;
    promptStructure?: Record<string, any>;
    apiIntegrationStructure?: Record<string, any>;
    isPublic?: boolean;
  } => {
    // コマンド構造を構築
    const commandStructure: Record<string, any> = {};
    
    // CreateTemplateRequestの場合、defaultCommandは必須
    if ('defaultCommand' in template && template.defaultCommand) {
      commandStructure.name = template.defaultCommand.name;
      commandStructure.description = template.defaultCommand.description;
      commandStructure.options = template.defaultCommand.options;
      
      if (template.defaultCommand.outputDestination) {
        commandStructure.outputDestination = template.defaultCommand.outputDestination;
      }
    }
    
    // 共通プロパティを設定
    if (template.difficulty) commandStructure.difficulty = template.difficulty;
    if (template.tags) commandStructure.tags = template.tags;
    if (template.popular !== undefined) commandStructure.popular = template.popular;
    if (template.defaultCommand?.requiredPermissions) commandStructure.requiredPermissions = template.defaultCommand.requiredPermissions;
    if (template.thumbnail) commandStructure.thumbnail = template.thumbnail;
    
    // プロンプト構造を構築
    let promptStructure: Record<string, any> | undefined = undefined;
    if ('defaultCommand' in template && template.defaultCommand && template.defaultCommand.promptTemplate) {
      promptStructure = {
        content: template.defaultCommand.promptTemplate,
        variables: []
      };
    }
    
    // API連携構造を構築
    let apiIntegrationStructure: Record<string, any> | undefined = undefined;
    if ('defaultCommand' in template && template.defaultCommand && 
        (template.defaultCommand.apiService || template.defaultCommand.apiFlow)) {
      apiIntegrationStructure = {};
      
      if (template.defaultCommand.apiService) {
        apiIntegrationStructure.service = template.defaultCommand.apiService;
        apiIntegrationStructure.settings = template.defaultCommand.apiSettings || {};
      }
      
      if (template.defaultCommand.apiFlow) {
        apiIntegrationStructure.flow = template.defaultCommand.apiFlow;
      }
    }
    
    return {
      name: template.name,
      description: template.description,
      category: template.category,
      commandStructure,
      promptStructure,
      apiIntegrationStructure,
      isPublic: template.isPublic
    };
  };

  /**
   * テンプレート一覧を取得
   */
  const fetchTemplates = useCallback(async (category?: string): Promise<TemplateWithId[] | null> => {
    try {
      let data;
      
      if (category) {
        data = await getTemplatesByCategory(category as TemplateCategory);
      } else {
        data = await getAllTemplates();
      }
      
      if (data) {
        setTemplates(data);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching templates:", err);
      toast({
        title: "エラー",
        description: "テンプレートの取得に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [toast]);

  /**
   * 特定のテンプレートを取得
   */
  const fetchTemplateById = useCallback(async (id: number): Promise<TemplateWithId | null> => {
    try {
      const template = await getTemplate(id);
      
      if (template) {
        // データベースから取得したテンプレートをTemplateWithId型に変換
        const templateWithId = convertDbTemplateToFrontend(template);
        
        setSelectedTemplate(templateWithId);
        return templateWithId;
      }
      
      return null;
    } catch (err) {
      console.error(`Error fetching template with ID ${id}:`, err);
      toast({
        title: "エラー",
        description: "テンプレートの取得に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [getTemplate, toast]);

  /**
   * テンプレートを追加
   */
  const addTemplate = useCallback(async (template: CreateTemplateRequest): Promise<TemplateWithId | null> => {
    try {
      // フロントエンドのテンプレートをデータベース用の型に変換
      const dbTemplate = convertFrontendTemplateToDb(template);
      
      // テンプレートをSupabaseに作成
      const newTemplate = await addTemplateInSupabase(
        dbTemplate.name!,
        dbTemplate.description!,
        dbTemplate.category!,
        dbTemplate.commandStructure,
        dbTemplate.promptStructure,
        dbTemplate.apiIntegrationStructure,
        dbTemplate.isPublic || false
      );
      
      if (newTemplate) {
        // 作成したテンプレートをTemplateWithId型に変換
        const templateWithId = convertDbTemplateToFrontend(newTemplate);
        
        // テンプレート一覧を更新
        setTemplates(prevTemplates => [...prevTemplates, templateWithId]);
        
        toast({
          title: "成功",
          description: "テンプレートを作成しました。",
          type: "success"
        });
        
        return templateWithId;
      }
      
      return null;
    } catch (err) {
      console.error("Error creating template:", err);
      toast({
        title: "エラー",
        description: "テンプレートの作成に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [addTemplateInSupabase, toast]);

  /**
   * テンプレートを更新
   */
  const editTemplate = useCallback(async (template: UpdateTemplateRequest): Promise<TemplateWithId | null> => {
    try {
      // テンプレートIDを数値に変換
      const id = parseInt(template.id);
      
      // フロントエンドのテンプレートをデータベース用の型に変換
      const dbTemplate = convertFrontendTemplateToDb(template);
      
      // テンプレートをSupabaseで更新
      const updatedTemplate = await editTemplateInSupabase(id, dbTemplate);
      
      if (updatedTemplate) {
        // 更新したテンプレートをTemplateWithId型に変換
        const templateWithId = convertDbTemplateToFrontend(updatedTemplate);
        
        // テンプレート一覧を更新
        setTemplates(prevTemplates => 
          prevTemplates.map(t => t.id === templateWithId.id ? templateWithId : t)
        );
        
        // 選択中のテンプレートを更新
        if (selectedTemplate && selectedTemplate.id === templateWithId.id) {
          setSelectedTemplate(templateWithId);
        }
        
        toast({
          title: "成功",
          description: "テンプレートを更新しました。",
          type: "success"
        });
        
        return templateWithId;
      }
      
      return null;
    } catch (err) {
      console.error(`Error updating template with ID ${template.id}:`, err);
      toast({
        title: "エラー",
        description: "テンプレートの更新に失敗しました。",
        type: "error"
      });
      return null;
    }
  }, [editTemplateInSupabase, selectedTemplate, toast]);

  /**
   * テンプレートを削除
   */
  const removeTemplate = useCallback(async (id: number): Promise<boolean> => {
    try {
      const result = await removeTemplateInSupabase(id);
      
      if (result) {
        // テンプレート一覧から削除
        setTemplates(prevTemplates => 
          prevTemplates.filter(t => t.id !== id.toString())
        );
        
        // 選択中のテンプレートをクリア
        if (selectedTemplate && selectedTemplate.id === id.toString()) {
          setSelectedTemplate(null);
        }
        
        toast({
          title: "成功",
          description: "テンプレートを削除しました。",
          type: "success"
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error(`Error deleting template with ID ${id}:`, err);
      toast({
        title: "エラー",
        description: "テンプレートの削除に失敗しました。",
        type: "error"
      });
      return false;
    }
  }, [removeTemplateInSupabase, selectedTemplate, toast]);

  /**
   * テンプレートをボットに適用
   */
  const applyTemplateToBots = useCallback(async (templateId: number, botIds: number[]): Promise<boolean> => {
    try {
      // テンプレートを取得
      const template = await getTemplate(templateId);
      
      if (!template) {
        throw new Error(`Template with ID ${templateId} not found`);
      }
      
      // テンプレートをフロントエンド用の型に変換
      const templateWithId = convertDbTemplateToFrontend(template);
      
      // 各ボットにコマンドを作成
      const results = await Promise.all(botIds.map(async (botId) => {
        // コマンド構造を取得
        const commandStructure = template.command_structure || {};
        
        // プロンプト構造を取得
        const promptStructure = template.prompt_structure || {};
        
        // API連携構造を取得
        const apiIntegrationStructure = template.api_integration_structure || {};
        
        // コマンドを作成
        const result = await addCommand(
          botId,
          commandStructure.name,
          commandStructure.description,
          commandStructure.options || [],
          promptStructure.content,
          promptStructure.variables,
          apiIntegrationStructure
        );
        
        return !!result;
      }));
      
      // すべてのボットにコマンドが作成されたかチェック
      const success = results.every(result => result);
      
      if (success) {
        toast({
          title: "成功",
          description: `テンプレート「${templateWithId.name}」を${botIds.length}個のボットに適用しました。`,
          type: "success"
        });
      } else {
        toast({
          title: "警告",
          description: "一部のボットにテンプレートを適用できませんでした。",
          type: "warning"
        });
      }
      
      return success;
    } catch (err) {
      console.error(`Error applying template ${templateId} to bots:`, err);
      toast({
        title: "エラー",
        description: "テンプレートの適用に失敗しました。",
        type: "error"
      });
      return false;
    }
  }, [getTemplate, addCommand, toast]);

  return {
    templates,
    loading,
    error,
    selectedTemplate,
    fetchTemplates,
    fetchTemplateById,
    addTemplate,
    editTemplate,
    removeTemplate,
    setSelectedTemplate,
    applyTemplateToBots
  };
}
