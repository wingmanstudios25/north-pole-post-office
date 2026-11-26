"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SHOP } from "@/lib/order";
import { PRODUCTS } from "@/lib/products";

// The shop's top bar: crest, the way around the page, a sleeps-until-Christmas count and the order button.
export default function Nav({ cta = true, links = true }) {
  const [sleeps, setSleeps] = useState(null);
  useEffect(() => { const n = new Date(); let x = new Date(n.getFullYear(), 11, 25); if (n > new Date(n.getFullYear(), 11, 25, 23, 59)) x = new Date(n.getFullYear() + 1, 11, 25); setSleeps(Math.max(0, Math.ceil((x - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5))); }, []);
  return (
    <nav className="nav" aria-label="Main">
      <div className="wrap nav-in">
        <Link className="nav-brand" href="/"><img src="/art/crest.png" alt="" /><span>{SHOP}</span></Link>
        {links && <div className="nav-links"><a href="/#arrives">What arrives</a><a href="/#reading">The reading</a><a href="/#prices">Prices</a><a href="/#questions">Questions</a>{PRODUCTS.length > 0 && <a href="/shop">Christmas packs</a>}</div>}
        <div className="nav-right">
          {sleeps !== null && <span className="sleeps">{sleeps === 0 ? "Merry Christmas" : sleeps === 1 ? "1 sleep until Christmas" : `${sleeps} sleeps until Christmas`}</span>}
          {cta && <Link className="btn nav-cta" href="/order">Order a letter</Link>}
        </div>
      </div>
      <div className="nav-snow" aria-hidden="true" />
    </nav>
  );
}
