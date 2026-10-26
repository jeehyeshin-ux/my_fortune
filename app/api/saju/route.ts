import { sajuRequestSchema } from "@/lib/fortune";
import { computeSaju } from "@/lib/saju";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const parsed = sajuRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력을 확인해 주세요." },
      { status: 400 },
    );
  }
  return Response.json({ saju: computeSaju(parsed.data.birthDate, parsed.data.hour) });
}
