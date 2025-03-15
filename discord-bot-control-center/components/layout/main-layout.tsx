/**
 * Main layout component for the Discord Bot Control Center
 * Created: 2025/3/13
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Home, 
  Bot, 
  Terminal, 
  Settings, 
  LogOut, 
  Menu, 
  Moon, 
  Sun, 
  User
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toggle } from "@/components/ui/toggle"

interface MainLayoutProps {
  children: React.ReactNode
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
      {isActive && (
        <motion.div
          className="absolute left-0 h-full w-1 bg-primary rounded-r-full"
          layoutId="activeNavIndicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  )
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  // Client-side only rendering for SVG components to avoid hydration errors
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // In a real implementation, this would toggle the theme in the document
    // and save the preference to localStorage
  }

  const navItems = [
    { href: "/dashboard", icon: isClient ? <Home size={20} /> : null, label: "ダッシュボード" },
    { href: "/bots", icon: isClient ? <Bot size={20} /> : null, label: "ボット管理" },
    { href: "/commands", icon: isClient ? <Terminal size={20} /> : null, label: "コマンド設定" },
    { href: "/settings", icon: isClient ? <Settings size={20} /> : null, label: "設定" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Discord Bot Center</h2>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            {isClient && <LogOut size={20} />}
            <span>ログアウト</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <div className="md:hidden border-b p-4 flex items-center justify-between">
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              {isClient && <Menu />}
            </Button>
          </SheetTrigger>
          <h2 className="text-lg font-semibold">Discord Bot Center</h2>
          <div className="flex items-center gap-2">
            <Toggle
              aria-label="Toggle theme"
              pressed={isDarkMode}
              onPressedChange={toggleTheme}
            >
              {isClient && (isDarkMode ? <Moon size={18} /> : <Sun size={18} />)}
            </Toggle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>ユ</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {isClient && <User className="mr-2 h-4 w-4" />}
                  <span>プロフィール</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {isClient && <Settings className="mr-2 h-4 w-4" />}
                  <span>設定</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {isClient && <LogOut className="mr-2 h-4 w-4" />}
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">Discord Bot Center</h2>
          </div>
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </nav>
          <div className="border-t p-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            {isClient && <LogOut size={20} />}
            <span>ログアウト</span>
          </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1">
        {/* Desktop Header */}
        <header className="hidden md:flex h-14 items-center border-b px-6 justify-between">
          <h1 className="text-xl font-semibold">
            {navItems.find(item => item.href === pathname)?.label || "Discord Bot Control Center"}
          </h1>
          <div className="flex items-center gap-4">
            <Toggle
              aria-label="Toggle theme"
              pressed={isDarkMode}
              onPressedChange={toggleTheme}
            >
              {isClient && (isDarkMode ? <Moon size={18} /> : <Sun size={18} />)}
            </Toggle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>ユ</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {isClient && <User className="mr-2 h-4 w-4" />}
                  <span>プロフィール</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {isClient && <Settings className="mr-2 h-4 w-4" />}
                  <span>設定</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {isClient && <LogOut className="mr-2 h-4 w-4" />}
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
