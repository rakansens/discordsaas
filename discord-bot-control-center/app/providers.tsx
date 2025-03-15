/**
 * Application providers
 * Created: 2025/3/14
 */

"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster richColors position="top-right" />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
