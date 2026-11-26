import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createHash } from "crypto";
import { put, list } from "@vercel/blob";
import { getOrder } from "@/lib/server";
import { renderSheets } from "@/lib/render";
import { getOrMakeVoice } from "@/lib/voice";
import { SHOP, CONTACT } from "@/lib/order";
export const maxDuration = 120;

// The download pack for one child: every letter (PDF + image), a print-and-cut envelope,
// a Nice List certificate and, where a reading was bought, the recording.
export async function GET(req) {
  const u = new URL(req.url), q = u.searchParams, sid = q.get("sid") || "";
  const order = await getOrder(sid);
  if (!order) return new NextResponse("Not found", { status: 404 });
  const c = Math.min(Math.max(parseInt(q.get("c")) || 0, 0), order.children.length - 1);
  const child = order.children[c], safe = child.name.replace(/[^A-Za-z0-9]+/g, "-") || "child";
  // A finished pack is kept in storage and reused: packs are too large to send straight from the site.
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN, key = "pack/" + createHash("sha256").update(sid + "|" + c).digest("hex").slice(0, 40);
  if (hasBlob) { const found = (await list({ prefix: key })).blobs[0]; if (found) return NextResponse.redirect(found.downloadUrl || found.url, 302); }
  const label = (k) => (k === "eve" ? "Christmas Eve letter" : "Letter");
  try {
    const jobs = [], names = [];
    for (const k of order.letters) { jobs.push({ query: `c=${c}&k=${k}`, type: "pdf" }, { query: `c=${c}&k=${k}`, type: "png" }); names.push(`${label(k)} - print this (A4).pdf`, `${label(k)} - picture.png`); }
    jobs.push({ query: `c=${c}&doc=envelope`, type: "pdf" }, { query: `c=${c}&doc=certificate`, type: "pdf" }); names.push("Envelope to cut out (A4).pdf", "Nice List certificate (A4).pdf");
    const [files, voices] = await Promise.all([
      renderSheets(u.origin, sid, jobs),
      order.voice ? Promise.all(order.letters.map(async (k) => { try { const v = await getOrMakeVoice(order, c, k); if (!v.url || v.url.startsWith("data:")) return null; const r = await fetch(v.url.startsWith("/") ? u.origin + v.url : v.url); return r.ok ? Buffer.from(await r.arrayBuffer()) : null; } catch { return null; } })) : [],
    ]);
    const fun = await fetch(u.origin + "/pack/Christmas-Day-Fun-Pack.pdf").then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
    const zip = new JSZip();
    if (fun) zip.file("Christmas Day Fun Pack.pdf", Buffer.from(fun));
    files.forEach((f, i) => zip.file(names[i], f));
    voices.forEach((v, i) => v && zip.file(`${label(order.letters[i])} - read by Father Christmas.mp3`, v));
    zip.file("Read me first.txt", `${child.name}'s pack from ${SHOP}\r\n\r\n1. Print the letter on A4. In the print box choose "Actual size" and switch on "Background graphics" if you see it.\r\n2. Print "Envelope to cut out", cut out the pieces and follow the steps on that page.\r\n3. The Nice List certificate is for the fridge, the bedroom wall or the memory box.\r\n${order.voice ? "4. The MP3 is Father Christmas reading the letter. Play it any time, even without the internet.\r\n" : ""}\r\nAnything not right? Write to ${CONTACT} and we will put it right.\r\n`);
    const data = await zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
    if (hasBlob) { const b = await put(`${key}/North-Pole-pack-for-${safe}.zip`, data, { access: "public", contentType: "application/zip", addRandomSuffix: true }); return NextResponse.redirect(b.downloadUrl || b.url, 302); }
    return new NextResponse(data, { headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="North-Pole-pack-for-${safe}.zip"`, "cache-control": "private, no-store" } });
  } catch (e) { console.error(e); return new NextResponse("We could not make the pack just now. Please try again in a moment.", { status: 500 }); }
}
