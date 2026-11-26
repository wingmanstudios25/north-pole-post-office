import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { stripe, siteUrl, settled } from "@/lib/server";
import { fromMetadata } from "@/lib/order";
import { sendOrderEmail, sendPackEmail } from "@/lib/email";
import { packsOf } from "@/lib/products";
export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, reason: "Please sign in again." }, { status: 401 });
  const { sid, to } = await req.json().catch(() => ({}));
  const s = stripe(); if (!s || !/^cs_[A-Za-z0-9_]+$/.test(sid || "")) return NextResponse.json({ ok: false, reason: "Order not found." }, { status: 404 });
  try {
    const session = await s.checkout.sessions.retrieve(sid); const order = fromMetadata(session.metadata);
    const email0 = (typeof to === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) ? to : session.customer_details?.email;
    const pk = packsOf(session.metadata);
    if (pk.length && settled(session)) { const out = await sendPackEmail(pk, sid, email0, siteUrl()); return NextResponse.json({ ...out, to: email0 }, { status: out.ok ? 200 : 502 }); }
    if (!order || !settled(session)) return NextResponse.json({ ok: false, reason: "That order has not been paid." }, { status: 400 });
    const email = (typeof to === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) ? to : session.customer_details?.email;
    const out = await sendOrderEmail(order, sid, email, siteUrl());
    return NextResponse.json({ ...out, to: email }, { status: out.ok ? 200 : 502 });
  } catch (e) { console.error(e); return NextResponse.json({ ok: false, reason: "Stripe could not find that order." }, { status: 404 }); }
}
