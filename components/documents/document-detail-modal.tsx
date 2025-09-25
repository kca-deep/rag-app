"use client"

import { useState } from "react"
import { FileText, Clock, Database, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentDetailModalProps {
  documentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock data - will be replaced with API calls
const mockDocumentDetails = {
  "1": {
    id: "1",
    filename: "product-manual-v2.pdf",
    collection: "Product Documentation",
    collectionId: "1",
    status: "completed",
    size: "2.3MB",
    uploadDate: "2024-01-15T10:30:00Z",
    processedChunks: 45,
    totalChunks: 45,
    lastSync: "2024-01-15T11:00:00Z",
    metadata: {
      title: "Product Manual Version 2",
      author: "Documentation Team",
      pages: 156,
      language: "Korean",
      format: "PDF",
      encoding: "UTF-8"
    },
    processing: [
      {
        id: "1",
        step: "파일 업로드",
        status: "completed",
        timestamp: "2024-01-15T10:30:00Z",
        duration: "2s"
      },
      {
        id: "2",
        step: "텍스트 추출",
        status: "completed",
        timestamp: "2024-01-15T10:30:15Z",
        duration: "18s"
      },
      {
        id: "3",
        step: "청크 분할",
        status: "completed",
        timestamp: "2024-01-15T10:31:45Z",
        duration: "5s"
      },
      {
        id: "4",
        step: "벡터 임베딩",
        status: "completed",
        timestamp: "2024-01-15T10:32:30Z",
        duration: "25s"
      },
      {
        id: "5",
        step: "Milvus 인덱싱",
        status: "completed",
        timestamp: "2024-01-15T10:35:00Z",
        duration: "3s"
      }
    ],
    chunks: Array.from({ length: 45 }, (_, i) => ({
      id: `chunk_${i + 1}`,
      index: i + 1,
      content: `This is chunk ${i + 1} content preview. Lorem ipsum dolor sit amet, consectetur adipiscing elit...`,
      wordCount: Math.floor(Math.random() * 200) + 50,
      vectorId: `vec_${Math.random().toString(36).substr(2, 9)}`,
      similarity: Math.random()
    }))
  }
}

const statusIcons = {
  completed: CheckCircle,
  processing: RefreshCw,
  error: AlertCircle,
  pending: Clock
}

const statusColors = {
  completed: "text-green-600",
  processing: "text-blue-600",
  error: "text-red-600",
  pending: "text-yellow-600"
}

export function DocumentDetailModal({ documentId, open, onOpenChange }: DocumentDetailModalProps) {
  const [activeTab, setActiveTab] = useState("metadata")

  if (!documentId || !mockDocumentDetails[documentId as keyof typeof mockDocumentDetails]) {
    return null
  }

  const document = mockDocumentDetails[documentId as keyof typeof mockDocumentDetails]

  const formatDate = (date: string) => new Date(date).toLocaleString('ko-KR')
  const formatFileSize = (size: string) => size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[60vw] !max-h-[90vh] !w-[60vw] overflow-y-auto p-8 sm:!max-w-[60vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{document.filename}</span>
          </DialogTitle>
          <DialogDescription>
            {document.collection} 컬렉션의 문서 상세 정보 및 처리 상태
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metadata">메타데이터</TabsTrigger>
            <TabsTrigger value="processing">처리 로그</TabsTrigger>
            <TabsTrigger value="chunks">청크 목록</TabsTrigger>
            <TabsTrigger value="sync">동기화 상태</TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">파일 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">파일명:</span>
                    <span className="text-sm">{document.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">크기:</span>
                    <span className="text-sm">{formatFileSize(document.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">업로드일:</span>
                    <span className="text-sm">{formatDate(document.uploadDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">상태:</span>
                    <Badge>{document.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">문서 메타데이터</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(document.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key}:
                      </span>
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">처리 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">청크 처리 진행률</span>
                    <span className="text-sm">
                      {document.processedChunks}/{document.totalChunks}
                    </span>
                  </div>
                  <Progress
                    value={(document.processedChunks / document.totalChunks) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">처리 타임라인</CardTitle>
                <CardDescription>
                  문서 업로드부터 인덱싱까지의 처리 과정
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {document.processing.map((step) => {
                    const Icon = statusIcons[step.status as keyof typeof statusIcons]
                    const colorClass = statusColors[step.status as keyof typeof statusColors]

                    return (
                      <div key={step.id} className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{step.step}</p>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(step.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chunks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">청크 목록</CardTitle>
                <CardDescription>
                  총 {document.chunks.length}개의 청크로 분할됨
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>내용 미리보기</TableHead>
                        <TableHead className="w-20">단어수</TableHead>
                        <TableHead className="w-32">벡터 ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {document.chunks.map((chunk) => (
                        <TableRow key={chunk.id}>
                          <TableCell className="font-mono text-xs">
                            {chunk.index}
                          </TableCell>
                          <TableCell>
                            <p className="text-xs line-clamp-2">
                              {chunk.content}
                            </p>
                          </TableCell>
                          <TableCell className="text-xs">
                            {chunk.wordCount}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {chunk.vectorId}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Milvus 동기화</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">상태:</span>
                    <Badge className="bg-green-100 text-green-800">동기화됨</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">마지막 동기화:</span>
                    <span className="text-sm">{formatDate(document.lastSync)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">벡터 수:</span>
                    <span className="text-sm">{document.totalChunks}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">액션</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    재동기화
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    벡터 재생성
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}