"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface MainLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  sidebarCollapsed?: boolean
  sidebarWidth?: string
  collapsedSidebarWidth?: string
}

const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  (
    {
      className,
      header,
      sidebar,
      footer,
      children,
      sidebarCollapsed = false,
      sidebarWidth = "16rem",
      collapsedSidebarWidth = "4rem",
      ...props
    },
    ref
  ) => {
    const currentSidebarWidth = sidebarCollapsed ? collapsedSidebarWidth : sidebarWidth

    return (
      <div
        ref={ref}
        className={cn("flex h-screen overflow-hidden bg-background", className)}
        {...props}
      >
        {sidebar && (
          <aside
            className={cn(
              "border-r bg-muted/10 transition-all duration-300 ease-in-out",
              "flex-shrink-0"
            )}
            style={{ width: currentSidebarWidth }}
          >
            {sidebar}
          </aside>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {header && (
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {header}
            </header>
          )}

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>

          {footer && (
            <footer className="border-t bg-background">
              {footer}
            </footer>
          )}
        </div>
      </div>
    )
  }
)
MainLayout.displayName = "MainLayout"

export interface AppLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sidebar" | "centered" | "full"
}

const AppLayout = React.forwardRef<HTMLDivElement, AppLayoutProps>(
  ({ className, variant = "sidebar", children, ...props }, ref) => {
    switch (variant) {
      case "centered":
        return (
          <div
            ref={ref}
            className={cn(
              "min-h-screen flex items-center justify-center bg-background",
              className
            )}
            {...props}
          >
            <div className="w-full max-w-md space-y-6">
              {children}
            </div>
          </div>
        )

      case "full":
        return (
          <div
            ref={ref}
            className={cn("min-h-screen bg-background", className)}
            {...props}
          >
            {children}
          </div>
        )

      case "sidebar":
      default:
        return (
          <div
            ref={ref}
            className={cn("min-h-screen bg-background", className)}
            {...props}
          >
            {children}
          </div>
        )
    }
  }
)
AppLayout.displayName = "AppLayout"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    { className, title, description, actions, breadcrumb, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4 pb-4", className)}
        {...props}
      >
        {breadcrumb && (
          <div className="text-sm text-muted-foreground">
            {breadcrumb}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>

        {children}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ className, maxWidth = "full", children, ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          maxWidth !== "full" && "mx-auto",
          maxWidthClasses[maxWidth],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageContent.displayName = "PageContent"

export { MainLayout, AppLayout, PageHeader, PageContent }