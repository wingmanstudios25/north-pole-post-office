import { NextResponse, after } from "next/server";
import { stripe, siteUrl } from "@/lib/server";
import { SHOP, BUSINESS, CONTACT, fromMetadata } from "@/lib/order";
import { getOrMakeVoice } from "@/lib/voice";
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
      const link = `${siteUrl()}/letter/${session.id}`, names = order.children.map((c) => c.name).join(" and ");
      await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ sender: { email: from, name: SHOP }, replyTo: { email: CONTACT }, to: [{ email: to }], subject: `The letter for ${names} has arrived from the North Pole`,
          htmlContent: `<div style="font-family:Georgia,serif;font-size:17px;line-height:1.55;color:#2a211a;max-width:560px"><p>Thank you for your order.</p><p>The letter for ${names} is ready. Open it here, and keep this link private:</p><p><a href="${link}" style="background:#8a1f1f;color:#fff;padding:12px 20px;text-decoration:none">Open the letter</a></p><p>On that page you can watch the envelope open, hear the reading if your order includes it, and download the PDF and image to print.</p><p>Tip: open it on your own first, so you know what to expect on the day.</p><p>If anything in the letter is not right, reply to this email and we will put it right.</p><p>With warm wishes,<br>${SHOP}</p><p style="font-size:12px;color:#777">${SHOP} is operated by ${BUSINESS}. Contact: ${CONTACT}</p></div>` }) }).catch((e) => console.error(e));
    }
  }
  return NextResponse.json({ ok: true });
}
