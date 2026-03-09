"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import Logo from "./logo"
import { memo } from "react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/workout/select", label: "Entrenar", icon: Calendar },
  { href: "/history", label: "Historial", icon: BarChart3 },
]

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center h-full min-h-[56px] min-w-[64px] px-2 py-2",
        "transition-colors duration-200 ease-in-out",
        "touch-manipulation select-none",
        isActive
          ? "text-primary bg-primary/5"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className={cn("h-6 w-6 mb-1", isActive && "text-primary")} />
      <span className="text-xs font-medium">{item.label}</span>
    </Link>
  )
}

const MemoizedNavLink = memo(NavLink)

function HeaderInner() {
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" aria-label="Ir al inicio">
              <Logo />
            </Link>
          </div>
        </div>
      </header>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        aria-label="Navegación principal"
      >
        {navItems.map((item) => (
          <MemoizedNavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </>
  )
}

// Memoize the entire header to prevent unnecessary re-renders
const Header = memo(HeaderInner)

export default Header
