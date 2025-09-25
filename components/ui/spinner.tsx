import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, className }))}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: VariantProps<typeof spinnerVariants>["size"] }
>(({ className, size = "md", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <Spinner size={size} />
      {children && <span className="text-sm text-muted-foreground">{children}</span>}
    </div>
  )
})
LoadingSpinner.displayName = "LoadingSpinner"

export { Spinner, LoadingSpinner, spinnerVariants }