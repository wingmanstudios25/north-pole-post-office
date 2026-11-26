import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
// Runs daily (see vercel.json): deletes stored readings older than 60 days.
export async function GET(req) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: true, deleted: 0 });
  const cutoff = Date.now() - 60 * 864e5; let cursor, deleted = 0;
  do { const page = await list({ prefix: "voice/", cursor }); const old = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url); if (old.length) { await del(old); deleted += old.length; } cursor = page.cursor; } while (cursor);
  return NextResponse.json({ ok: true, deleted });
}
