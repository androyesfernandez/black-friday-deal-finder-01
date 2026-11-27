[![black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/androyesfernandez/black-friday-deal-finder-01/rank.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/androyesfernandez/black-friday-deal-finder-01/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)

# DealHunt — Real Black Friday & Cyber Monday Deals 2026

A deal finder of **real, checked** Black Friday and Cyber Monday deals. Every
deal was found and checked by the finder’s maker on **27 November 2026**
(Black Friday): the sale price was read on the store’s own product page, or in
a deals roundup that names the store and the price. Each deal shows its
product, store, a link to it at that store, sale price, usual price, discount,
when the price was checked, where it was read — and an honest verdict on
whether it is really a deal (**NEW LOW**, **STRONG PRICE** or **ROUTINE SALE**).

## What it does

- **Search** across products, brands, stores and categories.
- **Filter** by category, store, minimum discount and verdict.
- **Sort** by biggest discount, best verdict, biggest saving, price or name.
- **Deal pages** (`#/deal/<id>`) with the full facts: both prices, the saving,
  the verdict and its evidence, the check time and the source.
- **Stats strip** up top: deal count, stores, categories, new lows, biggest
  discount and total savings — all computed from the data at load.
- Works on desktop and on a phone, from static files only: no build step, no
  network request, no cookies, no service worker.

## How to run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
```

or serve `app/` with any static HTTP server. Open `app/index.html` in a
browser.

## Layout

- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored make.fun
  library.
- `vendor/makefun-frontend.ts` — the kit’s copy, unchanged.
- `app/index.html` — the page shell (header, toolbar, grid, method footer).
- `app/style.css` — all styling (system fonts only).
- `app/main.js` — bootstrap.
- `app/render.js` — cards, stats, filters and the deal detail view.
- `app/finder.js` — search, filter, sort and discount maths.
- `app/deals.js` — the deals themselves, each with product, brand, store,
  sale and usual price, link, verdict, check time and source.
- `screenshots/` — real renders of the site running in a browser.

## How the deals were checked

Prices were read on 27 November 2026 from the store’s own product page or
from a deals roundup that names the store and the price (PopSci, SooMuch,
DealNews, Marathon Handbook, Garage Gym Reviews, SavingArena, HearSmart,
9to5Toys, The Verge, Durostechx, Product Bible, MiniPCBlogs, 2ndShift,
TheTechHacker, Best Buy’s own sale announcement).
The source and check time are printed on every card. A discount is only ever
the sale price against the usual price the store itself lists. Prices can
change or sell out; the store page is the final word.

## License

MIT — see [LICENSE](LICENSE).
