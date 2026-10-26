# my_fortune 작업 로그

작성일: 2026-10-26

## 1. 프로젝트 생성
- `npx create-next-app@latest . --yes` 로 현재 폴더에 생성
- Next.js 16.4.3 / React 19.3.0 / TypeScript / Tailwind CSS v4 / ESLint (App Router)

## 2. shadcn/ui 초기화
- `npx shadcn@latest init --defaults --no-monorepo`
- 스타일 `base-nova`, 기본 색상 `neutral`, 아이콘 lucide
- 생성: `components.json`, `components/ui/button.tsx`, `lib/utils.ts`, `app/globals.css` 수정

## 3. UI 컴포넌트 추가
- `npx shadcn@latest add button input label card select form calendar sonner`
  - `form`은 `base-nova` 스타일에 파일이 없어 설치되지 않음
- `npx shadcn@latest add field` (form 대체, `separator` 함께 설치)
- 현재 `components/ui/`: button, calendar, card, field, input, label, select, separator, sonner

## 4. 레이아웃 정리 (`app/layout.tsx`)
- Geist 폰트 변수명을 `--font-sans`로 변경 (shadcn CSS와 일치)
- `<Toaster />` 추가
- `lang="en"` → `lang="ko"`
- `npm run lint`, `npm run build` 통과

## 5. 개발 서버
- `npm run dev` 를 백그라운드로 실행, http://localhost:3000 (응답 200)
- 서버가 `.env.local` 변경을 읽으려면 재시작 필요

## 6. AI SDK 설치
- `npm install ai @ai-sdk/react @ai-sdk/google zod`
- ai 7.0.153 / @ai-sdk/react 4.0.157 / @ai-sdk/google 4.0.105 / zod 4.6.7

## 7. 환경 변수
- `.env.local`에 `GOOGLE_GENERATIVE_AI_API_KEY` 저장 (`.gitignore`의 `.env*`로 커밋 제외됨)
- 키 형식이 일반적인 AI Studio 키(`AIza...`)와 달라 실제 호출로 검증 필요
- 채팅에 키가 노출되었으므로 재발급 권장

## 참고
- `cacheComponents`, `partialPrefetching` 이 `next.config.ts`에서 기본 활성화됨
- `unrs-resolver` postinstall 스크립트 미승인 (`npm install-scripts approve unrs-resolver`)
- 아직 커밋하지 않음

## 다음 할 일
- 사이트 제목/설명 변경 (현재 "Create Next App")
- 운세 입력 폼(이름, 생년월일, 태어난 시간) 구현
- Gemini 호출 API 라우트 구현 및 키 동작 확인 (이때 dev 서버 재시작)
- 첫 커밋
