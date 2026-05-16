# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Server-Driven UI(SDUI) 실험 프로젝트. 서버가 컴포넌트 트리를 JSON으로 내려주면 클라이언트가 렌더링하는 구조를 탐구한다.

```
sdui/
├── apps/
│   ├── web/          # Next.js 16 (SDUI 렌더러 + 관리자 프리뷰)
│   └── api/          # NestJS 11 (SDUI 스크린 서버, :3001)
└── packages/
    └── sdui-schema/  # 공유 타입 (@sdui/schema) — 빌드 없이 TS 소스 직접 참조
```

## 명령어

### 루트 (Turborepo — 두 앱 동시 실행)
```bash
npm run dev          # web + api 병렬 실행
npm run build        # 전체 빌드 (sdui-schema → api/web 순)
npm run lint         # 전체 lint
npm run type-check   # 전체 타입 검사
```

### apps/web (Next.js 16, Tailwind v4)
```bash
cd apps/web
npm run dev          # http://localhost:3000
npm run build
npm run lint
```

### apps/api (NestJS 11)
```bash
cd apps/api
npm run start:dev    # watch 모드, http://localhost:3001
npm run build
npm run test                        # Jest 단위 테스트
npm run test:watch
npm run test:e2e
npx jest src/screens/screens.service.spec.ts   # 단일 파일
```

## 아키텍처

### 핵심 데이터 흐름
```
api (NestJS) → SDUIScreen JSON → web (Next.js) → SDUI 렌더러 → React 컴포넌트
```

### 공유 타입 (`@sdui/schema`)
`packages/sdui-schema/src/types.ts`가 계약의 단일 소스. `SDUIScreen`이 최상위 구조이고 `Component` 유니온 타입(`text | image | button | stack | card | list`)이 렌더링 단위다. 빌드 없이 `main: ./src/index.ts`로 직접 참조하므로 수정 즉시 적용.

### API 엔드포인트
- `GET /screens` — 스크린 목록
- `GET /screens/:screenId` — 특정 `SDUIScreen` JSON 반환

`ScreensService`가 스크린 데이터를 인메모리로 보관 (DB 없음). 새 샘플 스크린 추가는 `apps/api/src/screens/screens.service.ts`에서.

### CORS
`main.ts`에서 `app.enableCors()` 활성화 — web 앱이 제약 없이 API를 호출 가능.

### 타입 공유 주의
NestJS에서 `@sdui/schema`를 import할 때 `tsconfig-paths`가 처리. 타입을 인라인으로 중복 선언하지 말고 반드시 패키지를 통해 참조.
