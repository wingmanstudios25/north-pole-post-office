import Stripe from "stripe";
import { fromMetadata, SAMPLE } from "./order";

export const stripe = () => (process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null);
// An order counts once Stripe has completed it: paid, or free because a 100%-off code was used.
export const settled = (session) => session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000")).replace(/\/$/, "");

// Returns the paid order for a letter link, or null. "sample" is a demonstration letter, only available when DEMO_LETTER=1.
export async function getOrder(sid) {
  if (sid === "sample") return process.env.DEMO_LETTER !== "1" ? null : { tier: "full", kind: "classic", year: new Date().getFullYear(), children: [SAMPLE], letters: ["classic", "eve"], voice: true, sample: true };
  const s = stripe();
  if (!s || !/^cs_[A-Za-z0-9_]+$/.test(sid)) return null;
  try {
    const session = await s.checkout.sessions.retrieve(sid);
    if (!settled(session)) return null;
    const order = fromMetadata(session.metadata);
    if (order) order.email = session.customer_details?.email || "";
    return order;
  } catch { return null; }
}
