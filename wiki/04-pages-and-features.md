# 4. Pages and features

Every route, what is on it, and the components that do the work. All in `App.jsx` unless said otherwise.

## Routes

| Route | Page | What is on it |
|---|---|---|
| `/` | Home | Slideshow hero with the mark and four facts; the drag-to-turn Raj Green slab; editions; this season's palette; offers; the builder teaser; sourcing declaration; families; guides; projects strip; newsletter; reviews |
| `/shop` | Shop | Every range; tabs by category and Offers; filter chips by colour, size and finish (in the address, so a filtered view can be shared); search from the header or menu via `?q=`; editor's picks get the wide card |
| `/product/:id` | Product | Gallery with the 3D slide; unit table; the order box; See it in 3D; the story (features, in the pack, laying, care, honesty note); Finish the job; pairs with; FAQ |
| `/essentials` | Essentials | The fifteen warehouse lines, priced at the counter, Ask for a price |
| `/collections` | Collections | The editions and families as a browsing page |
| `/build` | Build your patio | Pick a stone, type width and length, pick a pattern, tick the allowance, see packs and price, save the design |
| `/guides`, `/guide/:slug` | Guides | Nine guides with drawings: porcelain or sandstone, laying sandstone, laying 20 mm porcelain, how many packs, sealing, cleaning, why slabs vary, the mixed pack, delivery day |
| `/projects` | Projects | 23 of the yard's own photographs of laid stone, captioned by what is visible |
| `/trade` | Trade | A typical trade offer and a form; the wording is the yard's to confirm |
| `/samples` | Samples | £5 pieces of any range |
| `/about`, `/faq`, `/contact` | | Yard, hours, map, the store's FAQ, the contact form |
| `/cart` | Bag | Lines with coverage, quantities, remove, delivery estimate, delivery-from date, collection |
| `/checkout` | Checkout | Contact, delivery or collection with the calendar, access notes, payment placeholder, summary; stops at the last step with the demo notice |

Every page shows the header (logo, links, search on wide screens, bag, theme), the slide-out menu on narrow screens (with search and "WhatsApp the yard"), and the footer with every contact detail. The floating WhatsApp button appears on every page except checkout.

## The order box (`OrderBox`)

At the top of every product page:

1. **Unit table**: per m², per slab (or "loose slabs by area" on mixed packs), per pack or pallet or box, each with the struck was-price.
2. **By the pack / By the area** toggle. Pack mode has a quantity stepper and, on single-size packs, a loose-slab stepper. Area mode takes m², a tick box for the allowance for cuts (5/10/15/20%), and says exactly what leaves the yard: "1 × 21.60 m² + 9 × 0.54 m² = 26.46 m²".
3. Facts: delivery from the earliest day, free over £500 inside the M25, collection from Mark Road with hours and a map link, the sample button.
4. Add to bag, which is also a sticky bar on phones.

## The calculator (`Calculator`, `AreaRows`, `CutAllowance`)

Several areas (width × length rows), the allowance tick box, and one result line: packs × coverage = m², with loose slabs listed by size for mixed packs. The same `CutAllowance` component is used in the builder and the order box, so the three always offer the same choices.

## Build your patio (`Build`, `Pattern`, `PatternThumb`)

Stone, dimensions, one of four patterns drawn to scale in SVG, allowance, whole packs and price, and a saved-designs list in local storage that can be re-added to the bag.

## See it in 3D (`Stone3D`, `StoneScene.jsx`)

Two modes: one slab turned in the hand, or the stone laid in its pattern with pointed joints (a wall for cladding). Dry or wet. Everything is at true scale: a 22 mm slab is 22 mm thick against a 900 mm face. The face is the product's own texture (page 5) on a physical material that also takes its fine relief from the photograph as a bump map; sandstone and limestone get a cleft, flat-shaded top on top of that. Lighting is neutral with no tone mapping, calibrated so the top face shows the photograph's colour within a few percent, plus a small studio environment (drawn from light panels, no file fetched) for the reflections wet and polished stone need. The environment's share is set at scene level, because the material-level intensity does not scale it in this three.js. Wet is a darker base under a clear coat. The laid field gives each slab its own window on the texture, mirrored and rotated, plus a seeded tone shift (wider for natural stone than porcelain) and a slight height jitter for riven slabs, on a bed coloured as jointing compound. The cladding wall is individual 600 × 150 strips in a running bond, each with its own projection and its own band of the colourway photograph (the photograph is treated as about 1200 × 900 mm of built wall, its bottom edge skipped where the mark sits), so the six colourways build six different walls and the key light casts shadows between courses. The camera rig changes with the mode without remounting the canvas, which is what kept WebGL from losing its context. The wet look is labelled simulated.

## Gallery (`Gallery`)

Every photograph the store has for the range, swipeable, with a full-screen view rendered on the body so the header can never cover its close button. The first slide after the photographs is the turning slab, marked with a 3D badge on its thumbnail.

## Offer pop-up (`OfferPopup`)

Once a week per browser, after nine seconds or when the mouse leaves for the tab bar. Built from the real was/now prices: the biggest saving and the count of ranges on sale. Never on the bag, checkout or builder; a dialog with focus inside it; Escape closes it.

## Checkout calendar (`DayPicker`)

Earliest delivery is three working days out. The customer can keep "earliest" or pick a working day up to sixty days ahead; collection has the same choice with the yard's hours. The chosen day appears in the order confirmation. No slot fees exist because the yard has not stated any.

## Search

The header form on wide screens and the menu form on every screen both go to `/shop?q=`. The shop matches names, families, finishes and the `SEARCH_TAGS` vocabulary.

## Motion and themes

`Motion.jsx` provides reveals, count-ups, the stone marquee and parallax; all stop under the system's reduced-motion setting. The theme button flips `data-theme` on the root and remembers the choice.
