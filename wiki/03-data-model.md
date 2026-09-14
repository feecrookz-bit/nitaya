# 3. Data model

Everything a customer sees about a product comes from three files: `data.js` (the facts), `content.js` (the long copy) and the two photo manifests (page 5). There is no database.

## A product

Each range is one entry in `PRODUCTS`, created by a helper per family (`sand`, `indoor`, and plain `add` for the rest). The fields that matter:

| Field | Example | Source |
|---|---|---|
| `id` | `raj-green` | Ours; it is the address of the product page and the key everywhere else |
| `slug` | `raj-green` or the store's slug | Names the studio render and texture files |
| `name`, `size`, `finish`, `cat` | Raj Green, Mixed patio pack, Riven, sandstone | The store's listing |
| `price`, `was` | 19.50, 22.20 per m² ex VAT | The store's current and struck prices |
| `unit` | per m², per pallet, per box, each | How the store sells it |
| `packing` | see below | The warehouse sheet |
| `cover`, `slabs`, `pack` | 18.19, 60, "18.19 m² per pack · 60 slabs in four sizes" | Computed from `packing` |
| `split` | true | Computed: every pack splits except boxes and cladding |
| `gallery`, `img`, `texture` | file lists | From the manifests, matched by id and slug |
| `content` | features, in the pack, laying, care | `content.js`, by id |

Categories: sandstone, limestone, outdoor (20 and 16 mm porcelain), indoor (8 mm tiles), cladding. Cladding is six products sharing one content block and one packing, one per colourway photograph on the store's listing; their names are a decision for the yard.

## Packing: the one table that drives the maths

`PACKING` in `data.js` holds, per product id, what a pack physically is. Its values come from the "Database Products" tab of the stock tracker sheet and from nowhere else; never type a coverage figure anywhere else.

Two shapes:

- **Mixed** (the four 22 mm sandstone patio packs): sizes with counts and slab areas. 16 × 900 × 600, 16 × 600 × 600, 16 × 600 × 290, 12 × 290 × 290 = 60 slabs, 18.19 m².
- **Fixed** (`fixed(perPack, slabM2, perBox)`): one size. Kandla Grey 900 × 600 is 40 slabs of 0.54 m² = 21.60 m². Black Limestone 38 × 0.36. The 900 × 600 porcelains 40 × 0.54. The 16 mm 600 × 600 pallets 80 slabs in boxes of 2. Indoor 600 × 1200 tiles 64 a pallet in boxes of 2; 600 × 600 Brit Raven 160 in boxes of 4; 300 × 600 tiles 336 in boxes of 6 (Aspire Grey 280 in boxes of 5). Cladding 196 strips in boxes of 7.
- Sinai Pearl is not in the sheet; it is marked `assumed` at 50 slabs of 600 × 600 and listed for the yard to add.

From the table the code sets `cover` (m² per pack or pallet), the unit wording, and `split`. Indoor tiles and cladding are sold by the box, and the box is the unit; the pallet is only the delivery quantity.

## From an area to what leaves the yard

`quantify(product, m2)` is the single function behind the product page's by-the-area mode, the calculator, the builder, the bag and the checkout. It returns whole packs plus loose slabs:

- **Mixed packs**: whole packs, then the remainder made up in the pack's own four sizes by `mixFill`: first in the pack's proportions, then the last bit largest slab first, so the overshoot is never more than one small slab. 55 m² of Autumn Brown is 3 packs + 2 loose slabs = 55.01 m², not 4 packs = 72.76 m². If the loose set would be a whole pack it becomes one.
- **Single-size packs that split** (sandstone 900 × 600, limestone, the porcelains): whole packs plus loose slabs by the slab.
- **Boxes and kits**: whole units, rounded up.

Prices follow: `m2Price` normalises per-pallet prices to per m², `slabPrice` is a slab's share, and `exVat` prices a quantity as packs at the pack price plus loose slabs at the per-m² price. The bag and the checkout total by calling these, so they cannot disagree with the product page.

## Bag line ids

The bag stores line ids and quantities. The id says what the line is:

| Prefix | Meaning |
|---|---|
| `raj-green` | Whole packs of a product |
| `slabs:kandla-grey-900` | Loose slabs of a single-size pack |
| `mix:raj-green:1.1.0.0` | A loose set from a mixed pack, the four counts in the id, unit "per set" |
| `sample:raj-green` | A £5 sample |
| `ask:jointtec-pitch-black` | An Essentials line with no price: a quote request, priced at 0 |

`lineProduct(id)` in `App.jsx` turns any of these back into a displayable line with name, unit, coverage and price.

## Essentials

`ESSENTIALS`: fifteen warehouse lines the store never listed. Joint-Tec in three colours, Por-Tec in four, primer, two step treads, two edgings, two granite setts and black cobbles, each with the sheet's per-pallet and per-box packing. They have no price on the site until the yard gives one; a customer can "Ask for a price", which puts a quote line in the bag. `essentialsFor(product)` picks the matching jointing compound and primer for the "Finish the job" strip.

## Delivery

`DELIVERY` has three indicative bands by postcode area (local, London and M25, England and Wales) and a list of areas that are "ask us". `deliveryFor(postcode)` picks the band. The bands are marked indicative on every page until the real rates arrive. Free over £500 inside the M25 and 3 to 5 working days are the store's own published terms. `workingDaysFrom(3)` gives the earliest delivery day shown on the product page, bag and checkout.

## Filters and search

- Colour groups (`COLOUR_GROUPS`, `colourOf`): Blacks, Whites, Greens and multi, Browns and rust, Creams and buffs, Greys, from a per-product word list.
- Size (`sizeOf`, `SIZE_LABEL`): the two dimensions sorted so 900 × 600 and 600 × 900 are one chip.
- Finish (`finishOf`, `FINISH_LABEL`): riven, riven-effect, honed, matt, polished, split face, read from the finish text.
- Search (`SEARCH_TAGS`): colour and use words customers type that product names do not contain.

## Other tables

`BUSINESS` (name, phones, WhatsApp, email, address, hours, socials, site) is the single source for every contact detail on the site; nothing else carries a phone number. `CATS`, `EDITIONS`, `SEASON`, `FAMILIES` and `PAIRS` arrange the same products into the home page's collections. `SCENES` is the 23 project photographs with captions. `PATTERNS` and `MIXED` describe the four laying patterns for the builder and the 3D field. `FAQ` and `REVIEWS` carry the store's own questions and its two reviews.
