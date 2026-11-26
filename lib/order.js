// Shared by the order form, the checkout, the letter page and the voice.
export const SHOP = "The North Pole Post Office";

export const TIERS = {
  letter: { name: "The Letter", price: 599, blurb: "A personalised letter from Father Christmas as a print-ready PDF and image.", letters: ["classic"], voice: false, choose: true },
  read: { name: "The Letter, Read by Father Christmas", price: 999, blurb: "The letter, plus a private page where the envelope opens and Father Christmas reads it aloud.", letters: ["classic"], voice: true, choose: true },
  full: { name: "The Full Christmas", price: 1499, blurb: "Two letters, both read aloud: one for December and one left on Christmas Eve.", letters: ["classic", "eve"], voice: true, choose: false },
};
export const EXTRA_CHILD = 499;
export const MAX_CHILDREN = 4;

export const LETTERS = {
  classic: {
    title: "A letter before Christmas",
    date: "The First of December, {year}",
    postmark: "1 DEC",
    salute: "My dear {name},",
    body: [
      "The snow is falling thick and soft outside my study window this evening, the fire is lit, and Mrs Christmas has just brought in a pot of tea — which makes this the very best moment of my day to sit down and write to you.",
      "I have had your name in front of me a good deal this year. The elves who keep the Great Book tell me that you {achievement}, and I do not mind admitting that I clapped my hands when I heard it. That took courage, and a fair bit of trying again, I should think. Well done indeed.",
      "I am told, too, that you have been {goodAt}. That matters more than you may know. Kindness is the thing I look for first, long before tidy bedrooms, and at {age} years old you have a great deal of it.",
      "Now, to the matter of your Christmas wish. Your hope for {wish} has reached me safely, and I have made a note of it in my own hand. I can make no promises — the sleigh is only so large — but I shall see what can be done.",
      "On Christmas Eve I shall be flying over {town} some time after midnight. Do be fast asleep, won’t you? The reindeer are shy creatures. And if you{andSibling} should think to leave out a carrot or two, I know of eight who would be most obliged.",
    ],
    close: "Until then, I remain, with love and every good wish for Christmas,",
    elf: ["Sorted, sealed & sent with care by Pip Tinseltoe, Post Room Elf (2nd class).", "P.P.S. — Comet sneezed on the first copy. This is the second. Sorry!"],
  },
  eve: {
    title: "The Christmas Eve letter",
    date: "Christmas Eve, {year} — a little after midnight",
    postmark: "24 DEC",
    salute: "My dear {name},",
    body: [
      "I am writing this by the light of your Christmas tree, very quietly, so as not to wake you. It is a little after midnight in {town}, the reindeer are waiting on the roof, and I have a great many chimneys still to visit — but I could not leave without a word.",
      "First, thank you. Whatever was left out for me has been gratefully received, and the reindeer made very short work of their share.",
      "Second, I wanted you to know that this year has not gone unnoticed. I know that you {achievement}, and that you have been {goodAt}. A year like that deserves to be seen, and I have seen it.",
      "As for {wish} — I shall say nothing at all. Some things are far better found out in the morning.",
      "Now I must be away. There is snow coming in over the North Sea and Dasher does not care to be kept waiting. Sleep well, {name}. Be kind, be brave, and remember that at {age} you have a great deal of Christmas still ahead of you.",
    ],
    close: "Yours, until next year, with my love,",
    elf: ["Left by hand at this address by F.C. himself. Copy filed at the North Pole by Pip Tinseltoe, Post Room Elf (2nd class).", "One crumb found on original."],
  },
};

export const FIELDS = [
  { key: "name", label: "Child’s first name", max: 24, required: true, placeholder: "Matilda" },
  { key: "age", label: "Age, in words", max: 16, required: true, placeholder: "six" },
  { key: "town", label: "Town or village", max: 32, required: true, placeholder: "Ludlow" },
  { key: "achievement", label: "Something they achieved this year", hint: "Finishes the sentence “…tell me that you ___”", max: 100, required: true, placeholder: "learnt to ride your bicycle without stabilisers", area: true },
  { key: "goodAt", label: "Something they have been good at", hint: "Finishes the sentence “…you have been ___”", max: 80, required: true, placeholder: "wonderfully kind to your little brother", area: true },
  { key: "wish", label: "Their Christmas wish", hint: "Finishes the sentence “Your hope for ___”", max: 60, required: true, placeholder: "a wooden train set" },
  { key: "sibling", label: "Brother or sister’s name (optional)", max: 30, placeholder: "Arthur" },
  { key: "ps", label: "A handwritten P.S. from Father Christmas (optional)", max: 110, placeholder: "Do give Biscuit a pat from me. I have not forgotten dogs.", area: true },
  { key: "say", label: "How is the name said? (optional)", hint: "Only for unusual names, so the voice gets it right. Example: “Neev” for Niamh.", max: 30, placeholder: "" },
];

