'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Loader2 } from 'lucide-react'
import { CollectionTable } from '@/components/collections/collection-table'
import { CollectionFiltersComponent } from '@/components/collections/collection-filters'
import { CollectionPagination } from '@/components/collections/collection-pagination'
import { CreateCollectionDialog } from '@/components/collections/create-collection-dialog'
import { usePaginatedCollections, useDeleteCollection, useSyncCollection } from '@/hooks/use-collections'
import { CollectionFilters, Collection } from '@/lib/types'
import { toast } from 'sonner'

const DEFAULT_FILTERS: CollectionFilters = {
  sort_by: 'created_at',
  sort_order: 'desc',
}

export default function CollectionsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<CollectionFilters>(DEFAULT_FILTERS)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch collections with current filters
  const {
    data: collectionsResponse,
    isLoading,
    error,
    refetch,
  } = usePaginatedCollections(page, pageSize, filters)

  // Mutations
  const deleteCollectionMutation = useDeleteCollection({
    onSuccess: () => {
      toast.success('컬렉션이 성공적으로 삭제되었습니다.')
    },
    onError: (error: any) => {
      toast.error(`컬렉션 삭제 실패: ${error.error || error.message}`)
    },
  })

  const syncCollectionMutation = useSyncCollection({
    onSuccess: () => {
      toast.success('컬렉션 동기화가 시작되었습니다.')
    },
    onError: (error: any) => {
      toast.error(`동기화 실패: ${error.error || error.message}`)
    },
  })

  const handleFiltersChange = (newFilters: CollectionFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleFiltersReset = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when page size changes
  }

  const handleEdit = (collection: Collection) => {
    // TODO: Implement edit functionality
    toast.info('편집 기능은 곧 구현될 예정입니다.')
  }

  const [deleteCollection, setDeleteCollection] = useState<Collection | null>(null)

  const handleDelete = (collection: Collection) => {
    setDeleteCollection(collection)
  }

  const confirmDelete = () => {
    if (deleteCollection) {
      deleteCollectionMutation.mutate(deleteCollection.id)
      setDeleteCollection(null)
    }
  }

  const handleSync = (collection: Collection) => {
    syncCollectionMutation.mutate({ id: collection.id })
  }

  const handleViewStats = (collection: Collection) => {
    // TODO: Implement stats view functionality
    toast.info('통계 보기는 곧 구현될 예정입니다.')
  }

  const handleCreateCollection = () => {
    setCreateDialogOpen(true)
  }

  const handleRefresh = () => {
    refetch()
    toast.success('목록을 새로고침했습니다.')
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              데이터를 불러올 수 없습니다
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {(error as any)?.error || (error as any)?.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const collections = collectionsResponse?.collections || []
  const totalItems = collectionsResponse?.total || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">컬렉션 관리</h1>
            <p className="text-muted-foreground">
              RAG 파이프라인의 문서 컬렉션을 생성하고 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              새로고침
            </Button>
            <Button onClick={handleCreateCollection}>
              <Plus className="mr-2 h-4 w-4" />
              컬렉션 생성
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <CollectionFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />
          </CardContent>
        </Card>

        {/* Collections Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              컬렉션 목록
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({totalItems}개)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CollectionTable
              collections={collections}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSync={handleSync}
              onViewStats={handleViewStats}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalItems > 0 && (
          <CollectionPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {/* Loading Overlay */}
        {(deleteCollectionMutation.isPending || syncCollectionMutation.isPending) && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>
                  {deleteCollectionMutation.isPending && '컬렉션을 삭제하는 중...'}
                  {syncCollectionMutation.isPending && '컬렉션을 동기화하는 중...'}
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Create Collection Dialog */}
        <CreateCollectionDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteCollection} onOpenChange={() => setDeleteCollection(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>컬렉션을 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                "{deleteCollection?.name}" 컬렉션을 삭제하면 모든 문서와 벡터 데이터가 영구적으로 제거됩니다.
                이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}