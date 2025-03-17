/**
 * Template management page for Discord Bot Control Center
 * Created: 2025/3/16
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Terminal, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  MessageSquare,
  Bot,
  ChevronDown,
  Search,
  ArrowLeft,
  Loader2,
  Download,
  Upload,
  Share,
  Zap,
  X,
  ArrowUp,
  ArrowDown
} from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
import { TemplatesDebug } from "@/components/debug/templates-debug"
import { SqlDebug } from "@/components/debug/sql-debug"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { CommandWizard } from "@/components/command/command-wizard"
import { TemplateSelector } from "@/components/command/template/template-selector"
import { CommandTemplate, TemplateCategory } from "@/types/template"
import { ApiConfig } from "@/types/api-config"
import { Command, CommandOption, CommandOptionType } from "@/types/command"
import { useSupabase } from "@/hooks/useSupabase"
import { useTemplates, TemplateWithId, CreateTemplateRequest, UpdateTemplateRequest } from "@/hooks/useTemplates"
import { useToast } from "@/components/ui/use-toast"
import { TEMPLATE_CATEGORIES } from "@/constants/command-templates"

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null)
  const [selectedBotIds, setSelectedBotIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { getBots } = useSupabase()
  const { 
    templates, 
    loading: templatesLoading, 
    error: templatesError,
    selectedTemplate,
    setSelectedTemplate,
    fetchTemplates,
    addTemplate,
    editTemplate,
    removeTemplate,
    applyTemplateToBots
  } = useTemplates()
  
  const [bots, setBots] = useState<any[]>([])
  const { toast } = useToast()
  
  // ボットデータの取得
  useEffect(() => {
    const loadBots = async () => {
      setIsLoading(true)
      try {
        const botsData = await getBots()
        if (botsData) {
          setBots(botsData)
        }
      } catch (error) {
        console.error("Error loading bots:", error)
        toast({
          title: "エラー",
          description: "ボットデータの取得に失敗しました。",
          type: "error"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadBots()
  }, [getBots, toast])
  
  // テンプレートデータの取得
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        await fetchTemplates(selectedCategory || undefined)
      } catch (error) {
        console.error("Error loading templates:", error)
        toast({
          title: "エラー",
          description: "テンプレートデータの取得に失敗しました。",
          type: "error"
        })
      }
    }
    
    loadTemplates()
  }, [selectedCategory, fetchTemplates, toast])
  
  // テンプレートデータの変換
  const processedTemplates = templates.map(template => {
    // Supabaseから取得したデータを適切な型にキャスト
    const dbTemplate = template as unknown as {
      id: string;
      name: string;
      description: string;
      category: string;
      command_structure: Record<string, any>;
      prompt_structure?: Record<string, any>;
      api_integration_structure?: Record<string, any>;
      is_public: boolean;
      user_id?: string;
      created_at: string;
      updated_at: string;
    };
    
    // コマンド構造を取得
    const commandStructure = dbTemplate.command_structure || {};
    
    // タグ情報を取得
    const tags = commandStructure.tags || [];
    
    // デフォルトコマンド情報を構築
    const defaultCommand = {
      name: commandStructure.name || "",
      description: commandStructure.description || "",
      options: commandStructure.options || [],
      promptTemplate: dbTemplate.prompt_structure?.content,
      apiService: dbTemplate.api_integration_structure?.service,
      apiFlow: dbTemplate.api_integration_structure?.flow,
      requiredPermissions: commandStructure.requiredPermissions || []
    };
    
    return {
      ...template,
      tags,
      defaultCommand,
      difficulty: commandStructure.difficulty || "beginner",
      popular: commandStructure.popular || false,
      promptStructure: dbTemplate.prompt_structure,
      apiIntegrationStructure: dbTemplate.api_integration_structure
    };
  });
  
  // Filter templates based on search query
  const filteredTemplates = processedTemplates.filter(template => {
    // カテゴリフィルタリング
    const categoryMatch = !selectedCategory || template.category === selectedCategory;
    
    // 検索クエリフィルタリング
    const searchMatch = searchQuery === "" || 
                       template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (template.tags && template.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return categoryMatch && searchMatch;
  });

  // テンプレートの編集を開始
  const handleEditTemplate = (template: TemplateWithId) => {
    setSelectedTemplate(template)
    setIsEditDialogOpen(true)
  }
  
  // テンプレートの適用ダイアログを開く
  const handleOpenApplyDialog = (template: TemplateWithId) => {
    setSelectedTemplate(template)
    setSelectedBotIds([])
    setIsApplyDialogOpen(true)
  }

  // 新しいテンプレートを保存
  const handleSaveNewTemplate = async (template: CreateTemplateRequest) => {
    try {
      const result = await addTemplate(template);
      
      if (result) {
        setIsCreateDialogOpen(false)
        
        toast({
          title: "成功",
          description: "新しいテンプレートを作成しました。",
          type: "success"
        })
      }
    } catch (error) {
      console.error("Error saving new template:", error)
      toast({
        title: "エラー",
        description: "テンプレートの作成に失敗しました。",
        type: "error"
      })
    }
  }

  // 既存のテンプレートを更新
  const handleUpdateTemplate = async (template: UpdateTemplateRequest) => {
    try {
      if (!selectedTemplate) return;
      
      const result = await editTemplate(template);
      
      if (result) {
        setIsEditDialogOpen(false)
        
        toast({
          title: "成功",
          description: "テンプレートを更新しました。",
          type: "success"
        })
      }
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "エラー",
        description: "テンプレートの更新に失敗しました。",
        type: "error"
      })
    }
  }
  
  // テンプレートを削除
  const handleDeleteTemplate = async (id: string) => {
    try {
      const result = await removeTemplate(parseInt(id))
      
      if (result) {
        toast({
          title: "成功",
          description: "テンプレートを削除しました。",
          type: "success"
        })
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "エラー",
        description: "テンプレートの削除に失敗しました。",
        type: "error"
      })
    }
  }
  
  // テンプレートをボットに適用
  const handleApplyTemplate = async () => {
    try {
      if (!selectedTemplate || selectedBotIds.length === 0) return;
      
      const result = await applyTemplateToBots(parseInt(selectedTemplate.id), selectedBotIds);
      
      if (result) {
        setIsApplyDialogOpen(false)
        
        toast({
          title: "成功",
          description: `テンプレート「${selectedTemplate.name}」を${selectedBotIds.length}個のボットに適用しました。`,
          type: "success"
        })
      }
    } catch (error) {
      console.error("Error applying template:", error)
      toast({
        title: "エラー",
        description: "テンプレートの適用に失敗しました。",
        type: "error"
      })
    }
  }
  
  // ボット選択の切り替え
  const toggleBotSelection = (botId: number) => {
    setSelectedBotIds(prev => 
      prev.includes(botId)
        ? prev.filter(id => id !== botId)
        : [...prev, botId]
    );
  }
  
  // テンプレートのエクスポート
  const handleExportTemplate = (template: TemplateWithId) => {
    try {
      // テンプレートをJSON文字列に変換
      const templateJson = JSON.stringify(template, null, 2);
      
      // Blobを作成
      const blob = new Blob([templateJson], { type: 'application/json' });
      
      // ダウンロードリンクを作成
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      
      // リンクをクリックしてダウンロード
      document.body.appendChild(a);
      a.click();
      
      // クリーンアップ
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "成功",
        description: "テンプレートをエクスポートしました。",
        type: "success"
      });
    } catch (error) {
      console.error("Error exporting template:", error);
      toast({
        title: "エラー",
        description: "テンプレートのエクスポートに失敗しました。",
        type: "error"
      });
    }
  }

  // ローディング表示
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">データを読み込み中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TemplatesDebug />
      <SqlDebug />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">テンプレート管理</h2>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新しいテンプレートを作成
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新しいテンプレートを作成</DialogTitle>
                <DialogDescription>
                  新しいテンプレートの詳細を入力してください。
                </DialogDescription>
              </DialogHeader>
              
              {/* テンプレート作成フォーム */}
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">テンプレート名</Label>
                    <Input id="name" placeholder="テンプレート名" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">カテゴリ</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea id="description" placeholder="テンプレートの説明" />
                </div>
                
                {/* ここにコマンド設定フォームを追加 */}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit">
                    保存
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* テンプレート編集ダイアログ */}
          <Dialog 
            open={isEditDialogOpen} 
            onOpenChange={(open) => {
              setIsEditDialogOpen(open)
              if (!open) {
                setSelectedTemplate(null)
              }
            }}
          >
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>テンプレートを編集</DialogTitle>
                <DialogDescription>
                  テンプレートの詳細を編集してください。
                </DialogDescription>
              </DialogHeader>
              
              {/* テンプレート編集フォーム */}
              {selectedTemplate && (
                <div className="space-y-6 py-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-4">
                      <TabsTrigger value="basic">基本情報</TabsTrigger>
                      <TabsTrigger value="command">コマンド設定</TabsTrigger>
                      <TabsTrigger value="prompt">プロンプト設定</TabsTrigger>
                      <TabsTrigger value="api">API連携</TabsTrigger>
                    </TabsList>
                    
                    {/* 基本情報タブ */}
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">テンプレート名</Label>
                          <Input 
                            id="edit-name" 
                            defaultValue={selectedTemplate.name} 
                            placeholder="テンプレート名" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">カテゴリ</Label>
                          <Select defaultValue={selectedTemplate.category}>
                            <SelectTrigger>
                              <SelectValue placeholder="カテゴリを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {TEMPLATE_CATEGORIES.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">説明</Label>
                        <Textarea 
                          id="edit-description" 
                          defaultValue={selectedTemplate.description} 
                          placeholder="テンプレートの説明" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>タグ</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                          {selectedTemplate.tags && selectedTemplate.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-destructive/20">
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                          <div className="flex items-center">
                            <Input 
                              placeholder="新しいタグを追加" 
                              className="h-7 text-xs min-w-[150px]" 
                            />
                            <Button size="sm" variant="ghost" className="h-7 px-2">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-difficulty">難易度</Label>
                          <Select defaultValue={selectedTemplate.difficulty || "beginner"}>
                            <SelectTrigger>
                              <SelectValue placeholder="難易度を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">初級</SelectItem>
                              <SelectItem value="intermediate">中級</SelectItem>
                              <SelectItem value="advanced">上級</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="edit-popular" 
                              defaultChecked={selectedTemplate.popular} 
                            />
                            <Label htmlFor="edit-popular">人気テンプレートとして表示</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* コマンド設定タブ */}
                    <TabsContent value="command" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-command-name">コマンド名</Label>
                        <Input 
                          id="edit-command-name" 
                          defaultValue={selectedTemplate.defaultCommand?.name} 
                          placeholder="コマンド名（英数字のみ）" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-command-description">コマンドの説明</Label>
                        <Textarea 
                          id="edit-command-description" 
                          defaultValue={selectedTemplate.defaultCommand?.description} 
                          placeholder="コマンドの説明" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label>コマンドオプション</Label>
                          <Button size="sm" variant="outline">
                            <Plus className="mr-1 h-3 w-3" />
                            オプションを追加
                          </Button>
                        </div>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                          {selectedTemplate.defaultCommand?.options && selectedTemplate.defaultCommand.options.length > 0 ? (
                            selectedTemplate.defaultCommand.options.map((option: any, index: number) => (
                              <div key={index} className="border rounded-md p-3 space-y-3">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-medium">{option.name}</h4>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">名前</Label>
                                    <Input defaultValue={option.name} className="h-8" />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">タイプ</Label>
                                    <Select defaultValue={option.type}>
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="string">テキスト</SelectItem>
                                        <SelectItem value="integer">数値</SelectItem>
                                        <SelectItem value="boolean">真偽値</SelectItem>
                                        <SelectItem value="user">ユーザー</SelectItem>
                                        <SelectItem value="channel">チャンネル</SelectItem>
                                        <SelectItem value="role">ロール</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <Label className="text-xs">説明</Label>
                                  <Input defaultValue={option.description} className="h-8" />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`option-required-${index}`} 
                                    defaultChecked={option.required} 
                                  />
                                  <Label htmlFor={`option-required-${index}`} className="text-xs">必須</Label>
                                </div>
                                
                                {option.choices && option.choices.length > 0 && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">選択肢</Label>
                                    <div className="space-y-2">
                                      {option.choices.map((choice: any, choiceIndex: number) => (
                                        <div key={choiceIndex} className="flex items-center gap-2">
                                          <Input defaultValue={choice.name} className="h-7 text-xs" placeholder="表示名" />
                                          <Input defaultValue={choice.value} className="h-7 text-xs" placeholder="値" />
                                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                                        <Plus className="mr-1 h-3 w-3" />
                                        選択肢を追加
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              オプションがありません。「オプションを追加」ボタンをクリックしてオプションを追加してください。
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>必要な権限</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {['メッセージの送信', 'メッセージ履歴の閲覧', '埋め込みリンクの送信', 'ファイルの添付'].map((permission, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`permission-${i}`} 
                                defaultChecked={selectedTemplate.defaultCommand?.requiredPermissions?.includes(permission)} 
                              />
                              <Label htmlFor={`permission-${i}`} className="text-sm">{permission}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* プロンプト設定タブ */}
                    <TabsContent value="prompt" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-prompt-template">プロンプトテンプレート</Label>
                        <Textarea 
                          id="edit-prompt-template" 
                          defaultValue={selectedTemplate.defaultCommand?.promptTemplate} 
                          placeholder="プロンプトテンプレート" 
                          className="min-h-[200px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          変数は {'{{変数名}}'} の形式で指定できます。例: {'{{city}}'}の天気予報を{'{{days}}'}日分表示
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label>変数設定</Label>
                          <Button size="sm" variant="outline">
                            <Plus className="mr-1 h-3 w-3" />
                            変数を追加
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {selectedTemplate.promptStructure?.variables && selectedTemplate.promptStructure.variables.length > 0 ? (
                            selectedTemplate.promptStructure.variables.map((variable: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 border rounded-md p-2">
                                <Input defaultValue={variable} className="h-8" />
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              変数がありません。「変数を追加」ボタンをクリックして変数を追加してください。
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* API連携タブ */}
                    <TabsContent value="api" className="space-y-4">
                      {selectedTemplate?.apiIntegrationStructure?.flow && selectedTemplate.apiIntegrationStructure.flow.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label>API連携フロー</Label>
                            <Button size="sm" variant="outline">
                              <Plus className="mr-1 h-3 w-3" />
                              ステップを追加
                            </Button>
                          </div>
                          
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {selectedTemplate?.apiIntegrationStructure?.flow?.map((step: any, index: number) => (
                              <div key={index} className="border rounded-md p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="h-6 px-2 bg-primary/10">
                                      ステップ {index + 1}
                                    </Badge>
                                    <h4 className="text-sm font-medium">{step.name}</h4>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {index > 0 && (
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {index < (selectedTemplate?.apiIntegrationStructure?.flow?.length || 0) - 1 && (
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">ステップ名</Label>
                                    <Input defaultValue={step.name} className="h-8" />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">サービス</Label>
                                    <Select defaultValue={step.service}>
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                        <SelectItem value="anthropic">Anthropic</SelectItem>
                                        <SelectItem value="stability">Stability AI</SelectItem>
                                        <SelectItem value="deepl">DeepL</SelectItem>
                                        <SelectItem value="spotify">Spotify</SelectItem>
                                        <SelectItem value="openweather">OpenWeather</SelectItem>
                                        <SelectItem value="perplexity">Perplexity</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <Label className="text-xs">説明</Label>
                                  <Input defaultValue={step.description} className="h-8" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-xs">設定</Label>
                                  <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="settings">
                                      <AccordionTrigger className="py-2 text-xs">
                                        詳細設定を表示
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {step.service === 'openai' && step.config?.settings?.openai && (
                                          <div className="space-y-3 pt-2">
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-xs">モデル</Label>
                                                <Select defaultValue={step.config.settings.openai.model}>
                                                  <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                                                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-xs">温度</Label>
                                                <div className="flex items-center gap-2">
                                                  <Slider 
                                                    defaultValue={[step.config.settings.openai.temperature * 100]} 
                                                    max={100} 
                                                    step={1}
                                                    className="flex-1"
                                                  />
                                                  <span className="text-xs w-8 text-right">
                                                    {step.config.settings.openai.temperature}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-1">
                                              <Label className="text-xs">最大トークン数</Label>
                                              <Input 
                                                type="number" 
                                                defaultValue={step.config.settings.openai.maxTokens} 
                                                className="h-8" 
                                              />
                                            </div>
                                            
                                            <div className="space-y-1">
                                              <Label className="text-xs">システムプロンプト</Label>
                                              <Textarea 
                                                defaultValue={step.config.settings.openai.systemPrompt} 
                                                className="min-h-[100px] text-xs font-mono" 
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        {step.service === 'anthropic' && step.config?.settings?.anthropic && (
                                          <div className="space-y-3 pt-2">
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-xs">モデル</Label>
                                                <Select defaultValue={step.config.settings.anthropic.model}>
                                                  <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-xs">温度</Label>
                                                <div className="flex items-center gap-2">
                                                  <Slider 
                                                    defaultValue={[step.config.settings.anthropic.temperature * 100]} 
                                                    max={100} 
                                                    step={1}
                                                    className="flex-1"
                                                  />
                                                  <span className="text-xs w-8 text-right">
                                                    {step.config.settings.anthropic.temperature}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-1">
                                              <Label className="text-xs">最大トークン数</Label>
                                              <Input 
                                                type="number" 
                                                defaultValue={step.config.settings.anthropic.maxTokens} 
                                                className="h-8" 
                                              />
                                            </div>
                                            
                                            <div className="space-y-1">
                                              <Label className="text-xs">システムプロンプト</Label>
                                              <Textarea 
                                                defaultValue={step.config.settings.anthropic.systemPrompt} 
                                                className="min-h-[100px] text-xs font-mono" 
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        {step.service === 'stability' && step.config?.settings?.stability && (
                                          <div className="space-y-3 pt-2">
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-xs">エンジン</Label>
                                                <Select defaultValue={step.config.settings.stability.engine}>
                                                  <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="stable-diffusion-xl-1024-v1-0">Stable Diffusion XL</SelectItem>
                                                    <SelectItem value="stable-diffusion-v1-5">Stable Diffusion 1.5</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-xs">CFG Scale</Label>
                                                <Input 
                                                  type="number" 
                                                  defaultValue={step.config.settings.stability.cfgScale} 
                                                  className="h-8" 
                                                />
                                              </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-xs">ステップ数</Label>
                                                <Input 
                                                  type="number" 
                                                  defaultValue={step.config.settings.stability.steps} 
                                                  className="h-8" 
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-xs">幅</Label>
                                                <Input 
                                                  type="number" 
                                                  defaultValue={step.config.settings.stability.width} 
                                                  className="h-8" 
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-xs">高さ</Label>
                                                <Input 
                                                  type="number" 
                                                  defaultValue={step.config.settings.stability.height} 
                                                  className="h-8" 
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* 他のサービスの設定も同様に実装 */}
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 border rounded-md">
                          <div className="flex flex-col items-center gap-2">
                            <Terminal className="h-8 w-8 text-muted-foreground" />
                            <h3 className="text-lg font-medium">API連携が設定されていません</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              「ステップを追加」ボタンをクリックして、API連携フローを作成してください。
                            </p>
                            <Button className="mt-2">
                              <Plus className="mr-2 h-4 w-4" />
                              ステップを追加
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button type="submit">
                      更新
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* テンプレート適用ダイアログ */}
          <Dialog 
            open={isApplyDialogOpen} 
            onOpenChange={(open) => {
              setIsApplyDialogOpen(open)
              if (!open) {
                setSelectedTemplate(null)
                setSelectedBotIds([])
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>テンプレートを適用</DialogTitle>
                <DialogDescription>
                  {selectedTemplate && `テンプレート「${selectedTemplate.name}」を適用するボットを選択してください。`}
                </DialogDescription>
              </DialogHeader>
              
              {/* ボット選択リスト */}
              <div className="space-y-4 py-4">
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {bots.map(bot => (
                    <div 
                      key={bot.id}
                      className={`p-3 border rounded-md cursor-pointer flex items-center space-x-3 transition-colors ${
                        selectedBotIds.includes(bot.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50 hover:bg-primary/5'
                      }`}
                      onClick={() => toggleBotSelection(bot.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{bot.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {bot.client_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    onClick={handleApplyTemplate}
                    disabled={selectedBotIds.length === 0}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    適用
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {/* カテゴリフィルターと検索バー */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex space-x-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                すべて
              </Button>
              {TEMPLATE_CATEGORIES.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id as TemplateCategory)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            
            <div className="relative w-full max-w-md ml-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="テンプレートを検索..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* テンプレートリスト */}
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Terminal className="h-5 w-5 text-primary" />
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>テンプレート操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>編集</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenApplyDialog(template)}>
                                <Zap className="mr-2 h-4 w-4" />
                                <span>ボットに適用</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                                <Download className="mr-2 h-4 w-4" />
                                <span>エクスポート</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>削除</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{template.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.tags && template.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="details">
                            <AccordionTrigger className="text-sm">詳細を表示</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                <div>
                                  <h4 className="text-sm font-medium mb-1">コマンド名</h4>
                                  <p className="text-sm font-mono bg-muted p-2 rounded">/{template.defaultCommand.name}</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium mb-1">説明</h4>
                                  <p className="text-sm bg-muted p-2 rounded">{template.defaultCommand.description}</p>
                                </div>
                                
                                {template.defaultCommand && template.defaultCommand.options && template.defaultCommand.options.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">オプション</h4>
                                    <div className="space-y-2">
                                      {template.defaultCommand.options.map((option: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm border-b pb-2 last:border-0">
                                          <div>
                                            <span className="font-medium">{option.name}</span>
                                            <span className="text-xs ml-2 text-muted-foreground">
                                              ({option.type}{option.required ? ', 必須' : ''})
                                            </span>
                                          </div>
                                          <div className="text-muted-foreground">{option.description}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {template.defaultCommand.promptTemplate && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">プロンプトテンプレート</h4>
                                    <div className="bg-muted p-2 rounded">
                                      <p className="text-sm font-mono whitespace-pre-wrap">
                                        {template.defaultCommand.promptTemplate}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                {template.defaultCommand.apiService && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">API連携</h4>
                                    <Badge>
                                      {template.defaultCommand.apiService}
                                    </Badge>
                                  </div>
                                )}
                                
                                {template.defaultCommand.apiFlow && template.defaultCommand.apiFlow.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">API連携フロー</h4>
                                    <Badge>
                                      複数API連携 ({template.defaultCommand.apiFlow.length}ステップ)
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="capitalize">{template.difficulty}</span>
                          <span className="mx-2">•</span>
                          <span>{TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenApplyDialog(template)}
                        >
                          <Zap className="mr-2 h-3 w-3" />
                          適用
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">テンプレートが見つかりません</h3>
                  <p className="text-muted-foreground mt-1">
                    検索条件に一致するテンプレートがありません。
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
