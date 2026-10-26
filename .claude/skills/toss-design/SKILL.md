---
name: toss-design
description: my_fortune 프로젝트의 화면 디자인 기준(토스 앱 스타일). 화면/페이지/컴포넌트를 새로 만들거나 기존 디자인을 바꿀 때, 폼·결과 화면·버튼·카드·색·폰트·여백을 손댈 때, 사용자가 "토스처럼", "토스 느낌", "토스 스타일", "깔끔하게", "모바일 화면"이라고 말할 때 반드시 이 스킬을 사용한다. UI와 관련된 작업이면 사용자가 스킬 이름을 말하지 않아도 사용한다.
---

# toss-design

my_fortune의 모든 화면을 토스 앱처럼 보이게 만드는 디자인 기준이다. 화면마다 느낌이 달라지면 서비스가 하나로 보이지 않기 때문에, 새 화면을 만들 때마다 같은 기준을 적용한다. 스택은 Next.js(App Router) + Tailwind v4 + shadcn/ui(base-nova)이다.

코드를 쓰기 전에 AGENTS.md 지침대로 `node_modules/next/dist/docs/`의 관련 문서를 확인한다. 이 프로젝트의 Next.js는 알려진 버전과 다르다.

## 핵심 원칙

토스 화면이 쉬워 보이는 이유는 한 번에 하나만 묻고 하나만 보여주기 때문이다. 아래 기준은 모두 그 원칙에서 나온다.

1. **화면 하나에 할 일 하나.** 한 화면에 질문 하나(또는 결과 하나)만 둔다. 입력이 여러 개면 화면을 나눈다.
2. **큰 제목, 짧은 문장.** 제목은 한 문장으로 묻거나 말하고(예: "생년월일을 알려주세요"), 설명은 한 줄 이내로 쓴다. 전문 용어와 긴 안내문은 쓰지 않는다.
3. **넓은 여백.** 요소 사이를 넉넉히 띄운다. 빽빽하면 토스처럼 보이지 않는다.

## 디자인 토큰

| 항목 | 값 |
|---|---|
| 배경 | 흰색 `#FFFFFF` |
| 카드 배경 | 연회색 `#F2F4F6` (또는 `#F9FAFB`) |
| 포인트 색 | 베이비 핑크 `#F8BBD0` 하나만. 눌림 상태는 `#F48FB1`. 핑크 위 글자는 `#191F28` |
| 본문 글자 | `#191F28`, 보조 글자 `#6B7684`, 비활성 `#B0B8C1` |
| 모서리 | 카드 `rounded-2xl`(16px) ~ `rounded-3xl`, 버튼·입력 `rounded-2xl` |
| 글꼴 | Pretendard (아래 설정 참고) |
| 최대 너비 | `max-w-[600px]`, 가운데 정렬, 모바일 우선 |

포인트 색은 블루 하나만 쓴다. 강조가 필요하면 색을 늘리지 말고 글자 굵기와 크기로 구분한다. 에러만 예외로 연한 빨강(`#F04452`)을 쓴다.

### 타이포

- 화면 제목: `text-[26px] font-bold leading-snug` (모바일 기준 24~28px)
- 결과 강조 숫자·문구: `text-3xl font-bold`
- 본문: `text-base`(17px 안팎), 보조 설명: `text-sm text-[#6B7684]`
- 제목 줄바꿈은 `break-keep`을 써서 단어 중간에서 끊기지 않게 한다.

## shadcn 컴포넌트는 고쳐서 쓴다

컴포넌트를 새로 만들지 말고 `components/ui/`의 shadcn 컴포넌트를 토스 스타일로 **수정**한다. 한 번 고쳐두면 모든 화면이 따라오기 때문이다.

- **토큰 바꾸기:** `app/globals.css`의 `:root`에서 `--primary`를 토스 블루로, `--muted`/`--card`를 연회색으로, `--radius`를 `1rem` 이상으로 바꾼다. 화면 코드에서 색을 하드코딩하지 말고 `bg-primary`, `bg-muted`, `text-muted-foreground` 같은 토큰을 쓴다.
- **Button:** 기본 높이 `h-14`, `rounded-2xl`, `text-lg font-semibold`로 키운다.
- **Input / Select:** `h-14`, 연회색 배경, 테두리 없음, 포커스 시 블루 링.
- **Card:** 그림자 대신 연회색 배경 + `rounded-3xl` + `p-6`.
- 컴포넌트가 없으면 `npx shadcn@latest add <name>`으로 추가한 뒤 위 기준으로 고친다. (`form`은 base-nova에 없으니 `field`를 쓴다.)

