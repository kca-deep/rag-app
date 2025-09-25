# 2. UI 구성 계획

## 개요
1단계에서 구축한 공통 컴포넌트를 활용하여 RAG 파이프라인 웹앱의 모든 페이지 UI를 v0.dev 스타일로 구성합니다. 모달 기반의 상호작용과 1레벨 사이드바 구조를 구현합니다.

## v0.dev 스타일 레이아웃 설계

### 섹션 기반 페이지 구성
```typescript
// 페이지 구조 템플릿
const PageLayout = ({
  title,
  description,
  actions,
  filters,
  children
}) => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Section */}
    <div className="bg-white border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
          <div className="flex gap-3">{actions}</div>
        </div>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-6">
      {filters && (
        <div className="mb-6 p-4 bg-white rounded-lg border">
          {filters}
        </div>
      )}
      <div className="bg-white rounded-lg border">
        {children}
      </div>
    </div>
  </div>
)
```

### 그리드 시스템 활용
- **12-column 그리드**: CSS Grid를 활용한 유연한 레이아웃
- **반응형 브레이크포인트**: sm, md, lg, xl 기준 적응형 레이아웃
- **카드 그리드**: 통계 카드, 컬렉션 카드 등 일관된 그리드 패턴

### 컴포넌트 컴포지션 전략
```typescript
// 대시보드 구성 예시
<Dashboard>
  <Dashboard.Header
    title="대시보드"
    actions={<CreateButton />}
  />
  <Dashboard.Stats>
    <StatsCard icon={Collection} value="24" label="Collections" />
    <StatsCard icon={Document} value="1,234" label="Documents" />
    <StatsCard icon={Key} value="8" label="API Keys" />
    <StatsCard icon={Activity} value="156" label="Today's Requests" />
  </Dashboard.Stats>
  <Dashboard.Content>
    <SystemStatus />
    <RecentActivity />
  </Dashboard.Content>
</Dashboard>
```

## 목표
- 5개 주요 페이지 UI 완전 구현
- 모달 기반 상호작용 시스템 구축
- 실시간 데이터 업데이트 UI 준비
- 반응형 디자인 적용

## 체크리스트

### Phase 1: 전역 레이아웃 구성
- [x] 메인 레이아웃 (app/layout.tsx) 업데이트
- [x] 1레벨 사이드바 네비게이션 구현
- [x] 헤더 컴포넌트 (사용자 정보, 테마 토글, 알림)
- [x] 페이지 컨테이너 래퍼 구성
- [x] 모바일 반응형 사이드바 구현

### Phase 2: 대시보드 페이지 (/)
- [x] 실시간 통계 카드 그리드 레이아웃
  - [x] Collections 수 카드
  - [x] 전체 문서 수 카드
  - [x] API 키 수 카드
  - [x] 금일 요청 수 카드
- [x] 시스템 상태 표시 섹션
  - [x] Milvus 연결 상태
  - [x] Redis 연결 상태
  - [x] 동기화 상태
- [x] 빠른 액션 버튼 섹션
  - [x] Collection 생성 모달 트리거
  - [x] 문서 업로드 모달 트리거
  - [x] API 키 발급 모달 트리거
- [ ] 최근 활동 피드 (선택사항)

### Phase 3: Collection 관리 페이지 (/collections)
- [x] Collection 목록 데이터 테이블
  - [x] 컬럼: 이름, 문서수, 상태, 최종 업데이트, 액션
  - [x] 정렬 및 필터링 기능
  - [ ] 페이지네이션
- [x] 상단 액션 바
  - [x] 새 Collection 생성 버튼
  - [x] 검색 필터 입력
  - [x] 상태별 필터 드롭다운
- [x] Collection 상세 모달
  - [x] 기본 정보 탭 (이름, 설명 수정 폼)
  - [x] 문서 목록 탭
  - [x] Milvus 통계 탭
  - [x] 동기화 상태 탭
- [x] Collection 삭제 확인 모달

### Phase 4: 문서 관리 페이지 (/documents)
- [x] 문서 목록 데이터 테이블
  - [x] 컬럼: 파일명, Collection, 상태, 크기, 업로드일, 액션
  - [x] 고급 필터링 (Collection, 상태, 날짜 범위)
  - [x] 배치 선택 기능
- [x] 상단 툴바
  - [x] 문서 업로드 버튼
  - [x] 다중 선택 액션 (삭제, 재처리)
  - [x] 필터 토글 버튼
- [x] 필터 사이드 패널
  - [x] Collection 선택기
  - [x] 상태 체크박스 그룹
  - [x] 날짜 범위 선택기
- [x] 문서 상세 모달
  - [x] 메타데이터 정보 표시
  - [x] 처리 로그 타임라인
  - [x] 청크 목록 (가상 스크롤)
  - [x] 동기화 상태 표시
- [x] 파일 업로드 모달 (드래그 앤 드롭 지원)

### Phase 5: 검색 페이지 (/search)
- [ ] 검색 인터페이스
  - [ ] 메인 검색 입력 (자동완성 지원)
  - [ ] 고급 검색 옵션 토글
