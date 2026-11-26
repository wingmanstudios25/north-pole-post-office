import { NextResponse } from "next/server";
import { stripe } from "@/lib/server";
import { product } from "@/lib/products";
import { SHOP } from "@/lib/order";

// Starts the payment for one shop download.
export async function POST(req) {
  const form = await req.formData(); const p = product(String(form.get("id") || "")); const origin = new URL(req.url).origin;
  const back = (msg) => NextResponse.redirect(`${origin}/shop?problem=${encodeURIComponent(msg)}`, 303);
  if (!p) return back("That pack could not be found.");
  const s = stripe(); if (!s) return back("Payments are not switched on yet. Nothing has been charged.");
  try {
    const session = await s.checkout.sessions.create({
      mode: "payment", allow_promotion_codes: true, metadata: { type: "pack", id: p.id },
      line_items: [{ quantity: 1, price_data: { currency: "gbp", unit_amount: p.price, product_data: { name: p.name } } }],
      success_url: origin + "/download/{CHECKOUT_SESSION_ID}", cancel_url: origin + "/shop",
      custom_text: { submit: { message: `Your download from ${SHOP} opens straight after payment, and we email you the link. By paying you ask for immediate delivery and understand the 14-day right to cancel then ends.` } },
    });
    return NextResponse.redirect(session.url, 303);
  } catch (e) { console.error(e); return back("The payment page could not be opened. Nothing has been charged; please try again."); }
}
