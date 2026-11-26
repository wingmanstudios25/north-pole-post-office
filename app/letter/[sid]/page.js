import Link from "next/link";
import { getOrder } from "@/lib/server";
import { SHOP } from "@/lib/order";
import Experience from "@/components/Experience";
import FilmExperience from "@/components/FilmExperience";
import { FILMS, hasFilm } from "@/lib/film";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your letter from Father Christmas", robots: { index: false, follow: false } };

export default async function LetterPage({ params, searchParams }) {
  const { sid } = await params; const q = await searchParams;
  const order = await getOrder(sid);
  if (!order) return (<div className="wrap" style={{ maxWidth: 640, padding: "80px 22px" }}>
    <h1 style={{ fontStyle: "italic" }}>We can’t find that letter yet.</h1>
    <p>If you have just paid, wait a few seconds and refresh this page. If the link came from an email, check it was copied in full. Still stuck? Reply to your order email and we will put it right.</p>
    <Link className="btn" href="/">Back to {SHOP}</Link></div>);
  const c = Math.min(Math.max(parseInt(q.c) || 0, 0), order.children.length - 1);
  const k = order.letters.includes(q.k) ? q.k : order.letters[0];
  if (hasFilm() && q.plain !== "1") return <FilmExperience sid={sid} order={{ ...order, email: undefined }} c={c} k={k} films={FILMS} />;
  return <Experience sid={sid} order={{ ...order, email: undefined }} c={c} k={k} povVideo={process.env.NEXT_PUBLIC_POV_VIDEO || ""} />;
}
