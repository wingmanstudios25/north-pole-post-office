import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// The private orders page is protected by one password, set in Vercel as ADMIN_PASSWORD.
export const COOKIE = "npo_admin";
export const token = () => (process.env.ADMIN_PASSWORD ? createHash("sha256").update("npo-admin|" + process.env.ADMIN_PASSWORD).digest("hex") : "");
export const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
export async function isAdmin() { const t = token(); if (!t) return false; const c = (await cookies()).get(COOKIE)?.value || ""; return same(c, t); }
