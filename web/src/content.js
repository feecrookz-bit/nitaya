/*
 * Long-form product content, keyed by product id. Everything here is taken
 * from the shop's own listings (nityastones.co.uk) and rewritten in the
 * site's voice: feature bullets, what a pack contains, the specification
 * table, the description proper, and the honest notes the shop already
 * prints (batch variation, illustrative renders, order 10% over).
 */

// ------------------------------------------------------------ shared blocks
const SAND_FEATURES = ['Naturally riven surface', 'Hand-dressed edges', 'Calibrated to 22 mm', 'Looks great wet and dry', 'Low maintenance', 'Frost resistant, made for the British climate', 'CE marked']
const LIME_FEATURES = ['Naturally riven surface', 'Hand-dressed edges', 'Looks great wet and dry', 'Low maintenance', 'CE marked']
const OUT_FEATURES = ['R11 non-slip rating', 'Stain, scratch and shock resistant', 'Hard-wearing and highly durable', 'Non-porous — no sealing, no moss', 'Colour-fast in sun and frost', 'Low maintenance', 'CE certified vitrified porcelain']
const IN_FEATURES = ['Water resistant — kitchens and bathrooms', 'Durable porcelain, resists wear', 'Easy to clean', 'Wall and floor']

const MIXED_PACK = [['600 × 900 mm', 16], ['600 × 600 mm', 16], ['290 × 600 mm', 16], ['290 × 290 mm', 12]] // 18.19 m²

const SAND_LAYING = [
  'Lay on a full bed of mortar (never spot bedding), with the backs primed so the slab bonds and the stone can’t hollow underneath.',
  'Leave a joint of 10–15 mm and point with a flexible compound or a sand-cement mix. The four sizes in a mixed pack are meant to be laid random, not in courses.',
  'Mix slabs from three or four packs as you go so any shade difference between pallets disappears into the pattern.',
  'Sealing is optional. It deepens the colour and makes cleaning easier; leave it a few weeks after laying before you apply it.',
]
const OUT_LAYING = [
  'Lay on a full mortar bed with a slurry primer on the back of every slab, or on pedestals over a drained sub-base. Porcelain doesn’t absorb water, so it needs the bond.',
  'Cut with a diamond blade on a wet cutter. Joints of 3–5 mm, pointed with a brush-in porcelain grout or a resin compound.',
  'No sealing, ever. A hose and a stiff brush is the whole maintenance routine.',
]
const IN_LAYING = [
  'Fix with a flexible porcelain adhesive on a flat, primed substrate. A levelling system keeps large formats flush.',
  'Order your area plus 10% for cuts and breakages, all from one batch, so the shade runs consistent across the floor.',
  'Colours can vary slightly between batches — that’s the manufacturing and firing process, not a fault.',
]

const SAND_NOTE = 'Natural stone varies. Colour, tone and pattern differ slab to slab and pallet to pallet; that variation is the point of the material. Colours come up richer wet than dry — look at the photos and the wet/dry slider before you decide.'
const OUT_NOTE = 'Porcelain is printed and fired, so shade is consistent across a pallet. Renders on this page are illustrative of the pattern; ask for a sample to see the real surface.'
const IN_NOTE = 'Room photographs are the manufacturer’s illustrations. Order a sample to see the tile in your own light before you commit.'

const sand = (o) => ({ features: SAND_FEATURES, laying: SAND_LAYING, note: SAND_NOTE, ...o })
const lime = (o) => ({ features: LIME_FEATURES, laying: SAND_LAYING, note: SAND_NOTE, ...o })
const out = (o) => ({ features: OUT_FEATURES, laying: OUT_LAYING, note: OUT_NOTE, ...o })
const indoor = (o) => ({ features: IN_FEATURES, laying: IN_LAYING, note: IN_NOTE, ...o })

const sandDetails = (colour, size, packs, extra = []) => [
  ['Colour', colour], ['Material', 'Indian sandstone'], ['Face', 'Natural riven'], ['Edges', 'Hand-cut'],
  ['Thickness', '22 mm, calibrated'], ['Sizes', size], ['Pack', packs], ['Joint', '10–15 mm'], ['Made in', 'India'], ['Rating', 'CE marked'], ...extra,
]
const outDetails = (colour, cover, extra = []) => [
  ['Colour', colour], ['Material', 'Vitrified porcelain'], ['Texture', 'R11 matt, anti-slip'], ['Edges', 'Rectified'],
  ['Size', '600 × 900 mm'], ['Thickness', '20 mm'], ['Pack', `${cover} m² · 40 slabs of 0.54 m²`], ['Rating', 'CE certified'], ...extra,
]
const inDetails = (colour, finish, size, rating = 'R10') => [
  ['Colour', colour], ['Material', 'Porcelain'], ['Finish', finish], ['Tile size', size], ['Thickness', '8 mm'], ['Suitability', 'Wall and floor, indoor'], ['Slip rating', rating],
]

