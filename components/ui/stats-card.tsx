"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cva, type VariantProps } from "class-variance-authority"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const statsCardVariants = cva("", {
  variants: {
    trend: {
      up: "text-emerald-600 dark:text-emerald-400",
      down: "text-red-600 dark:text-red-400",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
})

export interface StatsCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsCardVariants> {
  title: string
  value: string | number
  description?: string
  change?: {
    value: number
    label?: string
    trend?: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  loading?: boolean
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      className,
      title,
      value,
      description,
      change,
      icon,
      badge,
      loading = false,
      ...props
    },
    ref
  ) => {
    const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
      switch (trend) {
        case "up":
          return <TrendingUp className="h-4 w-4" />
        case "down":
          return <TrendingDown className="h-4 w-4" />
        case "neutral":
        default:
          return <Minus className="h-4 w-4" />
      }
    }

    const formatValue = (val: string | number) => {
      if (typeof val === "number") {
        return val.toLocaleString()
      }
      return val
    }

    const formatChange = (changeValue: number) => {
      const sign = changeValue > 0 ? "+" : ""
      return `${sign}${changeValue.toFixed(1)}%`
    }

    if (loading) {
      return (
        <Card ref={ref} className={cn(className)} {...props}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardTitle>
            {icon && <div className="h-4 w-4 animate-pulse rounded bg-muted" />}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant={badge.variant || "default"} className="text-xs">
                {badge.text}
              </Badge>
            )}
            {icon && <div className="text-muted-foreground">{icon}</div>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            <div className="flex items-center gap-2">
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {change && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    statsCardVariants({ trend: change.trend })
                  )}
                >
                  {getTrendIcon(change.trend)}
                  <span>{formatChange(change.value)}</span>
                  {change.label && (
                    <span className="text-muted-foreground">
                      {change.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatsCard.displayName = "StatsCard"

interface StatsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
}

const StatsGrid = React.forwardRef<HTMLDivElement, StatsGridProps>(
  ({ className, children, cols = 3, ...props }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }

    return (
      <div
        ref={ref}
        className={cn("grid gap-4", gridCols[cols], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StatsGrid.displayName = "StatsGrid"

export { StatsCard, StatsGrid, statsCardVariants }