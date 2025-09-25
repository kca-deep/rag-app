"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Database,
  FileText,
  Activity,
  Settings,
  BarChart3,
  Clock,
  HardDrive,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CollectionDetailModalProps {
  collectionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock collection detail data
const getCollectionDetail = (id: string) => ({
  id,
  name: "Product Documentation",
  description: "All product manuals and guides for customer support",
  status: "active" as const,
  createdAt: "2024-01-10T10:30:00Z",
  lastUpdated: "2024-01-15T10:30:00Z",
  documentCount: 156,
  vectorCount: 3420,
  indexSize: "2.3MB",
  syncProgress: 100,
  settings: {
    enableAutoSync: true,
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: "text-embedding-3-small"
  },
  documents: [
    {
      id: "1",
      name: "User Manual v1.2.pdf",
      status: "processed",
      uploadedAt: "2024-01-15T09:20:00Z",
      size: "2.1MB",
      chunks: 45
    },
    {
      id: "2",
      name: "API Documentation.md",
      status: "processing",
      uploadedAt: "2024-01-15T10:15:00Z",
      size: "856KB",
      chunks: 23
    },
    {
      id: "3",
      name: "FAQ.docx",
      status: "error",
      uploadedAt: "2024-01-14T16:30:00Z",
      size: "445KB",
      chunks: 0
    }
  ],
  stats: {
    totalQueries: 1245,
    avgResponseTime: "234ms",
    successRate: 98.5,
    topQueries: [
      "How to install the software?",
      "API authentication methods",
      "Troubleshooting network issues"
    ]
  }
})

const statusConfig = {
  active: { label: "활성", variant: "default" as const, icon: CheckCircle },
  syncing: { label: "동기화 중", variant: "secondary" as const, icon: Loader2 },
  error: { label: "오류", variant: "destructive" as const, icon: AlertCircle }
}

const docStatusConfig = {
  processed: { label: "처리됨", variant: "default" as const },
  processing: { label: "처리 중", variant: "secondary" as const },
  error: { label: "오류", variant: "destructive" as const }
}

export function CollectionDetailModal({
  collectionId,
  open,
  onOpenChange
}: CollectionDetailModalProps) {
  const [collection, setCollection] = useState<ReturnType<typeof getCollectionDetail> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (collectionId && open) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setCollection(getCollectionDetail(collectionId))
        setIsLoading(false)
      }, 500)
    }
  }, [collectionId, open])

  if (!collection) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const statusInfo = statusConfig[collection.status]
  const StatusIcon = statusInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[60vw] !max-h-[90vh] !w-[60vw] overflow-y-auto p-8 sm:!max-w-[60vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-semibold">{collection.name}</h2>
                <DialogDescription className="mt-1">
                  {collection.description}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusInfo.variant} className="gap-1">
                <StatusIcon className={`h-3 w-3 ${collection.status === 'syncing' ? 'animate-spin' : ''}`} />
                {statusInfo.label}
              </Badge>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                편집
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">기본 정보</TabsTrigger>
            <TabsTrigger value="documents">문서 목록</TabsTrigger>
            <TabsTrigger value="stats">통계</TabsTrigger>
            <TabsTrigger value="sync">동기화 상태</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 min-w-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">전체 문서</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{collection.documentCount}</span>
                    <span className="text-sm text-muted-foreground">개</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 min-w-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">벡터 수</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{collection.vectorCount.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">개</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 min-w-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">인덱스 크기</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{collection.indexSize}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 min-w-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">생성일</span>
                  </div>
                  <div className="text-lg font-bold">
                    {new Date(collection.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(collection.createdAt).toLocaleTimeString('ko-KR')}
                  </div>
                </div>
              </Card>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                설정 정보
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">자동 동기화:</span>
                  <span className="ml-2">
                    {collection.settings.enableAutoSync ? "활성화" : "비활성화"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">청크 크기:</span>
                  <span className="ml-2">{collection.settings.chunkSize} 토큰</span>
                </div>
                <div>
                  <span className="text-muted-foreground">청크 중복:</span>
                  <span className="ml-2">{collection.settings.chunkOverlap} 토큰</span>
                </div>
                <div>
                  <span className="text-muted-foreground">임베딩 모델:</span>
                  <span className="ml-2">{collection.settings.embeddingModel}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">문서 목록 ({collection.documents.length})</h4>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                문서 추가
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>파일명</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-center">크기</TableHead>
                  <TableHead className="text-center">청크 수</TableHead>
                  <TableHead className="text-center">업로드일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.documents.map((doc) => {
                  const docStatus = docStatusConfig[doc.status as keyof typeof docStatusConfig]
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={docStatus.variant}>{docStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{doc.size}</TableCell>
                      <TableCell className="text-center">{doc.chunks}</TableCell>
                      <TableCell className="text-center">
                        {new Date(doc.uploadedAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 min-w-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">총 쿼리 수</span>
                  </div>
                  <div className="text-2xl font-bold">{collection.stats.totalQueries.toLocaleString()}</div>
                </div>
              </Card>

              <Card className="p-4 min-w-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">평균 응답시간</span>
                  </div>
                  <div className="text-2xl font-bold">{collection.stats.avgResponseTime}</div>
                </div>
              </Card>

              <Card className="p-4 min-w-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">성공률</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{collection.stats.successRate}</span>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">인기 검색어</CardTitle>
                <CardDescription>가장 많이 검색된 쿼리들</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {collection.stats.topQueries.map((query, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm">{query}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  동기화 상태
                </CardTitle>
                <CardDescription>
                  벡터 인덱스와 문서 상태의 동기화 정보
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">전체 진행률</span>
                    <span className="text-sm text-muted-foreground">{collection.syncProgress}%</span>
                  </div>
                  <Progress value={collection.syncProgress} className="w-full" />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">마지막 동기화</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(collection.lastUpdated).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">자동 동기화</span>
                    <Badge variant={collection.settings.enableAutoSync ? "default" : "secondary"}>
                      {collection.settings.enableAutoSync ? "활성" : "비활성"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">처리 대기 문서</span>
                    <span className="text-sm">0개</span>
                  </div>
                </div>

                <Separator />

                <Button variant="outline" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  수동 동기화 실행
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}