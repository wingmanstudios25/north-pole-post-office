"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Letter, { Sheet } from "@/components/Letter";
import { SHOP, TIERS, FIELDS, LETTERS, EXTRA_CHILD, MAX_CHILDREN, priceFor, cleanChild, childErrors } from "@/lib/order";

const gbp = (p) => "£" + (p / 100).toFixed(2);
const blank = () => Object.fromEntries(FIELDS.map((f) => [f.key, ""]));
const year = new Date().getFullYear();

export default function Order() {
  const [tier, setTier] = useState("read");
  const [kind, setKind] = useState("classic");
  const [children, setChildren] = useState([blank()]);
  const [active, setActive] = useState(0);
  const [view, setView] = useState("classic");
  const [ok, setOk] = useState(false);
  const [now, setNow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const t = new URLSearchParams(location.search).get("tier"); if (TIERS[t]) setTier(t); }, []);
  const shown = TIERS[tier].choose ? kind : view;
  const set = (k, v) => setChildren((cs) => cs.map((c, i) => (i === active ? { ...c, [k]: v } : c)));
  const child = children[active];
  // preview shows gentle prompts where a field is still empty
  const preview = Object.fromEntries(FIELDS.map((f) => [f.key, child[f.key] || (f.required ? "[" + f.label.toLowerCase() + "]" : "")]));

  async function pay() {
    setError("");
    const cleaned = children.map(cleanChild);
    const bad = cleaned.findIndex((c) => childErrors(c).length);
    if (bad >= 0) { setActive(bad); setError("Please fill in for " + (cleaned[bad].name || "child " + (bad + 1)) + ": " + childErrors(cleaned[bad]).join(", ") + "."); return; }
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
    <div className="wrap">
      <div className="top"><Link className="brand" href="/">{SHOP}</Link></div>
      <div className="order">
        <form onSubmit={(e) => { e.preventDefault(); pay(); }}>
          <fieldset><legend>Choose the letter</legend>
            {Object.entries(TIERS).map(([k, t]) => (
              <label className={"opt" + (tier === k ? " on" : "")} key={k}>
                <input type="radio" name="tier" checked={tier === k} onChange={() => setTier(k)} />
                <div><b>{t.name} · {gbp(t.price)}</b><span>{t.blurb}</span></div>
              </label>))}
            {TIERS[tier].choose && (<><label htmlFor="kind">Which letter?</label>
              <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(LETTERS).map(([k, l]) => <option key={k} value={k}>{l.title}</option>)}</select></>)}
          </fieldset>
          <fieldset><legend>About the child</legend>
            <div className="tabs">
              {children.map((c, i) => <button type="button" key={i} className={i === active ? "on" : ""} onClick={() => setActive(i)}>{c.name || "Child " + (i + 1)}</button>)}
              {children.length < MAX_CHILDREN && <button type="button" onClick={() => { setChildren((cs) => [...cs, blank()]); setActive(children.length); }}>+ Add a child ({gbp(EXTRA_CHILD)})</button>}
              {children.length > 1 && <button type="button" onClick={() => { setChildren((cs) => cs.filter((_, i) => i !== active)); setActive(0); }}>Remove this child</button>}
            </div>
            {FIELDS.map((f) => (<div key={f.key}>
              <label htmlFor={f.key}>{f.label}{f.hint && <span className="hint">{f.hint}</span>}</label>
              {f.area ? <textarea id={f.key} maxLength={f.max} value={child[f.key]} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />
                : <input id={f.key} type="text" maxLength={f.max} value={child[f.key]} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />}
            </div>))}
          </fieldset>
          <div className="total"><span>Total</span><span>{gbp(priceFor(tier, children.length))}</span></div>
          <label className="check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>I am this child’s parent or guardian, and I am happy for these details to be used to make the letter. <Link href="/privacy">How we look after them</Link>.</span></label>
          <label className="check"><input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} /><span>Please deliver my letter straight after payment. I understand that once it has been delivered I can no longer cancel under the 14-day cooling-off period. <Link href="/terms">Terms and refunds</Link>.</span></label>
          {error && <div className="err" role="alert">{error}</div>}
          <button className="btn" disabled={busy}>{busy ? "Taking you to payment…" : "Pay and receive the letter"}</button>
        </form>
        <div className="preview">
          <div className="caps" style={{ marginBottom: 10 }}>Live preview{!TIERS[tier].choose && <> · <a href="#" onClick={(e) => { e.preventDefault(); setView(view === "classic" ? "eve" : "classic"); }}>show the {view === "classic" ? "Christmas Eve" : "December"} letter</a></>}</div>
          <Sheet><Letter child={preview} kind={shown} year={year} /></Sheet>
        </div>
      </div>
    </div>
  );
}
