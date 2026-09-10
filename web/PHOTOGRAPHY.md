# Photography — where better images come from, range by range

The site currently runs on the yard's own phone photography, graded by
`scripts/photos.py` so the cards read as one shoot. That pass fixes white
balance, exposure and crop; it can't add studio lighting or a room set. This is
where studio-quality imagery actually comes from for each range.

## Ranges with a manufacturer or importer behind them (ask them for imagery)

Stockists are normally entitled to the brand's product photography, room sets
and lifestyle shots. One email to the account manager, citing the trade
account, usually gets a Dropbox link.

| Range on the site | Who's behind it | What to ask for |
|---|---|---|
| Bodo White (and Bodo Beige/Grey/Anthracite if stocked) | **Pavestone** — imported "Bodo Spanish exclusive premium porcelain"; Nitya buys it in the Pavestone 900×600×20 format | Pavestone stockist image pack: studio slab shots + garden room sets. Pavestone also runs "virtual displays" you can link to. |
| Himalayan White | Sold under the same name by Cheshire Paving Stones, London Stone (LSD), MacBlair, HL Supplies — a shared Indian-made line | Ask Nitya's importer which factory; the factory catalogue will have a clean top-down slab and a laid room set. |
| Copper Slate / Rust Slate | Generic Indian 20 mm "rustic slate" porcelain, sold by NuStone, Melton Stone, Premier Porcelain, Paving Supplies | Same route — factory catalogue via the importer. |
| Crystal Gris, Earthstone Grey, Noor Grigio, HS Beige, Quartz White, Kandla Grey Porcelain | Factory range names from Morbi (Gujarat) tile manufacturers | Factory catalogue PDFs carry studio-lit slab renders and room sets for every SKU. Ask for the 600×900×20 "outdoor" catalogue. |
| Indoor 8 mm: Aspire Grey, Dark Stonella, Eden Ash, Rovero Dark Grey, Sand Grigio, Unika Gris, Brit Raven, Calacatta Blanco, Miracle/Modern Statuario, Jiniva Natural, Lobbies Silver, Saint Lawrence Black Diamond | Morbi catalogue names — e.g. "Stonella" is a Color Tiles Pvt Ltd range, "Aspire" appears in Ingrammi's catalogue | Every one of these will have a factory render (tile face at 1:1) and a bathroom/kitchen room set. These are the easiest wins on the site: the indoor cards are currently the weakest photos. |

## Ranges with no brand behind them (shoot them)

Kandla Grey, Raj Green, Rippon Buff, Autumn Brown, Fossil Mint, Black
Limestone, Sinai Pearl and the cladding are quarry names, not brands. Every
merchant photographs their own, and the ones that look premium (London Stone,
Stoneworld) shot them the same way. Half a day at the yard with a mirrorless
camera and one softbox covers it.

Shot list, per range:

1. **Top-down slab, dry** — one 600×600 or 900×600 slab flat on a mid-grey
   ground, camera square-on from above, soft light from one side to show the
   riven texture. This is the card image.
2. **Top-down slab, wet** — same setup, slab hosed. Sandstone sells wet.
3. **Corner detail** — 45°, close, edge and face in frame. Shows thickness
   and the hand-dressed edge.
4. **Three-slab fan** — three slabs from different packs fanned out, to show
   the shade range honestly (this replaces the "why are my slabs different
   shades" conversation).
5. **Laid** — 2 m² laid on the yard floor in the pack's random pattern,
   pointed, shot at ~1.5 m height. Reuse for the laying-patterns section.

Plus, once: the showroom front (already good), the racking inside, a pallet
being forked onto a lorry, the sample box. And keep asking customers for
finished-garden photos — the drone shot on the hero is the best image the
business owns.

## Rules for anything we didn't shoot

- Manufacturer imagery: fine, with the trade relationship. Keep the source
  noted in `scripts/photos.json` alongside the URL.
- Other merchants' photos of the same product: **no** — copyright sits with
  whoever shot it, and they compete for the same Google results.
- Stock libraries: fine for mood, never for a product card.

## Pipeline

```
python3 scripts/photos.py fetch   # pulls originals from the WordPress media library
python3 scripts/photos.py grade   # grades into src/assets/
python3 scripts/photos.py sheet   # before/after contact sheet
```

To swap in a better image for a range, change its `src` in
`scripts/photos.json` and re-run `grade`. Per-image overrides: `trim_bottom`
(remove a baked-in caption), `grade: false` (texture maps).
