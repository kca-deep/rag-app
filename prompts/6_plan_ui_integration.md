# 6단계: UI 통합 계획

## 개요
5단계에서 검증된 안정적인 백엔드 API와 2단계에서 구축한 프론트엔드 UI를 v0.dev 스타일로 통합하여 완전한 RAG 파이프라인 웹앱을 완성합니다. 실시간 데이터 연동, 상태 관리, 사용자 경험 최적화를 포함합니다.

## v0.dev 스타일 통합 전략

### 컴포넌트 기반 데이터 플로우
```typescript
// 데이터 페칭과 UI 컴포넌트 분리
const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: api.collections.getAll,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 컴포넌트에서 데이터 사용
const CollectionGrid = () => {
  const { data: collections, isLoading, error } = useCollections()

  if (isLoading) return <CollectionGrid.Skeleton />
  if (error) return <CollectionGrid.Error error={error} />
  if (!collections?.length) return <CollectionGrid.Empty />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

### 상태별 UI 패턴
```typescript
// 로딩 상태 스켈레톤
const DataTable = ({ data, isLoading, error }) => {
  const states = {
    loading: () => <DataTable.Skeleton />,
    error: () => <DataTable.Error error={error} />,
    empty: () => <DataTable.Empty />,
    success: () => <DataTable.Content data={data} />
  }

  if (isLoading) return states.loading()
  if (error) return states.error()
  if (!data?.length) return states.empty()
  return states.success()
}

// 실시간 업데이트 반영
const useRealTimeUpdates = (queryKey: string[]) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const eventSource = new EventSource('/api/sse')

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data)
      queryClient.invalidateQueries({ queryKey })
    }

    return () => eventSource.close()
  }, [queryKey, queryClient])
}
```

### 모달 상태 관리 패턴
```typescript
// 모달 상태 중앙 관리
const useModalStore = create<ModalState>((set) => ({
  modals: {},
  openModal: (id, props) => set(state => ({
    modals: { ...state.modals, [id]: { open: true, props } }
  })),
  closeModal: (id) => set(state => ({
    modals: { ...state.modals, [id]: { ...state.modals[id], open: false } }
  })),
}))

