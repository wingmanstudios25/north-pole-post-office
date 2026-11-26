// Downloads sold on their own in the shop. Add a product here and put its file in /public under the
// hard-to-guess folder named in `file`. The download link is only shown to someone who has paid.
export const PRODUCTS = [
  { id: "christmas-eve", name: "Christmas Eve Magic Pack", price: 499, pages: 21, cover: "/art/cover-eve.jpg", peek: ["/art/pv-eve-1.jpg", "/art/pv-eve-2.jpg", "/art/pv-eve-3.jpg", "/art/pv-eve-4.jpg"], file: "/dl-df9f28129c14912e88/Christmas-Eve-Magic-Pack.pdf",
    blurb: "A little North Pole magic for the big night, to print and do together before bed.",
    inside: ["A letter from Santa and a Nice List certificate to fill in", "Christmas Eve checklist, a note to Santa and a “please stop here” door hanger", "Six North Pole colouring pages", "Hot chocolate and cookie recipes, a snack mat and a bedtime poem", "Christmas morning treasure hunt and a delivery note from Santa"] },
  { id: "christmas-day", name: "Christmas Day Fun Pack", price: 499, pages: 21, cover: "/art/cover-day.jpg", peek: ["/art/pv-day-1.jpg", "/art/pv-day-2.jpg", "/art/pv-day-3.jpg", "/art/pv-day-4.jpg"], file: "/dl-df9f28129c14912e88/Christmas-Day-Fun-Pack.pdf",
    blurb: "Games and activities for the whole family, for after the presents and before the pudding.",
    inside: ["The Big Christmas Quiz with answer sheet", "Christmas bingo with eight cards", "48 charades cards and a Who Am I game", "Scavenger hunt, emoji quiz, jokes and drawing challenges", "Place cards, paper chains, tree decorations and a memories page"] },
  { id: "merry-mischief", name: "Merry Mischief Elf Idea Pack", price: 299, pages: 7, cover: "/art/cover-elf.jpg", peek: ["/art/pv-elf-1.jpg", "/art/pv-elf-2.jpg"], file: "/dl-df9f28129c14912e88/Merry-Mischief-Elf-Idea-Pack.pdf",
    blurb: "A grown-ups' guide: 24 days of North Pole elf antics, one ready-made idea for every night of December.",
    inside: ["24 elf set-ups, one for each night from 1 December to Christmas Eve", "A picture and a one-line how-to for every idea", "Uses things already in the house: spoons, socks, flour, cushions and toys", "Little notes to leave beside the elf", "A North Pole return ticket and a Christmas Eve goodbye to finish"] },
];
export const product = (id) => PRODUCTS.find((p) => p.id === id);
// The packs bought in one checkout (stored on the Stripe session as a comma-separated list).
export const packsOf = (metadata) => String((metadata?.type === "pack" ? metadata.ids || metadata.id : metadata?.packs) || "").split(",").map(product).filter(Boolean);
