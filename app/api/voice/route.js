import { NextResponse } from "next/server";
import { getOrder } from "@/lib/server";
import { getOrMakeVoice } from "@/lib/voice";
export const maxDuration = 60;

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const order = await getOrder(q.get("sid") || "");
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const k = order.letters.includes(q.get("k")) ? q.get("k") : order.letters[0];
  const out = await getOrMakeVoice(order, parseInt(q.get("c")) || 0, k);
  return NextResponse.json(out, { status: out.error ? out.status : 200 });
}