export const SAMPLE = { name: "Martha", age: "seven", town: "Hillmorton", achievement: "swam a whole length of the pool without stopping", goodAt: "a brilliant sister to Maisie", wish: "a pair of roller skates", sibling: "Maisie", ps: "Hillmorton looks very fine from above in the snow. I shall wave as I pass.", say: "" };

const clean = (s, max) => String(s ?? "").replace(/[\u0000-\u001f<>{}]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
export function cleanChild(c) { const o = {}; for (const f of FIELDS) o[f.key] = clean(c?.[f.key], f.max); return o; }
export function childErrors(c) { return FIELDS.filter((f) => f.required && !c[f.key]).map((f) => f.label); }

export function fill(text, c, year, spoken = false) {
  return text.replace(/\{(\w+)\}/g, (m, k) => {
    if (k === "andSibling") return c.sibling ? " and " + c.sibling : "";
    if (k === "year") return String(year);
    if (k === "name" && spoken && c.say) return c.say;
    return c[k] || (spoken ? "" : `[${k}]`);
  });
}

// Everything on the page that Father Christmas reads aloud, as blocks of words.
export function letterBlocks(kind, c, year) {
  const L = LETTERS[kind] || LETTERS.classic;
  const blocks = [{ type: "salute", text: fill(L.salute, c, year) }, ...L.body.map((p) => ({ type: "p", text: fill(p, c, year) })), { type: "close", text: fill(L.close, c, year) }];
  if (c.ps) blocks.push({ type: "ps", text: "P.S. " + c.ps });
  return blocks;
}
export function spokenText(kind, c, year) {
  const L = LETTERS[kind] || LETTERS.classic;
  // He speaks a short welcome before he begins to read; it is not written on the page.
  const hello = `[chuckles warmly] Ho, ho, ho! Hello, ${c.say || c.name}. It's Father Christmas here, at the North Pole. I've written you a letter, and I thought I'd read it to you myself.`;
  const parts = [hello, fill(L.salute, c, year, true), ...L.body.map((p) => fill(p, c, year, true)), fill(L.close, c, year, true), "Father Christmas."];
  if (c.ps) parts.push("P.S. " + c.ps);
  return parts.join("\n\n");
}

const roman = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");
export function register(c, year) { let h = 0; for (const ch of c.name + c.town) h = (h * 31 + ch.charCodeAt(0)) % 8999; return { vol: roman(year), folio: "Nº " + (1000 + h) }; }

export function priceFor(tier, nChildren) { return TIERS[tier].price + EXTRA_CHILD * Math.max(0, nChildren - 1); }

// Orders live in the Stripe Checkout Session metadata: no separate database to run or secure.
export function toMetadata(order) {
  const m = { tier: order.tier, kind: order.kind, year: String(order.year), n: String(order.children.length) };
  order.children.forEach((c, i) => { const a = FIELDS.map((f) => c[f.key]); m["c" + i + "a"] = JSON.stringify(a.slice(0, 6)); m["c" + i + "b"] = JSON.stringify(a.slice(6)); });
  return m;
}
export function fromMetadata(m) {
  if (!m?.tier || !TIERS[m.tier]) return null;
  const children = [];
  for (let i = 0; i < Number(m.n || 0); i++) { try { const a = [...JSON.parse(m["c" + i + "a"]), ...JSON.parse(m["c" + i + "b"])]; const c = {}; FIELDS.forEach((f, j) => (c[f.key] = a[j] || "")); children.push(c); } catch { } }
  const letters = m.tier === "full" ? ["classic", "eve"] : [m.kind === "eve" ? "eve" : "classic"];
  return { tier: m.tier, kind: m.kind, year: Number(m.year) || new Date().getFullYear(), children, letters, voice: TIERS[m.tier].voice };
}
