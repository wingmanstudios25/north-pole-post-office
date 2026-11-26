import "./globals.css";
import "./letter.css";
import { SHOP } from "@/lib/order";
export const metadata = { title: SHOP + " — a real letter from Father Christmas", description: "A personalised letter from Father Christmas, written to your child, sealed at the North Pole and read aloud by the man himself." };
export const viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({ children }) {
  return (<html lang="en-GB"><head><link rel="stylesheet" href="/fonts.css" /><link rel="preload" href="/art/paper.jpg" as="image" /></head><body>{children}</body></html>);
}
