# 3. DB 환경설정 및 환경변수 설정 계획

## 개요
RAG 파이프라인 운영에 필요한 모든 데이터베이스 환경과 외부 서비스 연동을 위한 환경변수를 설정합니다. SQLite, Milvus, Redis, OpenAI API 연동을 포함합니다.

## 목표
- 프로덕션급 데이터베이스 환경 구축
- 보안이 강화된 환경변수 관리
- 동기화 및 트랜잭션 안정성 확보
- 모니터링 및 백업 체계 구축

## 체크리스트

### Phase 1: 환경변수 및 설정 관리
- [x] .env 파일 구조 설계
- [x] 환경별 설정 파일 분리 (.env.local, .env.production)
- [x] 환경변수 유효성 검증 스키마 구현
- [x] 민감 정보 암호화 설정
- [x] 환경변수 타입 정의 (TypeScript)
- [x] .env.example 파일 생성

### Phase 2: SQLite 데이터베이스 설정
- [x] SQLite 데이터베이스 파일 위치 설정
- [x] 연결 풀 설정 (connection pooling)
- [x] WAL 모드 활성화 (성능 최적화)
- [x] 프라그마 설정 (journal_mode, synchronous, cache_size)
- [x] 백업 전략 구현
- [x] 데이터베이스 잠금 처리 로직

### Phase 3: SQLite 스키마 구현
- [x] **collections 테이블**
  - [x] 기본 필드 구현
  - [x] 인덱스 설정
  - [x] 제약조건 적용
- [x] **documents 테이블**
  - [x] 메타데이터 필드 구현
  - [x] 파일 해시 유니크 제약
  - [x] 외래키 관계 설정
- [x] **document_chunks 테이블**
  - [x] 청크 텍스트 저장 구조
  - [x] Milvus ID 매핑 필드
  - [x] 복합 인덱스 설정
- [x] **API 키 관리 테이블들**
  - [x] api_keys 테이블 구현
  - [x] api_key_permissions 테이블 구현
  - [x] 해시 기반 보안 구현
- [x] **사용량 추적 테이블**
  - [x] api_usage_logs 구현
  - [x] 파티셔닝 전략 고려
- [x] **동기화 관리 테이블**
  - [x] sync_operations 테이블
  - [x] job_queue 테이블
  - [x] 재시도 로직 지원

### Phase 4: SQLite 고급 기능
- [ ] **RAG 최적화 테이블들**
  - [ ] query_cache 테이블 구현
  - [ ] search_feedback 테이블 구현
  - [ ] conversation_context 테이블 구현
  - [ ] chunk_analytics 테이블 구현
- [ ] **시스템 모니터링 테이블**
  - [ ] system_health 테이블 구현
  - [ ] audit_logs 테이블 구현
- [ ] **트리거 구현**
  - [ ] 자동 timestamp 업데이트 트리거
  - [ ] 데이터 일관성 검증 트리거
- [ ] **뷰 구현**
  - [ ] 통계용 뷰 생성
  - [ ] 보고서용 뷰 생성

### Phase 5: Milvus 벡터 데이터베이스 설정
- [ ] Milvus 서버 연결 설정
- [ ] 연결 풀 및 재시도 로직 구현
- [ ] Collection 스키마 정의
  - [ ] 1536차원 임베딩 벡터 필드
  - [ ] 메타데이터 필드들
  - [ ] 동적 필드 활성화
- [ ] 인덱스 전략 구현
  - [ ] 데이터 크기별 최적 인덱스 선택 로직
  - [ ] 인덱스 파라미터 최적화
- [ ] Collection 생성/삭제 자동화
- [ ] 백업 및 복구 전략

### Phase 6: Redis 캐시 설정
- [ ] Redis 서버 연결 설정
- [ ] 연결 풀 설정 (ioredis 사용)
- [ ] 캐시 키 네이밍 전략 정의
- [ ] TTL (Time To Live) 전략 설정
- [ ] 캐시 계층화 구조 설계
  - [ ] L1: 임베딩 캐시
  - [ ] L2: 검색 결과 캐시
  - [ ] L3: 세션 캐시
- [ ] 캐시 무효화 전략
- [ ] Redis Pub/Sub 설정 (실시간 업데이트용)

### Phase 7: OpenAI API 연동 설정
- [ ] API 키 보안 저장
- [ ] 요청 제한 및 재시도 로직
- [ ] 에러 핸들링 (Rate limit, API 장애)
- [ ] 임베딩 모델 설정 (text-embedding-3-small)
- [ ] 배치 처리 최적화
- [ ] 비용 모니터링 설정

