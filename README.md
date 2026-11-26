# The North Pole Post Office

Personalised letters from Father Christmas: order form, Stripe checkout, a private page where the envelope opens and the letter is read aloud, and print-ready PDF/PNG downloads.

## How it works
- **Orders** are stored in the Stripe Checkout Session metadata. There is no separate database.
- **The letter** is `components/Letter.js` + `app/letter.css`. Wording lives in `lib/order.js` (`LETTERS`); prices in `TIERS`.
- **The private page** is `/letter/<checkout session id>`. `/letter/sample` is the public demo.
- **Voice**: `/api/voice` calls ElevenLabs once per letter and caches the audio in Vercel Blob.
- **Downloads**: `/api/file` renders the A4 sheet in headless Chromium.
- **Clean-up**: a daily cron deletes stored audio older than 60 days.

## Environment variables
See `.env.example`. The site runs without any of them (demo mode: no payments, no voice).

## Local
`npm install && npm run dev`. For downloads locally set `CHROME_PATH` to a Chrome binary.
