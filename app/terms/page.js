import Link from "next/link";
import Nav from "@/components/Nav";
import { SHOP, BUSINESS, CONTACT, TIERS, EXTRA_CHILD } from "@/lib/order";
export const metadata = { title: "Terms and refunds — " + SHOP };
const gbp = (p) => "£" + (p / 100).toFixed(2);
export default function Terms() {
  return (<><Nav /><div className="wrap" style={{ maxWidth: 720, paddingBottom: 80, paddingTop: 36 }}>
    <h1 style={{ fontStyle: "italic", fontSize: "2.6rem" }}>Terms and refunds</h1>
    <p><b>What you are buying.</b> A personalised digital letter from Father Christmas. Depending on the option you choose, you receive a print-ready PDF and image, and a private web page where the letter is opened and read aloud. Nothing is posted to you.</p>
    <p><b>Prices.</b> {Object.values(TIERS).map((t) => `${t.name} ${gbp(t.price)}`).join("; ")}. Each extra child on the same order is {gbp(EXTRA_CHILD)}. Prices are in pounds sterling and are charged once, at checkout.</p>
    <p><b>Delivery.</b> Your letter is made from the details you type and is delivered straight after payment, on screen and by a link sent to your email address. Please check names and spellings before you pay: the letter says exactly what you enter.</p>
    <p><b>Cancelling.</b> You normally have 14 days to cancel an online purchase. Because your letter is personalised and you ask us at checkout to deliver it immediately, that right ends once the letter has been delivered.</p>
    <p><b>If something is wrong.</b> If your letter has a fault, does not arrive, or you made a mistake in the details, write to <a href={"mailto:" + CONTACT}>{CONTACT}</a> within 14 days of ordering. We will correct and reissue it, or refund you if we cannot put it right.</p>
    <p><b>How long your letter is available.</b> Your private page and downloads are available for at least 60 days from the date of purchase. Download the PDF and image if you would like to keep them for longer.</p>
    <p><b>Personal use.</b> The letter is for your own family’s private use and may not be resold.</p>
    <p><b>Who we are.</b> {SHOP} is operated by {BUSINESS}. Contact: <a href={"mailto:" + CONTACT}>{CONTACT}</a>. These terms are governed by the law of England and Wales.</p>
    <p><Link href="/privacy">Privacy and your child’s details</Link></p>
  </div></>);
}
