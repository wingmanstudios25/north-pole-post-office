import { NextResponse } from "next/server";
import { stripe } from "@/lib/server";
import { TIERS, EXTRA_CHILD, MAX_CHILDREN, SHOP, cleanChild, childErrors, toMetadata } from "@/lib/order";

export async function POST(req) {
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: "We could not read the order. Please try again." }, { status: 400 }); }
  const tier = TIERS[body.tier] ? body.tier : null;
  const children = Array.isArray(body.children) ? body.children.slice(0, MAX_CHILDREN).map(cleanChild) : [];
  if (!tier || !children.length || children.some((c) => childErrors(c).length)) return NextResponse.json({ error: "Some details are missing. Please check each child’s fields and try again." }, { status: 400 });
  const s = stripe();
  if (!s) return NextResponse.json({ error: "Payments are not switched on yet. Nothing has been charged." }, { status: 503 });
  const origin = new URL(req.url).origin;
  const order = { tier, kind: body.kind === "eve" ? "eve" : "classic", year: new Date().getFullYear(), children };
  const item = (name, amount, quantity = 1) => ({ quantity, price_data: { currency: "gbp", unit_amount: amount, product_data: { name } } });
  const line_items = [item(TIERS[tier].name + " — for " + children[0].name, TIERS[tier].price)];
  if (children.length > 1) line_items.push(item("Extra child’s letter", EXTRA_CHILD, children.length - 1));
  try {
    const session = await s.checkout.sessions.create({
      mode: "payment", line_items, metadata: toMetadata(order), allow_promotion_codes: true,
      success_url: origin + "/letter/{CHECKOUT_SESSION_ID}", cancel_url: origin + "/order?tier=" + tier,
      custom_text: { submit: { message: "Your letter from " + SHOP + " opens straight after payment, and we email you the link." } },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) { console.error(e); return NextResponse.json({ error: "The payment page could not be opened. Nothing has been charged; please try again." }, { status: 502 }); }
}