### Phase 8: 데이터베이스 마이그레이션 시스템
- [ ] 마이그레이션 파일 구조 설계
- [ ] 스키마 버전 관리 시스템
- [ ] 롤백 메커니즘 구현
- [ ] 데이터 무결성 검증
- [ ] 자동 마이그레이션 실행 스크립트
- [ ] 마이그레이션 상태 추적

### Phase 9: 동기화 시스템 구현
- [ ] 2단계 커밋 패턴 구현
- [ ] SQLite-Milvus 동기화 로직
- [ ] 트랜잭션 격리 수준 설정
- [ ] 데드락 방지 메커니즘
- [ ] 동기화 실패 복구 로직
- [ ] 동기화 상태 모니터링

### Phase 10: 백업 및 복구 시스템
- [ ] SQLite 백업 자동화
  - [ ] 정기 백업 스케줄링
  - [ ] 증분 백업 구현
  - [ ] 백업 파일 압축 및 암호화
- [ ] Milvus 백업 전략
  - [ ] Collection 백업/복원 스크립트
  - [ ] 메타데이터 일관성 검증
- [ ] Redis 백업 설정
  - [ ] RDB/AOF 설정
  - [ ] 복구 시나리오 테스트
- [ ] 재해 복구 계획 수립

### Phase 11: 모니터링 및 로깅 시스템
- [ ] 데이터베이스 성능 모니터링
- [ ] 연결 상태 체크 시스템
- [ ] 쿼리 성능 로깅
- [ ] 리소스 사용량 추적
- [ ] 알림 시스템 구현
- [ ] 대시보드 메트릭 수집

### Phase 12: 보안 설정
- [ ] 데이터베이스 접근 권한 설정
- [ ] API 키 암호화 저장
- [ ] 감사 로깅 활성화
- [ ] 네트워크 보안 설정
- [ ] 데이터 암호화 (저장 시/전송 시)
- [ ] 취약점 스캔 및 점검

### Phase 13: 성능 최적화
- [ ] SQLite 쿼리 최적화
- [ ] 인덱스 성능 분석 및 튜닝
- [ ] Milvus 검색 성능 최적화
- [ ] Redis 메모리 사용량 최적화
- [ ] 연결 풀 크기 최적화
- [ ] 배치 처리 최적화

### Phase 14: 테스트 환경 구성
- [ ] 테스트용 데이터베이스 셋업
- [ ] 시드 데이터 생성 스크립트
- [ ] 통합 테스트 환경 구성
- [ ] 성능 테스트 환경 구성
- [ ] 데이터베이스 모킹 설정

## 주요 환경변수 목록

### 데이터베이스 연결
```
# SQLite
DATABASE_URL=sqlite:///./data/rag_pipeline.db
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Milvus
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_USER=
MILVUS_PASSWORD=
MILVUS_TIMEOUT=30

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=0
REDIS_MAX_CONNECTIONS=100
```

### OpenAI API
```
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_MAX_RETRIES=3
OPENAI_TIMEOUT=30
```

### 보안 설정
```
SECRET_KEY=your-secret-key-here
API_KEY_SALT=random-salt-for-hashing
ENCRYPTION_KEY=32-byte-encryption-key
JWT_SECRET=jwt-signing-secret
```

### 성능 설정
```
CACHE_TTL=3600
SEARCH_CACHE_TTL=1800
EMBEDDING_CACHE_TTL=86400
BATCH_SIZE=100
MAX_CONCURRENT_REQUESTS=10
```

## 완료 기준
- [ ] 모든 데이터베이스 연결 테스트 통과
- [ ] 환경변수 유효성 검증 통과
- [ ] 스키마 생성 및 마이그레이션 성공
- [ ] 동기화 시스템 안정성 검증
- [ ] 백업/복구 시스템 테스트 완료
- [ ] 성능 벤치마크 달성
- [ ] 보안 감사 통과
- [ ] 모니터링 시스템 동작 확인

## 다음 단계 연계
이 단계에서 구축한 데이터베이스 환경은 4단계(API 구현)에서 실제 비즈니스 로직과 연결됩니다.

## 예상 소요 시간
- Phase 1-4: 3-4일
- Phase 5-7: 2-3일
- Phase 8-10: 3-4일
- Phase 11-14: 3-4일

총 11-15일 예상

## 위험 요소 및 대응 방안
- **데이터 손실**: 자동 백업 시스템으로 대응
- **동기화 실패**: 트랜잭션 롤백 및 재시도 로직으로 대응
- **성능 저하**: 모니터링 시스템으로 조기 감지
- **보안 취약점**: 정기적인 보안 감사로 예방