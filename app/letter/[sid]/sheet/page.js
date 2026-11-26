import { notFound } from "next/navigation";
import { getOrder } from "@/lib/server";
import Letter from "@/components/Letter";
import { PrintEnvelope, Certificate } from "@/components/Extras";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
// The bare A4 sheet. Used to produce the PDF and the image, and for printing.
export default async function SheetPage({ params, searchParams }) {
  const { sid } = await params; const q = await searchParams;
  const order = await getOrder(sid); if (!order) notFound();
  const c = Math.min(Math.max(parseInt(q.c) || 0, 0), order.children.length - 1);
  const k = order.letters.includes(q.k) ? q.k : order.letters[0];
  return (<><style>{`@page{size:A4;margin:0}html,body{background:#fff!important;margin:0}`}</style>
    {q.doc === "envelope" ? <div data-ready="1"><PrintEnvelope child={order.children[c]} /></div> : q.doc === "certificate" ? <div data-ready="1"><Certificate child={order.children[c]} year={order.year} /></div>
      : <Letter child={order.children[c]} kind={k} year={order.year} plain={q.paper === "plain"} />}</>);
}
