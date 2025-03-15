/**
 * Bot management page for Discord Bot Control Center
 * Created: 2025/3/13
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
  AlertCircle
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

// Mock data for UI demonstration
const mockBots = [
  {
    id: "1",
    name: "Moderation Bot",
    clientId: "123456789012345678",
    status: "online",
    avatar: "/placeholder-bot-1.svg",
    servers: 8,
    commands: 12,
    lastActive: "2025-03-13T01:23:45Z"
  },
  {
    id: "2",
    name: "Music Bot",
    clientId: "234567890123456789",
    status: "online",
    avatar: "/placeholder-bot-2.svg",
    servers: 5,
    commands: 8,
    lastActive: "2025-03-13T02:34:56Z"
  },
  {
    id: "3",
    name: "Utility Bot",
    clientId: "345678901234567890",
    status: "offline",
    avatar: "/placeholder-bot-3.svg",
    servers: 3,
    commands: 15,
    lastActive: "2025-03-12T12:45:12Z"
  },
  {
    id: "4",
    name: "AI Assistant Bot",
    clientId: "456789012345678901",
    status: "error",
    avatar: "/placeholder-bot-4.svg",
    servers: 2,
    commands: 5,
    lastActive: "2025-03-12T18:12:33Z"
  }
]

export default function BotsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [bots, setBots] = useState(mockBots)
  
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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">ボット名</Label>
                  <Input id="name" placeholder="例: Moderation Bot" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientId">クライアントID</Label>
                  <Input id="clientId" placeholder="例: 123456789012345678" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="token">ボットトークン</Label>
                  <Input id="token" type="password" placeholder="例: MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0.abcdef.ghijklmnopqrstuvwxyz" />
                  <p className="text-xs text-muted-foreground">
                    トークンは暗号化されて保存され、他のユーザーには表示されません。
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="avatar">アバター画像（オプション）</Label>
                  <Input id="avatar" type="file" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  作成
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>クライアントIDをコピー</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>削除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-4">
                    ID: {bot.clientId}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">サーバー数</p>
                      <p className="font-medium">{bot.servers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">コマンド数</p>
                      <p className="font-medium">{bot.commands}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">最終アクティブ</p>
                      <p className="font-medium">
                        {new Date(bot.lastActive).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {bot.status === "online" ? (
                    <Button variant="outline" className="w-full">
                      <Square className="mr-2 h-4 w-4" />
                      停止
                    </Button>
                  ) : (
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      起動
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MainLayout>
  )
}