## 레이아웃 패턴

### 화면 구조

```tsx
<main className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col bg-white px-6 pt-16">
  <h1 className="text-[26px] font-bold leading-snug break-keep">제목은 한 문장으로</h1>
  <p className="mt-3 text-sm text-muted-foreground">설명은 한 줄만</p>
  <div className="mt-10 flex-1">{/* 입력 하나 */}</div>
  <div className="sticky bottom-0 -mx-6 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
    <Button className="h-14 w-full rounded-2xl text-lg">다음</Button>
  </div>
</main>
```

- **하단 버튼:** 화면 아래에 가로로 꽉 차는 큰 버튼 하나를 고정한다(`sticky bottom-0`). 아이폰 하단 영역을 위해 `safe-area-inset-bottom`을 반영한다. 입력이 비어 있으면 `disabled`로 두어 다음 단계로 못 가게 한다.
- **보조 동작**(뒤로가기 등)은 버튼이 아니라 상단의 작은 아이콘이나 글자 링크로 둔다. 큰 버튼은 화면당 하나다.

### 입력은 한 단계씩

여러 항목(이름 → 생년월일 → 태어난 시간)은 한 페이지에 모으지 않고 **단계별로 한 화면씩** 보여준다. 단계는 클라이언트 상태(`step`)로 관리하고, 이전 답은 위에 작은 글씨로 쌓아도 좋다. 단계가 넘어갈 때 새 질문이 아래에서 부드럽게 올라오게 한다. 마지막 단계에서는 로딩 문구("운세를 보고 있어요")를 보여준다.

### 결과는 카드로 나누기

결과는 한 덩어리 텍스트로 쏟지 말고, 주제별(총운·재물운·연애운 등)로 **연회색 카드**에 나눠 담는다. 카드마다 소제목 하나와 두세 문장만 넣는다. 카드가 순서대로 아래에서 위로 부드럽게 나타나게 한다.

## 움직임

부드럽게 나타나는 효과만 쓴다. 화려한 애니메이션은 토스 느낌을 해친다.

- 등장: `opacity 0 → 1`, `translateY(12px → 0)`, 300~400ms, `ease-out`. 이 프로젝트에는 `tw-animate-css`가 있으니 `animate-in fade-in slide-in-from-bottom-3 duration-500`을 먼저 쓴다.
- 카드가 여러 개면 `style={{ animationDelay: `${i * 100}ms` }}`와 `fill-mode-both`로 순차 등장시킨다.
- 버튼 눌림: `active:scale-[0.98] transition`
- `prefers-reduced-motion`에서는 애니메이션을 끈다(`motion-reduce:animate-none`).

## Pretendard 설정

`app/layout.tsx`는 지금 Geist를 `--font-sans`로 쓴다. Pretendard로 교체할 때는 `next/font/local`로 자체 호스팅하는 방식을 우선한다(외부 CDN 요청이 없어 빠르다). 변수명은 shadcn CSS와 맞추기 위해 `--font-sans`를 그대로 유지한다.

```tsx
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "45 920",
});
```

폰트 파일이 아직 없으면 사용자에게 알리고 `public/fonts/PretendardVariable.woff2`를 받아 두도록 한다. 임시로는 CDN(`pretendard` jsDelivr dynamic-subset CSS)을 쓸 수 있다. 어느 쪽이든 `font-family` 폴백에 `-apple-system, "Apple SD Gothic Neo", sans-serif`를 둔다.

## 하지 말 것

- 포인트 색 추가(보라, 그라데이션 등)
- 한 화면에 입력 여러 개, 큰 버튼 여러 개
- 그림자·진한 테두리로 카드 구분(연회색 배경으로만 구분)
- 600px를 넘는 넓은 레이아웃, 가로 스크롤
- 긴 설명문, 영어 섞인 제목, 이모지 남발

## 완료 전 확인

- [ ] 한 화면에 할 일이 하나인가
- [ ] 제목이 크고 한 문장인가
- [ ] 색은 흰색, 연회색, 토스 블루뿐인가
- [ ] 하단에 꽉 찬 큰 버튼이 있는가 (모바일 폭 375px에서 확인)
- [ ] 색·모서리를 하드코딩하지 않고 토큰/컴포넌트를 썼는가
- [ ] 등장 애니메이션이 부드럽고 `motion-reduce`가 처리됐는가
