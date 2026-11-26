"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { readBasket, addToBasket } from "@/lib/basket";

const gbp = (p) => "£" + (p / 100).toFixed(2);

// The packs, each sold from its front cover: look inside, add to the basket, or buy straight away.
export default function Packs() {
  const [open, setOpen] = useState(null);
  const [basket, setBasket] = useState([]);
  useEffect(() => { const sync = () => setBasket(readBasket()); sync(); addEventListener("npo-basket", sync); addEventListener("storage", sync); return () => { removeEventListener("npo-basket", sync); removeEventListener("storage", sync); }; }, []);
  useEffect(() => { if (!open) return; const k = (e) => e.key === "Escape" && setOpen(null); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [open]);
  const actions = (p) => (
    <div className="pack-acts">
      {basket.includes(p.id) ? <Link className="btn ghost" href="/basket">In your basket. View basket</Link> : <button type="button" className="btn ghost" onClick={() => addToBasket(p.id)}>Add to basket</button>}
      <form method="post" action="/api/buy"><input type="hidden" name="ids" value={p.id} /><button className="btn">Buy now for {gbp(p.price)}</button></form>
    </div>);
  return (
    <>
      <div className="packs">
        {PRODUCTS.map((p) => (
          <div className="pack" key={p.id}>
            <button type="button" className="pack-cover" onClick={() => setOpen(p)} aria-label={"See what is inside the " + p.name}><img src={p.cover} alt={"The front cover of the " + p.name} /><span>See what’s inside</span></button>
            <div className="pack-in"><h3>{p.name}</h3><p>{p.blurb}</p><p className="fine">{p.pages} pages to print on A4. Download straight after payment.</p><div className="pack-price">{gbp(p.price)}</div>{actions(p)}</div>
          </div>))}
      </div>
      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={"What is inside the " + open.name} onClick={() => setOpen(null)}>
          <div className="inside" onClick={(e) => e.stopPropagation()}>
            <div className="inside-top"><h2>What’s inside the {open.name}</h2><button className="btn ghost small" onClick={() => setOpen(null)}>Close</button></div>
            <div className="inside-grid">
              <img className="inside-cover" src={open.cover} alt="" />
              <div><ul>{open.inside.map((x) => <li key={x}>{x}</li>)}</ul><p className="fine">{open.pages} pages, A4 PDF. Print it as many times as you like for your own family.</p><div className="pack-price">{gbp(open.price)}</div>{actions(open)}</div>
            </div>
            <div className="peek">{open.peek.map((src, i) => <img key={src} src={src} alt={"A page from the pack, number " + (i + 1) + " of " + open.peek.length} />)}</div>
            <p className="fine centre">A few of the {open.pages} pages.</p>
          </div>
        </div>)}
    </>
  );
}
