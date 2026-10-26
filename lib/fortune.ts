import { z } from "zod";

export const FORTUNE_YEAR = 2027;

export const TOPICS = [
  "커리어/진로",
  "재물/금전운",
  "연애/인간관계",
  "건강",
  "학업/성장",
  "종합운세",
] as const;

export type Topic = (typeof TOPICS)[number];

export function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const exists =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d;
  return exists && y >= 1900 && date.getTime() <= Date.now();
}

export const nameSchema = z
  .string()
  .trim()
  .min(1, "이름을 입력해 주세요")
  .max(20, "이름은 20자까지 입력할 수 있어요");

export const birthDateSchema = z
  .string()
  .refine(isValidBirthDate, "YYYY-MM-DD 형식의 올바른 생년월일을 입력해 주세요");

export const topicSchema = z.enum(TOPICS, { error: "주제를 선택해 주세요" });

export const fortuneRequestSchema = z.object({
  name: nameSchema,
  birthDate: birthDateSchema,
  topic: topicSchema,
});

export type FortuneRequest = z.infer<typeof fortuneRequestSchema>;
