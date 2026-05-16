# Decision Log

## [2026-05-16] 모노레포 구조 선택 — Turborepo

### 결정
`sdui` 프로젝트를 Turborepo 기반 모노레포로 구성한다.

### 구조
```
sdui/
├── apps/
│   ├── web/        # Next.js 15 (프론트엔드 — SDUI 렌더러)
│   └── api/        # NestJS 11 (백엔드 — SDUI 스키마 서버)
├── packages/
│   └── sdui-schema/  # 공유 타입 정의 (@sdui/schema)
├── turbo.json
└── package.json
```

### 이유
- **Turborepo**: 태스크 캐싱과 병렬 실행으로 `dev`, `build`, `lint`를 단일 명령으로 처리.
- **모노레포**: 백엔드와 프론트엔드가 `@sdui/schema`를 공유해야 함. SDUI의 핵심은 서버-클라이언트 간 컴포넌트 스키마 계약이므로, 타입을 한 곳에서 관리하지 않으면 드리프트가 발생.
- **`packages/sdui-schema`**: 서버가 내려주는 컴포넌트 트리(`SDUIScreen`, `Component`, `Action`)의 타입을 단일 소스로 관리. 백엔드는 이 타입으로 응답을 직렬화하고, 프론트엔드는 이 타입을 기준으로 렌더링.
- **Next.js + NestJS**: labs 기존 스택과 동일. 학습 컨텍스트 전환 비용 최소화.

### 트레이드오프
- npm workspace는 pnpm 대비 심링크 방식이라 일부 엣지 케이스에서 resolution 문제가 생길 수 있음. SDUI 실험 규모에서는 문제 없다고 판단.
- `sdui-schema`를 TypeScript 소스 직접 참조(`main: ./src/index.ts`)로 구성함 — 별도 빌드 스텝 없이 사용 가능하나, 추후 배포/publish 시 빌드 파이프라인 추가 필요.
