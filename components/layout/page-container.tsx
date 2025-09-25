"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
  centered?: boolean
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      className,
      maxWidth = "full",
      padding = "md",
      centered = false,
      children,
      ...props
    },
    ref
  ) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full",
    }

    const paddingClasses = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          maxWidth !== "full" && "mx-auto",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          centered && "flex min-h-full items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageContainer.displayName = "PageContainer"

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  actions?: React.ReactNode
  padding?: "none" | "sm" | "md" | "lg"
  border?: boolean
  background?: boolean
}

const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  (
    {
      className,
      title,
      description,
      actions,
      padding = "md",
      border = false,
      background = false,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    }

    return (
      <section
        ref={ref}
        className={cn(
          paddingClasses[padding],
          border && "border rounded-lg",
          background && "bg-muted/50",
          className
        )}
        {...props}
      >
        {(title || description || actions) && (
          <div className={cn("mb-6", padding === "none" && "mb-4")}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {title && (
                  <h2 className="text-xl font-semibold tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        {children}
      </section>
    )
  }
)
PageSection.displayName = "PageSection"

export interface PageGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: "sm" | "md" | "lg"
  responsive?: boolean
}

const PageGrid = React.forwardRef<HTMLDivElement, PageGridProps>(
  (
    {
      className,
      cols = 3,
      gap = "md",
      responsive = true,
      children,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    }

    const getGridCols = () => {
      if (responsive) {
        switch (cols) {
          case 1:
            return "grid-cols-1"
          case 2:
            return "grid-cols-1 md:grid-cols-2"
          case 3:
            return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          case 4:
            return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          case 6:
            return "grid-cols-1 md:grid-cols-3 lg:grid-cols-6"
          case 12:
            return "grid-cols-1 md:grid-cols-6 lg:grid-cols-12"
          default:
            return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }
      } else {
        return `grid-cols-${cols}`
      }
    }

    return (
      <div
        ref={ref}
        className={cn("grid", getGridCols(), gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageGrid.displayName = "PageGrid"

export interface PageStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "sm" | "md" | "lg"
  align?: "start" | "center" | "end" | "stretch"
}

const PageStack = React.forwardRef<HTMLDivElement, PageStackProps>(
  (
    {
      className,
      gap = "md",
      align = "stretch",
      children,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      sm: "space-y-4",
      md: "space-y-6",
      lg: "space-y-8",
    }

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          gapClasses[gap],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageStack.displayName = "PageStack"

export { PageContainer, PageSection, PageGrid, PageStack }