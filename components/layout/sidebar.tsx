"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface SidebarItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  disabled?: boolean
  children?: SidebarItem[]
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[]
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  showToggle?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      items,
      collapsed = false,
      onCollapsedChange,
      showToggle = true,
      header,
      footer,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname()

    const isActiveItem = (item: SidebarItem): boolean => {
      if (item.href === pathname) return true
      if (item.children) {
        return item.children.some(child => isActiveItem(child))
      }
      return false
    }

    const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
      const isActive = isActiveItem(item)
      const hasChildren = item.children && item.children.length > 0
      const Icon = item.icon

      if (collapsed && level === 0) {
        return (
          <TooltipProvider key={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-center p-2 h-10",
                    item.disabled && "pointer-events-none opacity-50"
                  )}
                  asChild={!item.disabled}
                  disabled={item.disabled}
                >
                  {item.disabled ? (
                    <div>
                      {Icon && <Icon className="h-4 w-4" />}
                    </div>
                  ) : (
                    <Link href={item.href}>
                      {Icon && <Icon className="h-4 w-4" />}
                    </Link>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {item.title}
                {item.badge && (
                  <Badge variant={item.badge.variant} className="ml-auto">
                    {item.badge.text}
                  </Badge>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return (
        <div key={item.href} className="space-y-1">
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              level > 0 && `ml-${level * 4} w-auto`,
              item.disabled && "pointer-events-none opacity-50"
            )}
            asChild={!item.disabled}
            disabled={item.disabled}
          >
            {item.disabled ? (
              <div className="flex items-center">
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant={item.badge.variant} className="ml-auto">
                    {item.badge.text}
                  </Badge>
                )}
              </div>
            ) : (
              <Link href={item.href} className="flex items-center">
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant={item.badge.variant} className="ml-auto">
                    {item.badge.text}
                  </Badge>
                )}
              </Link>
            )}
          </Button>

          {hasChildren && !collapsed && (
            <div className="ml-4 space-y-1">
              {item.children?.map(child => renderSidebarItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <TooltipProvider>
        <div
          ref={ref}
          className={cn(
            "flex h-full flex-col border-r bg-background",
            collapsed ? "w-16" : "w-64",
            className
          )}
          {...props}
        >
          {header && (
            <div className={cn("p-4", collapsed && "px-2")}>
              {header}
            </div>
          )}

          <ScrollArea className="flex-1 px-3">
            <div className="space-y-2 py-2">
              {items.map(item => renderSidebarItem(item))}
            </div>
          </ScrollArea>

          {footer && (
            <>
              <Separator />
              <div className={cn("p-4", collapsed && "px-2")}>
                {footer}
              </div>
            </>
          )}

          {showToggle && (
            <>
              <Separator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onCollapsedChange?.(!collapsed)}
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      축소
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </TooltipProvider>
    )
  }
)
Sidebar.displayName = "Sidebar"

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  logo?: React.ReactNode
  collapsed?: boolean
}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, title, logo, collapsed, children, ...props }, ref) => {
    if (collapsed) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-center", className)}
          {...props}
        >
          {logo}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        {logo}
        {title && (
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        )}
        {children}
      </div>
    )
  }
)
SidebarHeader.displayName = "SidebarHeader"

export { Sidebar, SidebarHeader }