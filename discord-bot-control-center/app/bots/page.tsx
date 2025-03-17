/**
 * Bot management page for Discord Bot Control Center
 * Created: 2025/3/13
 * Updated: 2025/3/16 - Supabase連携実装
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { 
  Bot, 
  Plus, 
  MoreHorizontal, 
  Play, 
  Square, 
  Trash2, 
  Edit, 
  Copy, 
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// コマンドフックのモック（実際の実装は別途行う）
const useCommands = () => {
  const [loading, setLoading] = useState(false);
  const [commands, setCommands] = useState([]);
  
  return {
    loading,
    commands,
    fetchCommands: () => {},
    createCommand: () => {},
    updateCommand: () => {},
    deleteCommand: () => {}
  };
};

// ボットの型定義
interface BotData {
  id: number;
  name: string;
  client_id: string;
  status: string;
  avatar_url?: string;
  settings: Record<string, any>;
  last_active?: string;
  created_at: string;
  updated_at: string;
  // UI表示用の追加フィールド
  servers?: number;
  commands?: number;
}

// APIを直接呼び出すためのフック
const useBotsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ボット一覧の取得
  const getBots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/bots');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching bots:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      return null;
    }
  };
  
  // 特定のボットの取得
  const getBot = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bots?id=${id}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error(`Error fetching bot ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      return null;
    }
  };
  
  // ボットの追加
  const addBot = async (name: string, clientId: string, token: string, userId: string, avatarUrl?: string) => {
    console.log('addBot関数が呼び出されました', { name, clientId, token: '***', userId, avatarUrl });
    setLoading(true);
    setError(null);
    
    try {
      console.log('APIリクエストを送信します');
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          clientId,
          token,
          userId,
          avatarUrl
        }),
      });
      
      console.log('APIレスポンス:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('APIエラー:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('APIレスポンスデータ:', data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error adding bot:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('エラーメッセージ:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };
  
  // ボットの編集
  const editBot = async (id: number, updates: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/bots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updates
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error(`Error updating bot ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      return null;
    }
  };
  
  // ボットの削除
  const removeBot = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bots?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error(`Error deleting bot ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      return null;
    }
  };
  
  return {
    getBots,
    getBot,
    addBot,
    editBot,
    removeBot,
    loading,
    error
  };
};

export default function BotsPage() {
  const { data: session, status: sessionStatus } = useSession()
  
  // セッション情報のデバッグログ
  useEffect(() => {
    console.log('セッションステータス:', sessionStatus);
    console.log('セッション情報:', session);
  }, [session, sessionStatus]);
  const { toast } = useToast()
  const { loading: commandsLoading, commands } = useCommands()
  const { 
    getBots, 
    getBot, 
    addBot, 
    editBot, 
    removeBot,
    loading,
    error 
  } = useBotsApi()
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [botToDelete, setBotToDelete] = useState<BotData | null>(null)
  const [bots, setBots] = useState<BotData[]>([])
  const [commandCounts, setCommandCounts] = useState<Record<number, number>>({})
  const [newBotData, setNewBotData] = useState({
    name: '',
    clientId: '',
    token: '',
    avatarUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ボット一覧の取得
  useEffect(() => {
    const fetchBotsData = async () => {
      try {
        console.log('Fetching bots data...');
        const botsData = await getBots();
        console.log('Bots data received:', botsData);
        
        if (botsData) {
          // UI表示用のデータを追加
          const enhancedBots = botsData.map((bot: any) => ({
            ...bot,
            servers: bot.settings?.servers?.length || 0,
            commands: commandCounts[bot.id] || 0
          }));
          
          console.log('Enhanced bots:', enhancedBots);
          setBots(enhancedBots);
        } else {
          console.log('No bots data received');
          setBots([]);
        }
      } catch (err) {
        console.error('Error fetching bots:', err);
        setBots([]);
      }
    };
    
    fetchBotsData();
  }, [commandCounts]); // getBots を依存配列から削除
  
  // ボットの作成
  const handleCreateBot = async () => {
    console.log('handleCreateBot関数が呼び出されました');
    console.log('session:', session);
    
    if (!session?.user?.id) {
      console.log('セッションのユーザーIDがありません');
      return;
    }
    
    console.log('ボット作成処理を開始します');
    setIsSubmitting(true);
    
    try {
      console.log('ボットデータ:', newBotData);
      // トークンの暗号化はサーバーサイドで行う
      console.log('addBot関数を呼び出します');
      const result = await addBot(
        newBotData.name,
        newBotData.clientId,
        newBotData.token,
        session.user.id,
        newBotData.avatarUrl
      );
      console.log('addBot関数の結果:', result);
      
      if (result) {
        toast({
          title: "ボットを作成しました",
          description: `${newBotData.name}を作成しました。`,
          type: "success"
        });
        
        setIsCreateDialogOpen(false);
        setNewBotData({
          name: '',
          clientId: '',
          token: '',
          avatarUrl: ''
        });
        
        // ボット一覧を再取得
        const botsData = await getBots();
        if (botsData) {
          setBots(botsData);
        }
      }
    } catch (err) {
      console.error('handleCreateBot関数でエラーが発生しました:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('エラーメッセージ:', errorMessage);
      
      toast({
        title: "エラー",
        description: `ボットの作成に失敗しました: ${errorMessage}`,
        type: "error"
      });
    } finally {
      console.log('ボット作成処理が完了しました（成功または失敗）');
      setIsSubmitting(false);
    }
  };
  
  // ボットの削除
  const handleDeleteBot = async () => {
    if (!botToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await removeBot(botToDelete.id);
      
      if (result) {
        toast({
          title: "ボットを削除しました",
          description: `${botToDelete.name}を削除しました。`,
          type: "success"
        });
        
        setIsDeleteDialogOpen(false);
        setBotToDelete(null);
        
        // ボット一覧を再取得
        const botsData = await getBots();
        if (botsData) {
          setBots(botsData);
        }
      }
    } catch (err) {
      toast({
        title: "エラー",
        description: "ボットの削除に失敗しました。",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ボットの起動/停止
  const handleToggleBotStatus = async (bot: BotData) => {
    const newStatus = bot.status === 'online' ? 'offline' : 'online';
    
    try {
      const result = await editBot(bot.id, { status: newStatus });
      
      if (result) {
        toast({
          title: newStatus === 'online' ? "ボットを起動しました" : "ボットを停止しました",
          description: `${bot.name}を${newStatus === 'online' ? '起動' : '停止'}しました。`,
          type: "success"
        });
        
        // ボット一覧を再取得
        const botsData = await getBots();
        if (botsData) {
          setBots(botsData);
        }
      }
    } catch (err) {
      toast({
        title: "エラー",
        description: `ボットの${newStatus === 'online' ? '起動' : '停止'}に失敗しました。`,
        type: "error"
      });
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "オンライン"
      case "offline":
        return "オフライン"
      case "error":
        return "エラー"
      default:
        return status
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">ボット管理</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新しいボットを作成
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新しいボットを作成</DialogTitle>
                <DialogDescription>
                  新しいDiscordボットの詳細を入力してください。ボットトークンは暗号化されて保存されます。
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                console.log('フォーム送信イベント発生');
                handleCreateBot();
              }}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">ボット名</Label>
                    <Input
                      id="name"
                      placeholder="例: Moderation Bot"
                      value={newBotData.name}
                      onChange={(e) => setNewBotData({...newBotData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clientId">クライアントID</Label>
                    <Input
                      id="clientId"
                      placeholder="例: 123456789012345678"
                      value={newBotData.clientId}
                      onChange={(e) => setNewBotData({...newBotData, clientId: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="token">ボットトークン</Label>
                    <Input
                      id="token"
                      type="password"
                      placeholder="例: MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0.abcdef.ghijklmnopqrstuvwxyz"
                      value={newBotData.token}
                      onChange={(e) => setNewBotData({...newBotData, token: e.target.value})}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-muted-foreground">
                      トークンは暗号化されて保存され、他のユーザーには表示されません。
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="avatar">アバター画像URL（オプション）</Label>
                    <Input
                      id="avatar"
                      placeholder="例: https://example.com/avatar.png"
                      value={newBotData.avatarUrl}
                      onChange={(e) => setNewBotData({...newBotData, avatarUrl: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting} type="button">
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newBotData.name || !newBotData.clientId || !newBotData.token}
                    onClick={() => console.log('作成ボタンがクリックされました')}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    作成
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">ボットがありません</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              新しいボットを作成して、Discordサーバーに追加しましょう。
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新しいボットを作成
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {bots.map((bot, index) => (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          {bot.avatar_url ? (
                            <AvatarImage src={bot.avatar_url} alt={bot.name} />
                          ) : null}
                          <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{bot.name}</CardTitle>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {getStatusIcon(bot.status)}
                            <span className="ml-1">{getStatusText(bot.status)}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>ボット操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>編集</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Terminal className="mr-2 h-4 w-4" />
                            <span>コマンド設定</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(bot.client_id);
                            toast({
                              title: "コピーしました",
                              description: "クライアントIDをクリップボードにコピーしました。",
                              type: "success"
                            });
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>クライアントIDをコピー</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => {
                              setBotToDelete(bot);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>削除</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mb-4">
                      ID: {bot.client_id}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">サーバー数</p>
                        <p className="font-medium">{Array.isArray(bot.servers) ? bot.servers.length : 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">コマンド数</p>
                        <p className="font-medium">{bot.commands || 0}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">最終アクティブ</p>
                        <p className="font-medium">
                          {bot.last_active 
                            ? new Date(bot.last_active).toLocaleString('ja-JP')
                            : '未アクティブ'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {bot.status === "online" ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleToggleBotStatus(bot)}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        停止
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleToggleBotStatus(bot)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        起動
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ボットの削除</DialogTitle>
            <DialogDescription>
              {botToDelete?.name}を削除してもよろしいですか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBot} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
