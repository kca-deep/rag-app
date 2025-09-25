"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  notifications?: React.ReactNode
  user?: React.ReactNode
  logo?: React.ReactNode
  navigation?: React.ReactNode
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      title,
      subtitle,
      actions,
      breadcrumb,
      notifications,
      user,
      logo,
      navigation,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        {...props}
      >
        <div className="container flex h-14 items-center">
          {logo && (
            <>
              <div className="mr-4">{logo}</div>
              <Separator orientation="vertical" className="mr-4 h-6" />
            </>
          )}

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-4">
              {breadcrumb && (
                <div className="text-sm text-muted-foreground">
                  {breadcrumb}
                </div>
              )}

              {(title || subtitle) && (
                <div className="space-y-1">
                  {title && (
                    <h1 className="text-lg font-semibold leading-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              {navigation && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <nav className="flex items-center space-x-1">
                    {navigation}
                  </nav>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {actions && (
                <>
                  <div className="flex items-center space-x-2">
                    {actions}
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}

              {notifications && (
                <>
                  {notifications}
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}

              {user && user}
            </div>
          </div>

          {children}
        </div>
      </header>
    )
  }
)
Header.displayName = "Header"

export interface HeaderBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  logo?: React.ReactNode
  href?: string
}

const HeaderBrand = React.forwardRef<HTMLDivElement, HeaderBrandProps>(
  ({ className, title, logo, href = "/", children, ...props }, ref) => {
    const content = (
      <div
        className={cn("flex items-center space-x-2", className)}
        {...props}
      >
        {logo && <div className="flex-shrink-0">{logo}</div>}
        {title && (
          <span className="font-bold text-lg">{title}</span>
        )}
        {children}
      </div>
    )

    if (href) {
      return (
        <Button
          ref={ref}
          variant="ghost"
          className="h-auto p-0"
          asChild
        >
          <a href={href}>
            {content}
          </a>
        </Button>
      )
    }

    return (
      <div ref={ref}>
        {content}
      </div>
    )
  }
)
HeaderBrand.displayName = "HeaderBrand"

export interface HeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const HeaderActions = React.forwardRef<HTMLDivElement, HeaderActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
HeaderActions.displayName = "HeaderActions"

export interface HeaderNotificationsProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  showBadge?: boolean
}

const HeaderNotifications = React.forwardRef<HTMLDivElement, HeaderNotificationsProps>(
  ({ className, count = 0, showBadge = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex items-center", className)}
        {...props}
      >
        {children}
        {showBadge && count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </div>
    )
  }
)
HeaderNotifications.displayName = "HeaderNotifications"

export interface HeaderUserProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  email?: string
  avatar?: React.ReactNode
}

const HeaderUser = React.forwardRef<HTMLDivElement, HeaderUserProps>(
  ({ className, name, email, avatar, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-3", className)}
        {...props}
      >
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        {(name || email) && (
          <div className="min-w-0 text-right">
            {name && (
              <div className="truncate text-sm font-medium">{name}</div>
            )}
            {email && (
              <div className="truncate text-xs text-muted-foreground">
                {email}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }
)
HeaderUser.displayName = "HeaderUser"

export {
  Header,
  HeaderBrand,
  HeaderActions,
  HeaderNotifications,
  HeaderUser,
}