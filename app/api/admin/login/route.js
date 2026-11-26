import { NextResponse } from "next/server";
import { COOKIE, token, same } from "@/lib/admin";
export async function POST(req) {
  const form = await req.formData(); const t = token(), url = new URL("/admin", req.url);
  if (form.get("logout")) { const r = NextResponse.redirect(url, 303); r.cookies.delete(COOKIE); return r; }
  if (!t || !same(String(form.get("password") || ""), process.env.ADMIN_PASSWORD)) { await new Promise((r) => setTimeout(r, 900)); url.searchParams.set("wrong", "1"); return NextResponse.redirect(url, 303); }
  const r = NextResponse.redirect(url, 303);
  r.cookies.set(COOKIE, t, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return r;
}
