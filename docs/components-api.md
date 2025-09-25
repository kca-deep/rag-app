# 컴포넌트 API 문서

이 문서는 RAG 애플리케이션에서 사용되는 모든 UI 컴포넌트의 API 및 사용법을 설명합니다.

## 기본 UI 컴포넌트

### Button 컴포넌트

**위치**: `@/components/ui/button`

버튼 컴포넌트는 사용자 상호작용을 위한 기본 요소입니다.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}
```

**사용 예제**:
```tsx
import { Button } from "@/components/ui/button"

// 기본 버튼
<Button>클릭하세요</Button>

// 변형
<Button variant="destructive">삭제</Button>
<Button variant="outline">윤곽선</Button>

// 크기
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>

// 아이콘과 함께
<Button>
  <Mail className="mr-2 h-4 w-4" />
  이메일 보내기
</Button>
```

### Card 컴포넌트

**위치**: `@/components/ui/card`

카드 컴포넌트는 관련 정보를 그룹화하여 표시합니다.

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
```

**사용 예제**:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
  </CardHeader>
  <CardContent>
    <p>카드 내용입니다.</p>
  </CardContent>
</Card>
```

### Input 컴포넌트

**위치**: `@/components/ui/input`

텍스트 입력을 위한 컴포넌트입니다.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**사용 예제**:
```tsx
import { Input } from "@/components/ui/input"

<Input placeholder="텍스트를 입력하세요" />
<Input type="email" placeholder="이메일 주소" />
<Input type="password" placeholder="비밀번호" />
```

## 비즈니스 로직 컴포넌트

### FileUploadZone 컴포넌트

**위치**: `@/components/ui/file-upload-zone`

드래그 앤 드롭 파일 업로드를 지원하는 컴포넌트입니다.

```typescript
interface FileUploadZoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
  onDrop?: (files: File[]) => void
  disabled?: boolean
  showPreview?: boolean
}
```

**사용 예제**:
```tsx
import { FileUploadZone } from "@/components/ui/file-upload-zone"

<FileUploadZone
  accept=".pdf,.docx,.txt"
  maxFiles={5}
  maxSize={10 * 1024 * 1024} // 10MB
  onFilesChange={(files) => console.log(files)}
/>
```

### StatsCard 컴포넌트

**위치**: `@/components/ui/stats-card`

통계 정보를 표시하는 카드 컴포넌트입니다.

```typescript
interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  change?: {
    value: number
    label?: string
    trend?: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  loading?: boolean
}
```

**사용 예제**:
```tsx
import { StatsCard } from "@/components/ui/stats-card"
import { FileText } from "lucide-react"

<StatsCard
  title="총 문서"
  value={1234}
  description="전체 업로드된 문서"
  change={{ value: 12.5, trend: "up", label: "지난달 대비" }}
  icon={<FileText className="h-4 w-4" />}
/>
```

### StatusBadge 컴포넌트

**위치**: `@/components/ui/status-badge`

다양한 상태를 시각적으로 표시하는 뱃지 컴포넌트입니다.

```typescript
type StatusType = "pending" | "processing" | "completed" | "failed" | "cancelled" | "paused" | "active" | "inactive"

interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  status: StatusType
  showIcon?: boolean
  animated?: boolean
  label?: string
  size?: "sm" | "md" | "lg"
}
```

**사용 예제**:
```tsx
import { StatusBadge } from "@/components/ui/status-badge"

<StatusBadge status="processing" animated />
<StatusBadge status="completed" />
<StatusBadge status="failed" />
```

### SearchHighlight 컴포넌트

**위치**: `@/components/ui/search-highlight`

검색어를 하이라이트하여 표시하는 컴포넌트입니다.

```typescript
interface SearchHighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  searchTerm?: string
  highlightClassName?: string
  caseSensitive?: boolean
  wholeWords?: boolean
}

interface SearchResultsProps extends React.HTMLAttributes<HTMLDivElement> {
  results: Array<{
    id: string
    title: string
    content: string
    metadata?: Record<string, any>
  }>
  searchTerm?: string
  onResultSelect?: (result: any) => void
  emptyMessage?: string
  highlightClassName?: string
}
```

**사용 예제**:
```tsx
import { SearchHighlight, SearchResults } from "@/components/ui/search-highlight"

<SearchHighlight
  text="RAG 시스템에서 벡터 검색은 중요합니다"
  searchTerm="RAG"
/>

<SearchResults
  results={searchResults}
  searchTerm="검색어"
  onResultSelect={(result) => console.log(result)}
/>
```

### DataTableFilter 컴포넌트

**위치**: `@/components/ui/data-table-filter`

데이터 테이블을 위한 필터링 컴포넌트입니다.

```typescript
interface FilterConfig {
  key: string
  label: string
  type: "text" | "select" | "multiselect" | "date" | "daterange" | "checkbox"
  options?: FilterOption[]
  placeholder?: string
}

interface ActiveFilter {
  key: string
  label: string
  value: any
  displayValue: string
}

interface DataTableFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  filters: FilterConfig[]
  activeFilters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  onSearch?: (searchTerm: string) => void
  showSearch?: boolean
  searchPlaceholder?: string
}
```

**사용 예제**:
```tsx
import { DataTableFilter } from "@/components/ui/data-table-filter"

const filters = [
  {
    key: "status",
    label: "상태",
    type: "select" as const,
    options: [
      { label: "처리중", value: "processing", count: 12 },
      { label: "완료", value: "completed", count: 45 },
    ],
  },
]

<DataTableFilter
  filters={filters}
  activeFilters={[]}
  onFiltersChange={setActiveFilters}
  showSearch
