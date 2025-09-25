"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  showBorder?: boolean
  copyright?: string
  links?: Array<{
    text: string
    href: string
    external?: boolean
  }>
  logo?: React.ReactNode
  social?: React.ReactNode
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      className,
      showBorder = true,
      copyright,
      links = [],
      logo,
      social,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "mt-auto bg-background",
          showBorder && "border-t",
          className
        )}
        {...props}
      >
        <div className="container py-6">
          {children || (
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                {logo && (
                  <>
                    <div>{logo}</div>
                    <Separator orientation="vertical" className="hidden h-4 md:block" />
                  </>
                )}

                {copyright && (
                  <p className="text-sm text-muted-foreground">
                    {copyright}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                {links.length > 0 && (
                  <nav className="flex items-center space-x-4">
                    {links.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                      >
                        {link.text}
                      </a>
                    ))}
                  </nav>
                )}

                {social && (
                  <>
                    {links.length > 0 && (
                      <Separator orientation="vertical" className="hidden h-4 md:block" />
                    )}
                    <div>{social}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </footer>
    )
  }
)
Footer.displayName = "Footer"

export interface FooterSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  children: React.ReactNode
}

const FooterSection = React.forwardRef<HTMLDivElement, FooterSectionProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        {title && (
          <h3 className="text-sm font-semibold">{title}</h3>
        )}
        <div className="space-y-2">
          {children}
        </div>
      </div>
    )
  }
)
FooterSection.displayName = "FooterSection"

export interface FooterLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean
}

const FooterLink = React.forwardRef<HTMLAnchorElement, FooterLinkProps>(
  ({ className, external = false, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "block text-sm text-muted-foreground hover:text-foreground transition-colors",
          className
        )}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    )
  }
)
FooterLink.displayName = "FooterLink"

export interface FooterColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4
  children: React.ReactNode
}

const FooterColumns = React.forwardRef<HTMLDivElement, FooterColumnsProps>(
  ({ className, columns = 3, children, ...props }, ref) => {
    const columnsClasses = {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-8",
          columnsClasses[columns],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FooterColumns.displayName = "FooterColumns"

export { Footer, FooterSection, FooterLink, FooterColumns }