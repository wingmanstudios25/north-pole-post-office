import { NextResponse, after } from "next/server";
import { stripe, siteUrl } from "@/lib/server";
import { SHOP, BUSINESS, CONTACT, fromMetadata } from "@/lib/order";
import { getOrMakeVoice } from "@/lib/voice";
import { orderEmail } from "@/lib/email";
export const maxDuration = 300;

// Runs when Stripe confirms a payment: starts the voice recordings, and emails the customer their private link.
export async function POST(req) {
  const s = stripe(), secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ ok: false }, { status: 503 });
  let event; try { event = s.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature"), secret); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object, order = fromMetadata(session.metadata), to = session.customer_details?.email;
    if (order?.voice) after(() => Promise.allSettled(order.children.flatMap((_, c) => order.letters.map((k) => getOrMakeVoice(order, c, k)))));
    const from = process.env.EMAIL_FROM || "hello@envisageagency.co.uk";
    if (order && to && process.env.BREVO_API_KEY) {
      const mail = orderEmail(order, `${siteUrl()}/letter/${session.id}`, siteUrl());
      const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ sender: { email: from, name: SHOP }, replyTo: { email: CONTACT }, to: [{ email: to }], subject: mail.subject, htmlContent: mail.html, textContent: mail.text }) }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
      if (!r.ok) console.error("brevo", r.status, await r.text());
    }
  }
  return NextResponse.json({ ok: true });
}