// 컴포넌트에서 모달 사용
const CollectionActions = ({ collection }) => {
  const { openModal } = useModalStore()

  return (
    <DropdownMenu>
      <DropdownMenuItem
        onClick={() => openModal('editCollection', { collection })}
      >
        편집
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => openModal('deleteConfirm', {
          title: '컬렉션 삭제',
          onConfirm: () => deleteCollection(collection.id)
        })}
      >
        삭제
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
```

## 목표
- 프론트엔드-백엔드 완전 통합
- 실시간 데이터 동기화 구현
- 사용자 경험(UX) 최적화
- 성능 최적화 및 안정성 확보

## 체크리스트

### Phase 1: API 클라이언트 구성
- [x] **HTTP 클라이언트 설정**
  - [x] Axios 또는 Fetch 기반 API 클라이언트 구성
  - [x] 요청/응답 인터셉터 설정
  - [x] 에러 처리 및 재시도 로직 구현
  - [x] 타임아웃 및 취소 토큰 처리
- [x] **TypeScript 타입 정의**
  - [x] API 응답 스키마 타입 정의
  - [x] 요청 페이로드 타입 정의
  - [x] 에러 타입 정의
  - [ ] OpenAPI 스펙에서 타입 자동 생성
- [x] **API 엔드포인트 랩퍼 함수**
  - [x] Collection API 클라이언트 함수들
  - [ ] Document API 클라이언트 함수들
  - [ ] RAG 검색 API 클라이언트 함수들
  - [ ] API 키 관리 클라이언트 함수들
  - [ ] 시스템 관리 클라이언트 함수들

### Phase 2: 상태 관리 통합
- [x] **TanStack Query 설정**
  - [x] Query Client 구성 및 캐시 설정
  - [x] 쿼리 키 네이밍 전략 구현
  - [x] 캐시 무효화 전략 설정
  - [x] 백그라운드 refetch 설정
- [x] **커스텀 Hook 구현**
  - [x] useCollections - Collection 목록 관리
  - [ ] useDocuments - Document 관리
  - [ ] useSearch - 검색 기능
  - [ ] useApiKeys - API 키 관리
  - [ ] useSystemStats - 시스템 통계
- [ ] **Zustand 전역 상태 연동**
  - [ ] API 데이터와 로컬 상태 동기화
  - [ ] 사용자 설정 상태 관리
  - [ ] UI 상태 (모달, 사이드바 등) 관리
  - [ ] 알림 상태 관리

### Phase 3: 실시간 업데이트 구현
- [ ] **Server-Sent Events (SSE) 클라이언트**
  - [ ] SSE 연결 관리 Hook 구현
  - [ ] 이벤트 타입별 핸들러 등록
  - [ ] 연결 끊김 시 자동 재연결
  - [ ] 이벤트 필터링 및 구독 관리
- [ ] **실시간 UI 업데이트**
  - [ ] 문서 처리 상태 실시간 반영
  - [ ] 동기화 상태 실시간 업데이트
  - [ ] 시스템 통계 실시간 갱신
  - [ ] 알림 토스트 자동 표시
- [ ] **WebSocket 지원 (선택사항)**
  - [ ] 양방향 통신이 필요한 기능 구현
  - [ ] 실시간 검색 결과 스트리밍
  - [ ] 채팅형 인터페이스 지원

### Phase 4: 대시보드 페이지 통합
- [ ] **실시간 통계 카드 연동**
  - [ ] Collections 수 실시간 표시
  - [ ] 문서 수 및 상태별 집계
  - [ ] API 키 사용량 통계
  - [ ] 금일 요청 수 및 성공률
- [ ] **시스템 상태 모니터링**
  - [ ] 데이터베이스 연결 상태 표시
  - [ ] Milvus/Redis 연결 상태 체크
  - [ ] 동기화 지연 시간 모니터링
  - [ ] 에러율 및 응답시간 표시
- [ ] **빠른 액션 구현**
  - [ ] Collection 생성 모달 연동
  - [ ] 파일 업로드 기능 연동
  - [ ] API 키 생성 기능 연동

### Phase 5: Collection 관리 페이지 통합
- [x] **Collection 목록 구현**
  - [x] 페이지네이션 및 정렬 연동
  - [x] 실시간 상태 업데이트
  - [x] 필터링 및 검색 기능 연동
  - [ ] 배치 작업 (삭제, 내보내기) 구현
- [ ] **Collection 상세 모달**
  - [ ] 기본 정보 수정 폼 연동
  - [ ] 문서 목록 동적 로딩
  - [ ] Milvus 통계 시각화
  - [ ] 동기화 상태 및 로그 표시
- [x] **Collection 생성/수정**
  - [x] 폼 유효성 검사 통합
  - [x] 실시간 중복 이름 체크
  - [x] 생성 진행상황 표시
  - [x] 성공/실패 피드백 구현

### Phase 6: 문서 관리 페이지 통합
- [ ] **문서 목록 및 필터링**
  - [ ] 고급 필터 UI와 API 연동
  - [ ] 실시간 처리 상태 업데이트
  - [ ] 가상 스크롤링으로 성능 최적화
  - [ ] 배치 선택 및 작업 구현
- [ ] **파일 업로드 시스템**
  - [ ] 드래그 앤 드롭 업로드 구현
  - [ ] 진행률 표시 및 취소 기능
  - [ ] 다중 파일 업로드 지원
  - [ ] 업로드 에러 처리 및 재시도
- [ ] **문서 상세 모달**
  - [ ] 메타데이터 동적 로딩
  - [ ] 처리 로그 타임라인 구현
  - [ ] 청크 목록 가상 스크롤
  - [ ] 동기화 상태 실시간 표시
- [ ] **문서 처리 파이프라인**
  - [ ] 비동기 처리 상태 추적
  - [ ] 에러 발생 시 알림 및 재처리
  - [ ] 처리 완료 시 자동 새로고침

### Phase 7: 검색 페이지 통합
- [ ] **검색 인터페이스 구현**
  - [ ] 자동완성 기능 구현
  - [ ] 검색어 하이라이팅
  - [ ] 고급 검색 옵션 UI 연동
  - [ ] 검색 필터 상태 관리
- [ ] **검색 결과 표시**
  - [ ] Collection별 그룹화 표시
  - [ ] 관련성 점수 시각화
  - [ ] 무한 스크롤 또는 페이지네이션
  - [ ] 결과 내 재검색 기능
- [ ] **검색 히스토리 관리**
  - [ ] 최근 검색어 저장 및 표시
  - [ ] 북마크 검색 기능
  - [ ] 검색 통계 표시
  - [ ] 개인화 검색 추천

### Phase 8: API 키 관리 페이지 통합
- [ ] **API 키 목록 관리**
  - [ ] 키 상태별 필터링
  - [ ] 사용량 실시간 모니터링
  - [ ] 만료 예정 키 알림
  - [ ] 배치 관리 작업 구현
- [ ] **API 키 생성 및 설정**
  - [ ] 단계별 생성 위저드 구현
  - [ ] 권한 설정 UI 구현
  - [ ] 제한 설정 (Rate limiting) 구현
  - [ ] IP 제한 관리 UI
- [ ] **사용량 대시보드**
  - [ ] 실시간 사용량 차트
  - [ ] 시간별/일별 사용 패턴 분석
  - [ ] Collection별 사용량 분석
  - [ ] 에러율 및 응답시간 모니터링

### Phase 9: 모달 및 상호작용 시스템 완성
- [ ] **모달 상태 관리 완성**
  - [ ] 중첩 모달 지원 구현
  - [ ] 모달 간 데이터 전달
  - [ ] 모달 히스토리 관리
  - [ ] 브라우저 뒤로가기 지원
- [ ] **폼 처리 통합**
  - [ ] React Hook Form과 API 연동
  - [ ] 실시간 유효성 검사
  - [ ] 자동 저장 기능 구현
  - [ ] 변경사항 감지 및 경고
- [ ] **사용자 피드백 시스템**
  - [ ] 성공/실패 토스트 알림
  - [ ] 로딩 스피너 및 스켈레톤
  - [ ] 진행률 표시기
  - [ ] 확인 다이얼로그 구현

### Phase 10: 성능 최적화
- [ ] **코드 스플리팅 최적화**
  - [ ] 페이지별 동적 임포트
  - [ ] 컴포넌트 지연 로딩
  - [ ] 크리티컬 CSS 인라인화
  - [ ] 번들 크기 분석 및 최적화
- [ ] **데이터 로딩 최적화**
  - [ ] 데이터 pre-fetching 구현
  - [ ] 무한 쿼리 최적화
  - [ ] 캐시 전략 개선
  - [ ] 불필요한 리렌더링 방지
- [ ] **사용자 경험 최적화**
  - [ ] Optimistic UI 업데이트
  - [ ] 네트워크 상태에 따른 UX 조정
  - [ ] 오프라인 지원 기능
  - [ ] Progressive Web App (PWA) 기능

### Phase 11: 에러 처리 및 사용자 안내
- [ ] **에러 바운더리 구현**
  - [ ] 전역 에러 처리
  - [ ] 컴포넌트별 에러 복구
  - [ ] 에러 리포팅 시스템
  - [ ] 사용자 친화적 에러 메시지
- [ ] **네트워크 에러 처리**
  - [ ] 연결 끊김 감지 및 알림
  - [ ] 자동 재시도 로직
  - [ ] 오프라인 상태 표시
  - [ ] 재연결 시 데이터 동기화
- [ ] **사용자 안내 시스템**
  - [ ] 온보딩 투어 구현
  - [ ] 도움말 및 FAQ 통합
  - [ ] 키보드 단축키 안내
  - [ ] 기능별 툴팁 구현

### Phase 12: 접근성 및 국제화
- [ ] **접근성 개선**
  - [ ] 스크린 리더 지원 완성
  - [ ] 키보드 네비게이션 완전 지원
  - [ ] 고대비 모드 지원
  - [ ] 폰트 크기 조절 기능
- [ ] **국제화 (i18n) 구현**
  - [ ] 다국어 리소스 관리 시스템
  - [ ] 한국어/영어 전환 기능
  - [ ] 날짜/시간 현지화
  - [ ] 숫자 형식 현지화
- [ ] **반응형 디자인 최종 점검**
  - [ ] 모든 화면 크기 대응 확인
  - [ ] 터치 인터페이스 최적화
  - [ ] 모바일 메뉴 시스템 완성
  - [ ] 태블릿 레이아웃 최적화

### Phase 13: 최종 통합 테스트
- [ ] **엔드투엔드 테스트**
  - [ ] 전체 워크플로우 시나리오 테스트
  - [ ] 크로스 브라우저 호환성 테스트
  - [ ] 모바일 디바이스 테스트
  - [ ] 성능 회귀 테스트
- [ ] **사용자 수용 테스트 (UAT)**
  - [ ] 실제 사용자 시나리오 테스트
  - [ ] 피드백 수집 및 개선
  - [ ] 사용성 테스트 수행
  - [ ] 접근성 테스트 완료
- [ ] **보안 통합 테스트**
  - [ ] 클라이언트-서버 보안 검증
  - [ ] 인증/인가 플로우 테스트
  - [ ] 데이터 보호 검증
  - [ ] XSS/CSRF 방어 테스트

### Phase 14: 배포 준비 및 최적화
- [ ] **프로덕션 빌드 최적화**
  - [ ] 빌드 성능 최적화
  - [ ] 자산 압축 및 최적화
  - [ ] CDN 연동 준비
  - [ ] 캐싱 전략 구현
- [ ] **환경별 설정 관리**
  - [ ] 개발/스테이징/프로덕션 환경 분리
  - [ ] 환경변수 관리 시스템
  - [ ] 피쳐 플래그 구현
  - [ ] A/B 테스트 준비
- [ ] **모니터링 및 분석 설정**
  - [ ] 사용자 행동 분석 도구 연동
  - [ ] 성능 모니터링 설정
  - [ ] 에러 추적 시스템 구축
  - [ ] 비즈니스 메트릭 수집

### Phase 15: 문서화 및 교육 자료
- [ ] **사용자 매뉴얼 작성**
  - [ ] 기능별 사용 가이드
  - [ ] FAQ 및 문제해결 가이드
  - [ ] API 연동 가이드
  - [ ] 모범 사례 문서
- [ ] **개발자 문서 완성**
  - [ ] 코드 구조 문서화
  - [ ] 컴포넌트 API 문서
  - [ ] 상태 관리 가이드
  - [ ] 배포 및 운영 가이드

## 기술적 고려사항

### 상태 관리 전략
- **서버 상태**: TanStack Query로 캐싱 및 동기화
- **클라이언트 상태**: Zustand로 경량 전역 상태 관리
- **폼 상태**: React Hook Form으로 최적화된 폼 처리

### 성능 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 계산 비용이 높은 연산 최적화
- **가상화**: 큰 리스트의 렌더링 성능 최적화

### 에러 처리 전략
- **Boundary**: 컴포넌트 트리 레벨 에러 처리
- **Query Error**: API 에러의 일관된 처리
- **Toast**: 사용자 친화적 에러 알림

## 완료 기준
- [ ] 모든 UI 컴포넌트와 API 연동 완료
- [ ] 실시간 업데이트 시스템 정상 동작
- [ ] 모든 사용자 시나리오 테스트 통과
- [ ] 성능 요구사항 만족 (LCP < 2.5s, FID < 100ms)
- [ ] 접근성 기준 준수 (WCAG 2.1 AA)
- [ ] 크로스 브라우저 호환성 확보
- [ ] 모바일 반응형 디자인 완료
- [ ] 보안 검증 완료

## 다음 단계
- 프로덕션 배포
- 사용자 피드백 수집 및 개선
- 추가 기능 개발 및 확장
- 유지보수 및 업데이트 계획

## 예상 소요 시간
- Phase 1-4: 6-7일
- Phase 5-8: 8-10일
- Phase 9-12: 6-8일
- Phase 13-15: 4-5일

총 24-30일 예상

## 성공 지표
- **기능 완성도**: 모든 계획된 기능 100% 구현
- **성능**: Core Web Vitals 기준 만족
- **사용성**: 사용자 만족도 90% 이상
- **안정성**: 크리티컬 버그 0개
- **접근성**: WCAG 2.1 AA 레벨 준수

## 위험 요소 및 대응
- **API 변경**: 버전 관리 및 하위 호환성 보장
- **성능 이슈**: 지속적인 모니터링 및 최적화
- **브라우저 호환성**: Polyfill 및 fallback 구현
- **사용자 피드백**: 신속한 대응 및 개선 프로세스