# 5. Photographs and assets

Every image on the site is the yard's own, taken from its WordPress media library, its listings, its About page and its blog. No stock, no competitor imagery. The wet view and the renders are made from those photographs and are labelled as such.

## The pipeline (`web/scripts/photos.py`)

| Command | Does |
|---|---|
| `python3 scripts/photos.py fetch` | Downloads the originals listed in `photos.json` into `scripts/originals/` (not committed) |
| `python3 scripts/photos.py grade` | Grades each original and writes `src/assets/<name>.jpg` |
| `python3 scripts/photos.py gallery` | Builds the per-product gallery frames from `gallery.json` |
| `python3 scripts/photos.py textures` | Cuts a 768 px square texture from each studio render for the 3D views |
| `python3 scripts/photos.py sheet` | A before/after contact sheet for checking the grade |

The grade is the same pass for every image so the cards read as one shoot: grey-world white balance at 60%, auto-levels on the 0.5/99.5 percentiles, a gentle S-curve, +6% saturation, an unsharp mask, then a crop to the target aspect. A single tile on a plain ground is first cropped to the tile itself, which is what turns a phone snap on the yard floor into a product shot. Per-image overrides live in `photos.json`: `trim_top` and `trim_bottom` remove baked-in captions, `grade: false` skips the tonal work for texture maps.

## The manifests

- `scripts/photos.json`: every scene, hero, yard and studio image, with its source URL, target name, crop mode and overrides.
- `scripts/gallery.json`: the product galleries, in order, with captions.

To add a photograph: put its URL (or a file) in the right manifest with a `scene-` or `g-` name, run the command, and for a project photograph add a line to `SCENES` in `data.js` with the caption.

## What is in `src/assets`

| Prefix | Count | What |
|---|---|---|
| `g-` | 109 | Gallery frames, per product |
| `scene-` | 23 | Project photographs |
| `p-` | 36 | Studio renders: one slab per range on a neutral ground, made from the yard's photographs |
| `t-` | 36 | Textures for the 3D views, cut from the renders |
| `hero`, `yard`, `pallets`, `slab` | 4 | The hero slideshow, the yard, the stock, the drag-to-turn slab |
| `logo` | 2 | The original mark, cleaned |
| `payments` | 1 | The card marks on the checkout |

21 MB in all; the site loads them lazily and the gated preview fetches them on demand.

## Logo and fonts

The logo is the store's original, cleaned up, not redesigned. The site uses the 226 px web version upscaled; a vector is on the asks list for print and the favicon.

Geist 400, 500 and 700 and Cinzel 600 are self-hosted in `src/fonts`. The audit found the 700 file was a copy of the 500 and replaced it with the real bold; every weight used in the stylesheet maps to a loaded face.

## Better photographs

`web/PHOTOGRAPHY.md` says, range by range, where studio-quality imagery comes from: the manufacturer's stockist packs for the branded porcelains, the factory catalogues for the Morbi tiles, and a half-day shoot at the yard for the quarry-named sandstones and limestones, with a shot list. The yard says it already has the photographs; the ask is for the originals rather than WhatsApp copies.
