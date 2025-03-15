/**
 * Login page for Discord Bot Control Center
 * Created: 2025/3/13
 * Updated: 2025/3/13 - Integrated with useAuth hook for authentication
 */

"use client"

import { useState, FormEvent, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const { login, emailLogin, isLoading } = useAuth();
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Handle email login form submission
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await emailLogin(email, password);
    } catch (error) {
      toast.error("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
      console.error("Login error:", error);
    }
  };
  
  // Handle social login
  const handleSocialLogin = async (provider: string) => {
    try {
      await login(provider);
    } catch (error) {
      toast.error(`${provider}でのログインに失敗しました。`);
      console.error(`${provider} login error:`, error);
    }
  };
  
  // Client-side only rendering for SVG components to avoid hydration errors
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {isClient && <Bot className="h-8 w-8 text-primary" />}
              </div>
            </div>
            <CardTitle className="text-2xl">Discord Bot Control Center</CardTitle>
            <CardDescription>
              {isEmailLogin 
                ? "メールアドレスとパスワードでログイン" 
                : "アカウントでログインして、ボットを管理しましょう"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEmailLogin ? (
              <form className="space-y-4" onSubmit={handleEmailLogin}>
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="メールアドレス" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="パスワード" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="text-right text-sm">
                    <Link href="/forgot-password" className="text-primary hover:underline">
                      パスワードをお忘れですか？
                    </Link>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    "ログイン"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 bg-[#5865F2] text-white hover:bg-[#4752c4] hover:text-white"
                  onClick={() => handleSocialLogin("discord")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    isClient && <DiscordIcon className="h-5 w-5" />
                  )}
                  <span>Discordでログイン</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    isClient && (
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )
                  )}
                  <span>Googleでログイン</span>
                </Button>
                <Button 
                  variant="link" 
                  className="w-full"
                  onClick={() => setIsEmailLogin(true)}
                  disabled={isLoading}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  <span>メールアドレスでログイン</span>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              {isEmailLogin ? (
                <Button 
                  variant="link" 
                  className="text-primary"
                  onClick={() => setIsEmailLogin(false)}
                >
                  ソーシャルログインに戻る
                </Button>
              ) : (
                <div>
                  アカウントをお持ちでない場合は
                  <Link href="/register" className="text-primary hover:underline ml-1">
                    新規登録
                  </Link>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

// Bot icon component
function Bot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

// Discord icon component
function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}
