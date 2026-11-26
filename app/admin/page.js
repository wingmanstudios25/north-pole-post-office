import { isAdmin } from "@/lib/admin";
import { stripe, settled } from "@/lib/server";
import { fromMetadata, TIERS, SHOP } from "@/lib/order";
import { product } from "@/lib/products";
import AdminOrders from "@/components/AdminOrders";
export const dynamic = "force-dynamic";
export const metadata = { title: "Orders — " + SHOP, robots: { index: false, follow: false } };

export default async function Admin({ searchParams }) {
  const q = await searchParams;
  if (!process.env.ADMIN_PASSWORD) return <div className="wrap admin"><h1>Orders</h1><p>This page is switched off. To switch it on, add a setting called ADMIN_PASSWORD in Vercel, with a password of your choice, then redeploy.</p></div>;
  if (!(await isAdmin())) return (
    <div className="wrap admin" style={{ maxWidth: 440 }}><h1>Orders</h1>
      <form method="post" action="/api/admin/login" className="field"><label htmlFor="pw">Password</label><input id="pw" name="password" type="password" autoComplete="current-password" required />
        {q.wrong && <p className="err" role="alert">That password is not right. Check it against ADMIN_PASSWORD in Vercel.</p>}
        <button className="btn" style={{ marginTop: 14 }}>Sign in</button></form></div>);
  const s = stripe();
  if (!s) return <div className="wrap admin"><h1>Orders</h1><p>Stripe is not connected yet, so there are no orders to show.</p></div>;
  let orders = [], more = false, problem = "";
  try {
    const page = await s.checkout.sessions.list({ limit: 100, status: "complete", ...(q.after ? { starting_after: String(q.after) } : {}), ...(q.email ? { customer_details: { email: String(q.email).trim() } } : {}) });
    more = page.has_more;
    orders = page.data.filter(settled).map((x) => { const o = fromMetadata(x.metadata); const pk = x.metadata?.type === "pack" ? product(x.metadata.id) : null; if (pk) return { sid: x.id, when: x.created * 1000, email: x.customer_details?.email || "", amount: x.amount_total, test: !x.livemode, tier: "Pack", children: [{ name: pk.name, town: "Download" }], pack: true }; return { sid: x.id, when: x.created * 1000, email: x.customer_details?.email || "", amount: x.amount_total, test: !x.livemode, tier: o ? TIERS[o.tier].name : "Unknown", children: o ? o.children.map((c) => ({ name: c.name, town: c.town })) : [], letters: o ? o.letters.length : 0 }; });
  } catch (e) { console.error(e); problem = "Stripe did not answer. Refresh the page to try again."; }
  return <AdminOrders orders={orders} more={more} last={orders.at(-1)?.sid || ""} email={q.email ? String(q.email) : ""} problem={problem} />;
}
