"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Envelope from "@/components/Envelope";
import Snow from "@/components/Snow";
import { SHOP, TIERS, EXTRA_CHILD, BUSINESS, CONTACT } from "@/lib/order";

const gbp = (p) => "£" + (p / 100).toFixed(2);
const DETAILS = [
  { x: 17, y: 8.5, title: "Their own entry in the Nice List Register", text: "Every child gets a folio number, written in by hand and checked twice." },
  { x: 86, y: 8, title: "A North Pole stamp and postmark", text: "Franked at the Arctic Circle sorting office and passed for reindeer air mail." },
  { x: 50, y: 41, title: "Written about them, not at them", text: "Their name, their town, what they worked hardest at this year and what they are hoping for." },
  { x: 33, y: 78, title: "Signed in his own hand and sealed in wax", text: "With a handwritten P.S. you can choose yourself." },
  { x: 24, y: 91, title: "A note from the post-room elf", text: "Pip Tinseltoe sorted it, and has something to confess." },
];
const QUESTIONS = [
  ["How does the letter reach me?", "It opens on screen as soon as you have paid, and we email you a private link to it. Nothing is sent by post, so there is no last posting date."],
  ["Can I print it?", "Yes. You get an A4 PDF made for home printers, and an image. Print it, fold it in three and leave it on the doormat."],
  ["What does “read by Father Christmas” mean?", "Your private page shows Father Christmas’s own hands opening the envelope at his desk. He lifts out your child’s letter and reads it to them, with each word lighting up as he goes."],
  ["Can I order for more than one child?", "Yes, up to four on one order. Each child gets their own letter, written about them."],
  ["What if I make a spelling mistake?", "Write to us within 14 days and we will correct the letter and send it again."],
  ["What do you do with my child’s details?", "We use them to make the letter and nothing else. We never ask for a surname, address or photograph, and recordings are deleted after 60 days."],
];

