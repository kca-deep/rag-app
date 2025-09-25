"use client"

import { useState } from "react"
import { Upload, Search, Filter, MoreVertical, Eye, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DocumentUploadModal } from "@/components/documents/document-upload-modal"
import { DocumentDetailModal } from "@/components/documents/document-detail-modal"
import { DocumentFilterPanel } from "@/components/documents/document-filter-panel"

// Mock data - will be replaced with API calls
const mockDocuments = [
  {
    id: "1",
    filename: "product-manual-v2.pdf",
    collection: "Product Documentation",
    collectionId: "1",
    status: "completed",
    size: "2.3MB",
    uploadDate: "2024-01-15T10:30:00Z",
    processedChunks: 45,
    totalChunks: 45,
    lastSync: "2024-01-15T11:00:00Z"
  },
  {
    id: "2",
    filename: "installation-guide.docx",
    collection: "Product Documentation",
    collectionId: "1",
    status: "processing",
    size: "1.8MB",
    uploadDate: "2024-01-15T09:15:00Z",
    processedChunks: 32,
    totalChunks: 40,
    lastSync: "2024-01-15T10:45:00Z"
  },
  {
    id: "3",
    filename: "faq-database.txt",
    collection: "Customer Support",
    collectionId: "2",
    status: "error",
    size: "0.5MB",
    uploadDate: "2024-01-14T16:20:00Z",
    processedChunks: 0,
    totalChunks: 12,
    lastSync: null,
    error: "Encoding format not supported"
  },
  {
    id: "4",
    filename: "contract-template.pdf",
    collection: "Legal Documents",
    collectionId: "3",
    status: "completed",
    size: "1.2MB",
    uploadDate: "2024-01-14T14:30:00Z",
    processedChunks: 23,
    totalChunks: 23,
    lastSync: "2024-01-14T15:00:00Z"
  }
]

const statusColors = {
  completed: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  error: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800"
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [collectionFilter, setCollectionFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.collection.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCollection = collectionFilter === "all" || doc.collectionId === collectionFilter
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    return matchesSearch && matchesCollection && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id))
    } else {
      setSelectedDocuments([])
    }
  }

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId])
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId))
    }
  }

  const formatFileSize = (size: string) => size
  const formatDate = (date: string) => new Date(date).toLocaleDateString('ko-KR')

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            업로드된 문서를 관리하고 처리 상태를 모니터링합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            문서 업로드
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 bg-card">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="파일명 또는 컬렉션으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={collectionFilter} onValueChange={setCollectionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="컬렉션 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 컬렉션</SelectItem>
              <SelectItem value="1">Product Documentation</SelectItem>
              <SelectItem value="2">Customer Support</SelectItem>
              <SelectItem value="3">Legal Documents</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="processing">처리 중</SelectItem>
              <SelectItem value="error">오류</SelectItem>
              <SelectItem value="pending">대기 중</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          {selectedDocuments.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedDocuments.length}개 선택
              </Badge>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
          )}
          <Badge variant="secondary">
            총 {filteredDocuments.length}개
          </Badge>
        </div>
      </div>

      {/* Filter Panel */}
      {filterPanelOpen && (
        <DocumentFilterPanel
          onClose={() => setFilterPanelOpen(false)}
          onApplyFilters={(filters) => {
            setCollectionFilter(filters.collection || "all")
            setStatusFilter(filters.status || "all")
            setFilterPanelOpen(false)
          }}
        />
      )}

      {/* Data Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 py-4 px-6">
                <Checkbox
                  checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="py-4 px-6">파일명</TableHead>
              <TableHead className="py-4 px-6">컬렉션</TableHead>
              <TableHead className="py-4 px-6">상태</TableHead>
              <TableHead className="py-4 px-6">크기</TableHead>
              <TableHead className="py-4 px-6">업로드일</TableHead>
              <TableHead className="py-4 px-6">처리 진행률</TableHead>
              <TableHead className="w-12 py-4 px-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="py-4 px-6">
                  <Checkbox
                    checked={selectedDocuments.includes(document.id)}
                    onCheckedChange={(checked) =>
                      handleSelectDocument(document.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium py-4 px-6">
                  {document.filename}
                </TableCell>
                <TableCell className="py-4 px-6">{document.collection}</TableCell>
                <TableCell className="py-4 px-6">
                  <Badge className={statusColors[document.status as keyof typeof statusColors]}>
                    {document.status === "completed" && "완료"}
                    {document.status === "processing" && "처리 중"}
                    {document.status === "error" && "오류"}
                    {document.status === "pending" && "대기 중"}
                  </Badge>
                  {document.error && (
                    <p className="text-xs text-red-600 mt-1">{document.error}</p>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">{formatFileSize(document.size)}</TableCell>
                <TableCell className="py-4 px-6">{formatDate(document.uploadDate)}</TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(document.processedChunks / document.totalChunks) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {document.processedChunks}/{document.totalChunks}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setSelectedDocument(document.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        상세 보기
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        다운로드
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modals */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />

      <DocumentDetailModal
        documentId={selectedDocument}
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
      />
    </div>
  )
}