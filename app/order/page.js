"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Envelope from "@/components/Envelope";
import Nav from "@/components/Nav";
import { SHOP, TIERS, FIELDS, LETTERS, EXTRA_CHILD, MAX_CHILDREN, priceFor, cleanChild, childErrors } from "@/lib/order";

const gbp = (p) => "£" + (p / 100).toFixed(2);
const blank = () => Object.fromEntries(FIELDS.map((f) => [f.key, ""]));

export default function Order() {
  const [tier, setTier] = useState("read");
  const [kind, setKind] = useState("classic");
  const [children, setChildren] = useState([blank()]);
  const [active, setActive] = useState(0);
  const [ok, setOk] = useState(false);
  const [now, setNow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const q = new URLSearchParams(location.search); if (TIERS[q.get("tier")]) setTier(q.get("tier")); const n = (q.get("name") || "").slice(0, 24); if (n) setChildren([{ ...blank(), name: n }]); }, []);
  const set = (k, v) => setChildren((cs) => cs.map((c, i) => (i === active ? { ...c, [k]: v } : c)));
  const child = children[active];

  async function pay() {
    setError("");
    const cleaned = children.map(cleanChild);
    const bad = cleaned.findIndex((c) => childErrors(c).length);
    if (bad >= 0) { setActive(bad); setError("Still needed for " + (cleaned[bad].name || "child " + (bad + 1)) + ": " + childErrors(cleaned[bad]).join(", ").toLowerCase() + "."); return; }
    if (!ok) { setError("Please tick the box to confirm you are the child’s parent or guardian."); return; }
    if (!now) { setError("Please tick the box to confirm you would like the letter delivered straight away."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tier, kind, children: cleaned }) });
      const j = await r.json();
      if (j.url) location.href = j.url; else { setError(j.error || "Something went wrong starting the payment. Nothing has been charged; please try again."); setBusy(false); }
    } catch { setError("We could not reach the payment page. Nothing has been charged; please check your connection and try again."); setBusy(false); }
  }

  return (
    <><Nav cta={false} />
    <div className="wrap">
      <div className="order2">
        <form onSubmit={(e) => { e.preventDefault(); pay(); }}>
          <h1>Write their letter</h1>
          <p className="lead">Three short steps. It takes about three minutes.</p>

          <section className="step"><h2><span className="num">1</span>Choose the letter</h2>
            {Object.entries(TIERS).map(([k, t]) => (
              <label className={"opt" + (tier === k ? " on" : "")} key={k}>
                <input type="radio" name="tier" checked={tier === k} onChange={() => setTier(k)} />
                <div><b>{t.name}</b><span>{t.blurb}</span></div><em>{gbp(t.price)}</em>
              </label>))}
            {TIERS[tier].choose && (<div className="field"><label htmlFor="kind">Which letter would you like?</label>
              <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(LETTERS).map(([k, l]) => <option key={k} value={k}>{l.title}</option>)}</select>
              <p className="eg">{kind === "eve" ? "Written as if left by the tree on Christmas Eve night." : "Written from his study at the start of December."}</p></div>)}
          </section>

          <section className="step"><h2><span className="num">2</span>Tell us about your child</h2>
            <p className="eg">Father Christmas will use these words exactly as you type them, so please check the spelling.</p>
            <div className="tabs">
              {children.map((c, i) => <button type="button" key={i} className={i === active ? "on" : ""} onClick={() => setActive(i)}>{c.name || "Child " + (i + 1)}</button>)}
              {children.length < MAX_CHILDREN && <button type="button" onClick={() => { setChildren((cs) => [...cs, blank()]); setActive(children.length); }}>Add another child ({gbp(EXTRA_CHILD)})</button>}
              {children.length > 1 && <button type="button" onClick={() => { setChildren((cs) => cs.filter((_, i) => i !== active)); setActive(0); }}>Remove this child</button>}
            </div>
            {FIELDS.map((f) => { const len = child[f.key].length, near = len >= f.max * 0.9; return (
              <div className="field" key={f.key}>
                <label htmlFor={f.key}>{f.label}{!f.required && !/optional/.test(f.label) ? " (optional)" : ""}</label>
                {f.hint && <p className="says">{f.hint}</p>}
                {f.area ? <textarea id={f.key} maxLength={f.max} value={child[f.key]} onChange={(e) => set(f.key, e.target.value)} aria-describedby={f.key + "-c"} />
                  : <input id={f.key} type="text" maxLength={f.max} value={child[f.key]} onChange={(e) => set(f.key, e.target.value)} aria-describedby={f.key + "-c"} />}
                <div className="under"><span className="eg">{f.placeholder ? "For example: " + f.placeholder : ""}</span><span id={f.key + "-c"} className={"count" + (near ? " near" : "")}>{len} / {f.max}</span></div>
              </div>); })}
          </section>

          <section className="step"><h2><span className="num">3</span>Check and pay</h2>
            <div className="total"><span>{TIERS[tier].name}{children.length > 1 ? ` for ${children.length} children` : ""}</span><span>{gbp(priceFor(tier, children.length))}</span></div>
            <label className="check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>I am this child’s parent or guardian, and I am happy for these details to be used to make the letter. <Link href="/privacy">How we look after them</Link>.</span></label>
            <label className="check"><input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} /><span>Please deliver my letter straight after payment. I understand that once it has been delivered I can no longer cancel under the 14-day cooling-off period. <Link href="/terms">Terms and refunds</Link>.</span></label>
            {error && <div className="err" role="alert">{error}</div>}
            <button className="btn big" disabled={busy}>{busy ? "Taking you to payment…" : "Pay " + gbp(priceFor(tier, children.length)) + " and receive the letter"}</button>
            <p className="eg">You pay on Stripe’s secure page. Your letter opens as soon as you have paid.</p>
          </section>
        </form>
        <aside className="side">
          <Envelope name={child.name} town={child.town} className={child.name ? "addressed" : ""} />
          <p className="eg">Their envelope, as it will arrive.</p>
          <img src="/art/letter-tease.jpg" alt="A letter from the Office of Father Christmas with a crest, stamp, signature and red wax seal. The words are blurred." />
          <p className="eg">A glimpse of the letter. Theirs is written from the details you give, the moment you pay.</p>
        </aside>
      </div>
    </div></>
  );
}
