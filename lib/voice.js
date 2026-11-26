import { createHash } from "crypto";
import { put, list } from "@vercel/blob";
import { spokenText } from "./order";
import sampleVoice from "./sampleVoice.json";

const VOICE = () => process.env.ELEVENLABS_VOICE_ID || "uDsPstFWFBUXjIBimV7s"; // Mr. Claus – The Classic Jolly Santa
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const find = async (prefix, ext) => (await list({ prefix })).blobs.find((b) => b.pathname.endsWith(ext));

// Returns { url, starts } for one letter: the recording and the start time of each written word.
// A letter is recorded once and then reused. If two requests arrive together (the payment signal and
// the customer opening their page), the second waits for the first instead of paying twice.
export async function getOrMakeVoice(order, c, k) {
  const child = order.children[c];
  if (!child || !order.voice) return { error: "No reading with this letter.", status: 404 };
  if (order.sample && sampleVoice.url && k === "classic") return sampleVoice;
  const key = process.env.ELEVENLABS_API_KEY, voiceId = VOICE();
  if (!key) return { error: "Voice not set up.", status: 503 };
  const text = spokenText(k, child, order.year);
  const hash = createHash("sha256").update(voiceId + "|" + text).digest("hex").slice(0, 40);
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  const saved = async () => { const m = await find(`voice/${hash}`, ".json"); if (!m) return null; try { return await (await fetch(m.url)).json(); } catch { return null; } };
  if (hasBlob) {
    const done = await saved(); if (done) return done;
    const lock = await find(`lock/${hash}`, ".txt");
    if (lock && Date.now() - new Date(lock.uploadedAt).getTime() < 90000) {
      for (let i = 0; i < 24; i++) { await sleep(2000); const d = await saved(); if (d) return d; }
    } else await put(`lock/${hash}.txt`, "1", { access: "public", addRandomSuffix: true }).catch(() => { });
  }
  const speak = (model, t) => fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": key, "content-type": "application/json" }, body: JSON.stringify({ text: t, model_id: model }) });
  let r = await speak(process.env.ELEVENLABS_MODEL || "eleven_v4", text);
  if (!r.ok) { console.error("elevenlabs", r.status, await r.text()); r = await speak("eleven_multilingual_v2", text.replace(/\[[^\]]*\]\s*/g, "")); }   // older model: no stage directions
  if (!r.ok) { console.error("elevenlabs", r.status, await r.text()); return { error: "The reading could not be made.", status: 502 }; }
  const j = await r.json(); const al = j.alignment || j.normalized_alignment;
  let starts = [], tokens = [], prevSpace = true;
  al.characters.forEach((ch, i) => { const sp = /\s/.test(ch); if (!sp && prevSpace) { starts.push(Math.round(al.character_start_times_seconds[i] * 100) / 100); tokens.push(""); } if (!sp) tokens[tokens.length - 1] += ch; prevSpace = sp; });
  const from = tokens.findIndex((t, i) => t === "My" && tokens[i + 1] === "dear");   // skip the spoken welcome: highlighting begins at the salutation
  if (from > 0) starts = starts.slice(from);
  if (!hasBlob) return { url: "data:audio/mpeg;base64," + j.audio_base64, starts };
  const audio = await put(`voice/${hash}.mp3`, Buffer.from(j.audio_base64, "base64"), { access: "public", contentType: "audio/mpeg", addRandomSuffix: true });
  const out = { url: audio.url, starts };
  await put(`voice/${hash}.json`, JSON.stringify(out), { access: "public", contentType: "application/json", addRandomSuffix: true });
  return out;
}
