"use client";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import Letter from "@/components/Letter";
import { LETTERS } from "@/lib/order";

const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

// Father Christmas's own hands open the envelope (film), then the child's letter appears on the page he is holding.
export default function FilmExperience({ sid, order, c, k, films }) {
  const child = order.children[c];
  const [phase, setPhase] = useState(0);        // 0 sealed · 1 film playing · 2 letter appearing · 3 reading
  const [dim, setDim] = useState(null);
  const [voice, setVoice] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");
  const [focusY, setFocusY] = useState(null);   // which part of the page is brought to eye level (letter px)
  const video = useRef(null), audio = useRef(null), sheet = useRef(null), raf = useRef(0), last = useRef(-1), started = useRef(false);

  useLayoutEffect(() => {
    const m = () => {
      const vw = innerWidth, vh = innerHeight;
      const film = vw / vh > 1.15 && films.wide ? films.wide : films.tall;   // laptops and TVs get the wide film
      // tall film: fit the height (phones crop a little off the sides). wide film: fill the screen.
      const fh = film === films.tall ? vh : Math.max(vh, vw / film.aspect), fw = fh * film.aspect;
      const fx = (vw - fw) / 2, fy = (vh - fh) / 2;
      // the letter sits inside the blank page, centred, whichever of width or height is the tighter fit
      const pw = fw * film.page.w, ph = fh * film.page.h, w = Math.min(pw, ph * 210 / 297) * 0.985, h = w * 297 / 210;
      const p = { x: fx + fw * film.page.x + (pw - w) / 2, y: fy + fh * film.page.y + (ph - h) / 2, w, h };
      setDim({ vw, vh, fw, fh, fx, fy, p, film, envW: fw * film.env.w, envX: fx + fw * film.env.x, envY: fy + fh * film.env.y, envH: fw * film.env.w / film.env.ratio, ks: p.w / 793.7 });
    };
    m(); addEventListener("resize", m); return () => removeEventListener("resize", m);
  }, [films]);

  useEffect(() => {
    if (!order.voice) { setVoice("none"); return; }
    let dead = false;
    fetch(`/api/voice?sid=${encodeURIComponent(sid)}&c=${c}&k=${k}`).then((r) => r.json()).then((j) => { if (!dead) setVoice(j.url ? j : "error"); }).catch(() => !dead && setVoice("error"));
    return () => { dead = true; };
  }, [sid, c, k, order.voice]);

  const mark = useCallback((i) => {
    if (i === last.current) return; last.current = i;
    const root = sheet.current; if (!root) return;
    root.querySelectorAll(".now").forEach((n) => n.classList.remove("now"));
    const el = root.querySelector(`[data-w="${i}"]`); if (!el) return;
    el.classList.add("now");
    const box = root.querySelector(".lt-letter"); let y = el.offsetTop, o = el.offsetParent;
    while (o && o !== box && box.contains(o)) { y += o.offsetTop; o = o.offsetParent; }
    setFocusY(box.offsetTop + y);
  }, []);
  const tick = useCallback(() => {
    const a = audio.current; if (!a || !voice?.starts) return;
    const t = a.currentTime, s = voice.starts; let i = last.current < 0 ? 0 : last.current;
    if (s[i] > t) i = 0; while (i + 1 < s.length && s[i + 1] <= t) i++;
    if (t >= s[0]) mark(sheet.current?.querySelector(`[data-w="${i}"]`) ? i : i - 1);
    raf.current = requestAnimationFrame(tick);
  }, [voice, mark]);
  const play = useCallback(async () => {
    const a = audio.current; if (!a || !voice?.url) return;
    if (a.dataset.loaded !== voice.url) { a.src = voice.url; a.dataset.loaded = voice.url; }
    try { await a.play(); setPlaying(true); setStatus(""); cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(tick); } catch { setStatus("Tap “Hear Father Christmas read it” to start the reading."); }
  }, [voice, tick]);
  const pause = () => { audio.current?.pause(); setPlaying(false); cancelAnimationFrame(raf.current); };

  // The spoken welcome ("Ho, ho, ho…") starts while his hands are still opening the envelope.
  useEffect(() => {
    if (phase < 1 || started.current) return;
    if (voice?.url) { started.current = true; play(); }
    else if (phase === 3 && voice === null) setStatus("Father Christmas is clearing his throat…");
    else if (phase === 3 && voice === "error") setStatus("The reading could not be loaded just now. The letter is all here to read; refresh the page to try the voice again.");
  }, [phase, voice, play]);

  function open() {
    const a = audio.current; if (a && order.voice) { a.src = SILENCE; a.play().then(() => a.pause()).catch(() => { }); }
    const v = video.current; setPhase(1);
    if (v) { v.currentTime = 0; v.play().catch(() => arrive()); } else arrive();
  }
  const arrived = useRef(false);
  function arrive() { if (arrived.current) return; arrived.current = true; setPhase(2); setTimeout(() => setPhase(3), 1700); }
  function again() { pause(); const a = audio.current; if (a) { a.currentTime = 0; delete a.dataset.loaded; } started.current = false; arrived.current = false; last.current = -1; sheet.current?.querySelectorAll(".now").forEach((n) => n.classList.remove("now")); setFocusY(null); setStatus(""); if (video.current) { video.current.pause(); video.current.currentTime = 0; } setPhase(0); }

  if (!dim) return <div className="stage film" />;
  const { vw, vh, fw, fh, fx, fy, p, film, envW, envX, envY, envH, ks } = dim;
  // Reading: bring the page towards the viewer so the words are large enough to follow.
  let world = "none";
  if (phase === 3) {
    const S = Math.min(vw * 1.17, 900) / p.w;
    const fyLetter = p.y + (focusY ?? 300) * ks;
    let ty = vh * 0.4 - fyLetter * S;
    ty = Math.min(ty, vh * 0.05 - p.y * S); ty = Math.max(ty, vh * 0.82 - (p.y + p.h) * S);
    world = `translate(${vw / 2 - (p.x + p.w / 2) * S}px, ${ty}px) scale(${S})`;
  }
  const others = [];
  order.children.forEach((ch, ci) => order.letters.forEach((lk) => { if (ci !== c || lk !== k) others.push({ ci, lk, label: (order.children.length > 1 ? ch.name + " · " : "") + LETTERS[lk].title }); }));
  const file = (type) => `/api/file?sid=${encodeURIComponent(sid)}&c=${c}&k=${k}&type=${type}`;

  return (
    <div className="stage film">
      <div className="world" style={{ transform: world }}>
        <video key={film.src} ref={video} className="filmv" src={film.src} poster={film.poster} muted playsInline preload="auto" onEnded={arrive} onError={() => phase === 1 && arrive()}
          style={{ left: fx, top: fy, width: fw, height: fh, opacity: 1 }} />
        <div className={"onpage" + (phase === 3 ? " reading" : "")} ref={sheet} style={{ left: p.x, top: p.y, width: p.w, height: p.h, opacity: phase >= 2 ? 1 : 0 }}>
          <div style={{ width: "210mm", height: "297mm", transform: `scale(${ks})`, transformOrigin: "0 0" }}><Letter child={child} kind={k} year={order.year} plain /></div>
        </div>
      </div>
      <div className={"env" + (phase >= 1 ? " gone2" : "")} style={{ width: envW, height: envH, left: envX, marginLeft: -envW / 2, top: envY, marginTop: -envH / 2 }} aria-hidden={phase > 0}>
        <div className="envfront">
          <img className="pm" src="/art/postmark.png" alt="" /><img className="st" src="/art/stamp.png" alt="" />
          <div className="to" style={{ fontSize: envH * 0.17 }}>{child.name}</div>
          <div className="to" style={{ fontSize: envH * 0.09 }}>{child.town}</div>
          <div className="air" style={{ fontSize: envH * 0.034 }}>By Reindeer Air Mail</div>
        </div>
      </div>
      <div className="vignette" />
      <audio ref={audio} preload="auto" onEnded={() => { setPlaying(false); cancelAnimationFrame(raf.current); sheet.current?.querySelectorAll(".now").forEach((n) => n.classList.remove("now")); }} />
      {status && <div className="status" role="status">{status}</div>}
      {phase === 0 && <button className="btn open-btn" onClick={open}>Open {child.name}’s letter</button>}
      {phase === 3 && (
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
