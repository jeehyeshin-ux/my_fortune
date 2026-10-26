# my_fortune

AI 신년운세 웹 서비스. 이름·생년월일·주제를 입력하면 Gemini가 2027년 운세를 써 준다. 로그인·저장 없음. 자세한 요구사항은 `PRD.md`.

## 스택
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind v4, shadcn/ui (base-nova, `components/ui/`)
- AI SDK (`ai`, `@ai-sdk/google`), zod

## 구조
- `app/page.tsx` — 랜딩 → 입력 → 결과 흐름
- `app/api/fortune/route.ts` — Gemini 호출 (서버 전용)
- `lib/` — 공용 스키마·상수

## 규칙
- `GOOGLE_GENERATIVE_AI_API_KEY`는 `.env.local`에만 두고 서버 코드에서만 읽는다. 클라이언트로 보내거나 로그에 찍지 않는다.
- UI 작업은 `.claude/skills/toss-design`의 디자인 기준을 따른다.
- 명령: `npm run dev`, `npm run lint`, `npm run build`
- "작업로그 저장해줘"는 `WORKLOG.md` 갱신 후 git 커밋을 뜻한다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
