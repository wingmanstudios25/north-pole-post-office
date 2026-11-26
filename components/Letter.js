"use client";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import { LETTERS, fill, letterBlocks, register } from "@/lib/order";

// The stationery. Never changes; only the words and the child's details do.
export default function Letter({ child, kind = "classic", year, plain = false, postmark }) {
  const L = LETTERS[kind] || LETTERS.classic;
  const ref = useRef(null);
  const blocks = letterBlocks(kind, child, year);
  const reg = register(child, year);
  let w = 0;
  const words = (text) => text.split(" ").map((t, i) => <span key={i}><span data-w={w++}>{t}</span> </span>);
  const key = JSON.stringify([child, kind]);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => { let s = 13.4; el.style.fontSize = s + "pt"; while (el.scrollHeight > el.clientHeight + 1 && s > 9.4) { s -= 0.1; el.style.fontSize = s + "pt"; } el.dataset.fit = "1"; };
    fit(); document.fonts?.ready.then(fit);
  }, [key]);
  const body = blocks.filter((b) => b.type === "p");
  const salute = blocks.find((b) => b.type === "salute"), close = blocks.find((b) => b.type === "close"), ps = blocks.find((b) => b.type === "ps");
  const saluteEl = words(salute.text), bodyEl = body.map((b, i) => <p key={i} className={i ? "b" : ""}>{words(b.text)}</p>), closeEl = words(close.text);
  const sigIndex = w; w += 2;
  const psEl = ps ? words(ps.text) : null;
  return (
    <div className={"lt-page" + (plain ? " plain" : "")}>
      {!plain && <img className="lt-paper" src="/art/paper.jpg" alt="" />}
      <img className="lt-wm" src="/art/snowflake.svg" alt="" />
      <div className="lt-ref">
        <div>Nice List Register</div>
        <div>Vol. {reg.vol} · Folio <span className="line"><span className="hw">{child.name ? reg.folio : ""}</span></span></div>
        <div className="note">checked twice ✓ <span style={{ fontSize: ".8em" }}>F.C.</span></div>
      </div>
      <div className="lt-head">
        <img className="lt-crest" src="/art/crest.png" alt="" />
        <div className="lt-office">Office of Father Christmas</div>
        <div className="lt-addr">The North Pole · Arctic Circle</div>
        <img className="lt-rule" src="/art/rule.svg" alt="" />
      </div>
      <div className="lt-post">
        <img className="stamp" src="/art/stamp.png" alt="" />
        <img className="pm" src="/art/postmark.png" alt="" />
        <div className="pmdate"><span>{postmark || L.postmark}</span><span>{year}</span></div>
      </div>
      <div className="lt-letter" ref={ref}>
        <div className="lt-date">{fill(L.date, child, year)}</div>
        <div className="lt-salute">{saluteEl}</div>
        <div>{bodyEl}</div>
        <div className="lt-close">{closeEl}</div>
        <div className="lt-sig"><span data-w={sigIndex} data-span="2">Father Christmas</span>
          <svg viewBox="0 0 300 20" preserveAspectRatio="none"><path d="M4,12 C70,4 190,3 296,9 C230,9 150,12 96,17" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
        </div>
        {psEl && <div className="lt-ps">{psEl}</div>}
      </div>
      <img className="lt-seal" src="/art/seal.png" alt="" />
      <div className="lt-elf">{L.elf.map((t, i) => <div key={i}>{t}</div>)}</div>
      <img className="lt-hs" src="/art/handstamp.png" alt="" />
      <div className="lt-foot">By Sleigh · By Starlight · Since Time Out of Mind</div>
    </div>
  );
}

// Scales the A4 sheet to whatever width it is given.
export function Sheet({ children, className = "" }) {
  const box = useRef(null); const [s, setS] = useState(0);
  useEffect(() => {
    const el = box.current; const ro = new ResizeObserver(() => setS(el.clientWidth / 793.7)); ro.observe(el); return () => ro.disconnect();
  }, []);
  return <div ref={box} className={"sheet " + className} style={{ aspectRatio: "210/297" }}><div style={{ transform: `scale(${s})`, transformOrigin: "0 0", width: "210mm", height: "297mm", visibility: s ? "visible" : "hidden" }}>{children}</div></div>;
}
