"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { PRODUCTS } from "@/lib/products";
import { readBasket, removeFromBasket } from "@/lib/basket";

const gbp = (p) => "£" + (p / 100).toFixed(2);
export default function Basket() {
  const [ids, setIds] = useState(null);
  useEffect(() => { const sync = () => setIds(readBasket()); sync(); addEventListener("npo-basket", sync); return () => removeEventListener("npo-basket", sync); }, []);
  const items = (ids || []).map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean), total = items.reduce((a, p) => a + p.price, 0);
  return (<><Nav />
    <div className="wrap shop" style={{ maxWidth: 760 }}>
      <h1>Your basket</h1>
      {ids === null ? null : items.length === 0 ? (<><p className="lead">Your basket is empty.</p><Link className="btn" href="/shop">See the Christmas packs</Link></>) : (<>
        <div className="basket">
          {items.map((p) => (<div className="basket-row" key={p.id}><img src={p.cover} alt="" /><div><b>{p.name}</b><span className="eg">{p.pages} pages, A4 PDF download</span></div><span className="basket-price">{gbp(p.price)}</span><button className="btn ghost small" onClick={() => removeFromBasket(p.id)}>Remove</button></div>))}
        </div>
        <div className="total"><span>Total</span><span>{gbp(total)}</span></div>
        <form method="post" action="/api/buy"><input type="hidden" name="ids" value={items.map((p) => p.id).join(",")} /><button className="btn big">Pay {gbp(total)} and download</button></form>
        <p className="eg">You pay on Stripe’s secure page. Your downloads open as soon as you have paid, and we email you the link.</p>
        <p style={{ marginTop: 26 }}><Link href="/shop">Keep looking</Link></p></>)}
    </div></>);
}
