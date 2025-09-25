"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Filter, X, Calendar as CalendarIcon, Search, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface FilterConfig {
  key: string
  label: string
  type: "text" | "select" | "multiselect" | "date" | "daterange" | "checkbox"
  options?: FilterOption[]
  placeholder?: string
}

export interface ActiveFilter {
  key: string
  label: string
  value: any
  displayValue: string
}

export interface DataTableFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  filters: FilterConfig[]
  activeFilters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  onSearch?: (searchTerm: string) => void
  showSearch?: boolean
  searchPlaceholder?: string
}

const DataTableFilter = React.forwardRef<HTMLDivElement, DataTableFilterProps>(
  (
    {
      className,
      filters,
      activeFilters,
      onFiltersChange,
      onSearch,
      showSearch = true,
      searchPlaceholder = "검색...",
      ...props
    },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [isOpen, setIsOpen] = React.useState(false)

    const handleSearchChange = (value: string) => {
      setSearchTerm(value)
      onSearch?.(value)
    }

    const addFilter = (filterKey: string, value: any, displayValue: string) => {
      const filterConfig = filters.find((f) => f.key === filterKey)
      if (!filterConfig) return

      const existingFilterIndex = activeFilters.findIndex((f) => f.key === filterKey)

      let newFilters = [...activeFilters]

      if (filterConfig.type === "multiselect") {
        const existingFilter = newFilters[existingFilterIndex]
        if (existingFilter) {
          const existingValues = Array.isArray(existingFilter.value) ? existingFilter.value : []
          if (!existingValues.includes(value)) {
            const newValues = [...existingValues, value]
            const newDisplayValues = newValues.map(v =>
              filterConfig.options?.find(opt => opt.value === v)?.label || v
            ).join(", ")

            newFilters[existingFilterIndex] = {
              ...existingFilter,
              value: newValues,
              displayValue: newDisplayValues,
            }
          }
        } else {
          newFilters.push({
            key: filterKey,
            label: filterConfig.label,
            value: [value],
            displayValue,
          })
        }
      } else {
        if (existingFilterIndex >= 0) {
          newFilters[existingFilterIndex] = {
            ...newFilters[existingFilterIndex],
            value,
            displayValue,
          }
        } else {
          newFilters.push({
            key: filterKey,
            label: filterConfig.label,
            value,
            displayValue,
          })
        }
      }

      onFiltersChange(newFilters)
    }

    const removeFilter = (filterKey: string, specificValue?: any) => {
      let newFilters = [...activeFilters]

      if (specificValue !== undefined) {
        const filterIndex = newFilters.findIndex((f) => f.key === filterKey)
        if (filterIndex >= 0) {
          const filter = newFilters[filterIndex]
          if (Array.isArray(filter.value)) {
            const newValues = filter.value.filter((v) => v !== specificValue)
            if (newValues.length === 0) {
              newFilters.splice(filterIndex, 1)
            } else {
              const filterConfig = filters.find((f) => f.key === filterKey)
              const newDisplayValues = newValues.map(v =>
                filterConfig?.options?.find(opt => opt.value === v)?.label || v
              ).join(", ")

              newFilters[filterIndex] = {
                ...filter,
                value: newValues,
                displayValue: newDisplayValues,
              }
            }
          }
        }
      } else {
        newFilters = newFilters.filter((f) => f.key !== filterKey)
      }

      onFiltersChange(newFilters)
    }

    const clearAllFilters = () => {
      onFiltersChange([])
      setSearchTerm("")
      onSearch?.("")
    }

    const renderFilterInput = (filter: FilterConfig) => {
      const activeFilter = activeFilters.find((f) => f.key === filter.key)

      switch (filter.type) {
        case "text":
          return (
            <Input
              placeholder={filter.placeholder}
              value={activeFilter?.value || ""}
              onChange={(e) => {
                if (e.target.value) {
                  addFilter(filter.key, e.target.value, e.target.value)
                } else {
                  removeFilter(filter.key)
                }
              }}
            />
          )

        case "select":
          return (
            <Select
              value={activeFilter?.value || ""}
              onValueChange={(value) => {
                if (value) {
                  const option = filter.options?.find((opt) => opt.value === value)
                  addFilter(filter.key, value, option?.label || value)
                } else {
                  removeFilter(filter.key)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                    {option.count && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )

        case "multiselect":
          const selectedValues = Array.isArray(activeFilter?.value) ? activeFilter.value : []
          return (
            <div className="space-y-2">
              {filter.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.key}-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        addFilter(filter.key, option.value, option.label)
                      } else {
                        removeFilter(filter.key, option.value)
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${filter.key}-${option.value}`}
                    className="text-sm font-normal"
                  >
                    {option.label}
                    {option.count && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({option.count})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )

        case "date":
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !activeFilter?.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {activeFilter?.value ? (
                    format(activeFilter.value, "PPP", { locale: ko })
                  ) : (
                    <span>{filter.placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={activeFilter?.value}
                  onSelect={(date) => {
                    if (date) {
                      addFilter(
                        filter.key,
                        date,
                        format(date, "PPP", { locale: ko })
                      )
                    } else {
                      removeFilter(filter.key)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )

        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={filter.key}
                checked={activeFilter?.value === true}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addFilter(filter.key, true, filter.label)
                  } else {
                    removeFilter(filter.key)
                  }
                }}
              />
              <Label htmlFor={filter.key} className="text-sm font-normal">
                {filter.label}
              </Label>
            </div>
          )

        default:
          return null
      }
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                필터
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">필터</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 font-normal text-muted-foreground"
                  >
                    전체 초기화
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filters.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {filter.label}
                      </Label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 lg:px-3"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="gap-1"
              >
                <span className="text-xs text-muted-foreground">
                  {filter.label}:
                </span>
                {filter.displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removeFilter(filter.key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }
)
DataTableFilter.displayName = "DataTableFilter"

export { DataTableFilter }