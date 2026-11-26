import Link from "next/link";
import Nav from "@/components/Nav";
import { stripe, settled } from "@/lib/server";
import { packsOf } from "@/lib/products";
import ClearBasket from "@/components/ClearBasket";
import { SHOP } from "@/lib/order";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your download — " + SHOP, robots: { index: false, follow: false } };

export default async function Download({ params }) {
  const { sid } = await params; const s = stripe(); let packs = [];
  if (s && /^cs_[A-Za-z0-9_]+$/.test(sid)) { try { const session = await s.checkout.sessions.retrieve(sid); if (settled(session)) packs = packsOf(session.metadata); } catch { } }
  return (<><Nav />
    <div className="wrap shop" style={{ maxWidth: 720 }}>
      {!packs.length ? (<><h1>We can’t find that download yet.</h1><p>If you have just paid, wait a few seconds and refresh this page. If the link came from an email, check it was copied in full. Still stuck? Reply to your order email and we will sort it out.</p><Link className="btn" href="/shop">Back to the packs</Link></>) : (<>
        <ClearBasket />
        <h1>Thank you. {packs.length > 1 ? "Your packs are ready." : "Your pack is ready."}</h1>
        {packs.map((p) => (<div className="pack got" key={p.id}><img src={p.cover} alt={"The cover of the " + p.name} /><div className="pack-in"><h3>{p.name}</h3><p className="fine">{p.pages} pages, A4 PDF</p>
          <a className="btn big" href={p.file} download>Download the pack</a></div></div>))}
        <p className="eg" style={{ marginTop: 18 }}>Print the pages you want on A4. We have emailed you this link too, so you can come back to it.</p>
        <p className="lead" style={{ marginTop: 44 }}>Has your child had their letter from Father Christmas yet?</p><Link className="btn ghost" href="/order">Write their letter</Link></>)}
    </div></>);
}
