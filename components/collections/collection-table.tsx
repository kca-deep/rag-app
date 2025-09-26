'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal, Edit, Trash2, RefreshCw, BarChart3 } from 'lucide-react'
import { Collection } from '@/lib/types'
import { formatBytes, formatDate } from '@/lib/utils'

interface CollectionTableProps {
  collections: Collection[]
  isLoading: boolean
  onEdit?: (collection: Collection) => void
  onDelete?: (collection: Collection) => void
  onSync?: (collection: Collection) => void
  onViewStats?: (collection: Collection) => void
}

function getStatusVariant(status: Collection['status']) {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'syncing':
      return 'outline'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getStatusLabel(status: Collection['status']) {
  switch (status) {
    case 'active':
      return '활성'
    case 'inactive':
      return '비활성'
    case 'syncing':
      return '동기화 중'
    case 'error':
      return '오류'
    default:
      return status
  }
}

function CollectionTableSkeleton() {
  return (
    <div className="-mx-6 overflow-x-auto">
      <div className="min-w-full px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">컬렉션명</TableHead>
              <TableHead className="min-w-[80px]">상태</TableHead>
              <TableHead className="min-w-[80px] text-right">문서 수</TableHead>
              <TableHead className="min-w-[80px] text-right">청크 수</TableHead>
              <TableHead className="min-w-[80px] text-right">크기</TableHead>
              <TableHead className="min-w-[80px]">동기화</TableHead>
              <TableHead className="min-w-[100px]">생성일</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function CollectionTable({
  collections,
  isLoading,
  onEdit,
  onDelete,
  onSync,
  onViewStats,
}: CollectionTableProps) {
  if (isLoading) {
    return <CollectionTableSkeleton />
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">컬렉션이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            새 컬렉션을 생성하여 문서를 관리하고<br />
            RAG 파이프라인을 구축해보세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-6 overflow-x-auto">
      <div className="min-w-full px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">컬렉션명</TableHead>
              <TableHead className="min-w-[80px]">상태</TableHead>
              <TableHead className="min-w-[80px] text-right">문서 수</TableHead>
              <TableHead className="min-w-[80px] text-right">청크 수</TableHead>
              <TableHead className="min-w-[80px] text-right">크기</TableHead>
              <TableHead className="min-w-[80px]">동기화</TableHead>
              <TableHead className="min-w-[100px]">생성일</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
      <TableBody>
        {collections.map((collection) => (
          <TableRow key={collection.id}>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{collection.name}</div>
                {collection.description && (
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {collection.description}
                  </div>
                )}
                {collection.tags && collection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {collection.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {collection.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{collection.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(collection.status)}>
                {getStatusLabel(collection.status)}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-sm text-right">
              {collection.document_count.toLocaleString()}
            </TableCell>
            <TableCell className="font-mono text-sm text-right">
              {collection.chunk_count.toLocaleString()}
            </TableCell>
            <TableCell className="font-mono text-sm text-right">
              {formatBytes(collection.total_size_bytes)}
            </TableCell>
            <TableCell>
              <Badge
                variant={collection.milvus_synced ? 'default' : 'destructive'}
                className="text-xs"
              >
                {collection.milvus_synced ? '동기화됨' : '미동기화'}
              </Badge>
            </TableCell>
            <TableCell className="text-sm">
              {formatDate(collection.created_at)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">작업 메뉴 열기</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>작업</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {onViewStats && (
                    <DropdownMenuItem onClick={() => onViewStats(collection)}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      통계 보기
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(collection)}>
                      <Edit className="mr-2 h-4 w-4" />
                      편집
                    </DropdownMenuItem>
                  )}
                  {onSync && (
                    <DropdownMenuItem onClick={() => onSync(collection)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      동기화
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(collection)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
      </div>
    </div>
  )
}