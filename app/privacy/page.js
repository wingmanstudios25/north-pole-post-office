import Link from "next/link";
import { SHOP } from "@/lib/order";
export const metadata = { title: "Privacy — " + SHOP };
export default function Privacy() {
  return (<div className="wrap" style={{ maxWidth: 720, paddingBottom: 80 }}>
    <div className="top"><Link className="brand" href="/">{SHOP}</Link></div>
    <h1 style={{ fontStyle: "italic", fontSize: "2.6rem" }}>Privacy and your child’s details</h1>
    <p>We ask only for what the letter needs: a first name, an age, a town or village, and the few lines you write about their year. We never ask for a surname, a street address, a school or a photograph.</p>
    <p><b>What we do with it.</b> The details are used to make the letter, the reading and the private page you are sent. They are not used for marketing, not sold and not shared, other than with the services that make the product work: Stripe (payment and order record), ElevenLabs (turns the letter text into the spoken reading) and Vercel (hosts the site and stores the audio file).</p>
    <p><b>Who can see the letter.</b> Only someone with your private link. The link is long and cannot be guessed, but anyone you send it to can open it.</p>
    <p><b>How long we keep it.</b> Stored audio is deleted automatically 60 days after it is made. You can ask us to delete an order sooner at any time.</p>
    <p><b>Your rights.</b> You can ask to see, correct or delete the details you gave us by replying to your order email.</p>
    <p style={{ color: "#b5ab93", fontSize: ".9rem" }}>[Business name, contact email and ICO registration number to be added before launch.]</p>
  </div>);
}
