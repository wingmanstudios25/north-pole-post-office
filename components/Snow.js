"use client";
import { useEffect, useRef } from "react";
// Quiet snowfall behind the counter. Stops when off screen and for anyone who prefers reduced motion.
export default function Snow() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d"); let w, h, raf = 0, on = true;
    const size = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    size(); addEventListener("resize", size);
    const flakes = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.9, v: 0.012 + Math.random() * 0.03, s: Math.random() * 6.28 }));
    let last = performance.now();
    const draw = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t; g.clearRect(0, 0, w, h);
      for (const f of flakes) { f.y += f.v * dt * (0.6 + f.r / 2); f.s += dt * 0.6; if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        g.globalAlpha = 0.25 + f.r / 4; g.beginPath(); g.arc((f.x + Math.sin(f.s) * 0.012) * w, f.y * h, f.r, 0, 6.28); g.fillStyle = "#eef4f2"; g.fill(); }
      if (on) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; cancelAnimationFrame(raf); if (on) { last = performance.now(); raf = requestAnimationFrame(draw); } });
    io.observe(c);
    return () => { on = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="snow" aria-hidden="true" />;
}
