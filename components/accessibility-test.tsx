"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ariaHelpers, detectHighContrastMode, detectReducedMotion } from "@/lib/accessibility"
import {
  AlertCircle,
  CheckCircle,
  Info,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Pause,
  Play,
  Settings,
  Moon,
  Sun,
} from "lucide-react"

export function AccessibilityTest() {
  const [audioEnabled, setAudioEnabled] = React.useState(true)
  const [autoPlay, setAutoPlay] = React.useState(false)
  const [fontSize, setFontSize] = React.useState([16])
  const [highContrast, setHighContrast] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  React.useEffect(() => {
    setHighContrast(detectHighContrastMode())
    setReducedMotion(detectReducedMotion())
  }, [])

  const announceChange = (message: string) => {
    ariaHelpers.announce(message, 'polite')
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">접근성 테스트 페이지</h1>
        <p className="text-muted-foreground">
          이 페이지는 웹 접근성(WCAG 2.1) 준수를 테스트하기 위한 컴포넌트들을 포함합니다.
        </p>
      </div>

      {/* 시스템 설정 감지 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            시스템 접근성 설정 감지
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span>고대비 모드</span>
              <Badge variant={highContrast ? "default" : "secondary"}>
                {highContrast ? "활성화됨" : "비활성화됨"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>축소된 애니메이션</span>
              <Badge variant={reducedMotion ? "default" : "secondary"}>
                {reducedMotion ? "활성화됨" : "비활성화됨"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 접근성 컨트롤 */}
      <Card>
        <CardHeader>
          <CardTitle>접근성 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 오디오 설정 */}
          <div className="space-y-2">
            <Label htmlFor="audio-toggle" className="flex items-center gap-2">
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              오디오 피드백
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="audio-toggle"
                checked={audioEnabled}
                onCheckedChange={(checked) => {
                  setAudioEnabled(checked)
                  announceChange(checked ? "오디오 피드백이 활성화되었습니다" : "오디오 피드백이 비활성화되었습니다")
                }}
                aria-describedby="audio-description"
              />
              <span id="audio-description" className="text-sm text-muted-foreground">
                버튼 클릭 시 오디오 피드백 제공
              </span>
            </div>
          </div>

          {/* 자동 재생 설정 */}
          <div className="space-y-2">
            <Label htmlFor="autoplay-toggle" className="flex items-center gap-2">
              {autoPlay ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              자동 재생
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoplay-toggle"
                checked={autoPlay}
                onCheckedChange={(checked) => {
                  setAutoPlay(checked)
                  announceChange(checked ? "자동 재생이 활성화되었습니다" : "자동 재생이 비활성화되었습니다")
                }}
                aria-describedby="autoplay-description"
              />
              <span id="autoplay-description" className="text-sm text-muted-foreground">
                미디어 콘텐츠 자동 재생 여부
              </span>
            </div>
          </div>

          {/* 폰트 크기 */}
          <div className="space-y-2">
            <Label htmlFor="font-size-slider">
              폰트 크기: {fontSize[0]}px
            </Label>
            <Slider
              id="font-size-slider"
              value={fontSize}
              onValueChange={(value) => {
                setFontSize(value)
                announceChange(`폰트 크기가 ${value[0]}픽셀로 변경되었습니다`)
              }}
              max={24}
              min={12}
              step={1}
              className="w-full"
              aria-describedby="font-size-description"
            />
            <span id="font-size-description" className="text-sm text-muted-foreground">
              텍스트 크기를 조정합니다 (12px ~ 24px)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 키보드 네비게이션 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>키보드 네비게이션 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tab 키로 순서대로 이동하고, Enter나 Space로 활성화해보세요.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <Button
                key={num}
                variant={num % 2 === 0 ? "default" : "outline"}
                onClick={() => announceChange(`버튼 ${num}이 클릭되었습니다`)}
                aria-label={`테스트 버튼 ${num}`}
              >
                버튼 {num}
              </Button>
            ))}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Shift+Tab으로 역순 이동도 가능합니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 폼 접근성 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>폼 접근성 테스트</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-input">
                  이름 <span className="text-red-500" aria-label="필수">*</span>
                </Label>
                <Input
                  id="name-input"
                  placeholder="이름을 입력하세요"
                  aria-required="true"
                  aria-describedby="name-description"
                />
                <span id="name-description" className="text-sm text-muted-foreground">
                  실제 이름을 입력해주세요
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-input">
                  이메일 <span className="text-red-500" aria-label="필수">*</span>
                </Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="email@example.com"
                  aria-required="true"
                  aria-describedby="email-description"
                />
                <span id="email-description" className="text-sm text-muted-foreground">
                  유효한 이메일 주소를 입력하세요
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" aria-describedby="submit-description">
                제출
              </Button>
              <Button type="button" variant="outline">
                취소
              </Button>
            </div>
            <span id="submit-description" className="text-sm text-muted-foreground">
              폼을 제출하려면 Enter 키를 누르거나 버튼을 클릭하세요
            </span>
          </form>
        </CardContent>
      </Card>

      {/* 탭 패널 접근성 */}
      <Card>
        <CardHeader>
          <CardTitle>탭 패널 접근성</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1" aria-describedby="tab1-description">
                일반 정보
              </TabsTrigger>
              <TabsTrigger value="tab2" aria-describedby="tab2-description">
                고급 설정
              </TabsTrigger>
              <TabsTrigger value="tab3" aria-describedby="tab3-description">
                도움말
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tab1" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">일반 정보</h3>
                <p>기본적인 사용자 정보를 설정합니다.</p>
                <Progress value={33} aria-label="진행률 33%" />
              </div>
            </TabsContent>

            <TabsContent value="tab2" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">고급 설정</h3>
                <p>고급 사용자를 위한 상세 설정 옵션입니다.</p>
                <Progress value={66} aria-label="진행률 66%" />
              </div>
            </TabsContent>

            <TabsContent value="tab3" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">도움말</h3>
                <p>자주 묻는 질문과 사용 방법을 확인하세요.</p>
                <Progress value={100} aria-label="진행률 100%" />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <span id="tab1-description" className="sr-only">
              기본 사용자 정보 설정 탭
            </span>
            <span id="tab2-description" className="sr-only">
              고급 설정 및 세부 옵션 탭
            </span>
            <span id="tab3-description" className="sr-only">
              도움말 및 가이드 탭
            </span>
            <p>방향키로 탭 간 이동, Enter나 Space로 선택하세요.</p>
          </div>
        </CardContent>
      </Card>

      {/* 상태 메시지 */}
      <Card>
        <CardHeader>
          <CardTitle>상태 메시지 및 알림</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                성공: 작업이 완료되었습니다.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                오류: 네트워크 연결을 확인하세요.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => announceChange("성공 메시지가 표시되었습니다")}
              variant="outline"
            >
              성공 알림 테스트
            </Button>
            <Button
              onClick={() => announceChange("오류가 발생했습니다", 'assertive')}
              variant="outline"
            >
              오류 알림 테스트
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 접근성 체크리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>접근성 체크리스트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>모든 이미지에 대체 텍스트 제공</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>충분한 색상 대비 (4.5:1 이상)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>키보드만으로 모든 기능 접근 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>적절한 제목 구조 (h1-h6)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>폼 요소에 라벨 연결</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>ARIA 속성 적절히 사용</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>포커스 표시기 명확히 표시</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>자동 재생 콘텐츠 제어 가능</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스크린 리더 전용 정보 */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        접근성 테스트 페이지가 로드되었습니다.
        이 페이지는 키보드 네비게이션과 스크린 리더를 완전히 지원합니다.
      </div>
    </div>
  )
}