"use client";
import { useState } from "react";

const gbp = (p) => "£" + ((p || 0) / 100).toFixed(2);
const when = (t) => new Date(t).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminOrders({ orders, more, last, email, problem }) {
  const [find, setFind] = useState("");
  const [note, setNote] = useState({});
  const [busy, setBusy] = useState("");
  const f = find.trim().toLowerCase();
  const shown = orders.filter((o) => !f || o.email.toLowerCase().includes(f) || o.children.some((c) => (c.name + " " + c.town).toLowerCase().includes(f)));
  const link = (sid) => `${location.origin}/${orders.find((x) => x.sid === sid)?.pack ? "download" : "letter"}/${sid}`;
  async function resend(o) {
    const to = prompt("Send the letter link to this address:", o.email); if (!to) return;
    setBusy(o.sid);
    try { const r = await fetch("/api/admin/resend", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sid: o.sid, to }) }); const j = await r.json(); setNote((n) => ({ ...n, [o.sid]: j.ok ? "Sent to " + j.to : "Not sent. " + (j.reason || "") })); }
    catch { setNote((n) => ({ ...n, [o.sid]: "Not sent. Check your connection and try again." })); }
    setBusy("");
  }
  async function copy(o) { try { await navigator.clipboard.writeText(link(o.sid)); setNote((n) => ({ ...n, [o.sid]: "Link copied" })); } catch { prompt("Copy this link:", link(o.sid)); } }
  const live = orders.filter((o) => !o.test), total = live.reduce((a, o) => a + (o.amount || 0), 0);
  return (
    <div className="wrap admin">
      <div className="admin-top"><h1>Orders</h1><form method="post" action="/api/admin/login"><button className="btn ghost small" name="logout" value="1">Sign out</button></form></div>
      {problem && <p className="err" role="alert">{problem}</p>}
      <p className="lead">{live.length} paid {live.length === 1 ? "order" : "orders"} on this page, {gbp(total)} in total{orders.length > live.length ? `, plus ${orders.length - live.length} test ${orders.length - live.length === 1 ? "order" : "orders"}` : ""}.</p>
      <div className="admin-find">
        <input type="text" placeholder="Find by child’s name, town or email" value={find} onChange={(e) => setFind(e.target.value)} aria-label="Find an order on this page" />
        <form method="get"><input type="text" name="email" defaultValue={email} placeholder="Search all orders by exact email" aria-label="Search all orders by exact email" /><button className="btn ghost small">Search</button>{email && <a className="btn ghost small" href="/admin">Clear</a>}</form>
      </div>
      {shown.length === 0 ? <p>{orders.length ? "No orders on this page match that search." : email ? "No paid orders for that email address." : "No paid orders yet. They will appear here as soon as someone buys a letter."}</p> : (
        <div className="admin-list">
          {shown.map((o) => (
            <div className="admin-row" key={o.sid}>
              <div><b>{o.children.map((c) => c.name).join(", ") || "Unknown"}</b>{o.test && <span className="tag-test">Test</span>}<br /><span className="eg">{o.children.map((c) => c.town).filter(Boolean).join(", ")}</span></div>
              <div>{o.email || "No email"}<br /><span className="eg">{when(o.when)}</span></div>
              <div>{o.tier}<br /><span className="eg">{gbp(o.amount)}</span></div>
              <div className="admin-acts">
                <a className="btn ghost small" href={(o.pack ? "/download/" : "/letter/") + o.sid} target="_blank" rel="noreferrer">{o.pack ? "Open download" : "Open letter"}</a>
                <button className="btn ghost small" onClick={() => copy(o)}>Copy link</button>
                <button className="btn small" disabled={busy === o.sid} onClick={() => resend(o)}>{busy === o.sid ? "Sending…" : "Resend email"}</button>
                {note[o.sid] && <span className="eg" role="status">{note[o.sid]}</span>}
              </div>
            </div>))}
        </div>)}
      {more && <p><a className="btn ghost" href={"/admin?after=" + last + (email ? "&email=" + encodeURIComponent(email) : "")}>Show older orders</a></p>}
    </div>
  );
}