// ------------------------------------------------------------------ content
export const CONTENT = {
  // ----- sandstone
  'kandla-grey': sand({
    pack: MIXED_PACK,
    details: sandDetails('Light grey with blue-grey and buff tones', 'Four sizes, mixed', '18.19 m² · 60 slabs'),
    body: [
      'Kandla Grey is the sandstone landscape designers, architects and builders reach for when they want natural stone that still reads as contemporary. Each slab shows a range of light greys with soft blue and buff undertones, and the pale palette opens a garden up rather than closing it in.',
      'Riven by hand along the stone’s natural bed, then machine-calibrated to a true 22 mm so it lays evenly and cuts cleanly. Hand-dressed edges keep the organic look; the riven face gives grip underfoot, wet or dry.',
      'The mixed pack holds four sizes for a random lay, the traditional English-garden pattern. It suits patios, paths, pool surrounds and covered indoor-outdoor spaces, and takes the British climate without complaint: frost resistant, hard wearing, minimal upkeep.',
    ],
  }),
  'kandla-grey-900': sand({
    details: sandDetails('Light grey with blue-grey and buff tones', '900 × 600 mm', '18.90 m² · 35 slabs', [['Split packs', 'Yes']]),
    body: [
      'The same Kandla Grey in a single 900 × 600 size for a half-bond, stack-bond or stretcher lay. Rows read cleaner and there are fewer joints to point, which is why this is the size most often chosen for modern extensions and long paths.',
      'Riven face, hand-cut edges, calibrated to 22 mm. Because every slab is the same size we’ll split this pack to the metreage you need — one of only two packs in the yard we will.',
    ],
  }),
  'raj-green': sand({
    pack: MIXED_PACK,
    details: sandDetails('Greens, greys and browns with occasional buff', 'Four sizes, mixed', '18.19 m² · 60 slabs'),
    body: [
      'Raj Green is the best-known Indian sandstone in the UK and one of the most popular in our range. “Raj” means king in Hindi, and the stone earns it: a blend of subtle greens, greys and browns that changes with the light and comes up richer every time it rains.',
      'Each slab is split along its natural bed for a riven face, machine-calibrated to 22 mm and finished with hand-cut edges. The four-size mixed pack is laid random, the pattern that makes a traditional patio look as if it has always been there.',
      'Sometimes sold elsewhere as Raj Blend, it suits cottage gardens, red brick and old stone, and it hides leaf litter and footprints better than any pale slab. Frost resistant and hard wearing, with a riven surface that keeps its grip in the wet.',
    ],
  }),
  'rippon-buff': sand({
    pack: MIXED_PACK,
    details: sandDetails('Cream, honey and light brown', 'Four sizes, mixed', '18.19 m² · 60 slabs'),
    body: [
      'Rippon Buff sits between vibrancy and earthiness: warm, lively colour that lifts a patio while keeping the connection to real stone. The palette runs from pale cream through honey to light brown, with veining and colour banding formed over millennia.',
      'Hand-split for a riven face, calibrated to 22 mm and hand-dressed on every edge. The four-size pack lays random and suits south-facing gardens, red brick and anywhere the aim is warmth rather than cool grey.',
      'Ethically sourced Indian sandstone, frost resistant and suited to the British climate. Expect natural variation in colour and tone from slab to slab; the photos show the stone both wet and dry so you can see the range.',
    ],
  }),
  'autumn-brown': sand({
    pack: MIXED_PACK,
    details: sandDetails('Warm browns, tan and rust with darker bands', 'Four sizes, mixed', '18.19 m² · 60 slabs'),
    body: [
      'Autumn Brown, also sold as Autumn Blend, is a perennial favourite: the rich colours of autumn in one pack, varying shades of brown, beige and tan with darker bands running through some slabs.',
      'Each slab is riven along its natural layers for an authentic finish, calibrated to 22 mm and hand-dressed on the edges. Laid random from the four-size pack it reads like a country-house path, and it is the sandstone that hides leaf litter best.',
      'Frost resistant and hard wearing, it holds its colour through the seasons. Wet, it goes deep and glossy; dry, the tones soften. Look at both before you decide.',
    ],
  }),
  'fossil-mint': sand({
    pack: MIXED_PACK,
    details: sandDetails('Cream and beige with mint-green veining and fossil marks', 'Four sizes, mixed', '18.19 m² · 60 slabs'),
    body: [
      'Fossil Mint is pale cream and beige with soft mint-green veining and, across some slabs, the fossil marks of the ancient sea bed the stone came from. It is the brightest sandstone in the yard and the one most often chosen for sunny, south-facing patios.',
      'Split for a riven face, calibrated to 22 mm, hand-cut edges. The four-size mixed pack lays random and takes the British weather with its frost resistance and hard-wearing surface.',
      'A light stone shows the dirt sooner than a dark one; a seal after laying keeps it looking new and makes the odd spill a wipe rather than a scrub.',
    ],
  }),
  'kandla-circle': sand({
    details: [['Colour', 'Light grey with blue-grey and buff tones'], ['Material', 'Indian sandstone'], ['Face', 'Natural riven'], ['Edges', 'Hand-cut'], ['Thickness', '22 mm, calibrated'], ['Diameter', '2.85 m'], ['Kit', 'Centre stone, two rings, squaring-off pieces'], ['Made in', 'India']],
    body: [
      'A complete 2.85 m feature circle in Kandla Grey: the centre stone, two rings of cut segments and the squaring-off pieces that set the circle into a straight field of the same stone.',
      'Use it as a centrepiece in a larger patio, as a standalone seating circle in a lawn, or as the base for a fire pit or a table. Same riven face and hand-cut edges as the rest of the Kandla range, so it sits seamlessly in a mixed pack patio.',
    ],
  }),

  // ----- limestone
  'black-limestone': lime({
    details: [['Colour', 'Charcoal dry, near-black wet'], ['Material', 'Limestone'], ['Face', 'Natural riven'], ['Edges', 'Hand-dressed'], ['Size', '600 × 600 mm'], ['Thickness', '20 mm'], ['Pack', '18.00 m² · 50 slabs'], ['Made in', 'India'], ['Rating', 'CE marked']],
    body: [
      'Black Limestone is the darkest stone in the yard: charcoal when dry and near-black when wet, with a natural riven face and hand-dressed edges. In a single 600 × 600 size it lays in a tight grid or a half-bond that reads modern against pale render and grass.',
      'It is the stone for contrast — a border around a pale porcelain, a step, a plinth — as much as for whole patios. Low maintenance, and it looks its best straight after rain.',
      'Black limestone lightens over time in strong sun. A colour-enhancing seal after laying holds the depth of colour and is the one thing we’d insist on for this stone.',
    ],
  }),
  'sinai-pearl': lime({
    features: ['Fine fossil detail', 'Honed, even face', 'Looks great wet and dry', 'Low maintenance', 'CE marked'],
    details: [['Colour', 'Pale cream with fine fossil detail'], ['Material', 'Egyptian limestone'], ['Face', 'Honed'], ['Size', '600 × 600 mm'], ['Thickness', '20 mm'], ['Pack', '18.00 m² · 50 slabs'], ['Made in', 'Egypt']],
    body: [
      'Sinai Pearl is a pale, honed Egyptian limestone with fine fossil detail through the surface. Cool, even and quietly expensive-looking, it is the stone for a formal terrace, a courtyard or the run from a kitchen floor out to a garden in one material.',
      'Single 600 × 600 size, 20 mm, in packs of 18 m². Limestone is softer and more porous than sandstone or porcelain: seal it after laying and it stays the colour you bought.',
    ],
  }),
  'sinai-pearl-mixed': lime({
    features: ['Fine fossil detail', 'Honed, even face', 'Four sizes for a random lay', 'Low maintenance', 'CE marked'],
    pack: MIXED_PACK,
    details: [['Colour', 'Pale cream with fine fossil detail'], ['Material', 'Egyptian limestone'], ['Face', 'Honed'], ['Sizes', 'Four sizes, mixed'], ['Thickness', '20 mm'], ['Pack', '18.19 m² · 60 slabs'], ['Made in', 'Egypt']],
    body: [
      'The same Sinai Pearl in a four-size mixed pack for a random lay. The cream, fossil-flecked surface takes the traditional pattern beautifully, and the honed face gives a softer, more finished look than riven stone.',
      'Seal after laying. Limestone is a soft stone and the seal is what keeps a pale floor pale.',
    ],
  }),

  // ----- outdoor porcelain
  'bodo-white': out({
    details: outDetails('Bright white with marble veining', '28.08'),
    body: [
      'Bodo White is a bright, marble-veined 20 mm porcelain, the slab in most of the modern extensions we supply. It is pale without being cold, rectified for tight joints, and it stays exactly the colour you bought.',
      'Vitrified porcelain absorbs almost no water, so there is no moss, no algae and no sealing. The lightly textured R11 surface keeps its grip wet, which makes it right for pool surrounds and family gardens as well as terraces.',
      'Sold by the pallet of 40 slabs at 600 × 900 mm. We split packs to your metreage so you don’t pay for slabs you won’t lay (split-pack fee applies).',
    ],
  }),
  'himalayan-white': out({
    details: outDetails('Cream and white with soft grey movement', '21.60'),
    body: [
      'Himalayan White brightens a garden with cream and white tones and the soft grey variation of a light natural stone, without any of the upkeep. The flat, lightly textured face mimics honed stone; the R11 rating keeps it safe in the wet.',
      'Stain and scratch resistant, non-porous, colour-fast in full sun: wipe it clean with a damp cloth and it looks new. Pallets of 21.6 m² (40 slabs). Ask us to split a pack to the exact metreage.',
    ],
  }),
  'quartz-white': out({
    details: outDetails('Clean white, fine even grain', '21.60'),
    body: [
      'Quartz White is the cleanest of the whites: a fine, even grain with very little movement across the slab, so a large patio reads as one calm surface. It reflects light beautifully and makes a small garden feel bigger.',
      'The photographs show it on real jobs, from a pool terrace to a family patio, and the range of gardens it suits. R11 anti-slip, rectified, 20 mm. Pallets of 40 slabs, split on request.',
    ],
  }),
  'crystal-gris': out({
    details: outDetails('Mid-grey with a soft stone texture', '21.60'),
    body: [
      'Crystal Gris is a mid-grey with a soft stone texture and subtle darker variation, the safe choice next to grey composite decking, anthracite windows and modern render. Flat, lightly textured and rated R11 for grip when wet.',
      'Robust, stain and scratch resistant, and non-porous so it never greens up. Price is per pallet of 21.6 m² (40 slabs of 600 × 900).',
    ],
  }),
  'earthstone-grey': out({
    details: outDetails('Charcoal, grey and white blend', '21.60', [['Split packs', '15 m² (28), 12 m² (22), 10 m² (18)']]),
    body: [
      'Earthstone Grey blends charcoal, grey and white in a textured finish that reads as natural stone from a metre away and as immaculate porcelain up close. It is the slab in the raised terrace and the pool-house photographs here.',
      'R11 matt anti-slip texture, 20 mm, rectified. Pallets of 21.6 m² contain 40 slabs; smaller packs of 15, 12 and 10 m² are available so you buy what you lay.',
    ],
  }),
  'kandla-porcelain': out({
    features: ['Riven-effect face', ...OUT_FEATURES],
    details: outDetails('Varying greys, riven-effect surface', '21.60'),
    body: [
      'The Kandla Grey look in a calibrated 20 mm porcelain: varying grey tones and a surface that mirrors riven stone, with none of the shade variation and no sealing. Where the sandstone is the traditional choice, this is the same colour for people who want a slab that looks the same in year ten as it did on day one.',
      'Flat, lightly textured and rated R11, so it keeps its grip wet: right for patios, paths, driveways and pool surrounds. Non-porous, so there is no moss build-up and a spill wipes off with a damp cloth. Colour-fast in summer sun.',
      'One pallet is 40 slabs of 600 × 900 mm, 0.54 m² each, 21.6 m² in all. We split packs to the exact metreage.',
    ],
  }),
  'noor-grigio': out({
    details: outDetails('Soft limestone grey with fossil marks', '28.08'),
    body: [
      'Noor Grigio is a soft limestone-effect grey with subtle fossil marks, the look of a honed European limestone with the resilience of vitrified porcelain. It sits well with pale render and timber, and it takes steps and raised edges as cleanly as it takes a flat terrace.',
      'R11 anti-slip texture, stain and scratch resistant, non-porous, 20 mm. Sold by the pallet of 40 slabs; split packs on request.',
    ],
  }),
  'hs-beige': out({
    details: outDetails('Warm sand beige', '28.08'),
    body: [
      'HS Beige is a warm, sand-coloured porcelain for gardens that want the Rippon Buff tone without the upkeep. Even in colour, lightly textured and rated R11, it stays clean and stays warm-looking in every season.',
      'Rectified 600 × 900 slabs at 20 mm, 40 to the pallet. No sealing, no moss; a hose is the maintenance routine.',
    ],
  }),
  'copper-slate': out({
    features: ['Riven slate-effect face', ...OUT_FEATURES],
    details: outDetails('Copper, rust and charcoal', '21.60', [['Split packs', '15 m² (27), 12 m² (22), 10 m² (18), 8 m² (14)']]),
    body: [
      'Copper Slate brings the warmth and texture of natural slate to a garden without the maintenance: vibrant, multi-tonal copper and rust over charcoal, with a veined, riven-effect surface that mimics the real thing.',
      'A luxurious choice that suits bespoke projects, indoors and out, and areas around swimming pools thanks to its slip-resistant texture. Rectified 600 × 900 slabs at 20 mm; pallets of 40 slabs with smaller packs available.',
    ],
  }),
  'beige-porcelain': out({
    details: [['Colour', 'Plain, even beige'], ['Material', 'Vitrified porcelain'], ['Texture', 'Matt'], ['Size', '600 × 600 mm'], ['Thickness', '16 mm'], ['Pallet', '28.08 m²'], ['Rating', 'CE certified']],
    body: [
      'A plain, even beige 600 × 600 in 16 mm, sold by the pallet at a price that works out at £17.50 per square metre. It is the slab for a large, simple terrace laid on a full bed, where the budget is going on the garden rather than the paving.',
      'Vitrified, so no moss and no sealing; matt surface, easy to keep clean. Sold as a full pallet of 28.08 m².',
    ],
  }),
  'light-grey-porcelain': out({
    details: [['Colour', 'Plain light grey'], ['Material', 'Vitrified porcelain'], ['Texture', 'Matt'], ['Size', '600 × 600 mm'], ['Thickness', '16 mm'], ['Pallet', '28.08 m²'], ['Rating', 'CE certified']],
    body: [
      'A plain light grey 600 × 600 in 16 mm, sold by the pallet at £17.50 per square metre. Quiet, even and modern; it disappears under the furniture and the planting, which is what a lot of gardens want from their paving.',
      'Vitrified porcelain: non-porous, colour-fast, no sealing. Full pallets of 28.08 m².',
    ],
  }),
  'black-porcelain': out({
    details: [['Colour', 'Plain black'], ['Material', 'Vitrified porcelain'], ['Texture', 'Matt'], ['Size', '600 × 600 mm'], ['Thickness', '16 mm'], ['Pallet', '28.08 m²'], ['Rating', 'CE certified']],
    body: [
      'A plain black 600 × 600 in 16 mm, sold by the pallet at £17.50 per square metre. Dramatic on its own, and the classic border and step material against any pale slab.',
      'Vitrified porcelain holds its black in full sun where natural black stone would fade. Full pallets of 28.08 m².',
    ],
  }),

  // ----- indoor porcelain
  'calacatta-blanco': indoor({
    details: inDetails('White with soft grey veining', 'Matt / satin', '600 × 1200 mm'),
    body: ['Calacatta Blanco brings the veined white marble look to a 600 × 1200 rectified tile at 8 mm. Soft grey veining on a warm white ground, in a satin finish that reads as honed marble without the porosity. Large format means fewer joints and a calmer floor; it is equally at home on a bathroom wall.'],
  }),
  'miracle-statuario': indoor({
    details: inDetails('White with bold grey veining', 'Polished', '600 × 1200 mm'),
    body: ['Miracle Statuario has the bold grey veining of the real marble in a polished 600 × 1200 porcelain. The large format and the sheen make a luxurious, sophisticated floor for a hallway, kitchen or bathroom; the porcelain makes it stain and scratch resistant and effortless to clean.'],
  }),
  'modern-statuario': indoor({
    details: inDetails('White with fine, spaced grey veining', 'Polished', '600 × 1200 mm'),
    body: ['Modern Statuario captures Statuario marble with a contemporary twist: a quieter white with fine, widely spaced veins, polished, at 600 × 1200. It suits modern interiors where the marble should be a background rather than the statement.'],
  }),
  'saint-lawrence': indoor({
    details: inDetails('Black with white and gold veining', 'Polished', '600 × 1200 mm'),
    body: ['Saint Lawrence Black Diamond is a black marble effect with white and gold veins in a polished 600 × 1200 tile. Made for a statement floor or a feature wall, and, because it is porcelain, it takes the traffic of a hallway or a commercial lobby without marking.'],
  }),
  'lobbies-silver': indoor({
    details: inDetails('Silver grey', 'Smooth with a subtle sheen', '600 × 1200 mm'),
    body: ['Lobbies Silver is a cool silver-grey with a subtle texture and a soft sheen, at 600 × 1200. The large format and the light colour enlarge a room; the porcelain is robust enough for high-traffic areas and easy to keep clean.'],
  }),
  'jiniva-natural': indoor({
    details: inDetails('Natural grey-beige', 'Matt', '600 × 1200 mm'),
    body: ['Jiniva Natural is a soft grey-beige stone effect in a matt 600 × 1200 tile. It works with almost any scheme, warm or cool, and it is the tile we suggest when the floor needs to run through several rooms without arguing with any of them.'],
  }),
  'brit-raven': indoor({
    details: inDetails('Raven — dark grey to black', 'Matt', '600 × 600 mm'),
    body: ['Brit Raven is a deep charcoal 600 × 600 with a matt, concrete-like finish. A dark, contemporary floor for kitchens and bathrooms, wall and floor rated, water resistant and low maintenance.'],
  }),
  'aspire-grey': indoor({
    features: ['Rectified edges for tight joints', ...IN_FEATURES],
    details: inDetails('Cool grey', 'Matt', '300 × 600 mm'),
    body: ['Aspire Grey is a sleek, cool grey with clean lines in a 300 × 600 format. Rectified edges give a seamless installation; the matt finish and subtle stone texture suit kitchens, bathrooms and living areas, on the wall or the floor.'],
  }),
  'dark-stonella': indoor({
    details: inDetails('Dark grey', 'Matt', '300 × 600 mm', 'R11'),
    body: ['Dark Stonella is a rich dark grey stone effect with a fine speckle, in a matt 300 × 600 tile. It carries an R11 slip rating, the high level of resistance, which makes it the tile in this range for wet rooms and shower floors as well as kitchens.'],
  }),
  'eden-ash': indoor({
    details: inDetails('Ash — pale grey-white', 'Matt', '300 × 600 mm'),
    body: ['Eden Ash is a pale, brushed-concrete grey on a clean white ground with subtle veining, in a matt 300 × 600. Simple and elegant, it brings a natural calm to a bathroom or a utility room, and the matt face hides splash marks.'],
  }),
  'rovero-dark-grey': indoor({
    details: inDetails('Deep grey', 'Matt, smooth', '300 × 600 mm'),
    body: ['Rovero Dark Grey is a bold, deep grey with a smooth matt surface and a subtle texture. A statement for contemporary interiors, on walls or floors, and easy to keep clean.'],
  }),
  'sand-grigio': indoor({
    details: inDetails('Soft grey with a sandy grain', 'Matt', '300 × 600 mm'),
    body: ['Sand Grigio is a soft grey with a sandy grain and a matt finish, in a 300 × 600. Soothing rather than stark, with a touch of seaside about it: a cosy bathroom tile that also works as a kitchen floor.'],
  }),
  'unika-gris': indoor({
    details: inDetails('Smooth, even grey', 'Matt', '300 × 600 mm'),
    body: ['Unika Gris is a smooth, even grey with a matt finish in a 300 × 600. The timeless option: it suits every style of interior and it will still look right in twenty years.'],
  }),

  // ----- cladding
  'cladding': {
    features: ['Split-face natural stone', 'Mixed greys, buffs and creams', 'Indoors and out', 'Timeless, durable finish'],
    details: [['Material', 'Natural stone'], ['Face', 'Split face'], ['Strip size', '600 × 150 mm'], ['Thickness', '8–10 mm strips, 22 mm overall'], ['Lay', 'Running bond']],
    laying: [
      'Fix to a sound, flat wall with a flexible stone adhesive, working in a running bond from a level line. Butt-joint the strips; no pointing needed.',
      'Outside, seal the finished wall to keep the colours and stop water tracking behind the stone.',
    ],
    body: [
      'Split-face natural stone strips in mixed greys, buffs and creams, laid in a running bond to turn an ordinary wall into a feature. Garden walls, the back of a raised bed, a fireplace, the wall behind the TV.',
      'Each 600 × 150 strip is a mosaic of split stone pieces on a backing, so the wall goes up quickly and the pattern stays random. Six colourways are shown in the gallery; ask which are in stock.',
    ],
    note: 'Natural stone: colour and texture vary strip to strip. Lay from several boxes at once.',
  },
}

export const contentFor = (id) => CONTENT[id] || null
