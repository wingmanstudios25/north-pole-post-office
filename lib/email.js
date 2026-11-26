import { SHOP, BUSINESS, CONTACT, TIERS } from "./order";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const list = (a) => (a.length < 2 ? a[0] : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

// The "your letter has arrived" email, sent through Brevo when Stripe confirms payment.
export function orderEmail(order, link, site) {
  const names = list(order.children.map((c) => esc(c.name)));
  const tier = TIERS[order.tier], many = order.children.length > 1 || order.letters.length > 1;
  const subject = `${list(order.children.map((c) => c.name))}’s letter from Father Christmas has arrived`;
  const tips = [
    order.voice ? "Open it on your own first, with the sound on, so you know what to expect." : "Open it on your own first, so you know what to expect.",
    order.voice ? "When you are ready, watch it together. Father Christmas opens the envelope and reads the letter aloud." : "",
    "Press “Download the full pack” under the letter. It has the letter to print, an envelope to cut out, a Nice List certificate" + (order.voice ? " and the recording." : "."),
    many ? "Each letter has its own button at the bottom of the page." : "",
    "Keep this link to yourself. Anyone who has it can open the letter. It works for 60 days.",
  ].filter(Boolean);
  const html = `<!doctype html><html><body style="margin:0;background:#10201b">
<span style="display:none;max-height:0;overflow:hidden">Open it here. Sealed at the North Pole and ready to read.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#10201b"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#f4ead4;font-family:Georgia,'Times New Roman',serif;color:#2a211a">
<tr><td align="center" style="padding:30px 30px 0"><img src="${site}/art/crest.png" width="110" alt="" style="display:block;border:0">
<div style="margin-top:10px;font-size:13px;letter-spacing:4px;color:#8a1f1f;text-transform:uppercase">Office of Father Christmas</div>
<div style="margin-top:4px;font-size:10px;letter-spacing:3px;color:#6b5638;text-transform:uppercase">The North Pole &middot; Arctic Circle</div>
<div style="margin:16px auto 0;width:220px;border-top:1px solid #a8842f"></div></td></tr>
<tr><td style="padding:26px 38px 6px;font-size:17px;line-height:1.6">
<h1 style="margin:0 0 14px;font-size:27px;line-height:1.25;font-weight:normal;font-style:italic;color:#2a211a">The letter for ${names} has arrived.</h1>
<p style="margin:0 0 20px">Thank you for your order. It has been written, signed, sealed in wax and stamped at the Arctic Circle sorting office, and it is waiting for you here:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 22px"><tr><td style="background:#8a1f1f"><a href="${link}" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-size:18px;font-family:Georgia,serif">Open the letter</a></td></tr></table>
<p style="margin:0 0 8px;font-style:italic;font-size:18px">Before you show them</p>
<ul style="margin:0 0 18px;padding-left:20px">${tips.map((t) => `<li style="margin-bottom:6px">${t}</li>`).join("")}</ul>
<p style="margin:0 0 18px;font-size:15px;color:#4a3b2a">Your order: ${esc(tier.name)}${order.children.length > 1 ? `, for ${order.children.length} children` : ""}.</p>
<p style="margin:0 0 18px">If a name is spelled wrongly, or the letter does not open, reply to this email within 14 days and we will help you put it right.</p>
<p style="margin:0 0 26px">With warm wishes for Christmas,<br><span style="font-style:italic">${SHOP}</span></p></td></tr>
<tr><td style="padding:16px 38px 24px;border-top:1px solid #d9c9a3;font-size:12px;line-height:1.6;color:#6b5638">If the button does not work, copy this address into your browser:<br><a href="${link}" style="color:#8a1f1f;word-break:break-all">${link}</a><br><br>${SHOP} is operated by ${BUSINESS}. Contact: <a href="mailto:${CONTACT}" style="color:#8a1f1f">${CONTACT}</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = `The letter for ${list(order.children.map((c) => c.name))} has arrived.\n\nOpen it here: ${link}\n\n${tips.map((t) => "- " + t).join("\n")}\n\nIf a name is spelled wrongly, or the letter does not open, reply to this email within 14 days and we will help you put it right.\n\n${SHOP}, operated by ${BUSINESS}. ${CONTACT}`;
  return { subject, html, text };
}

// Sends the order email through Brevo. Returns { ok, reason }.
export async function sendOrderEmail(order, sid, to, site) {
  if (!process.env.BREVO_API_KEY) return { ok: false, reason: "Brevo is not connected (BREVO_API_KEY is missing)." };
  if (!to) return { ok: false, reason: "This order has no email address." };
  const from = process.env.EMAIL_FROM || "hello@envisageagency.co.uk";
  const mail = orderEmail(order, `${site}/letter/${sid}`, site);
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ sender: { email: from, name: SHOP }, replyTo: { email: CONTACT }, to: [{ email: to }], subject: mail.subject, htmlContent: mail.html, textContent: mail.text }) });
    if (r.ok) return { ok: true };
    const t = await r.text(); console.error("brevo", r.status, t);
    return { ok: false, reason: `Brevo refused the email (${r.status}). ${t.slice(0, 160)}` };
  } catch (e) { console.error(e); return { ok: false, reason: "Brevo could not be reached." }; }
}

// The download email for a pack bought on its own from the shop.
export async function sendPackEmail(pack, sid, to, site) {
  if (!process.env.BREVO_API_KEY) return { ok: false, reason: "Brevo is not connected (BREVO_API_KEY is missing)." };
  if (!to) return { ok: false, reason: "This order has no email address." };
  const from = process.env.EMAIL_FROM || "hello@envisageagency.co.uk", link = `${site}/download/${sid}`;
  const html = `<!doctype html><html><body style="margin:0;background:#10201b"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#10201b"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#f4ead4;font-family:Georgia,'Times New Roman',serif;color:#2a211a">
<tr><td align="center" style="padding:30px 30px 0"><img src="${site}/art/crest.png" width="100" alt="" style="display:block;border:0"><div style="margin-top:10px;font-size:13px;letter-spacing:4px;color:#8a1f1f;text-transform:uppercase">The North Pole Post Office</div><div style="margin:16px auto 0;width:220px;border-top:1px solid #a8842f"></div></td></tr>
<tr><td style="padding:26px 38px 6px;font-size:17px;line-height:1.6"><h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;font-weight:normal;font-style:italic">Your ${esc(pack.name)} is ready.</h1>
<p style="margin:0 0 20px">Thank you for your order. Download it here, then print the pages you want on A4:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 22px"><tr><td style="background:#8a1f1f"><a href="${link}" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-size:18px;font-family:Georgia,serif">Download your pack</a></td></tr></table>
<p style="margin:0 0 18px">The link is yours to keep. If the file does not open, reply to this email and we will put it right.</p>
<p style="margin:0 0 26px">With warm wishes for Christmas,<br><span style="font-style:italic">${SHOP}</span></p></td></tr>
<tr><td style="padding:16px 38px 24px;border-top:1px solid #d9c9a3;font-size:12px;line-height:1.6;color:#6b5638">If the button does not work, copy this address into your browser:<br><a href="${link}" style="color:#8a1f1f;word-break:break-all">${link}</a><br><br>${SHOP} is operated by ${BUSINESS}. Contact: <a href="mailto:${CONTACT}" style="color:#8a1f1f">${CONTACT}</a></td></tr></table></td></tr></table></body></html>`;
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ sender: { email: from, name: SHOP }, replyTo: { email: CONTACT }, to: [{ email: to }], subject: `Your ${pack.name} is ready to download`, htmlContent: html, textContent: `Your ${pack.name} is ready.\n\nDownload it here: ${link}\n\n${SHOP}, operated by ${BUSINESS}. ${CONTACT}` }) });
    if (r.ok) return { ok: true };
    const t = await r.text(); console.error("brevo", r.status, t); return { ok: false, reason: `Brevo refused the email (${r.status}). ${t.slice(0, 160)}` };
  } catch (e) { console.error(e); return { ok: false, reason: "Brevo could not be reached." }; }
}
