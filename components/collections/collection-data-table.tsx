"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface Collection {
  id: string
  name: string
  description: string
  documentCount: number
  status: "active" | "syncing" | "error"
  lastUpdated: string
  vectorCount: number
  indexSize: string
}

interface CollectionDataTableProps {
  collections: Collection[]
  onViewDetails: (id: string) => void
  onDelete: (id: string) => void
}

const statusConfig = {
  active: {
    label: "활성",
    variant: "default" as const,
    icon: CheckCircle
  },
  syncing: {
    label: "동기화 중",
    variant: "secondary" as const,
    icon: Loader2
  },
  error: {
    label: "오류",
    variant: "destructive" as const,
    icon: AlertCircle
  }
}

export function CollectionDataTable({
  collections,
  onViewDetails,
  onDelete
}: CollectionDataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Collection
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (key: keyof Collection) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedCollections = [...collections].sort((a, b) => {
    if (!sortConfig) return 0

    const { key, direction } = sortConfig
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="py-4 px-6 cursor-pointer hover:text-foreground"
              onClick={() => handleSort('name')}
            >
              이름
              {sortConfig?.key === 'name' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableHead>
            <TableHead className="py-4 px-6">설명</TableHead>
            <TableHead
              className="py-4 px-6 cursor-pointer hover:text-foreground text-center"
              onClick={() => handleSort('documentCount')}
            >
              문서 수
              {sortConfig?.key === 'documentCount' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableHead>
            <TableHead className="py-4 px-6" className="text-center">상태</TableHead>
            <TableHead className="py-4 px-6" className="text-center">벡터 수</TableHead>
            <TableHead className="py-4 px-6" className="text-center">인덱스 크기</TableHead>
            <TableHead
              className="py-4 px-6 cursor-pointer hover:text-foreground text-center"
              onClick={() => handleSort('lastUpdated')}
            >
              최종 업데이트
              {sortConfig?.key === 'lastUpdated' && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableHead>
            <TableHead className="py-4 px-6" className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCollections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Collection이 없습니다</p>
                <p className="text-sm">새 Collection을 만들어 문서를 관리해보세요.</p>
              </TableCell>
            </TableRow>
          ) : (
            sortedCollections.map((collection) => {
              const status = statusConfig[collection.status]
              const StatusIcon = status.icon

              return (
                <TableRow
                  key={collection.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewDetails(collection.id)}
                >
                  <TableCell className="font-medium py-4 px-6">
                    <div>
                      <div className="font-semibold">{collection.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] py-4 px-6">
                    <div className="text-sm text-muted-foreground truncate">
                      {collection.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-6">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium">{collection.documentCount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 px-6">
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className={`h-3 w-3 ${collection.status === 'syncing' ? 'animate-spin' : ''}`} />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {collection.vectorCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {collection.indexSize}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(collection.lastUpdated), {
                      addSuffix: true,
                      locale: ko
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onViewDetails(collection.id)
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="mr-2 h-4 w-4" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(collection.id)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}