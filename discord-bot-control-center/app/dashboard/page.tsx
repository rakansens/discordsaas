/**
 * Dashboard page for Discord Bot Control Center
 * Created: 2025/3/13
 * Updated: 2025/3/14 - Integrated with API hooks
 */

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bot, Server, MessageSquare, Users, Activity, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useBots } from "@/hooks/useBots"
import { BotStatus } from "@/types/bot"

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { bots, loading: botsLoading, error, fetchBots } = useBots();
  
  // Client-side only rendering for SVG components to avoid hydration errors
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Derived state
  const [stats, setStats] = useState([
    { 
      title: "アクティブボット", 
      value: "0", 
      description: "現在オンラインのボット", 
      icon: <Bot className="h-5 w-5 text-primary" />,
      change: "Loading..."
    },
    { 
      title: "サーバー数", 
      value: "0", 
      description: "ボットが参加しているサーバー", 
      icon: <Server className="h-5 w-5 text-indigo-500" />,
      change: "Loading..."
    },
    { 
      title: "コマンド実行数", 
      value: "0", 
      description: "過去24時間", 
      icon: <MessageSquare className="h-5 w-5 text-green-500" />,
      change: "Loading..."
    },
    { 
      title: "ユーザー数", 
      value: "0", 
      description: "全サーバー合計", 
      icon: <Users className="h-5 w-5 text-blue-500" />,
      change: "Loading..."
    },
  ]);
  
  // Mock data for activity and alerts (would be fetched from API in a real implementation)
  const recentActivity = [
    { bot: "Moderation Bot", event: "コマンド実行: /ban", time: "5分前", status: "成功" },
    { bot: "Music Bot", event: "プロセス再起動", time: "23分前", status: "成功" },
    { bot: "Utility Bot", event: "新しいサーバーに参加", time: "1時間前", status: "成功" },
    { bot: "Moderation Bot", event: "エラー発生", time: "2時間前", status: "失敗" },
    { bot: "Music Bot", event: "コマンド実行: /play", time: "3時間前", status: "成功" },
  ];
  
  const [alerts, setAlerts] = useState<{ title: string; description: string; severity: string }[]>([]);
  
  // Skip authentication check in development with SKIP_AUTH=true
  const isSkipAuth = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SKIP_AUTH === "true";
  
  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isSkipAuth && !authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router, isSkipAuth]);
  
  // Fetch bots on component mount
  useEffect(() => {
    if (isAuthenticated || isSkipAuth) {
      fetchBots().catch((err) => {
        toast.error("ボットの取得に失敗しました");
        console.error("Error fetching bots:", err);
      });
    }
  }, [isAuthenticated, fetchBots, isSkipAuth]);
  
  // Update stats when bots data changes
  useEffect(() => {
    if (bots.length > 0) {
      // Count online bots
      const onlineBots = bots.filter((bot) => bot.status === "online").length;
      
      // Update stats
      setStats((prevStats) => {
        const newStats = [...prevStats];
        newStats[0] = {
          ...newStats[0],
          value: onlineBots.toString(),
          change: `${bots.length}個中${onlineBots}個オンライン`,
        };
        return newStats;
      });
      
      // Check for bots with error status and create alerts
      const errorBots = bots.filter((bot) => bot.status === "error");
      if (errorBots.length > 0) {
        const newAlerts = errorBots.map((bot) => ({
          title: `${bot.name}でエラーが発生しています`,
          description: "ボットのステータスを確認してください",
          severity: "high",
        }));
        
        setAlerts(newAlerts);
      }
    }
  }, [bots]);
  
  // Handle create new bot
  const handleCreateBot = () => {
    router.push("/bots/new");
  };
  
  // Show loading state
  if (authLoading || botsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center space-y-4">
            {isClient && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            <p className="text-lg">データを読み込み中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center space-y-4 text-center">
            {isClient && <AlertCircle className="h-12 w-12 text-red-500" />}
            <p className="text-lg">データの読み込みに失敗しました</p>
            <p className="text-muted-foreground">
              {error.message || "エラーが発生しました。もう一度お試しください。"}
            </p>
            <Button onClick={() => fetchBots()}>再試行</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
          <Button onClick={handleCreateBot}>
            {isClient && <Bot className="mr-2 h-4 w-4" />}
            新しいボットを作成
          </Button>
        </div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {isClient && stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isClient && <Activity className="mr-2 h-5 w-5" />}
                  最近のアクティビティ
                </CardTitle>
                <CardDescription>
                  過去24時間のボットアクティビティ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{activity.bot}</p>
                        <p className="text-sm text-muted-foreground">{activity.event}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{activity.time}</p>
                        <p className={`text-xs ${activity.status === "成功" ? "text-green-500" : "text-red-500"}`}>
                          {activity.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isClient && <AlertCircle className="mr-2 h-5 w-5 text-red-500" />}
                  アラート
                </CardTitle>
                <CardDescription>
                  注意が必要な問題
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                      <div 
                        key={index} 
                        className={`rounded-lg p-3 ${
                          alert.severity === "high" 
                            ? "bg-red-500/10 border border-red-500/20" 
                            : "bg-yellow-500/10 border border-yellow-500/20"
                        }`}
                      >
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">アラートはありません</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}
