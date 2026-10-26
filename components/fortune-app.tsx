"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, Download } from "lucide-react";
import { toBlob } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import {
  FORTUNE_YEARS,
  birthDateSchema,
  nameSchema,
  type FortuneYear,
} from "@/lib/fortune";
import {
  BRANCHES,
  BRANCHES_KO,
  ELEMENTS_HANJA,
  ELEMENTS_KO,
  HOUR_SLOTS,
  STEMS,
  STEMS_KO,
  branchElement,
  stemElement,
  type Pillar,
  type Saju,
} from "@/lib/saju-data";
import { cn } from "@/lib/utils";

type Step = "landing" | "name" | "birth" | "hour" | "loading" | "saju" | "result";

const BACK: Partial<Record<Step, Step>> = {
  name: "landing",
  birth: "name",
  hour: "birth",
  saju: "hour",
  result: "saju",
};

const FADE_IN =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both motion-reduce:animate-none";

export function FortuneApp() {
  const [step, setStep] = useState<Step>("landing");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [hour, setHour] = useState("unknown");
  const [error, setError] = useState("");
  const [saju, setSaju] = useState<Saju | null>(null);
  const [year, setYear] = useState<FortuneYear>(FORTUNE_YEARS[0]);
  const [fortunes, setFortunes] = useState<Partial<Record<FortuneYear, string>>>({});
  const [loadingText, setLoadingText] = useState("");
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const hourSlot = hour === "unknown" ? null : Number(hour);

  async function saveImage() {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const blob = await toBlob(cardRef.current, { pixelRatio: 2, backgroundColor: getComputedStyle(document.body).backgroundColor });
      if (!blob) throw new Error("empty image");
      const file = new File([blob], `my-fortune-${year}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError("이미지를 저장하지 못했어요. 다시 시도해 주세요.");
      }
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setStep("landing");
    setName("");
    setBirthDate("");
    setHour("unknown");
    setError("");
    setSaju(null);
    setFortunes({});
  }

  function next() {
    setError("");
    if (step === "landing") return setStep("name");
    if (step === "name") {
      const r = nameSchema.safeParse(name);
      if (!r.success) return setError(r.error.issues[0].message);
      return setStep("birth");
    }
    if (step === "birth") {
      const r = birthDateSchema.safeParse(birthDate);
      if (!r.success) return setError(r.error.issues[0].message);
      return setStep("hour");
    }
    if (step === "hour") return void loadSaju();
  }

  async function loadSaju() {
    setLoadingText("사주팔자를 세우고 있어요");
    setStep("loading");
    try {
      const res = await fetch("/api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, hour: hourSlot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaju(data.saju);
      setFortunes({});
      setStep("saju");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "사주를 계산하지 못했어요.");
      setStep("hour");
    }
  }

  async function openYear(selected: FortuneYear) {
    setError("");
    setYear(selected);
    if (fortunes[selected]) return setStep("result");
    setLoadingText(`${selected}년 운세를 보고 있어요`);
    setStep("loading");
    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthDate, hour: hourSlot, year: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFortunes((f) => ({ ...f, [selected]: data.fortune }));
      setStep("result");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "운세를 불러오지 못했어요.");
      setStep("saju");
    }
  }

  const back = BACK[step];
  const canNext =
    step === "landing" ||
    (step === "name" && name.trim().length > 0) ||
    (step === "birth" && birthDate.length > 0) ||
    step === "hour";

  const fortune = fortunes[year] ?? "";
  const [elementPart, readingPart] = splitFortune(fortune);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col bg-background px-6">
      <header className="flex h-14 items-center justify-between">
        {back && (
          <button
            type="button"
            aria-label="이전"
            onClick={() => {
              setError("");
              setStep(back);
            }}
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
        <ThemeToggle />
      </header>

      <section key={step} className={cn("flex flex-1 flex-col pt-6", FADE_IN)}>
        {step === "landing" && (
          <>
            <div className="relative aspect-[4/5] max-h-[44dvh] w-full overflow-hidden rounded-3xl bg-muted">
              <Image
                src="/cover.png"
                alt="Happy New Year 2027"
                fill
                priority
                sizes="(max-width: 600px) 100vw, 552px"
                className="object-cover"
              />
            </div>
            <h1 className="mt-8 text-[28px] leading-snug font-bold break-keep">
              새해 운세,
              <br />
              사주로 알려드려요
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              이름, 생년월일, 태어난 시간만 있으면 돼요.
            </p>
          </>
        )}

        {step === "name" && (
          <>
            <Heading>이름이 어떻게 되세요?</Heading>
            <Input
              autoFocus
              value={name}
              maxLength={20}
              placeholder="홍길동"
              aria-invalid={!!error}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canNext && next()}
              className="mt-10"
            />
            <ErrorText>{error}</ErrorText>
          </>
        )}

        {step === "birth" && (
          <>
            <Heading>생년월일을 알려주세요</Heading>
            <Input
              autoFocus
              inputMode="numeric"
              value={birthDate}
              maxLength={10}
              placeholder="1995-03-21"
              aria-invalid={!!error}
              onChange={(e) => setBirthDate(formatBirth(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && canNext && next()}
              className="mt-10"
            />
            <p className="mt-3 text-sm text-muted-foreground">양력 YYYY-MM-DD 형식으로 입력해 주세요</p>
            <ErrorText>{error}</ErrorText>
          </>
        )}

        {step === "hour" && (
          <>
            <Heading>태어난 시간을 알려주세요</Heading>
            <div className="relative mt-10">
              <select
                aria-label="태어난 시간"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="h-14 w-full appearance-none rounded-2xl border border-transparent bg-muted px-4 pr-12 text-lg text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="unknown">시간 모름</option>
                {HOUR_SLOTS.map((slot, i) => (
                  <option key={slot.label} value={i}>
                    {slot.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              한국 표준시 기준이에요. 모르면 &lsquo;시간 모름&rsquo;을 골라 주세요.
            </p>
            <ErrorText>{error}</ErrorText>
          </>
        )}

        {step === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
            <div
              aria-hidden
              className="size-10 animate-spin rounded-full border-4 border-muted border-t-primary motion-reduce:animate-none"
            />
            <h1 className="mt-8 text-2xl font-bold break-keep">{loadingText}</h1>
            <p className="mt-3 text-base text-muted-foreground">잠시만 기다려 주세요</p>
          </div>
        )}

        {step === "saju" && saju && (
          <>
            <Heading>{name}님의 사주팔자</Heading>
            <p className="mt-3 text-sm text-muted-foreground">
              만세력 기준 명식과 타고난 오행이에요.
              {!saju.hour && " 시간을 몰라 시주는 비워 뒀어요."}
            </p>
            <SajuChart saju={saju} />
            <ElementBars saju={saju} />

            <h2 className="mt-12 text-[22px] leading-snug font-bold break-keep">운세 보기</h2>
            <p className="mt-2 text-sm text-muted-foreground">보고 싶은 해를 골라 주세요.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 pb-10">
              {FORTUNE_YEARS.map((y) => (
                <Button key={y} size="lg" onClick={() => openYear(y)}>
                  {y}년
                </Button>
              ))}
            </div>
            <ErrorText>{error}</ErrorText>
          </>
        )}

        {step === "result" && (
          <>
            <div ref={cardRef} className="bg-background pb-2">
              <p className="text-lg font-semibold text-primary">사주 운세</p>
              <h1 className="mt-2 text-[28px] leading-snug font-bold break-keep">
                {name}님의 {year}년
              </h1>
              {elementPart.length > 0 && (
                <FortuneSection title="오행 분석" paragraphs={elementPart} />
              )}
              <FortuneSection title="사주풀이" paragraphs={readingPart} offset={elementPart.length} />
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="mt-6 w-full"
              disabled={saving}
              onClick={() => {
                setError("");
                saveImage();
              }}
            >
              <Download aria-hidden />
              {saving ? "만드는 중이에요" : "이미지로 저장"}
            </Button>
            <ErrorText>{error}</ErrorText>
            <p className="mt-6 text-sm text-muted-foreground">
              재미로 보는 운세예요. 중요한 결정은 신중하게 내려 주세요.
            </p>
          </>
        )}
      </section>

      {step !== "loading" && step !== "saju" && (
        <div className="sticky bottom-0 -mx-6 bg-background px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {step === "result" ? (
            <Button size="lg" className="w-full" onClick={reset}>
              다시 보기
            </Button>
          ) : (
            <Button size="lg" className="w-full" disabled={!canNext} onClick={next}>
              {step === "landing" ? "운세 보기" : step === "hour" ? "사주 보기" : "다음"}
            </Button>
          )}
        </div>
      )}
    </main>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[26px] leading-snug font-bold break-keep">{children}</h1>;
}

function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-3 text-sm text-destructive">
      {children}
    </p>
  );
}

function FortuneSection({
  title,
  paragraphs,
  offset = 0,
}: {
  title: string;
  paragraphs: string[];
  offset?: number;
}) {
  return (
    <>
      <h2 className="mt-8 text-xl font-bold break-keep">{title}</h2>
      <div className="mt-4 flex flex-col gap-3">
        {paragraphs.map((para, i) => (
          <Card
            key={i}
            className={cn(FADE_IN)}
            style={{ animationDelay: `${(offset + i) * 150}ms` }}
          >
            <p className="px-6 leading-relaxed break-keep">{para}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

// 1부(오행 분석)와 2부(사주풀이)는 "===" 한 줄로 나뉜다. 구분선이 없으면 전부 사주풀이로 본다.
function splitFortune(text: string): [string[], string[]] {
  const paras = (part: string) => part.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const parts = text.split(/\n\s*={3,}\s*\n/);
  if (parts.length >= 2) return [paras(parts[0]), paras(parts.slice(1).join("\n\n"))];
  return [[], paras(text)];
}

// 시주·일주·월주·연주 순서로, 왼쪽부터 보여 준다 (전통 명식 표기).
function SajuChart({ saju }: { saju: Saju }) {
  const cols: { label: string; pillar: Pillar | null; isDay?: boolean }[] = [
    { label: "시주", pillar: saju.hour },
    { label: "일주", pillar: saju.day, isDay: true },
    { label: "월주", pillar: saju.month },
    { label: "연주", pillar: saju.year },
  ];
  return (
    <div className="mt-8 grid grid-cols-4 gap-2">
      {cols.map(({ label, pillar, isDay }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div
            className={cn(
              "flex w-full flex-col items-center gap-3 rounded-2xl bg-muted py-4",
              isDay && "ring-2 ring-primary",
            )}
          >
            {pillar ? (
              <>
                <Glyph hanja={STEMS[pillar.stem]} ko={STEMS_KO[pillar.stem]} element={stemElement(pillar.stem)} />
                <Glyph hanja={BRANCHES[pillar.branch]} ko={BRANCHES_KO[pillar.branch]} element={branchElement(pillar.branch)} />
              </>
            ) : (
              <>
                <span className="py-5 text-2xl text-muted-foreground">?</span>
                <span className="py-5 text-2xl text-muted-foreground">?</span>
              </>
            )}
          </div>
          {isDay && <span className="text-xs font-semibold text-primary">나</span>}
        </div>
      ))}
    </div>
  );
}

function Glyph({ hanja, ko, element }: { hanja: string; ko: string; element: number }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <span className="text-3xl font-bold">{hanja}</span>
      <span className="mt-1 text-sm text-muted-foreground">
        {ko} · {ELEMENTS_KO[element]}
      </span>
    </div>
  );
}

function ElementBars({ saju }: { saju: Saju }) {
  const top = Math.max(...saju.counts);
  const max = Math.max(top, 3);
  const lacking = ELEMENTS_KO.filter((_, i) => saju.counts[i] === 0);
  const strong = ELEMENTS_KO.filter((_, i) => saju.counts[i] === top && top >= 3);
  return (
    <div className="mt-10">
      <h2 className="text-[22px] leading-snug font-bold break-keep">타고난 오행 분포</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {strong.length ? `많은 오행: ${strong.join(", ")}` : "고르게 퍼져 있어요"}
        {lacking.length ? ` · 없는 오행: ${lacking.join(", ")}` : ""}
      </p>
      <ul className="mt-5 flex flex-col gap-4">
        {ELEMENTS_KO.map((e, i) => (
          <li key={e} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-base font-semibold">
              {e} {ELEMENTS_HANJA[i]}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(saju.counts[i] / max) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-base text-muted-foreground">
              {saju.counts[i]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatBirth(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}
