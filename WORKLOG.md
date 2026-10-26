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

## 8. 운세 서비스 구현
- 입력(이름 → 생년월일 → 주제) → 로딩 → 결과 흐름 (`components/fortune-app.tsx`), toss-design 기준 적용
- `app/api/fortune/route.ts`: Gemini(`gemini-3.6-flash`) 호출, zod 검증, IP당 1분 3회 제한(인스턴스 메모리 기반)
- 첫 커밋 `49670d2` 이후 구현분은 `f16c14d`에 함께 커밋

## 9. 운세 말투·색 변경 (`f16c14d`)
- 시스템 프롬프트(`INSTRUCTIONS`)를 문학 편집자 말투 + 밈으로 변경, 마지막 문단에 "기세가 전부다. 기죽지 말자." 다짐 필수
- 건강·돈 단정 예언 금지
- 포인트 색 토스 블루 → 베이비 핑크 `#F8BBD0` (눌림 `#F48FB1`, 핑크 위 글자 `#191F28`), `toss-design` 스킬 문서도 수정

## 10. 결과 이미지 저장 (`f60e02c`)
- 결과 카드 아래 "이미지로 저장" 버튼, `html-to-image`(`toBlob`)로 PNG 생성
- 파일 공유 지원 환경(휴대폰)은 공유 시트, 그 외는 `my-fortune-2027.png` 다운로드

## 11. 다크모드 (`9b2214b`)
- `dark` 클래스 방식. `layout.tsx` 인라인 스크립트로 저장값/시스템 설정을 첫 페인트 전에 적용
- 헤더 오른쪽 토글(`components/theme-toggle.tsx`), `localStorage`의 `theme`에 저장
- 다크 토큰: 배경 `#17171c`, 카드 `#2c2c35`, 포인트 `#e58fb0`. `bg-white` → `bg-background`

## 12. 배포 (Vercel)
- 프로젝트 `my-fortune` (`jeehyeshin-4010`), GitHub `jeehyeshin-ux/my_fortune`의 `main`에 푸시
- 푸시만으로는 자동 배포가 안 돼서 `npx vercel --prod --yes`로 직접 배포
- `GOOGLE_GENERATIVE_AI_API_KEY`는 Production에만 등록
- Deployment Protection(`ssoProtection`)을 꺼서 로그인 없이 접속 가능
- 공유 주소: https://my-fortune-livid.vercel.app

## 참고
- `cacheComponents`, `partialPrefetching` 이 `next.config.ts`에서 기본 활성화됨
- `unrs-resolver` postinstall 스크립트 미승인 (`npm install-scripts approve unrs-resolver`)
- Gemini 키 사용량 한도는 Google AI Studio에서 설정 권장

## 다음 할 일
- GitHub ↔ Vercel Git 연결 확인 (자동 배포)
- `metadataBase` 경고 해결
- 휴대폰에서 이미지 저장·다크모드 실사용 확인
