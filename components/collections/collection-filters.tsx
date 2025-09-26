'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import { CollectionFilters } from '@/lib/types'

interface CollectionFiltersProps {
  filters: CollectionFilters
  onFiltersChange: (filters: CollectionFilters) => void
  onReset: () => void
}

const statusOptions = [
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'syncing', label: '동기화 중' },
  { value: 'error', label: '오류' },
]

const sortOptions = [
  { value: 'name', label: '이름' },
  { value: 'created_at', label: '생성일' },
  { value: 'updated_at', label: '수정일' },
  { value: 'document_count', label: '문서 수' },
  { value: 'total_size_bytes', label: '크기' },
]

export function CollectionFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: CollectionFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: localSearch || undefined })
  }

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    // Auto-search after a delay
    if (!value.trim()) {
      onFiltersChange({ ...filters, search: undefined })
    }
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : (status as any),
    })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sort_by: sortBy })
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, sort_order: sortOrder })
  }

  const hasActiveFilters = !!(
    filters.search ||
    filters.status ||
    filters.tags?.length ||
    filters.sort_by !== 'created_at' ||
    filters.sort_order !== 'desc'
  )

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="컬렉션 검색..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </form>

        {/* Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              필터
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  ON
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">상태</h4>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium leading-none">정렬</h4>
                <div className="flex gap-2">
                  <Select
                    value={filters.sort_by || 'created_at'}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sort_order || 'desc'}
                    onValueChange={handleSortOrderChange}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">내림차순</SelectItem>
                      <SelectItem value="asc">오름차순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  필터 초기화
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              검색: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({ ...filters, search: undefined })
                }
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              상태: {statusOptions.find(s => s.value === filters.status)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({ ...filters, status: undefined })
                }
              />
            </Badge>
          )}
          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              태그: {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    tags: filters.tags?.filter((t) => t !== tag),
                  })
                }
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}