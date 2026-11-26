import { NextResponse } from "next/server";
import { stripe, siteUrl } from "@/lib/server";
import { SHOP, fromMetadata } from "@/lib/order";

// Optional: emails the customer their private link after payment (needs STRIPE_WEBHOOK_SECRET and BREVO_API_KEY).
export async function POST(req) {
  const s = stripe(), secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ ok: false }, { status: 503 });
  let event; try { event = s.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature"), secret); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (event.type === "checkout.session.completed" && process.env.BREVO_API_KEY && process.env.EMAIL_FROM) {
    const session = event.data.object, order = fromMetadata(session.metadata), to = session.customer_details?.email;
    if (order && to) {
      const link = `${siteUrl()}/letter/${session.id}`, names = order.children.map((c) => c.name).join(" and ");
      await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ sender: { email: process.env.EMAIL_FROM, name: SHOP }, to: [{ email: to }], subject: `The letter for ${names} has arrived from the North Pole`,
          htmlContent: `<div style="font-family:Georgia,serif;font-size:17px;line-height:1.55;color:#2a211a;max-width:560px"><p>Thank you for your order.</p><p>The letter for ${names} is ready. Open it here, and keep this link private:</p><p><a href="${link}" style="background:#8a1f1f;color:#fff;padding:12px 20px;text-decoration:none">Open the letter</a></p><p>On that page you can watch the envelope open, hear the reading if your order includes it, and download the PDF and image to print.</p><p>Tip: open it on your own first, so you know what to expect on the day.</p><p>With warm wishes,<br>${SHOP}</p></div>` }) }).catch((e) => console.error(e));
    }
  }
  return NextResponse.json({ ok: true });
}