/>
```

## 레이아웃 컴포넌트

### MainLayout 컴포넌트

**위치**: `@/components/layout/main-layout`

애플리케이션의 기본 레이아웃을 제공하는 컴포넌트입니다.

```typescript
interface MainLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  sidebarCollapsed?: boolean
  sidebarWidth?: string
  collapsedSidebarWidth?: string
}
```

**사용 예제**:
```tsx
import { MainLayout } from "@/components/layout/main-layout"

<MainLayout
  header={<Header />}
  sidebar={<Sidebar />}
  sidebarCollapsed={sidebarCollapsed}
>
  <div>메인 콘텐츠</div>
</MainLayout>
```

### Sidebar 컴포넌트

**위치**: `@/components/layout/sidebar`

사이드바 네비게이션을 제공하는 컴포넌트입니다.

```typescript
interface SidebarItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  disabled?: boolean
  children?: SidebarItem[]
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[]
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  showToggle?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
}
```

**사용 예제**:
```tsx
import { Sidebar } from "@/components/layout/sidebar"
import { Home, Settings } from "lucide-react"

const sidebarItems = [
  { title: "홈", href: "/", icon: Home },
  { title: "설정", href: "/settings", icon: Settings },
]

<Sidebar
  items={sidebarItems}
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
/>
```

### Header 컴포넌트

**위치**: `@/components/layout/header`

페이지 상단 헤더를 제공하는 컴포넌트입니다.

```typescript
interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  notifications?: React.ReactNode
  user?: React.ReactNode
  logo?: React.ReactNode
  navigation?: React.ReactNode
}
```

**사용 예제**:
```tsx
import { Header } from "@/components/layout/header"

<Header
  title="페이지 제목"
  logo={<Logo />}
  actions={<Button>액션</Button>}
  user={<UserMenu />}
/>
```

## 유틸리티 컴포넌트

### Spinner 컴포넌트

**위치**: `@/components/ui/spinner`

로딩 상태를 표시하는 스피너 컴포넌트입니다.

```typescript
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
}
```

**사용 예제**:
```tsx
import { Spinner, LoadingSpinner } from "@/components/ui/spinner"

<Spinner size="lg" />
<LoadingSpinner>로딩 중...</LoadingSpinner>
```

### ThemeToggle 컴포넌트

**위치**: `@/components/ui/theme-toggle`

다크/라이트 모드를 전환하는 컴포넌트입니다.

```typescript
interface ThemeToggleButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  variant?: "outline" | "ghost" | "default"
  size?: "default" | "sm" | "lg" | "icon"
}
```

**사용 예제**:
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

<ThemeToggle />
```

## 접근성 유틸리티

### accessibility.ts

**위치**: `@/lib/accessibility`

웹 접근성을 위한 유틸리티 함수들을 제공합니다.

```typescript
// 포커스 트랩
function trapFocus(container: HTMLElement): () => void

// 방향키 네비게이션
function createArrowKeyNavigation(
  elements: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
    onSelect?: (element: HTMLElement, index: number) => void
  }
): () => void

// 고대비 모드 감지
function detectHighContrastMode(): boolean

// 축소된 모션 감지
function detectReducedMotion(): boolean

// 색상 대비율 계산
function calculateContrastRatio(color1: string, color2: string): number

// ARIA 헬퍼
const ariaHelpers = {
  setAttributes(element: HTMLElement, attributes: Record<string, string | boolean | null>): void
  announce(message: string, priority?: 'polite' | 'assertive'): void
  generateId(prefix?: string): string
}
```

**사용 예제**:
```tsx
import { trapFocus, ariaHelpers } from "@/lib/accessibility"

// 포커스 트랩 설정
useEffect(() => {
  if (isOpen) {
    const cleanup = trapFocus(containerRef.current)
    return cleanup
  }
}, [isOpen])

// 스크린 리더에 메시지 공지
ariaHelpers.announce("작업이 완료되었습니다")
```

## 컴포넌트 사용 가이드라인

### 1. 타입 안전성

모든 컴포넌트는 TypeScript로 작성되어 타입 안전성을 보장합니다. 컴포넌트를 사용할 때는 올바른 Props 타입을 사용해주세요.

### 2. 접근성

모든 컴포넌트는 WCAG 2.1 가이드라인을 준수합니다:
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 적절한 색상 대비
- ARIA 속성 지원

### 3. 반응형 디자인

컴포넌트들은 다양한 화면 크기에서 올바르게 작동합니다:
- 모바일 우선 접근법
- Tailwind CSS 반응형 유틸리티 사용
- 유연한 레이아웃 지원

### 4. 테마 지원

모든 컴포넌트는 다크/라이트 모드를 지원합니다:
- CSS 변수 기반 테마 시스템
- next-themes와 통합
- 매끄러운 테마 전환

### 5. 성능 최적화

컴포넌트들은 성능을 고려하여 설계되었습니다:
- React.memo 및 useMemo 적절히 활용
- 가상화된 리스트 지원
- 지연 로딩 지원

## 커스터마이징

### 스타일 커스터마이징

컴포넌트의 스타일은 Tailwind CSS 클래스와 CSS 변수를 통해 커스터마이징할 수 있습니다:

```css
:root {
  --primary: your-custom-color;
  --secondary: your-custom-color;
}
```

### 변형(Variant) 추가

기존 컴포넌트에 새로운 변형을 추가할 수 있습니다:

```typescript
// 기존 Button 컴포넌트 확장
const customButtonVariants = cva(
  // base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        // 기존 변형들...
        custom: "bg-custom text-custom-foreground hover:bg-custom/90",
      },
    },
  }
)
```

이 문서는 지속적으로 업데이트되며, 새로운 컴포넌트가 추가되거나 기존 컴포넌트가 수정될 때마다 갱신됩니다.