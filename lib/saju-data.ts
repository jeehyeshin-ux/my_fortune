export const STEMS = "甲乙丙丁戊己庚辛壬癸";
export const STEMS_KO = "갑을병정무기경신임계";
export const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
export const BRANCHES_KO = "자축인묘진사오미신유술해";

export const ELEMENTS_KO = ["목", "화", "토", "금", "수"] as const;
export const ELEMENTS_HANJA = ["木", "火", "土", "金", "水"] as const;

// 지지 오행: 子水 丑土 寅木 卯木 辰土 巳火 午火 未土 申金 酉金 戌土 亥水
export const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

export const stemElement = (stem: number) => Math.floor(stem / 2);
export const branchElement = (branch: number) => BRANCH_ELEMENT[branch];

export type Pillar = { stem: number; branch: number };

export type Saju = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  // 목·화·토·금·수 순서, 천간+지지 글자 수 (시간 모름이면 6글자)
  counts: [number, number, number, number, number];
};

// 한국 표준시 기준. 동경 127.5도(한반도 중앙)와 표준시(135도)의 약 30분 차이를 반영해
// 시진을 23:30부터 2시간 단위로 나눈다.
export const HOUR_SLOTS = [
  { label: "자시 (23:30~01:29)", range: "23:30~01:29", repHour: 0, repMin: 30 },
  { label: "축시 (01:30~03:29)", range: "01:30~03:29", repHour: 2, repMin: 30 },
  { label: "인시 (03:30~05:29)", range: "03:30~05:29", repHour: 4, repMin: 30 },
  { label: "묘시 (05:30~07:29)", range: "05:30~07:29", repHour: 6, repMin: 30 },
  { label: "진시 (07:30~09:29)", range: "07:30~09:29", repHour: 8, repMin: 30 },
  { label: "사시 (09:30~11:29)", range: "09:30~11:29", repHour: 10, repMin: 30 },
  { label: "오시 (11:30~13:29)", range: "11:30~13:29", repHour: 12, repMin: 30 },
  { label: "미시 (13:30~15:29)", range: "13:30~15:29", repHour: 14, repMin: 30 },
  { label: "신시 (15:30~17:29)", range: "15:30~17:29", repHour: 16, repMin: 30 },
  { label: "유시 (17:30~19:29)", range: "17:30~19:29", repHour: 18, repMin: 30 },
  { label: "술시 (19:30~21:29)", range: "19:30~21:29", repHour: 20, repMin: 30 },
  { label: "해시 (21:30~23:29)", range: "21:30~23:29", repHour: 22, repMin: 30 },
] as const;

export const pillarKo = (p: Pillar) => `${STEMS_KO[p.stem]}${BRANCHES_KO[p.branch]}`;
export const pillarHanja = (p: Pillar) => `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
