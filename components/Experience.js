"use client";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import Letter from "@/components/Letter";
import { LETTERS } from "@/lib/order";

const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Experience({ sid, order, c, k, povVideo }) {
  const child = order.children[c];
  const [phase, setPhase] = useState(0);         // 0 sealed · 1 turned over · 2 seal broken, flap open · 3 letter rising · 4 unfolding · 5 reading
  const [dim, setDim] = useState(null);
  const [voice, setVoice] = useState(null);      // {url, starts} | "none" | "error"
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");
  const reader = useRef(null), fold = useRef(null), audio = useRef(null), raf = useRef(0), last = useRef(-1);

  useLayoutEffect(() => {
    const m = () => { const vw = innerWidth, vh = innerHeight; const W = Math.min(940, vw * 1.3); const envW = Math.min(vw * 0.9, 620, (vh * 0.5) * 2.1); setDim({ vw, vh, W, H: W * 297 / 210, envW, envH: envW / 2.1, top: Math.max(24, vh * 0.06) }); };
    m(); addEventListener("resize", m); return () => removeEventListener("resize", m);
  }, []);

  // Ask for the reading as soon as the page opens, so it is ready by the time the letter unfolds.
  useEffect(() => {
    if (!order.voice) { setVoice("none"); return; }
    let dead = false;
    fetch(`/api/voice?sid=${encodeURIComponent(sid)}&c=${c}&k=${k}`).then((r) => r.json()).then((j) => { if (!dead) setVoice(j.url ? j : "error"); }).catch(() => !dead && setVoice("error"));
    return () => { dead = true; };
  }, [sid, c, k, order.voice]);

  const mark = useCallback((i) => {
    if (i === last.current) return; last.current = i;
    const root = fold.current; if (!root) return;
    root.querySelectorAll(".now").forEach((n) => n.classList.remove("now"));
    let target = null;
    root.querySelectorAll(`[data-w="${i}"]`).forEach((n) => { n.classList.add("now"); const f = n.closest(".face").getBoundingClientRect(), r = n.getBoundingClientRect(); if (r.top >= f.top - 2 && r.bottom <= f.bottom + 2) target = n; });
    if (target && reader.current) { const r = target.getBoundingClientRect(); const sc = reader.current; const want = sc.scrollTop + r.top - innerHeight * 0.4; if (Math.abs(want - sc.scrollTop) > innerHeight * 0.12) sc.scrollTo({ top: Math.max(0, want), behavior: "smooth" }); }
  }, []);

  const tick = useCallback(() => {
    const a = audio.current; if (!a || !voice?.starts) return;
    const t = a.currentTime, s = voice.starts; let i = last.current < 0 ? 0 : last.current;
    if (s[i] > t) i = 0; while (i + 1 < s.length && s[i + 1] <= t) i++;
    // the signature is one element covering two spoken words
    const el = fold.current?.querySelector(`[data-w="${i}"]`) ? i : i - 1;
    mark(el); raf.current = requestAnimationFrame(tick);
  }, [voice, mark]);

  const play = useCallback(async () => {
    const a = audio.current; if (!a || !voice?.url) return;
    if (a.dataset.loaded !== voice.url) { a.src = voice.url; a.dataset.loaded = voice.url; }
    try { await a.play(); setPlaying(true); setStatus(""); cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(tick); } catch { setStatus("Tap “Hear Father Christmas read it” to start the reading."); }
  }, [voice, tick]);
  const pause = () => { audio.current?.pause(); setPlaying(false); cancelAnimationFrame(raf.current); };

  // once the letter is open and the reading has arrived, begin
  useEffect(() => {
    if (phase !== 5) return;
    if (voice === null) setStatus("Father Christmas is clearing his throat…");
    else if (voice === "error") setStatus("The reading could not be loaded just now. The letter is all here to read; refresh the page to try the voice again.");
    else if (voice?.url && !audio.current?.dataset.loaded) play();
    else if (voice === "none") setStatus("");
  }, [phase, voice, play]);

  async function open() {
    const a = audio.current; if (a && order.voice) { a.src = SILENCE; a.play().then(() => a.pause()).catch(() => { }); }   // unlocks sound on phones
    const quick = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase(1); await wait(quick ? 50 : 1800);
    setPhase(2); await wait(quick ? 50 : 1500);
    setPhase(3); await wait(quick ? 50 : 1350);
    setPhase(4); await wait(quick ? 50 : 1900);
    setPhase(5);
  }
  function again() { pause(); if (audio.current) { audio.current.currentTime = 0; delete audio.current.dataset.loaded; } last.current = -1; fold.current?.querySelectorAll(".now").forEach((n) => n.classList.remove("now")); reader.current?.scrollTo({ top: 0 }); setStatus(""); setPhase(0); }

  if (!dim) return <div className="stage" />;
  const { W, H, vh, envW, envH, top } = dim;
  const s0 = (envW * 0.95) / W, third = H / 3;
  const centre = vh / 2 - (top + H / 2);                       // moves the folded letter to the middle of the screen
  const foldT = phase <= 2 ? `translateY(${centre + envH * 0.02}px) scale(${s0})` : phase === 3 ? `translateY(${centre - envH * 0.92}px) scale(${s0})` : "none";
  const folded = phase < 4;
  const letter = <div style={{ width: "210mm", height: "297mm", transform: `scale(${W / 793.7})`, transformOrigin: "0 0" }}><Letter child={child} kind={k} year={order.year} /></div>;
  const panel = (i, tf) => (
    <div className="panel" style={{ top: i * third, height: third + 0.5, transformOrigin: i === 0 ? "50% 100%" : "50% 0", transform: tf, zIndex: i === 2 ? 3 : i === 0 ? 2 : 1 }}>
      <div className="face"><div style={{ position: "absolute", top: -i * third, left: 0 }}>{letter}</div></div>
      {i !== 1 && <div className="face back" />}
    </div>);
  const others = [];
  order.children.forEach((ch, ci) => order.letters.forEach((lk) => { if (ci !== c || lk !== k) others.push({ ci, lk, label: (order.children.length > 1 ? ch.name + " · " : "") + LETTERS[lk].title }); }));
  const file = (type) => `/api/file?sid=${encodeURIComponent(sid)}&c=${c}&k=${k}&type=${type}`;

  return (
    <div className="stage">
      {povVideo && <video className="pov" src={povVideo} autoPlay muted loop playsInline />}
      <div className={"env" + (phase >= 4 ? " gone" : "")} style={{ width: envW, height: envH, marginLeft: -envW / 2, marginTop: -envH / 2 }} aria-hidden={phase > 0}>
        <div className={"envback" + (phase >= 1 ? " show" : "")} />
        <div className={"flapbox" + (phase >= 1 ? " show" : "") + (phase >= 3 ? " under" : "")}><div className={"flap" + (phase >= 2 ? " open" : "")}><i /><img src="/art/seal.png" alt="" className={phase >= 2 ? "broken" : ""} /></div></div>
        <div className={"envfront" + (phase >= 1 ? " flip" : "")}>
          <img className="pm" src="/art/postmark.png" alt="" /><img className="st" src="/art/stamp.png" alt="" />
          <div className="to" style={{ fontSize: envH * 0.2 }}>{child.name}</div>
          <div className="to" style={{ fontSize: envH * 0.11 }}>{child.town}</div>
          <div className="air" style={{ fontSize: envH * 0.042 }}>By Reindeer Air Mail</div>
        </div>
      </div>
      <div className={"reader" + (phase === 5 ? " free" : "")} ref={reader} style={{ zIndex: 2 }}>
        <div className={"fold" + (phase === 5 ? " reading" : "")} ref={fold} style={{ width: W, height: H, marginLeft: -W / 2, marginTop: top, marginBottom: vh * 0.45, transformOrigin: "50% 50%", transform: foldT, visibility: phase >= 1 ? "visible" : "hidden" }}>
          {panel(1, "none")}
          {panel(0, folded ? "rotateX(-179.4deg)" : "none")}
          {panel(2, folded ? "rotateX(179.8deg) translateZ(1px)" : "none")}
        </div>
      </div>
      <div className={"env" + (phase >= 4 ? " gone" : "")} style={{ width: envW, height: envH, marginLeft: -envW / 2, marginTop: -envH / 2, zIndex: 3, pointerEvents: "none" }} aria-hidden="true">
        <div className={"pocket" + (phase >= 1 ? " show" : "")} />
      </div>
      <div className="glow" />
      <audio ref={audio} preload="auto" onEnded={() => { setPlaying(false); cancelAnimationFrame(raf.current); fold.current?.querySelectorAll(".now").forEach((n) => n.classList.remove("now")); }} />
      {status && <div className="status" role="status">{status}</div>}
      {phase === 0 && <button className="btn open-btn" onClick={open}>Open {child.name}’s letter</button>}
      {phase === 5 && (
        <div className="bar">
          {voice?.url && (playing ? <button className="btn" onClick={pause}>Pause the reading</button> : <button className="btn" onClick={play}>Hear Father Christmas read it</button>)}
          <button className="btn ghost" onClick={again}>Open it again</button>
          {!order.sample && <><a className="btn" href={`/api/pack?sid=${encodeURIComponent(sid)}&c=${c}`} onClick={() => setStatus("Wrapping up your pack. This takes about fifteen seconds…")}>Download the full pack</a><a className="btn ghost" href="/pack/Christmas-Day-Fun-Pack.pdf" download>Christmas Day Fun Pack</a><a className="btn ghost" href={file("pdf")}>Letter PDF only</a></>}
          {others.map((o) => <a className="btn ghost" key={o.ci + o.lk} href={`?c=${o.ci}&k=${o.lk}`}>{o.label}</a>)}
          {order.sample && <a className="btn" href="/order">Write a letter for your child</a>}
        </div>)}
    </div>
  );
}
