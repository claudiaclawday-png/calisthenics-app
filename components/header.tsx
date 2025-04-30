"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import Logo from "./logo"

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/workout/select", label: "Entrenar", icon: Calendar },
    { href: "/history", label: "Historial", icon: BarChart3 },
  ]

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex h-16 items-center justify-around border-t bg-background">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center text-xs",
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
