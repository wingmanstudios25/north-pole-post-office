import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { put, list } from "@vercel/blob";
import { getOrder } from "@/lib/server";
import { spokenText } from "@/lib/order";
import sampleVoice from "@/lib/sampleVoice.json";
export const maxDuration = 60;

// Returns { url, starts } : the reading and the start time (seconds) of each spoken word.
export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const order = await getOrder(q.get("sid") || "");
  if (!order || !order.voice) return NextResponse.json({ error: "No reading with this letter." }, { status: 404 });
  const child = order.children[parseInt(q.get("c")) || 0]; const k = order.letters.includes(q.get("k")) ? q.get("k") : order.letters[0];
  if (!child) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (order.sample && sampleVoice.url && k === "classic") return NextResponse.json(sampleVoice);   // the demo letter uses a ready-made recording
  const key = process.env.ELEVENLABS_API_KEY, voiceId = process.env.ELEVENLABS_VOICE_ID || "uDsPstFWFBUXjIBimV7s"; // Mr. Claus – The Classic Jolly Santa
  if (!key || !voiceId) return NextResponse.json({ error: "Voice not set up." }, { status: 503 });
  const text = spokenText(k, child, order.year);
  const hash = createHash("sha256").update(voiceId + "|" + text).digest("hex").slice(0, 40);
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  if (hasBlob) { // made before? reuse it, so a letter is only ever paid for once
    const found = await list({ prefix: `voice/${hash}` });
    const meta = found.blobs.find((b) => b.pathname.endsWith(".json"));
    if (meta) { try { return NextResponse.json(await (await fetch(meta.url)).json()); } catch { } }
  }
  const speak = (model, t) => fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": key, "content-type": "application/json" }, body: JSON.stringify({ text: t, model_id: model }) });
  let r = await speak(process.env.ELEVENLABS_MODEL || "eleven_v4", text);
  if (!r.ok) { console.error("elevenlabs", r.status, await r.text()); r = await speak("eleven_multilingual_v2", text.replace(/\[[^\]]*\]\s*/g, "")); }   // older model: no stage directions
  if (!r.ok) { console.error("elevenlabs", r.status, await r.text()); return NextResponse.json({ error: "The reading could not be made." }, { status: 502 }); }
  const j = await r.json(); const al = j.alignment || j.normalized_alignment;
  let starts = [], tokens = [], prevSpace = true;
  al.characters.forEach((ch, i) => { const sp = /\s/.test(ch); if (!sp && prevSpace) { starts.push(Math.round(al.character_start_times_seconds[i] * 100) / 100); tokens.push(""); } if (!sp) tokens[tokens.length - 1] += ch; prevSpace = sp; });
  const from = tokens.findIndex((t, i) => t === "My" && tokens[i + 1] === "dear");   // skip the spoken welcome: highlighting begins at the salutation
  if (from > 0) starts = starts.slice(from);
  const mp3 = Buffer.from(j.audio_base64, "base64");
  if (!hasBlob) return NextResponse.json({ url: "data:audio/mpeg;base64," + j.audio_base64, starts });
  const audio = await put(`voice/${hash}.mp3`, mp3, { access: "public", contentType: "audio/mpeg", addRandomSuffix: true });
  const out = { url: audio.url, starts };
  await put(`voice/${hash}.json`, JSON.stringify(out), { access: "public", contentType: "application/json", addRandomSuffix: true });
  return NextResponse.json(out);
}
