import Link from "next/link";
import Nav from "@/components/Nav";
import { PRODUCTS } from "@/lib/products";
import { SHOP, BUSINESS, CONTACT } from "@/lib/order";
export const metadata = { title: "Christmas packs to download — " + SHOP, description: "Printable Christmas games, quizzes and activities for the whole family. Download straight after payment." };
const gbp = (p) => "£" + (p / 100).toFixed(2);

export default async function Shop({ searchParams }) {
  const q = await searchParams;
  return (<><Nav />
    <div className="wrap shop">
      <h1>Christmas packs to print at home</h1>
      <p className="lead">Games, quizzes and things to make for Christmas Day. Each pack is a PDF you download straight after payment and print on A4 as many times as you like.</p>
      {q.problem && <p className="err" role="alert">{String(q.problem)}</p>}
      {PRODUCTS.length === 0 ? <p>The packs are on their way from the workshop. Please look again soon.</p> : (
        <div className="packs">
          {PRODUCTS.map((p) => (
            <form className="pack" key={p.id} method="post" action="/api/buy">
              <img src={p.cover} alt={"The cover of " + p.name} />
              <div className="pack-in"><h2>{p.name}</h2><p>{p.blurb}</p>
                <ul>{p.inside.map((x) => <li key={x}>{x}</li>)}</ul>
                <p className="fine">{p.pages} pages, A4 PDF</p>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn">Buy and download for {gbp(p.price)}</button></div>
            </form>))}
        </div>)}
      <p className="fine" style={{ marginTop: 40 }}>Looking for a letter from Father Christmas? <Link href="/order">Write their letter</Link>.</p>
    </div>
    <footer><div className="wrap">{SHOP} is operated by {BUSINESS}. <a href={"mailto:" + CONTACT}>{CONTACT}</a><br /><Link href="/privacy">Privacy</Link> &nbsp; <Link href="/terms">Terms and refunds</Link></div></footer></>);
}
