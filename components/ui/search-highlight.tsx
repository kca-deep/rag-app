"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SearchHighlightProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  searchTerm?: string
  highlightClassName?: string
  caseSensitive?: boolean
  wholeWords?: boolean
}

const SearchHighlight = React.forwardRef<HTMLSpanElement, SearchHighlightProps>(
  (
    {
      className,
      text,
      searchTerm = "",
      highlightClassName = "bg-yellow-200 dark:bg-yellow-900/50 font-medium",
      caseSensitive = false,
      wholeWords = false,
      ...props
    },
    ref
  ) => {
    const getHighlightedText = React.useMemo(() => {
      if (!searchTerm || !text) {
        return [{ text, highlight: false }]
      }

      let pattern: RegExp

      try {
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const flags = caseSensitive ? 'g' : 'gi'

        if (wholeWords) {
          pattern = new RegExp(`\\b${escapedSearchTerm}\\b`, flags)
        } else {
          pattern = new RegExp(escapedSearchTerm, flags)
        }
      } catch (error) {
        return [{ text, highlight: false }]
      }

      const parts: Array<{ text: string; highlight: boolean }> = []
      let lastIndex = 0
      let match

      while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            text: text.slice(lastIndex, match.index),
            highlight: false,
          })
        }

        parts.push({
          text: match[0],
          highlight: true,
        })

        lastIndex = pattern.lastIndex

        if (pattern.lastIndex === match.index) {
          break
        }
      }

      if (lastIndex < text.length) {
        parts.push({
          text: text.slice(lastIndex),
          highlight: false,
        })
      }

      return parts.length > 0 ? parts : [{ text, highlight: false }]
    }, [text, searchTerm, caseSensitive, wholeWords])

    return (
      <span ref={ref} className={cn(className)} {...props}>
        {getHighlightedText.map((part, index) =>
          part.highlight ? (
            <mark
              key={index}
              className={cn("bg-transparent", highlightClassName)}
            >
              {part.text}
            </mark>
          ) : (
            <React.Fragment key={index}>{part.text}</React.Fragment>
          )
        )}
      </span>
    )
  }
)
SearchHighlight.displayName = "SearchHighlight"

interface SearchResultItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  content: string
  searchTerm?: string
  metadata?: Record<string, any>
  onSelect?: () => void
  highlightClassName?: string
}

const SearchResultItem = React.forwardRef<HTMLDivElement, SearchResultItemProps>(
  (
    {
      className,
      title,
      content,
      searchTerm = "",
      metadata,
      onSelect,
      highlightClassName,
      ...props
    },
    ref
  ) => {
    const truncateText = (text: string, maxLength: number = 200) => {
      if (text.length <= maxLength) return text

      if (searchTerm) {
        const searchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase())
        if (searchIndex !== -1) {
          const start = Math.max(0, searchIndex - Math.floor(maxLength / 2))
          const end = Math.min(text.length, start + maxLength)
          const truncated = text.slice(start, end)
          return start > 0 ? `...${truncated}` : truncated
        }
      }

      return text.slice(0, maxLength) + "..."
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors",
          className
        )}
        onClick={onSelect}
        {...props}
      >
        <div className="space-y-2">
          <h3 className="font-medium leading-none">
            <SearchHighlight
              text={title}
              searchTerm={searchTerm}
              highlightClassName={highlightClassName}
            />
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-3">
            <SearchHighlight
              text={truncateText(content)}
              searchTerm={searchTerm}
              highlightClassName={highlightClassName}
            />
          </p>

          {metadata && Object.keys(metadata).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(metadata).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
SearchResultItem.displayName = "SearchResultItem"

interface SearchResultsProps extends React.HTMLAttributes<HTMLDivElement> {
  results: Array<{
    id: string
    title: string
    content: string
    metadata?: Record<string, any>
  }>
  searchTerm?: string
  onResultSelect?: (result: any) => void
  emptyMessage?: string
  highlightClassName?: string
}

const SearchResults = React.forwardRef<HTMLDivElement, SearchResultsProps>(
  (
    {
      className,
      results,
      searchTerm = "",
      onResultSelect,
      emptyMessage = "검색 결과가 없습니다.",
      highlightClassName,
      ...props
    },
    ref
  ) => {
    if (results.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center py-8 text-muted-foreground",
            className
          )}
          {...props}
        >
          {emptyMessage}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        {results.map((result) => (
          <SearchResultItem
            key={result.id}
            title={result.title}
            content={result.content}
            searchTerm={searchTerm}
            metadata={result.metadata}
            onSelect={() => onResultSelect?.(result)}
            highlightClassName={highlightClassName}
          />
        ))}
      </div>
    )
  }
)
SearchResults.displayName = "SearchResults"

export { SearchHighlight, SearchResultItem, SearchResults }