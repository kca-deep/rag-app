# 1. UI 공통컴포넌트 구성 계획

## 개요
RAG 파이프라인 웹앱의 shadcn/ui 기반 공통 컴포넌트 시스템을 v0.dev 스타일로 구축합니다. 모든 화면에서 재사용 가능한 기본 UI 컴포넌트들을 설정하고 구성합니다.

## v0.dev 스타일 컴포넌트 개발 원칙

### 핵심 설계 철학
- **컴포넌트 중심 아키텍처**: 모든 UI 요소를 독립적이고 재사용 가능한 컴포넌트로 설계
- **컴포지션 우선**: 상속보다는 컴포지션을 통한 기능 확장
- **타입 안전성**: TypeScript를 활용한 강타입 컴포넌트 인터페이스
- **접근성 우선**: ARIA 속성과 키보드 네비게이션 기본 지원

### 컴포넌트 구조 패턴
```typescript
// Compound Component 패턴
const Card = ({ children, ...props }) => (
  <div className="bg-white rounded-lg shadow" {...props}>
    {children}
  </div>
)
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

// Variant 기반 스타일링
const Button = ({ variant = 'default', size = 'md', ...props }) => {
  const variants = {
    default: 'bg-blue-500 text-white',
    outline: 'border border-gray-300 text-gray-700',
    ghost: 'text-gray-700 hover:bg-gray-100'
  }
  // ...
}

// Forward Ref 패턴
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn('border rounded-md px-3 py-2', className)}
        {...props}
      />
    )
  }
)
```

### 상태 관리 패턴
- **제어 컴포넌트**: 외부에서 상태를 관리하는 컴포넌트
- **비제어 컴포넌트**: 내부 상태를 가지는 컴포넌트
- **하이브리드 패턴**: defaultValue와 value를 모두 지원

### 스타일링 전략
- **유틸리티 우선**: Tailwind CSS 클래스를 기본으로 사용
- **CSS 변수 활용**: 테마 변경을 위한 CSS 커스텀 속성 사용
- **클래스 네임 유틸리티**: `cn()` 함수를 통한 조건부 스타일링

## 목표
- shadcn/ui 컴포넌트 시스템 완전 구축
- 테마 시스템 (다크/라이트 모드) 구성
- 공통 레이아웃 컴포넌트 개발
- 재사용 가능한 비즈니스 로직 컴포넌트 개발

## 체크리스트

### Phase 1: 기본 설정
- [x] shadcn/ui 초기 설정 확인 및 업데이트
- [x] Tailwind CSS v4 구성 확인
- [x] 테마 시스템 설정 (next-themes)
- [x] 폰트 설정 확인 (Noto Sans KR, Geist Mono)

### Phase 2: 기본 UI 컴포넌트 추가
- [x] Button 컴포넌트 (다양한 variant)
- [x] Input 컴포넌트 (텍스트, 검색, 파일 업로드)
- [x] Card 컴포넌트 (통계, 정보 표시용)
- [x] Table 컴포넌트 (데이터 테이블용)
- [x] Badge 컴포넌트 (상태 표시용)
- [x] Alert 컴포넌트 (알림용)
- [x] Dialog/Modal 컴포넌트
- [x] Sheet 컴포넌트 (사이드바용)
- [x] Tabs 컴포넌트
- [x] Progress 컴포넌트
- [x] Dropdown Menu 컴포넌트
- [x] Alert Dialog 컴포넌트
- [x] Accordion 컴포넌트
- [x] Avatar 컴포넌트
- [x] Collapsible 컴포넌트
- [x] Separator 컴포넌트

### Phase 3: 폼 관련 컴포넌트
- [x] Form 컴포넌트 (React Hook Form 통합)
- [x] Label 컴포넌트
- [x] Textarea 컴포넌트
- [x] Select 컴포넌트
- [x] Checkbox 컴포넌트
- [x] Switch 컴포넌트
- [x] Slider 컴포넌트

### Phase 4: 네비게이션 컴포넌트
- [x] Navigation Menu 컴포넌트
- [x] Breadcrumb 컴포넌트
- [x] Pagination 컴포넌트

### Phase 5: 피드백 컴포넌트
- [x] Toast/Sonner 통합 설정
- [x] Skeleton 컴포넌트 (로딩 상태용)
- [x] Spinner/Loading 컴포넌트

### Phase 6: 고급 컴포넌트
- [x] Command 컴포넌트 (검색 팔레트용)
- [x] Popover 컴포넌트
- [x] Tooltip 컴포넌트
- [x] Hover Card 컴포넌트
- [x] Scroll Area 컴포넌트

### Phase 7: 비즈니스 로직 컴포넌트
- [x] 파일 업로드 존 컴포넌트
- [x] 통계 카드 컴포넌트
- [x] 상태 뱃지 컴포넌트 (처리중, 완료, 실패 등)
- [x] 검색 결과 하이라이팅 컴포넌트
- [x] 데이터 테이블 필터 컴포넌트

### Phase 8: 레이아웃 컴포넌트
- [x] 메인 레이아웃 컴포넌트
- [x] 사이드바 컴포넌트
- [x] 헤더 컴포넌트
- [x] 푸터 컴포넌트
- [x] 페이지 컨테이너 컴포넌트

### Phase 9: 테마 및 스타일링
- [x] CSS 변수를 활용한 테마 커스터마이징
- [x] 다크/라이트 모드 토글 컴포넌트
- [x] 반응형 디자인 검증
- [x] 접근성 (a11y) 검증

### Phase 10: 컴포넌트 문서화
- [x] 각 컴포넌트 사용 예제 작성
- [ ] Storybook 설정 (선택사항)
- [x] 컴포넌트 API 문서 작성

## 주요 고려사항

### 디자인 시스템
- **New York 스타일**: shadcn/ui의 New York 변형 사용
- **일관성**: 모든 컴포넌트에서 일관된 디자인 언어 적용
- **접근성**: WCAG 2.1 가이드라인 준수

### 성능 최적화
- **지연 로딩**: 큰 컴포넌트는 React.lazy 적용
- **번들 크기**: 불필요한 의존성 최소화
- **트리 셰이킹**: 사용되지 않는 컴포넌트 제거

### 한국어 지원
- **폰트**: Noto Sans KR을 기본 폰트로 사용
- **텍스트 길이**: 한국어 특성을 고려한 레이아웃 설계
- **RTL 지원**: 필요시 RTL 지원 고려

## 완료 기준
- [ ] 모든 필수 shadcn/ui 컴포넌트 설치 완료
- [ ] 테마 시스템 완전 작동 (다크/라이트 모드 전환)
- [ ] 기본 레이아웃 구조 완성
- [ ] 컴포넌트 재사용성 검증
- [ ] 반응형 디자인 동작 확인
- [ ] TypeScript 타입 정의 완료
- [ ] 기본 스타일 가이드 문서 작성

## 다음 단계 연계
이 단계에서 구축한 컴포넌트들은 2단계(UI 구성)에서 각 페이지의 구체적인 UI를 구성하는 데 사용됩니다.

## 예상 소요 시간
- Phase 1-6: 2-3일
- Phase 7-8: 1-2일
- Phase 9-10: 1일

총 4-6일 예상