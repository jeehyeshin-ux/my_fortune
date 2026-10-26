"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, Download } from "lucide-react";
import { toBlob } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import {
  FORTUNE_YEAR,
  TOPICS,
  birthDateSchema,
  nameSchema,
  type Topic,
} from "@/lib/fortune";
import { cn } from "@/lib/utils";

type Step = "landing" | "name" | "birth" | "topic" | "loading" | "result";

const BACK: Partial<Record<Step, Step>> = {
  name: "landing",
  birth: "name",
  topic: "birth",
};

const FADE_IN =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both motion-reduce:animate-none";

export function FortuneApp() {
  const [step, setStep] = useState<Step>("landing");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [error, setError] = useState("");
  const [fortune, setFortune] = useState("");
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function saveImage() {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const blob = await toBlob(cardRef.current, { pixelRatio: 2, backgroundColor: getComputedStyle(document.body).backgroundColor });
      if (!blob) throw new Error("empty image");
      const file = new File([blob], `my-fortune-${FORTUNE_YEAR}.png`, { type: "image/png" });
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
    setTopic(null);
    setError("");
    setFortune("");
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
      return setStep("topic");
    }
    if (step === "topic" && topic) return void submit(topic);
  }

  async function submit(selected: Topic) {
    setStep("loading");
    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthDate, topic: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFortune(data.fortune);
      setStep("result");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "운세를 불러오지 못했어요.");
      setStep("topic");
    }
  }

  const back = BACK[step];
  const canNext =
    step === "landing" ||
    (step === "name" && name.trim().length > 0) ||
    (step === "birth" && birthDate.length > 0) ||
    (step === "topic" && topic !== null);

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
              AI가 알려드려요
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              이름과 생년월일만 있으면 돼요.
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
            <p className="mt-3 text-sm text-muted-foreground">YYYY-MM-DD 형식으로 입력해 주세요</p>
            <ErrorText>{error}</ErrorText>
          </>
        )}

        {step === "topic" && (
          <>
            <Heading>무엇이 가장 궁금하세요?</Heading>
            <div className="mt-8 flex flex-col gap-3">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  aria-pressed={topic === t}
                  className={cn(
                    "h-14 rounded-2xl px-5 text-left text-lg font-medium transition active:scale-[0.98]",
                    topic === t ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <ErrorText>{error}</ErrorText>
          </>
        )}

        {step === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
            <div
              aria-hidden
              className="size-10 animate-spin rounded-full border-4 border-muted border-t-primary motion-reduce:animate-none"
            />
            <h1 className="mt-8 text-2xl font-bold break-keep">
              {FORTUNE_YEAR}년 운세를 보고 있어요
            </h1>
            <p className="mt-3 text-base text-muted-foreground">잠시만 기다려 주세요</p>
          </div>
        )}

        {step === "result" && (
          <>
            <div ref={cardRef} className="bg-background pb-2">
              <p className="text-lg font-semibold text-primary">{topic}</p>
              <h1 className="mt-2 text-[28px] leading-snug font-bold break-keep">
                {name}님의 {FORTUNE_YEAR}년
              </h1>
              <div className="mt-8 flex flex-col gap-3">
                {fortune.split(/\n\s*\n/).map((para, i) => (
                  <Card
                    key={i}
                    className={cn(FADE_IN)}
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <p className="px-6 leading-relaxed break-keep">{para}</p>
                  </Card>
                ))}
              </div>
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

      {step !== "loading" && (
        <div className="sticky bottom-0 -mx-6 bg-background px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {step === "result" ? (
            <Button size="lg" className="w-full" onClick={reset}>
              다시 보기
            </Button>
          ) : (
            <Button size="lg" className="w-full" disabled={!canNext} onClick={next}>
              {step === "landing" ? "운세 보기" : step === "topic" ? "결과 보기" : "다음"}
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

function formatBirth(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}