export default function Home() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState(2);
  const [opened, setOpened] = useState(0);   // 0 sealed · 1 turned over · 2 seal broken · 3 letter out
  const timers = useRef([]);
  const openEnvelope = () => { if (opened) return; const quick = matchMedia("(prefers-reduced-motion: reduce)").matches; setOpened(1); timers.current = [setTimeout(() => setOpened(2), quick ? 10 : 800), setTimeout(() => setOpened(3), quick ? 20 : 1350)]; };
  const closeEnvelope = () => { timers.current.forEach(clearTimeout); setOpened(0); };
  useEffect(() => { if (opened !== 3) return; const k = (e) => e.key === "Escape" && closeEnvelope(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [opened]);
  const stack = useRef(null);
  const tilt = (e) => { const el = stack.current; if (!el) return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg"); el.style.setProperty("--ry", (x * 7).toFixed(2) + "deg"); };
  const rest = () => { stack.current?.style.setProperty("--rx", "0deg"); stack.current?.style.setProperty("--ry", "0deg"); };
  const clean = name.trim();
  const orderHref = "/order" + (clean ? "?name=" + encodeURIComponent(clean) : "");

  return (
    <>
      <header className="counter">
        <Snow />
        <div className="wrap">
          <div className="top"><Link className="brand" href="/">{SHOP}</Link><Link className="btn ghost small" href="/order">Order a letter</Link></div>
          <div className="counter-grid">
            <div>
              <h1>A real letter from Father Christmas, written to your child.</h1>
              <p className="lead">He knows their name, their town and the thing they worked hardest at this year. Stamped at the North Pole, sealed in wax, and read aloud by the man himself.</p>
              <form className="who" onSubmit={(e) => { e.preventDefault(); location.href = orderHref; }}>
                <label htmlFor="who">Who is the letter for?</label>
                <div className="who-row">
                  <input id="who" type="text" maxLength={24} autoComplete="off" placeholder="Type their first name" value={name} onChange={(e) => setName(e.target.value)} />
                  <button className="btn">{clean ? `Write ${clean}’s letter` : "Write their letter"}</button>
                </div>
                <p className="hint">Watch the envelope as you type.</p>
              </form>
            </div>
            <div className="stack" ref={stack} onPointerMove={tilt} onPointerLeave={rest}>
              <img className="sheet-peek" src="/art/sample.jpg" alt="" />
              <button type="button" className={"env-btn" + (opened ? " flipped" : "") + (opened >= 2 ? " broken" : "")} onClick={openEnvelope} aria-label="Open the envelope to see an example letter">
                <span className="flip3d">
                  <Envelope name={clean} town={clean ? "By hand, with care" : ""} className={clean ? "addressed" : ""} />
                  <span className="env-back"><i /><img src="/art/seal.png" alt="" /></span>
                </span>
              </button>
              <p className="tap">Tap the envelope to open it</p>
            </div>
          </div>
        </div>
      </header>

      {opened === 3 && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="An example letter" onClick={closeEnvelope}>
          <div className="lightbox-in" onClick={(e) => e.stopPropagation()}>
            <img src="/art/sample.jpg" alt="An example letter from Father Christmas, written for a girl called Matilda." />
            <div className="lightbox-bar"><span>An example, written for Matilda. Yours is written about your child.</span><span><button className="btn ghost small" onClick={closeEnvelope}>Close</button> <Link className="btn small" href={orderHref}>{clean ? `Write ${clean}’s letter` : "Write their letter"}</Link></span></div>
          </div>
        </div>)}

      <main>
        <section className="arrives wrap">
          <div className="letter-pins">
            <img src="/art/sample.jpg" alt="An example letter from Father Christmas on aged cream paper, with a crest, a North Pole stamp and postmark, a signature and a red wax seal." />
            {DETAILS.map((d, i) => <button key={i} className={"pin" + (pin === i ? " on" : "")} style={{ left: d.x + "%", top: d.y + "%" }} onMouseEnter={() => setPin(i)} onFocus={() => setPin(i)} onClick={() => setPin(i)} aria-label={d.title}><span /></button>)}
          </div>
          <div>
            <h2>What arrives</h2>
            <p className="lead">One sheet of his own stationery, written to your child. This example was written for Matilda, who is six.</p>
            <ul className="detail-list">
              {DETAILS.map((d, i) => <li key={i} className={pin === i ? "on" : ""} onMouseEnter={() => setPin(i)}><button onClick={() => setPin(i)}><b>{d.title}</b><span>{d.text}</span></button></li>)}
            </ul>
          </div>
        </section>

        <section className="reads">
          <div className="wrap reads-grid">
            <div>
              <h2>Then he reads it to them himself</h2>
              <p className="lead">Open your private page together. Father Christmas’s own hands break the seal at his desk, lift out the letter and hold it up by the fire. Then he says hello to your child by name and reads every word.</p>
              <p>The words light up as he reads, so little ones can follow along. Watch it as many times as you like, on a phone, a tablet or the television.</p>
              <p className="fine">Included with “{TIERS.read.name}” and “{TIERS.full.name}”.</p>
            </div>
            <img className="hands" src="/art/hands-letter.jpg" alt="Father Christmas’s white-gloved hands holding a letter up by firelight at his desk, with a candle and a snowy window behind." />
          </div>
        </section>

        <section className="wrap">
          <h2 className="centre">Choose their letter</h2>
          <div className="tickets">
            {Object.entries(TIERS).map(([k, t]) => (
              <div className={"ticket" + (k === "read" ? " best" : "")} key={k}>
                {k === "read" && <div className="tag">Most chosen</div>}
                <h3>{t.name}</h3><div className="price">{gbp(t.price)}</div><p>{t.blurb}</p>
                <Link className={"btn" + (k === "read" ? "" : " ghost")} href={"/order?tier=" + k + (clean ? "&name=" + encodeURIComponent(clean) : "")}>Choose this letter</Link>
              </div>))}
          </div>
          <p className="centre fine">Each extra child on the same order is {gbp(EXTRA_CHILD)}. Delivered on screen and by email, straight after payment.</p>
        </section>

        <section className="wrap questions">
          <h2>Questions parents ask</h2>
          {QUESTIONS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </section>
      </main>

      <footer><div className="wrap">{SHOP} is operated by {BUSINESS}. <a href={"mailto:" + CONTACT}>{CONTACT}</a><br /><Link href="/privacy">Privacy and your child’s details</Link> &nbsp; <Link href="/terms">Terms and refunds</Link></div></footer>
    </>
  );
}
