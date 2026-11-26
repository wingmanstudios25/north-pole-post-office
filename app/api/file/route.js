import { NextResponse } from "next/server";
import { getOrder } from "@/lib/server";
import { renderSheets } from "@/lib/render";
export const maxDuration = 60;

// One sheet as a print-ready PDF or a 300dpi PNG.
export async function GET(req) {
  const u = new URL(req.url), q = u.searchParams, sid = q.get("sid") || "";
  const order = await getOrder(sid);
  if (!order) return new NextResponse("Not found", { status: 404 });
  const c = Math.min(Math.max(parseInt(q.get("c")) || 0, 0), order.children.length - 1);
  const k = order.letters.includes(q.get("k")) ? q.get("k") : order.letters[0];
  const type = q.get("type") === "png" ? "png" : "pdf";
  try {
    const [data] = await renderSheets(u.origin, sid, [{ query: `c=${c}&k=${k}${q.get("paper") === "plain" ? "&paper=plain" : ""}`, type }]);
    const name = `Letter-from-Father-Christmas-${order.children[c].name.replace(/[^A-Za-z0-9]+/g, "-") || "child"}${k === "eve" ? "-Christmas-Eve" : ""}.${type}`;
    return new NextResponse(data, { headers: { "content-type": type === "pdf" ? "application/pdf" : "image/png", "content-disposition": `attachment; filename="${name}"`, "cache-control": "private, no-store" } });
  } catch (e) { console.error(e); return new NextResponse("We could not make the file just now. Please try again in a moment.", { status: 500 }); }
}
