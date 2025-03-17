/**
 * Command management page for Discord Bot Control Center
 * Created: 2025/3/13
 * Updated: 2025/3/14 - コマンド作成ダイアログをウィザード形式に変更
 * Updated: 2025/3/14 - ボット選択UIを改善し、ボットごとのコマンド表示に変更
 * Updated: 2025/3/14 - テンプレートベースのコマンド作成フローを追加
 * Updated: 2025/3/14 - ファイル構造を整理し、重複コードを削除
 * Updated: 2025/3/15 - コマンドのアウトプット先設定を追加
 * Updated: 2025/3/16 - Supabase MCPサーバーとの連携を実装
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
  Loader2
} from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
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
import { CommandWizard } from "@/components/command/command-wizard"
import { TemplateSelector } from "@/components/command/template/template-selector"
import { CommandTemplate } from "@/types/template"
import { ApiConfig } from "@/types/api-config"
import { Command, CommandOption, CommandOptionType } from "@/types/command"
import { useCommandsMcp, CommandWithPrompt, CreateCommandRequest, UpdateCommandRequest, PromptInfo } from "@/hooks/useCommandsMcp"
import { useToast } from "@/components/ui/use-toast"

export default function CommandsPage() {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [creationStep, setCreationStep] = useState<"template" | "wizard">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<CommandTemplate | null>(null)
  const [bots, setBots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // ボットデータを取得する関数
  const fetchBots = async () => {
    try {
      const response = await fetch('/api/bots');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching bots:', err);
      throw err;
    }
  };
  const { 
    commands, 
    loading: commandsLoading, 
    error: commandsError,
    selectedCommand,
    setSelectedCommand,
    fetchCommands,
    addCommand,
    editCommand,
    removeCommand
  } = useCommandsMcp()
  
  const { toast } = useToast()
  
  // ボットデータの取得
  useEffect(() => {
    const loadBots = async () => {
      setIsLoading(true)
      try {
        const botsData = await fetchBots()
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
  }, [fetchBots, toast])
  
  // ボットが選択された時にコマンドを取得
  useEffect(() => {
    if (selectedBotId) {
      const loadCommands = async () => {
        try {
          await fetchCommands(parseInt(selectedBotId))
        } catch (error) {
          console.error("Error loading commands:", error)
          toast({
            title: "エラー",
            description: "コマンドデータの取得に失敗しました。",
            type: "error"
          })
        }
      }
      
      loadCommands()
    }
  }, [selectedBotId, fetchCommands, toast])
  
  // Filter commands based on search query
  const filteredCommands = commands.filter(command => {
    // 検索クエリがある場合はフィルタリング
    return searchQuery === "" || 
           command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           command.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get bot name by ID
  const getBotName = (botId: string) => {
    const bot = bots.find(b => b.id.toString() === botId)
    return bot ? bot.name : "Unknown Bot"
  }

  // コマンドの編集を開始
  const handleEditCommand = (command: CommandWithPrompt) => {
    setSelectedCommand(command)
    setIsEditDialogOpen(true)
  }

  // テンプレートが選択された時の処理
  const handleSelectTemplate = (template: CommandTemplate) => {
    setSelectedTemplate(template)
    setCreationStep("wizard")
  }
  
  // テンプレート選択をキャンセル
  const handleCancelTemplateSelection = () => {
    setIsCreateDialogOpen(false)
    setCreationStep("template")
    setSelectedTemplate(null)
  }

  // 新しいコマンドを保存
  const handleSaveNewCommand = async (command: Partial<Command> | CreateCommandRequest | UpdateCommandRequest) => {
    try {
      // コマンドオブジェクトをCreateCommandRequest型に変換
      const createRequest: CreateCommandRequest = {
        botId: selectedBotId || "",
        name: command.name || "",
        description: command.description || "",
        options: command.options || [],
        prompt: 'prompt' in command && command.prompt ? {
          content: command.prompt.content,
          variables: command.prompt.variables,
          apiIntegration: command.prompt.apiIntegration,
          apiSettings: 'apiSettings' in command.prompt ? command.prompt.apiSettings : null
        } : undefined,
        apiFlow: command.apiFlow,
        enabled: command.enabled,
        outputDestination: command.outputDestination
      };
      
      const result = await addCommand(createRequest);
      
      if (result) {
        setIsCreateDialogOpen(false)
        setCreationStep("template")
        setSelectedTemplate(null)
        
        toast({
          title: "成功",
          description: "新しいコマンドを作成しました。",
          type: "success"
        })
      }
    } catch (error) {
      console.error("Error saving new command:", error)
      toast({
        title: "エラー",
        description: "コマンドの作成に失敗しました。",
        type: "error"
      })
    }
  }

  // 既存のコマンドを更新
  const handleUpdateCommand = async (command: Partial<Command> | CreateCommandRequest | UpdateCommandRequest) => {
    try {
      if (!selectedCommand) return;
      
      // コマンドオブジェクトをUpdateCommandRequest型に変換
      const updateRequest: UpdateCommandRequest = {
        id: selectedCommand.id,
        botId: command.botId,
        name: command.name,
        description: command.description,
        options: command.options,
        prompt: 'prompt' in command && command.prompt ? {
          content: command.prompt.content,
          variables: command.prompt.variables,
          apiIntegration: command.prompt.apiIntegration,
          apiSettings: 'apiSettings' in command.prompt ? command.prompt.apiSettings : null
        } : undefined,
        apiFlow: command.apiFlow,
        enabled: command.enabled,
        outputDestination: command.outputDestination
      };
      
      const result = await editCommand(updateRequest);
      
      if (result) {
        setIsEditDialogOpen(false)
        
        toast({
          title: "成功",
          description: "コマンドを更新しました。",
          type: "success"
        })
      }
    } catch (error) {
      console.error("Error updating command:", error)
      toast({
        title: "エラー",
        description: "コマンドの更新に失敗しました。",
        type: "error"
      })
    }
  }
  
  // コマンドを削除
  const handleDeleteCommand = async (id: string) => {
    try {
      const result = await removeCommand(parseInt(id))
      
      if (result) {
        toast({
          title: "成功",
          description: "コマンドを削除しました。",
          type: "success"
        })
      }
    } catch (error) {
      console.error("Error deleting command:", error)
      toast({
        title: "エラー",
        description: "コマンドの削除に失敗しました。",
        type: "error"
      })
    }
  }

  // テンプレートからコマンド初期値を作成
  const createInitialCommandFromTemplate = (): Partial<Command> => {
    if (!selectedTemplate || !selectedBotId) {
      return {
        botId: selectedBotId || "",
        name: "",
        description: "",
        options: [],
        usage: "",
        outputDestination: { type: "global" } // デフォルトはグローバル（制限なし）
      };
    }

    // テンプレートにアウトプット先の設定があれば使用し、なければデフォルト値を使用
    const outputDestination = selectedTemplate.defaultCommand.outputDestination || { type: "global" };
    
    // テンプレートにAPI連携フローの設定があれば使用
    const apiFlow = selectedTemplate.defaultCommand.apiFlow;

    // テンプレートのオプションをCommandOption型に変換
    const options: CommandOption[] = selectedTemplate.defaultCommand.options.map(opt => ({
      id: opt.id || Math.random().toString(36).substring(2, 9),
      name: opt.name,
      description: opt.description,
      type: opt.type as CommandOptionType, // 型をCommandOptionTypeに変換
      required: opt.required,
      choices: opt.choices,
      subOptions: opt.subOptions as CommandOption[] // 型をCommandOption[]に変換
    }));

    return {
      botId: selectedBotId,
      name: selectedTemplate.defaultCommand.name,
      description: selectedTemplate.defaultCommand.description,
      options,
      usage: `/${selectedTemplate.defaultCommand.name} ${selectedTemplate.defaultCommand.options
        .map(opt => opt.required ? `<${opt.name}>` : `[${opt.name}]`)
        .join(" ")}`,
      enabled: true,
      outputDestination, // テンプレートからのアウトプット先設定
      apiFlow // テンプレートからのAPI連携フロー設定
    };
  };

  // テンプレートからAPI設定を作成
  const createApiConfigFromTemplate = (): ApiConfig | undefined => {
    if (!selectedTemplate || !selectedTemplate.defaultCommand.apiService) {
      return undefined;
    }

    return {
      service: selectedTemplate.defaultCommand.apiService,
      settings: selectedTemplate.defaultCommand.apiSettings || {}
    };
  };

  // テンプレートからプロンプトテンプレートを取得
  const getPromptTemplateFromTemplate = (): string | undefined => {
    if (!selectedTemplate || !selectedTemplate.defaultCommand.promptTemplate) {
      return undefined;
    }

    return selectedTemplate.defaultCommand.promptTemplate;
  };

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">コマンド設定</h2>
          
          {selectedBotId && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新しいコマンドを作成
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                {creationStep === "template" ? (
                  // テンプレート選択画面
                  <TemplateSelector
                    onSelectTemplate={handleSelectTemplate}
                    onCancel={handleCancelTemplateSelection}
                    botId={selectedBotId}
                  />
                ) : (
                  // コマンドウィザード
                  <>
                    <DialogHeader>
                      <DialogTitle>新しいコマンドを作成</DialogTitle>
                      <DialogDescription>
                        新しいDiscordボットコマンドの詳細を入力してください。
                      </DialogDescription>
                    </DialogHeader>
                    
                    <CommandWizard
                      bots={bots}
                      initialCommand={createInitialCommandFromTemplate()}
                      initialApiConfig={createApiConfigFromTemplate()}
                      initialPromptContent={getPromptTemplateFromTemplate()}
                      onSave={handleSaveNewCommand}
                      onCancel={() => {
                        setCreationStep("template")
                        setSelectedTemplate(null)
                      }}
                    />
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
          
          {/* コマンド編集ダイアログ */}
          <Dialog 
            open={isEditDialogOpen} 
            onOpenChange={(open) => {
              setIsEditDialogOpen(open)
              if (!open) {
                setCreationStep("template")
                setSelectedTemplate(null)
              }
            }}
          >
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>コマンドを編集</DialogTitle>
                <DialogDescription>
                  コマンドの詳細を編集してください。
                </DialogDescription>
              </DialogHeader>
              
              {/* コマンドウィザードコンポーネントを使用 */}
              {selectedCommand && (
                <CommandWizard
                  bots={bots}
                  initialCommand={selectedCommand as unknown as Partial<Command>}
                  onSave={handleUpdateCommand}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* ボット選択セクション */}
        {!selectedBotId ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {bots.map(bot => (
              <Card 
                key={bot.id}
                className="cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
                onClick={() => setSelectedBotId(bot.id.toString())}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{bot.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {commands.filter(cmd => cmd.botId === bot.id.toString()).length} コマンド
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="cursor-pointer hover:border-primary/50 hover:bg-primary/5">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">新しいボットを追加</h3>
                  <p className="text-xs text-muted-foreground">
                    ボットを作成して設定する
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ボット情報とナビゲーション */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedBotId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{getBotName(selectedBotId)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredCommands.length} コマンド
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 検索バー */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="コマンドを検索..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* コマンドリスト */}
            {commandsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((command, index) => (
                    <motion.div
                      key={command.id}
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
                                <CardTitle className="text-lg">/{command.name}</CardTitle>
                                {command.prompt && (
                                  <Badge variant="outline" className="ml-2">
                                    プロンプト
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>コマンド操作</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditCommand(command)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>編集</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>複製</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-500"
                                  onClick={() => handleDeleteCommand(command.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>削除</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{command.description}</p>
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="details">
                              <AccordionTrigger className="text-sm">詳細を表示</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">使用方法</h4>
                                    <p className="text-sm font-mono bg-muted p-2 rounded">{command.usage}</p>
                                  </div>
                                  
                                  {command.options.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">オプション</h4>
                                      <div className="space-y-2">
                                        {command.options.map((option, i) => (
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
                                  
                                  {command.prompt && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">プロンプト</h4>
                                      <div className="bg-muted p-2 rounded">
                                        <p className="text-sm font-mono whitespace-pre-wrap">
                                          {command.prompt.content}
                                        </p>
                                        {command.prompt.apiIntegration && (
                                          <Badge className="mt-2">
                                            {command.prompt.apiIntegration} 連携
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">コマンドが見つかりません</h3>
                    <p className="text-muted-foreground mt-1">
                      検索条件に一致するコマンドがありません。
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
