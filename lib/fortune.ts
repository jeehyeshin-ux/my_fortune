import { z } from "zod";

export const FORTUNE_YEARS = [2026, 2027] as const;
export type FortuneYear = (typeof FORTUNE_YEARS)[number];

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

// 태어난 시진 번호(0=자시 ~ 11=해시). null은 "시간 모름".
export const hourSchema = z.number().int().min(0).max(11).nullable();

export const yearSchema = z.union([z.literal(2026), z.literal(2027)], { error: "연도를 선택해 주세요" });

export const sajuRequestSchema = z.object({
  birthDate: birthDateSchema,
  hour: hourSchema,
});

export const fortuneRequestSchema = sajuRequestSchema.extend({
  name: nameSchema,
  year: yearSchema,
});

export type FortuneRequest = z.infer<typeof fortuneRequestSchema>;