- [ ] 고급 검색 옵션 패널
  - [ ] Collection 다중 선택
  - [ ] 유사도 임계값 슬라이더
  - [ ] 결과 수 설정
  - [ ] 검색 타입 선택 (vector, keyword, hybrid)
- [ ] 검색 결과 표시
  - [ ] Collection별 그룹화된 결과
  - [ ] 검색어 하이라이팅
  - [ ] 관련성 점수 표시
  - [ ] 페이지네이션
- [ ] 검색 히스토리 사이드바
  - [ ] 최근 검색어 목록
  - [ ] 저장된 검색 목록
  - [ ] 검색 삭제 기능

### Phase 6: API 키 관리 페이지 (/api-keys)
- [ ] API 키 목록 테이블
  - [ ] 컬럼: 이름, 키 프리픽스, 상태, 권한, 사용량, 만료일, 액션
  - [ ] 상태별 필터링
- [ ] 상단 액션 바
  - [ ] 새 API 키 생성 버튼
  - [ ] 만료 예정 알림 배너
- [ ] API 키 생성 모달
  - [ ] 기본 정보 입력 (이름, 설명)
  - [ ] 권한 설정 (Collection별)
  - [ ] 제한 설정 (일일 한도, 분당 제한)
  - [ ] IP 제한 설정
  - [ ] 만료일 설정
- [ ] API 키 상세 모달
  - [ ] 사용량 통계 차트 (시간별, 일별)
  - [ ] Collection별 사용 패턴
  - [ ] 사용 히스토리 테이블
  - [ ] 권한 수정 인터페이스
- [ ] 사용량 대시보드 탭
  - [ ] 실시간 사용량 차트
  - [ ] 에러율 차트
  - [ ] 응답 시간 차트

### Phase 7: 모달 시스템 구현
- [x] 모달 상태 관리 (Zustand)
- [x] 중첩 모달 지원
- [x] 모달 애니메이션 구현
- [x] ESC 키로 모달 닫기
- [x] 외부 클릭으로 모달 닫기
- [x] 모달 포커스 트랩

### Phase 8: 실시간 업데이트 UI
- [ ] Server-Sent Events 클라이언트 구현
- [ ] 실시간 상태 업데이트 표시
- [ ] Toast 알림 시스템
- [ ] 진행률 표시 컴포넌트
- [ ] 자동 새로고침 토글

### Phase 9: 에러 처리 및 로딩 상태
- [ ] 전역 에러 바운더리 구현
- [ ] 404 페이지 디자인
- [ ] 500 에러 페이지 디자인
- [ ] 네트워크 에러 처리 UI
- [x] 스켈레톤 로딩 상태
- [x] 스피너 로딩 상태

### Phase 10: 접근성 및 UX 개선
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 지원
- [ ] 고대비 모드 지원
- [ ] 폰트 크기 조절 기능
- [ ] 빈 상태 (Empty State) 디자인
- [ ] 데이터 로딩 인디케이터

### Phase 11: 모바일 최적화
- [x] 사이드바 햄버거 메뉴 구현
- [ ] 터치 제스처 지원
- [x] 모바일 모달 최적화
- [ ] 가상 키보드 대응
- [ ] 스와이프 액션 구현

### Phase 12: 성능 최적화
- [ ] React.memo 적용
- [ ] useMemo, useCallback 최적화
- [ ] 이미지 지연 로딩
- [ ] 무한 스크롤 구현 (대용량 리스트)
- [ ] 가상 스크롤링 구현

## 주요 고려사항

### 사용자 경험 (UX)
- **직관적 네비게이션**: 명확한 메뉴 구조와 브레드크럼
- **빠른 피드백**: 모든 사용자 액션에 즉시 반응
- **일관성**: 모든 페이지에서 동일한 디자인 패턴 적용

### 성능
- **지연 로딩**: 페이지별 코드 스플리팅 적용
- **메모이제이션**: 불필요한 리렌더링 방지
- **최적화**: 큰 리스트의 가상화 구현

### 접근성
- **시맨틱 HTML**: 의미있는 HTML 태그 사용
- **ARIA 레이블**: 스크린 리더 지원
- **키보드 접근**: 모든 기능 키보드로 접근 가능

## 완료 기준
- [ ] 모든 5개 페이지 UI 구현 완료
- [ ] 모달 시스템 완전 동작
- [ ] 모바일 반응형 디자인 검증
- [ ] 접근성 테스트 통과
- [ ] 성능 최적화 적용
- [ ] 실시간 업데이트 UI 준비 완료
- [ ] TypeScript 타입 안정성 확보
- [ ] 크로스 브라우저 호환성 검증

## 다음 단계 연계
이 단계에서 완성한 UI는 3단계(DB 환경설정)와 4단계(API 구현) 이후 실제 데이터와 연결됩니다.

## 예상 소요 시간
- Phase 1-2: 1-2일
- Phase 3-6: 4-5일
- Phase 7-9: 2-3일
- Phase 10-12: 2-3일

총 9-13일 예상