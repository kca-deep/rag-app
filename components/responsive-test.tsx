"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCard, StatsGrid } from "@/components/ui/stats-card"
import { DataTableFilter } from "@/components/ui/data-table-filter"
import { FileUploadZone } from "@/components/ui/file-upload-zone"
import { SearchResults } from "@/components/ui/search-highlight"
import { StatusBadge } from "@/components/ui/status-badge"
import { MainLayout, PageHeader, PageContent } from "@/components/layout/main-layout"
import { Sidebar, SidebarHeader } from "@/components/layout/sidebar"
import { Header, HeaderBrand, HeaderActions } from "@/components/layout/header"
import { PageGrid, PageSection } from "@/components/layout/page-container"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Home,
  FileText,
  Settings,
  Search,
  Upload,
  BarChart,
  Database,
  Users,
} from "lucide-react"

export function ResponsiveTest() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  const sidebarItems = [
    { title: "대시보드", href: "/", icon: Home },
    { title: "문서", href: "/documents", icon: FileText },
    { title: "검색", href: "/search", icon: Search },
    { title: "업로드", href: "/upload", icon: Upload },
    { title: "통계", href: "/stats", icon: BarChart },
    { title: "데이터베이스", href: "/database", icon: Database },
    { title: "사용자", href: "/users", icon: Users },
    { title: "설정", href: "/settings", icon: Settings },
  ]

  const mockFilters = [
    {
      key: "status",
      label: "상태",
      type: "select" as const,
      options: [
        { label: "처리중", value: "processing", count: 12 },
        { label: "완료", value: "completed", count: 45 },
        { label: "실패", value: "failed", count: 3 },
      ],
    },
    {
      key: "category",
      label: "카테고리",
      type: "multiselect" as const,
      options: [
        { label: "문서", value: "document", count: 25 },
        { label: "이미지", value: "image", count: 15 },
        { label: "비디오", value: "video", count: 8 },
      ],
    },
  ]

  const mockResults = [
    {
      id: "1",
      title: "RAG 시스템 설계 문서",
      content: "이 문서는 RAG (Retrieval Augmented Generation) 시스템의 전체적인 아키텍처와 설계 원칙을 다룹니다...",
      metadata: { type: "document", date: "2024-01-15" },
    },
    {
      id: "2",
      title: "벡터 데이터베이스 최적화",
      content: "Milvus를 사용한 벡터 검색 성능 최적화 방법과 인덱싱 전략에 대해 설명합니다...",
      metadata: { type: "guide", date: "2024-01-14" },
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <MainLayout
        header={
          <Header
            logo={<HeaderBrand title="RAG App" />}
            actions={
              <HeaderActions>
                <Button variant="ghost" size="sm">
                  알림
                </Button>
                <ThemeToggle />
              </HeaderActions>
            }
            user={
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary" />
                <div className="hidden md:block">
                  <div className="text-sm font-medium">사용자</div>
                  <div className="text-xs text-muted-foreground">admin@example.com</div>
                </div>
              </div>
            }
          />
        }
        sidebar={
          <Sidebar
            items={sidebarItems}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            header={
              <SidebarHeader
                title={sidebarCollapsed ? "" : "RAG App"}
                logo={<div className="h-8 w-8 rounded bg-primary" />}
                collapsed={sidebarCollapsed}
              />
            }
          />
        }
        sidebarCollapsed={sidebarCollapsed}
      >
        <div className="space-y-6">
          {/* Page Header - Responsive */}
          <PageHeader
            title="반응형 테스트"
            description="다양한 화면 크기에서의 컴포넌트 테스트"
            actions={
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" className="w-full sm:w-auto">
                  새로 만들기
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  내보내기
                </Button>
              </div>
            }
          />

          {/* Stats Grid - Responsive */}
          <PageSection title="통계" description="시스템 현황">
            <StatsGrid cols={4}>
              <StatsCard
                title="총 문서"
                value={1234}
                description="전체 업로드된 문서"
                change={{ value: 12.5, trend: "up", label: "지난달 대비" }}
                icon={<FileText className="h-4 w-4" />}
              />
              <StatsCard
                title="처리 완료"
                value={987}
                description="성공적으로 처리됨"
                change={{ value: -2.1, trend: "down", label: "지난주 대비" }}
                icon={<BarChart className="h-4 w-4" />}
                badge={{ text: "활성", variant: "default" }}
              />
              <StatsCard
                title="사용자"
                value={45}
                description="활성 사용자"
                change={{ value: 0, trend: "neutral" }}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="스토리지"
                value="2.5 TB"
                description="사용된 저장공간"
                icon={<Database className="h-4 w-4" />}
              />
            </StatsGrid>
          </PageSection>

          {/* Responsive Grid Layout */}
          <PageSection title="그리드 레이아웃 테스트">
            <PageGrid cols={3} gap="md">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    카드 1
                    <StatusBadge status="active" size="sm" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    이 카드는 반응형 그리드에서 테스트됩니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    카드 2
                    <Badge variant="secondary">새로움</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    모바일에서는 세로로 쌓이고, 데스크톱에서는 가로로 배치됩니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    카드 3
                    <StatusBadge status="processing" size="sm" animated />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    화면 크기에 따라 레이아웃이 자동으로 조정됩니다.
                  </p>
                </CardContent>
              </Card>
            </PageGrid>
          </PageSection>

          {/* File Upload - Responsive */}
          <PageSection title="파일 업로드">
            <FileUploadZone
              maxFiles={5}
              maxSize={10 * 1024 * 1024}
              accept=".pdf,.docx,.txt"
              onFilesChange={(files) => console.log("Files changed:", files)}
            />
          </PageSection>

          {/* Data Filter - Responsive */}
          <PageSection title="데이터 필터">
            <DataTableFilter
              filters={mockFilters}
              activeFilters={[]}
              onFiltersChange={() => {}}
              showSearch
            />
          </PageSection>

          {/* Search Results - Responsive */}
          <PageSection title="검색 결과">
            <SearchResults
              results={mockResults}
              searchTerm="RAG"
              emptyMessage="검색 결과가 없습니다."
            />
          </PageSection>

          {/* Mobile Warning */}
          <div className="block sm:hidden">
            <Card className="border-warning bg-warning/10">
              <CardContent className="pt-6">
                <p className="text-sm">
                  📱 모바일 화면에서 보고 계십니다. 데스크톱에서 더 많은 기능을 확인하세요.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Info */}
          <div className="hidden lg:block">
            <Card className="border-info bg-info/10">
              <CardContent className="pt-6">
                <p className="text-sm">
                  🖥️ 데스크톱 화면에서 모든 기능이 최적화되어 표시됩니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </div>
  )
}