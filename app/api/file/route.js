import { NextResponse } from "next/server";
import { getOrder } from "@/lib/server";
export const maxDuration = 60;

// Renders the A4 sheet in a headless browser and returns it as a print-ready PDF or a 300dpi PNG.
export async function GET(req) {
  const u = new URL(req.url), q = u.searchParams, sid = q.get("sid") || "";
  const order = await getOrder(sid);
  if (!order) return new NextResponse("Not found", { status: 404 });
  const c = Math.min(Math.max(parseInt(q.get("c")) || 0, 0), order.children.length - 1);
  const k = order.letters.includes(q.get("k")) ? q.get("k") : order.letters[0];
  const type = q.get("type") === "png" ? "png" : "pdf";
  const puppeteer = (await import("puppeteer-core")).default;
  let browser;
  try {
    if (process.env.CHROME_PATH) browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] });
    else { const chromium = (await import("@sparticuz/chromium")).default; browser = await puppeteer.launch({ args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }), executablePath: await chromium.executablePath(), headless: "shell" }); }
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 3.125 });
    await page.goto(`${u.origin}/letter/${encodeURIComponent(sid)}/sheet?c=${c}&k=${k}${q.get("paper") === "plain" ? "&paper=plain" : ""}`, { waitUntil: "networkidle0", timeout: 45000 });
    await page.waitForSelector(".lt-letter[data-fit]"); await page.evaluate(() => document.fonts.ready);
    const data = type === "pdf" ? await page.pdf({ preferCSSPageSize: true, printBackground: true }) : await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 794, height: 1123 } });
    const name = `Letter-from-Father-Christmas-${order.children[c].name.replace(/[^A-Za-z0-9]+/g, "-") || "child"}${k === "eve" ? "-Christmas-Eve" : ""}.${type}`;
    return new NextResponse(data, { headers: { "content-type": type === "pdf" ? "application/pdf" : "image/png", "content-disposition": `attachment; filename="${name}"`, "cache-control": "private, no-store" } });
  } catch (e) { console.error(e); return new NextResponse("We could not make the file just now. Please try again in a moment." + (order.sample && q.get("debug") ? "\n" + String(e?.message || e).slice(0, 600) : ""), { status: 500 }); }
  finally { await browser?.close(); }
}
