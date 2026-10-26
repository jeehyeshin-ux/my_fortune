import { Solar } from "lunar-javascript";
import {
  BRANCHES,
  BRANCHES_KO,
  ELEMENTS_KO,
  HOUR_SLOTS,
  STEMS,
  STEMS_KO,
  branchElement,
  pillarHanja,
  pillarKo,
  stemElement,
  type Pillar,
  type Saju,
} from "@/lib/saju-data";

const parse = (gz: string): Pillar => ({
  stem: STEMS.indexOf(gz[0]),
  branch: BRANCHES.indexOf(gz[1]),
});

// lunar-javascript의 절기 시각은 중국 표준시(UTC+8) 기준이라 한국 표준시(UTC+9)에서 1시간을 뺀다.
function beijingParts(y: number, m: number, d: number, hh: number, mm: number) {
  const t = new Date(Date.UTC(y, m - 1, d, hh - 1, mm));
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes()] as const;
}

export function computeSaju(birthDate: string, hourSlot: number | null): Saju {
  const [y, m, d] = birthDate.split("-").map(Number);
  const slot = hourSlot === null ? null : HOUR_SLOTS[hourSlot];
  const hh = slot ? slot.repHour : 12;
  const mm = slot ? slot.repMin : 0;

  // 연주·월주는 입춘·절기 시각이 기준이라 출생 시각을 반영한다.
  const [by, bm, bd, bh, bmin] = beijingParts(y, m, d, hh, mm);
  const eight = Solar.fromYmdHms(by, bm, bd, bh, bmin, 0).getLunar().getEightChar();
  const year = parse(eight.getYear());
  const month = parse(eight.getMonth());

  // 일주는 출생일(자정 기준)의 일진이다.
  const day = parse(Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar().getDayInGanZhi());

  // 시주: 시지는 선택한 시진, 시간은 일간에서 오서둔법(五鼠遁)으로 정한다.
  const hour: Pillar | null =
    hourSlot === null ? null : { stem: ((day.stem % 5) * 2 + hourSlot) % 10, branch: hourSlot };

  const counts: Saju["counts"] = [0, 0, 0, 0, 0];
  for (const p of [year, month, day, hour]) {
    if (!p) continue;
    counts[stemElement(p.stem)]++;
    counts[branchElement(p.branch)]++;
  }
  return { year, month, day, hour, counts };
}

// 십성: 일간 기준 상대 글자와의 오행 생극·음양 관계
const TEN_GODS = [
  ["비견", "겁재"],
  ["식신", "상관"],
  ["편재", "정재"],
  ["편관", "정관"],
  ["편인", "정인"],
] as const;

function tenGod(dayStem: number, element: number, yang: boolean): string {
  const rel = (element - stemElement(dayStem) + 5) % 5;
  const same = yang === (dayStem % 2 === 0);
  return TEN_GODS[rel][same ? 0 : 1];
}

// 지지 본기(지장간 중 가장 중심이 되는 천간)
const MAIN_STEM = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];

const STEM_COMBINE: Record<number, number> = { 0: 5, 1: 6, 2: 7, 3: 8, 4: 9, 5: 0, 6: 1, 7: 2, 8: 3, 9: 4 };
const STEM_CLASH: Record<number, number> = { 0: 6, 1: 7, 2: 8, 3: 9, 6: 0, 7: 1, 8: 2, 9: 3 };
const BRANCH_COMBINE: Record<number, number> = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
const clash = (a: number, b: number) => (a - b + 12) % 12 === 6;

const PILLAR_NAMES = ["연주", "월주", "일주", "시주"];

export type YearFacts = { year: number; text: string };

// 해당 연도(세운) 간지를 명식과 비교한 사실들을 모델 프롬프트용 텍스트로 만든다.
export function computeYearFacts(saju: Saju, year: number): YearFacts {
  const yp: Pillar = { stem: (year - 4) % 10, branch: (year - 4) % 12 };
  const dm = saju.day.stem;
  const dmEl = stemElement(dm);

  const ys = tenGod(dm, stemElement(yp.stem), yp.stem % 2 === 0);
  const mainStem = MAIN_STEM[yp.branch];
  const yb = tenGod(dm, stemElement(mainStem), mainStem % 2 === 0);

  const natal = [saju.year, saju.month, saju.day, saju.hour];
  const relations: string[] = [];
  natal.forEach((p, i) => {
    if (!p) return;
    const name = PILLAR_NAMES[i];
    if (STEM_COMBINE[yp.stem] === p.stem) relations.push(`세운 천간 ${STEMS_KO[yp.stem]}과 ${name} 천간 ${STEMS_KO[p.stem]}의 합`);
    if (STEM_CLASH[yp.stem] === p.stem) relations.push(`세운 천간 ${STEMS_KO[yp.stem]}과 ${name} 천간 ${STEMS_KO[p.stem]}의 충`);
    if (BRANCH_COMBINE[yp.branch] === p.branch) relations.push(`세운 지지 ${BRANCHES_KO[yp.branch]}과 ${name} 지지 ${BRANCHES_KO[p.branch]}의 육합`);
    if (clash(yp.branch, p.branch)) relations.push(`세운 지지 ${BRANCHES_KO[yp.branch]}과 ${name} 지지 ${BRANCHES_KO[p.branch]}의 충`);
  });

  const counts = [...saju.counts];
  counts[stemElement(yp.stem)]++;
  counts[branchElement(yp.branch)]++;
  const lacking = ELEMENTS_KO.filter((_, i) => saju.counts[i] === 0);
  const strong = ELEMENTS_KO.filter((_, i) => saju.counts[i] >= 3);

  const pillars = natal
    .map((p, i) => (p ? `${PILLAR_NAMES[i]} ${pillarKo(p)}(${pillarHanja(p)})` : `${PILLAR_NAMES[i]} 모름`))
    .join(", ");

  const text = [
    `사주 명식: ${pillars}`,
    `일간(나): ${STEMS_KO[dm]}(${STEMS[dm]}) ${ELEMENTS_KO[dmEl]} ${dm % 2 === 0 ? "양" : "음"}`,
    `타고난 오행 분포(천간·지지 ${saju.hour ? 8 : 6}글자): ${ELEMENTS_KO.map((e, i) => `${e} ${saju.counts[i]}`).join(", ")}`,
    `부족한 오행: ${lacking.length ? lacking.join(", ") : "없음"} / 많은 오행(3개 이상): ${strong.length ? strong.join(", ") : "없음"}`,
    `${year}년 세운: ${pillarKo(yp)}(${pillarHanja(yp)}), 천간 ${ELEMENTS_KO[stemElement(yp.stem)]}·지지 ${ELEMENTS_KO[branchElement(yp.branch)]}`,
    `일간 기준 세운 십성: 천간 ${ys}, 지지 본기 ${yb}`,
    `세운을 더한 오행 분포: ${ELEMENTS_KO.map((e, i) => `${e} ${counts[i]}`).join(", ")}`,
    `세운과 명식의 관계: ${relations.length ? relations.join("; ") : "뚜렷한 합·충 없음"}`,
  ].join("\n");

  return { year, text };
}
