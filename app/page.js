import Link from "next/link";
import { SHOP, TIERS, EXTRA_CHILD, BUSINESS, CONTACT } from "@/lib/order";
const gbp = (p) => "£" + (p / 100).toFixed(2);
export default function Home() {
  return (
    <div className="wrap">
      <div className="top"><Link className="brand" href="/">{SHOP}</Link><Link className="btn ghost" href="/order">Order a letter</Link></div>
      <section className="hero">
        <div>
          <div className="caps">Office of Father Christmas · The North Pole</div>
          <h1>A real letter from Father Christmas, written to your child.</h1>
          <p>He knows their name, their town, and the thing they worked hardest at this year. Sealed in wax, stamped at the North Pole, and read aloud by the man himself.</p>
          <div className="cta"><Link className="btn" href="/order">Write their letter</Link><Link className="btn ghost" href="/letter/sample">Watch one being opened</Link></div>
        </div>
        <img className="shot" src="/art/sample.jpg" alt="An example letter from Father Christmas on aged cream paper, with a crest, a North Pole stamp and postmark, a signature and a red wax seal." />
      </section>
      <section className="steps">
        <div><div className="caps">One</div><h3>Tell us about them</h3><p>Their name, their town, what they achieved this year and what they are wishing for. It takes about three minutes.</p></div>
        <div><div className="caps">Two</div><h3>The letter is written</h3><p>Their details are set into Father Christmas’s own stationery and entered in the Nice List Register under their own folio number.</p></div>
        <div><div className="caps">Three</div><h3>Open it together</h3><p>Print the letter for the doormat, then watch the envelope open on screen while Father Christmas reads it to them.</p></div>
      </section>
      <section className="tiers">
        {Object.entries(TIERS).map(([k, t]) => (
          <div className={"tier" + (k === "read" ? " best" : "")} key={k}>
            {k === "read" && <div className="caps">Most chosen</div>}
            <h3>{t.name}</h3><div className="price">{gbp(t.price)}</div><p>{t.blurb}</p>
            <Link className={"btn" + (k === "read" ? "" : " ghost")} href={"/order?tier=" + k}>Choose this letter</Link>
          </div>
        ))}
      </section>
      <footer>Each extra child on the same order is {gbp(EXTRA_CHILD)}. Letters are delivered digitally, straight after payment. <Link href="/privacy">Privacy and your child’s details</Link> · <Link href="/terms">Terms and refunds</Link><br />{SHOP} is operated by {BUSINESS} · <a href={"mailto:" + CONTACT}>{CONTACT}</a></footer>
    </div>
  );
}
