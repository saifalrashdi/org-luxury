# Org Luxury — Rare Watches & Jewelry

A complete bilingual (English / العربي) e-commerce boutique for a dealers-run
house of rare watches and jewelry. No build step, no frameworks, no external
paid services — just Node.js + Express 4 + better-sqlite3 and a hand-written
vanilla JS storefront with hash routing.

## Features

**Storefront**
- Home (serif hero, marquee strip, featured pieces, brand strip), Shop with
  category filters, individual product pages, About (family story, EN + AR)
- Fully bilingual EN/AR with عربي/EN toggle — every storefront string
  translated, full RTL layout (Amiri font, mirrored drawer/badges/arrows),
  language remembered in localStorage
- Live stock: "Only X left" badges, Out of stock state, and an
  "I'm interested — notify me" flow that saves name + contact for the admin
- Browser cart (localStorage) + guest checkout — no accounts
- Delivery areas: UAE emirates grouped under "United Arab Emirates", plus
  Saudi Arabia / Kuwait / Qatar / Bahrain / Oman under "Other GCC countries".
  Each area maps to a shipping zone (abudhabi / emirates / gcc) whose fee is
  read live from the database; Subtotal / Delivery / Total update live
- Payment method cards: Cash on Delivery, Apple Pay, VISA card. Honest flow:
  nothing is charged — card orders say a secure payment link arrives via
  WhatsApp. Newsletter tick-box recorded on the order
- Order confirmation page + WhatsApp click-to-chat link
- Floating chat assistant on every page: bilingual, rule-based (no AI API),
  answers delivery fees (live from the API), payments, order status, stock
  interest, brand story, language switching — and searches the live catalog
  with quick-reply chips, typing indicator and a polite WhatsApp fallback

**Admin panel** at `/#/admin` (deep-linkable tabs: `#/admin/orders`,
`#/admin/inventory`, `#/admin/interest`, `#/admin/shipping`)
- Login with username/password, HMAC-SHA256 signed httpOnly cookie session,
  logout, session check
- Orders: full detail + status flow pending → processing → completed /
  cancelled. Stock is deducted when an order is marked completed and restored
  if a completed order is cancelled
- Inventory: full product CRUD with photo upload (base64 → saved to
  `public/images/products`), hide/show, featured flag. Delete is blocked with
  a clear message if the piece appears in past orders — hide it instead
- Interest: customers waiting on out-of-stock pieces, grouped by product
- Shipping: editable fees in AED for the three zones, applied instantly at
  checkout (0 = free delivery)

## Run locally

```bash
npm install
npm start          # http://localhost:3000
```

First run auto-creates `data/orglux.db`, seeds ~20 products and the default
shipping fees (15 / 30 / 80 AED).

- Admin: `/#/admin` — default `admin` / `jiwan2026` (override via env vars)

## Deploy to Render (free plan, auto-deploy on push)

1. Push this folder to a GitHub repository.
2. Render dashboard → **New → Blueprint** → connect the repo. Render reads
   `render.yaml` and provisions the web service (free plan, Node 22 via
   `engines` + `NODE_VERSION`).
3. In the service's **Environment** tab, set:
   - `ADMIN_PASSWORD` — change it from the default!
   - `ADMIN_USERNAME` (optional, default `admin`)
   - `SESSION_SECRET` — any long random string (recommended)
   - `WHATSAPP_NUMBER` — digits only, international format, e.g. `9715XXXXXXX`
4. Every push to the repo auto-deploys.

> **Free-plan note:** Render's free tier has no persistent disk, so the SQLite
> file and any uploaded product photos reset on each redeploy/restart. Orders
> placed stay live until the next deploy. To keep data permanently, add a
> Render Disk (paid) and set `DATA_DIR=/var/data` — the app already honors
> `DATA_DIR`.

## Environment variables

| Var              | Default        | Purpose                                |
|------------------|----------------|----------------------------------------|
| `PORT`           | `3000`         | HTTP port (Render sets its own)        |
| `ADMIN_USERNAME` | `admin`        | Admin login                            |
| `ADMIN_PASSWORD` | `jiwan2026`    | Admin login — change in production     |
| `SESSION_SECRET` | derived        | HMAC key for admin session cookies     |
| `WHATSAPP_NUMBER`| `971500000000` | wa.me click-to-chat number (digits)    |
| `DATA_DIR`       | `./data`       | SQLite file location                   |

## Structure

```
server.js            Express app: public API, admin API, auth, uploads
db.js                SQLite schema, lightweight migrations, seed data
render.yaml          Render Blueprint (free plan, auto-deploy)
package.json         engines pinned to Node 22.x (better-sqlite3 prebuilds)
public/
  index.html         single-page shell
  css/style.css      vintage editorial design system (cream/espresso/terracotta)
  js/app.js          i18n (EN/AR), hash router, storefront, cart, checkout
  js/admin.js        back office: orders / inventory / interest / shipping
  js/chatbot.js      bilingual rule-based concierge
  images/            hero + 20 seeded product photographs
data/                auto-created SQLite database (gitignored)
```

## Notes

- Prices can be set per-product in different currencies (AED, USD, …); order
  totals are computed server-side in AED at fixed indicative rates (see
  `FX_TO_AED` in `db.js`) — no external rate APIs.
- All inputs are validated server-side; order placement runs in a transaction;
  JSON body limit is 12 MB for photo uploads; errors surface as toasts.
