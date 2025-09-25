"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Pause,
  Play,
  Square,
} from "lucide-react"

const statusBadgeVariants = cva("inline-flex items-center gap-1.5", {
  variants: {
    status: {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      processing: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      failed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
      paused: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      active: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      inactive: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
    },
    size: {
      sm: "text-xs px-1.5 py-0.5",
      md: "text-sm px-2 py-1",
      lg: "text-base px-2.5 py-1.5",
    },
  },
  defaultVariants: {
    status: "pending",
    size: "md",
  },
})

export type StatusType =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "paused"
  | "active"
  | "inactive"

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusBadgeVariants> {
  status: StatusType
  showIcon?: boolean
  animated?: boolean
  label?: string
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      className,
      status,
      size,
      showIcon = true,
      animated = false,
      label,
      ...props
    },
    ref
  ) => {
    const getStatusIcon = (status: StatusType) => {
      const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

      switch (status) {
        case "pending":
          return <Clock className={iconSize} />
        case "processing":
          return (
            <Loader2
              className={cn(iconSize, animated && "animate-spin")}
            />
          )
        case "completed":
          return <CheckCircle className={iconSize} />
        case "failed":
          return <XCircle className={iconSize} />
        case "cancelled":
          return <Square className={iconSize} />
        case "paused":
          return <Pause className={iconSize} />
        case "active":
          return <Play className={iconSize} />
        case "inactive":
          return <AlertCircle className={iconSize} />
        default:
          return null
      }
    }

    const getStatusLabel = (status: StatusType) => {
      if (label) return label

      switch (status) {
        case "pending":
          return "대기중"
        case "processing":
          return "처리중"
        case "completed":
          return "완료"
        case "failed":
          return "실패"
        case "cancelled":
          return "취소됨"
        case "paused":
          return "일시정지"
        case "active":
          return "활성"
        case "inactive":
          return "비활성"
        default:
          return status
      }
    }

    return (
      <Badge
        ref={ref}
        variant="outline"
        className={cn(statusBadgeVariants({ status, size }), className)}
        {...props}
      >
        {showIcon && getStatusIcon(status)}
        <span>{getStatusLabel(status)}</span>
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType
  size?: "sm" | "md" | "lg"
  animated?: boolean
  showPulse?: boolean
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  (
    {
      className,
      status,
      size = "md",
      animated = false,
      showPulse = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-2 w-2",
      md: "h-3 w-3",
      lg: "h-4 w-4",
    }

    const statusClasses = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
      cancelled: "bg-gray-500",
      paused: "bg-orange-500",
      active: "bg-emerald-500",
      inactive: "bg-slate-500",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-full",
          sizeClasses[size],
          statusClasses[status],
          animated && status === "processing" && "animate-pulse",
          className
        )}
        {...props}
      >
        {showPulse && (status === "active" || status === "processing") && (
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              statusClasses[status],
              "opacity-75"
            )}
          />
        )}
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

export { StatusBadge, StatusIndicator, statusBadgeVariants }