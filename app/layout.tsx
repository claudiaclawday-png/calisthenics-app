import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import DebugPanel from "@/components/debug-panel"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Request notification permission when the app loads
  if (typeof window !== "undefined") {
    // Use setTimeout to ensure this runs after the component mounts
    setTimeout(() => {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
    }, 2000)
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <title>Seguimiento de Calistenia</title>
        <meta name="description" content="Controla tu rutina de calistenia y tu progreso" />
        <script src="/register-sw.js" defer></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16">{children}</main>
            <DebugPanel />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
