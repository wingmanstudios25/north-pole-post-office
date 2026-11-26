import Link from "next/link";
import Nav from "@/components/Nav";
import { stripe, settled } from "@/lib/server";
import { product } from "@/lib/products";
import { SHOP } from "@/lib/order";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your download — " + SHOP, robots: { index: false, follow: false } };

export default async function Download({ params }) {
  const { sid } = await params; const s = stripe(); let p = null;
  if (s && /^cs_[A-Za-z0-9_]+$/.test(sid)) { try { const session = await s.checkout.sessions.retrieve(sid); if (settled(session) && session.metadata?.type === "pack") p = product(session.metadata.id); } catch { } }
  return (<><Nav />
    <div className="wrap shop" style={{ maxWidth: 720 }}>
      {!p ? (<><h1>We can’t find that download yet.</h1><p>If you have just paid, wait a few seconds and refresh this page. If the link came from an email, check it was copied in full. Still stuck? Reply to your order email and we will sort it out.</p><Link className="btn" href="/shop">Back to the packs</Link></>) : (<>
        <h1>Thank you. Your pack is ready.</h1>
        <div className="pack got"><img src={p.cover} alt={"The cover of " + p.name} /><div className="pack-in"><h2>{p.name}</h2><p className="fine">{p.pages} pages, A4 PDF</p>
          <a className="btn big" href={p.file} download>Download the pack</a>
          <p className="eg">Print the pages you want on A4. We have emailed you this link too, so you can come back to it.</p></div></div>
        <p className="lead" style={{ marginTop: 44 }}>Has your child had their letter from Father Christmas yet?</p><Link className="btn ghost" href="/order">Write their letter</Link></>)}
    </div></>);
}
