// Renders A4 sheets of an order in a headless browser. jobs: [{ query, type: "pdf" | "png" }] -> [Buffer]
export async function renderSheets(origin, sid, jobs) {
  const puppeteer = (await import("puppeteer-core")).default;
  let browser;
  try {
    if (process.env.CHROME_PATH) browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] });
    else { const chromium = (await import("@sparticuz/chromium")).default; browser = await puppeteer.launch({ args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }), executablePath: await chromium.executablePath(), headless: "shell" }); }
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 3.125 });
    const out = [];
    for (const job of jobs) {
      await page.goto(`${origin}/letter/${encodeURIComponent(sid)}/sheet?${job.query}`, { waitUntil: "networkidle0", timeout: 45000 });
      await page.waitForSelector(".lt-letter[data-fit], [data-ready]"); await page.evaluate(() => document.fonts.ready);
      out.push(Buffer.from(job.type === "pdf" ? await page.pdf({ preferCSSPageSize: true, printBackground: true }) : await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 794, height: 1123 } })));
    }
    return out;
  } finally { await browser?.close(); }
}
