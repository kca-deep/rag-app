"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner, LoadingSpinner } from "@/components/ui/spinner"
import { FileUploadZone } from "@/components/ui/file-upload-zone"
import { StatsCard, StatsGrid } from "@/components/ui/stats-card"
import { StatusBadge, StatusIndicator } from "@/components/ui/status-badge"
import { SearchHighlight, SearchResults } from "@/components/ui/search-highlight"
import { DataTableFilter } from "@/components/ui/data-table-filter"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  FileText,
  Home,
  Loader2,
  Mail,
  Menu,
  MoreHorizontal,
  Package,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  User,
  Users,
  X,
  Bell,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Heart,
  Info,
  Lock,
  MessageSquare,
  Moon,
  Star,
  Sun,
  Zap,
  Calendar as CalendarIcon,
  BarChart,
  Database,
  TrendingUp,
  Activity,
} from "lucide-react"

export function ComponentExamples() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(13)
  const [switchValue, setSwitchValue] = React.useState(false)
  const [sliderValue, setSliderValue] = React.useState([50])
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const mockSearchResults = [
    {
      id: "1",
      title: "RAG 시스템 설계 문서",
      content: "이 문서는 RAG (Retrieval Augmented Generation) 시스템의 전체적인 아키텍처와 설계 원칙을 다룹니다.",
      metadata: { type: "document", date: "2024-01-15" },
    },
    {
      id: "2",
      title: "벡터 데이터베이스 최적화",
      content: "Milvus를 사용한 벡터 검색 성능 최적화 방법과 인덱싱 전략에 대해 설명합니다.",
      metadata: { type: "guide", date: "2024-01-14" },
    },
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
  ]

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-12 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">컴포넌트 사용 예제</h1>
        <p className="text-xl text-muted-foreground">
          shadcn/ui 기반 컴포넌트들의 다양한 사용 예제를 확인해보세요.
        </p>
      </div>

      {/* Button Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button 컴포넌트</h2>
        <Card>
          <CardHeader>
            <CardTitle>Button 변형</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              아이콘 포함
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Card Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Card 컴포넌트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>간단한 카드</CardTitle>
            </CardHeader>
            <CardContent>
              <p>기본적인 카드 컴포넌트입니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                아이콘이 있는 카드
                <Package className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>제목에 아이콘이 포함된 카드입니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>상태가 있는 카드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>진행률을 표시하는 카드입니다.</p>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Form Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Form 컴포넌트</h2>
        <Card>
          <CardHeader>
            <CardTitle>폼 요소들</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="input-example">텍스트 입력</Label>
                <Input id="input-example" placeholder="텍스트를 입력하세요" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="select-example">선택</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="옵션을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">옵션 1</SelectItem>
                    <SelectItem value="option2">옵션 2</SelectItem>
                    <SelectItem value="option3">옵션 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textarea-example">텍스트 영역</Label>
                <Textarea id="textarea-example" placeholder="긴 텍스트를 입력하세요" />
              </div>

              <div className="space-y-2">
                <Label>스위치</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={switchValue}
                    onCheckedChange={setSwitchValue}
                  />
                  <span>{switchValue ? "켜짐" : "꺼짐"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>슬라이더: {sliderValue[0]}</Label>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>체크박스</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="checkbox-example" />
                  <Label htmlFor="checkbox-example">동의합니다</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>라디오 그룹</Label>
              <RadioGroup defaultValue="option-one">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-one" id="option-one" />
                  <Label htmlFor="option-one">옵션 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-two" id="option-two" />
                  <Label htmlFor="option-two">옵션 2</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Loading & Progress */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">로딩 & 진행률</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>스피너</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
              <LoadingSpinner>로딩 중...</LoadingSpinner>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>진행률 바</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={33} />
              <Progress value={66} />
              <Progress value={100} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Status Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">상태 컴포넌트</h2>
        <Card>
          <CardHeader>
            <CardTitle>상태 뱃지 & 인디케이터</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="pending" />
              <StatusBadge status="processing" animated />
              <StatusBadge status="completed" />
              <StatusBadge status="failed" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StatusIndicator status="active" showPulse />
                <span>활성</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status="processing" animated showPulse />
                <span>처리중</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status="failed" />
                <span>실패</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">통계 컴포넌트</h2>
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
      </section>

      {/* Search & Filter */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">검색 & 필터</h2>

        <Card>
          <CardHeader>
            <CardTitle>데이터 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableFilter
              filters={mockFilters}
              activeFilters={[]}
              onFiltersChange={() => {}}
              showSearch
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>검색 결과 하이라이팅</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SearchHighlight
                text="RAG 시스템에서 벡터 검색은 매우 중요합니다"
                searchTerm="RAG"
              />
              <SearchResults
                results={mockSearchResults}
                searchTerm="RAG"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* File Upload */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">파일 업로드</h2>
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드 존</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              maxFiles={5}
              maxSize={10 * 1024 * 1024}
              accept=".pdf,.docx,.txt"
              onFilesChange={(files) => console.log("Files:", files)}
            />
          </CardContent>
        </Card>
      </section>

      {/* Dialog Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">다이얼로그 & 오버레이</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>다이얼로그 열기</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>다이얼로그 제목</DialogTitle>
                <DialogDescription>
                  여기에 다이얼로그 내용을 입력합니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="submit">확인</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">삭제 확인</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 파일이 영구적으로 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction>삭제</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">사이드 시트 열기</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>사이드 시트</SheetTitle>
                <SheetDescription>
                  여기에 사이드 시트 내용을 입력합니다.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">팝오버 열기</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p>팝오버 내용입니다.</p>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* Menu Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">메뉴 & 네비게이션</h2>
        <div className="flex flex-wrap gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                드롭다운 메뉴
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>프로필</DropdownMenuItem>
              <DropdownMenuItem>설정</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Command className="max-w-sm">
            <CommandInput placeholder="검색..." />
            <CommandList>
              <CommandEmpty>결과가 없습니다.</CommandEmpty>
              <CommandGroup heading="제안">
                <CommandItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </CommandItem>
                <CommandItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </section>

      {/* Navigation Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">네비게이션</h2>

        <Card>
          <CardHeader>
            <CardTitle>브레드크럼</CardTitle>
          </CardHeader>
          <CardContent>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">홈</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/docs">문서</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>컴포넌트</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>페이지네이션</CardTitle>
          </CardHeader>
          <CardContent>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      </section>

      {/* Table Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">테이블</h2>
        <Card>
          <CardHeader>
            <CardTitle>데이터 테이블</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>사용자 목록</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">가입일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">홍길동</TableCell>
                  <TableCell>hong@example.com</TableCell>
                  <TableCell><StatusBadge status="active" size="sm" /></TableCell>
                  <TableCell className="text-right">2024-01-15</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">김철수</TableCell>
                  <TableCell>kim@example.com</TableCell>
                  <TableCell><StatusBadge status="inactive" size="sm" /></TableCell>
                  <TableCell className="text-right">2024-01-14</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Layout Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">레이아웃 컴포넌트</h2>

        <Card>
          <CardHeader>
            <CardTitle>탭</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tab1">탭 1</TabsTrigger>
                <TabsTrigger value="tab2">탭 2</TabsTrigger>
                <TabsTrigger value="tab3">탭 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-4">
                <p>첫 번째 탭 내용입니다.</p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-4">
                <p>두 번째 탭 내용입니다.</p>
              </TabsContent>
              <TabsContent value="tab3" className="mt-4">
                <p>세 번째 탭 내용입니다.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>아코디언</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>섹션 1</AccordionTrigger>
                <AccordionContent>
                  첫 번째 섹션의 내용입니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>섹션 2</AccordionTrigger>
                <AccordionContent>
                  두 번째 섹션의 내용입니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Utility Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">유틸리티</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>툴팁 & 호버 카드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">툴팁 보기</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>유용한 정보가 여기에 표시됩니다</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@username</Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-semibold">@username</h4>
                      <p className="text-xs text-muted-foreground">
                        사용자 정보가 여기에 표시됩니다
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>아바타 & 분리선</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
              </div>

              <Separator />

              <p>분리선 아래 내용입니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Theme Toggle */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">테마 토글</h2>
        <Card>
          <CardHeader>
            <CardTitle>다크/라이트 모드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span>테마를 전환해보세요</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">알림 & 피드백</h2>
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              일반적인 정보 알림입니다.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              오류가 발생했습니다. 다시 시도해주세요.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Calendar */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">달력</h2>
        <Card className="w-fit">
          <CardHeader>
            <CardTitle>날짜 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </section>

      {/* Scroll Area */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">스크롤 영역</h2>
        <Card>
          <CardHeader>
            <CardTitle>스크롤 가능한 콘텐츠</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] border p-4">
              {Array.from({ length: 50 }, (_, i) => (
                <div key={i} className="py-2">
                  스크롤 가능한 아이템 {i + 1}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}