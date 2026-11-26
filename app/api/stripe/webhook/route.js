import { NextResponse, after } from "next/server";
import { stripe, siteUrl } from "@/lib/server";
import { SHOP, BUSINESS, CONTACT, fromMetadata } from "@/lib/order";
import { getOrMakeVoice } from "@/lib/voice";
import { sendOrderEmail, sendPackEmail } from "@/lib/email";
import { product } from "@/lib/products";
export const maxDuration = 300;

// Runs when Stripe confirms a payment: starts the voice recordings, and emails the customer their private link.
export async function POST(req) {
  const s = stripe(), secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ ok: false }, { status: 503 });
  let event; try { event = s.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature"), secret); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object, order = fromMetadata(session.metadata), to = session.customer_details?.email;
    const pack = session.metadata?.type === "pack" ? product(session.metadata.id) : null;
    if (pack && to) await sendPackEmail(pack, session.id, to, siteUrl());
    if (order?.voice) after(() => Promise.allSettled(order.children.flatMap((_, c) => order.letters.map((k) => getOrMakeVoice(order, c, k)))));
    if (order && to) await sendOrderEmail(order, session.id, to, siteUrl());
  }
  return NextResponse.json({ ok: true });
}
