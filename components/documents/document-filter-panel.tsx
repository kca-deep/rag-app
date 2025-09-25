"use client"

import { useState } from "react"
import { X, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface DocumentFilterPanelProps {
  onClose: () => void
  onApplyFilters: (filters: {
    collection?: string
    status?: string
    dateRange?: {
      from: string
      to: string
    }
    sizeRange?: {
      min: number
      max: number
    }
  }) => void
}

const statusOptions = [
  { value: "completed", label: "완료", count: 156 },
  { value: "processing", label: "처리 중", count: 23 },
  { value: "error", label: "오류", count: 5 },
  { value: "pending", label: "대기 중", count: 12 }
]

const collectionOptions = [
  { value: "1", label: "Product Documentation", count: 89 },
  { value: "2", label: "Customer Support", count: 67 },
  { value: "3", label: "Legal Documents", count: 34 },
  { value: "4", label: "Marketing Materials", count: 23 }
]

export function DocumentFilterPanel({ onClose, onApplyFilters }: DocumentFilterPanelProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [minSize, setMinSize] = useState<string>("")
  const [maxSize, setMaxSize] = useState<string>("")

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses(prev => [...prev, status])
    } else {
      setSelectedStatuses(prev => prev.filter(s => s !== status))
    }
  }

  const handleApply = () => {
    const filters: any = {}

    if (selectedCollection) {
      filters.collection = selectedCollection
    }

    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses[0] // For simplicity, use first selected status
    }

    if (dateFrom && dateTo) {
      filters.dateRange = { from: dateFrom, to: dateTo }
    }

    if (minSize || maxSize) {
      filters.sizeRange = {
        min: minSize ? parseFloat(minSize) : 0,
        max: maxSize ? parseFloat(maxSize) : Infinity
      }
    }

    onApplyFilters(filters)
  }

  const handleReset = () => {
    setSelectedCollection("")
    setSelectedStatuses([])
    setDateFrom("")
    setDateTo("")
    setMinSize("")
    setMaxSize("")
  }

  const hasFilters = selectedCollection ||
                    selectedStatuses.length > 0 ||
                    dateFrom ||
                    dateTo ||
                    minSize ||
                    maxSize

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>고급 필터</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collection Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">컬렉션</Label>
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger>
              <SelectValue placeholder="컬렉션 선택" />
            </SelectTrigger>
            <SelectContent>
              {collectionOptions.map((collection) => (
                <SelectItem key={collection.value} value={collection.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{collection.label}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      ({collection.count})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">상태</Label>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={status.value}
                  checked={selectedStatuses.includes(status.value)}
                  onCheckedChange={(checked) =>
                    handleStatusChange(status.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={status.value}
                  className="text-sm font-normal flex items-center justify-between flex-1"
                >
                  <span>{status.label}</span>
                  <span className="text-muted-foreground text-xs">
                    ({status.count})
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>업로드 날짜</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                시작일
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                종료일
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* File Size Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">파일 크기 (MB)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="size-min" className="text-xs text-muted-foreground">
                최소
              </Label>
              <Input
                id="size-min"
                type="number"
                placeholder="0"
                value={minSize}
                onChange={(e) => setMinSize(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="size-max" className="text-xs text-muted-foreground">
                최대
              </Label>
              <Input
                id="size-max"
                type="number"
                placeholder="100"
                value={maxSize}
                onChange={(e) => setMaxSize(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={handleApply} className="flex-1">
            필터 적용
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasFilters}
          >
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}