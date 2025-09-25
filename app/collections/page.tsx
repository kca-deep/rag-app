"use client"

import { useState } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CollectionDataTable } from "@/components/collections/collection-data-table"
import { CreateCollectionModal } from "@/components/collections/create-collection-modal"
import { CollectionDetailModal } from "@/components/collections/collection-detail-modal"
import { DeleteConfirmModal } from "@/components/collections/delete-confirm-modal"

// Mock data - will be replaced with API calls
const mockCollections = [
  {
    id: "1",
    name: "Product Documentation",
    description: "All product manuals and guides",
    documentCount: 156,
    status: "active",
    lastUpdated: "2024-01-15T10:30:00Z",
    vectorCount: 3420,
    indexSize: "2.3MB"
  },
  {
    id: "2",
    name: "Customer Support",
    description: "Support tickets and FAQ",
    documentCount: 89,
    status: "syncing",
    lastUpdated: "2024-01-14T16:45:00Z",
    vectorCount: 2150,
    indexSize: "1.8MB"
  },
  {
    id: "3",
    name: "Legal Documents",
    description: "Contracts and legal papers",
    documentCount: 23,
    status: "error",
    lastUpdated: "2024-01-13T09:20:00Z",
    vectorCount: 567,
    indexSize: "0.9MB"
  }
]

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null)

  const filteredCollections = mockCollections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || collection.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteCollection = (id: string) => {
    setCollectionToDelete(id)
    setDeleteModalOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">
            문서 컬렉션을 관리하고 벡터 인덱스를 모니터링합니다.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 Collection
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 bg-card">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Collection 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="syncing">동기화 중</SelectItem>
              <SelectItem value="error">오류</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            총 {filteredCollections.length}개
          </Badge>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-card p-6">
        <CollectionDataTable
          collections={filteredCollections}
          onViewDetails={setSelectedCollection}
          onDelete={handleDeleteCollection}
        />
      </div>

      {/* Modals */}
      <CreateCollectionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <CollectionDetailModal
        collectionId={selectedCollection}
        open={!!selectedCollection}
        onOpenChange={(open) => !open && setSelectedCollection(null)}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        collectionId={collectionToDelete}
        onConfirm={() => {
          // Handle delete logic here
          setDeleteModalOpen(false)
          setCollectionToDelete(null)
        }}
      />
    </div>
  )
}