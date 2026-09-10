import hero from './assets/hero.jpg'
import yard from './assets/yard.jpg'
import pallets from './assets/pallets.jpg'
import slabTexture from './assets/slab-texture.jpg'
import payments from './assets/payments.png'
import logoOriginal from './assets/logo-original.png'
import sceneAutumn from './assets/scene-autumn.jpg'
import scenePool from './assets/scene-pool.jpg'
import sceneHimalayan from './assets/scene-himalayan.jpg'
import sceneCircle from './assets/scene-circle.jpg'
import sceneRajWet from './assets/scene-raj-wet.jpg'
import sceneCopper from './assets/scene-copper.jpg'
import sceneBodo from './assets/scene-bodo.jpg'

// Studio renders (p-*) and graded lifestyle photos (g-*), both produced by
// scripts/photos.py from the yard's own photography.
const STUDIO = import.meta.glob('./assets/p-*.jpg', { eager: true, import: 'default' })
const GALLERY = import.meta.glob('./assets/g-*.jpg', { eager: true, import: 'default' })
const find = (map, prefix) => {
  const key = Object.keys(map).find(k => k.startsWith('./assets/' + prefix))
  return key ? map[key] : null
}
const studio = (p) => { const s = find(STUDIO, 'p-' + p); if (!s) throw new Error('no render for ' + p); return s }
const gallery = (p) => find(GALLERY, 'g-' + p)

export const IMG = { hero, yard, pallets, slabTexture, payments, logoOriginal }

export const CATS = [
  ['sandstone', 'Sandstone', 'Riven Indian sandstone, 22 mm, hand-split. Sold in mixed patio packs and single sizes.'],
  ['limestone', 'Limestone', 'Honed limestone, 20 mm, sawn edges. Black Limestone and Egyptian Sinai Pearl.'],
  ['outdoor', 'Outdoor porcelain', 'Vitrified 20 mm and 16 mm porcelain, R11, frost-proof, calibrated. Hoses clean.'],
  ['indoor', 'Indoor porcelain', '8 mm rectified porcelain, matt or gloss, slip resistant. Marble, stone and concrete effects.'],
  ['cladding', 'Cladding', 'Split-face natural stone strips for garden walls, fireplaces and feature walls.'],
]
export const CAT_LABEL = Object.fromEntries(CATS.map(([k, l]) => [k, l]))

/* Prices per m² ex VAT unless `unit` says otherwise, exactly as listed on the shop. */
const P = []
const add = (o) => { P.push({ gallery: gallery(o.slug), img: studio(o.slug), unit: 'per m²', ...o }) }

const sand = (slug, id, name, size, pack, cover, was, extra = {}) => add({
  slug, id, name, cat: 'sandstone', origin: 'Indian sandstone', size, thick: '22 mm, uncalibrated', pack, cover,
  finish: 'Riven, natural', price: 19.5, was, ...extra,
  blurb: `${name} is hand-split Indian sandstone with the riven face and hand-dressed edges the stone is known for. Uncalibrated, so lay it on a full wet bed and work to the top face.`,
})
sand('kandla-grey-22mm-sandstone-mixed', 'kandla-grey', 'Kandla Grey', 'Mixed patio pack', '18.19 m² per pack', 18.19, 22.2,
  { blurb: 'Kandla Grey is the calm one: light-to-mid grey with occasional buff undertones, and the sandstone most often laid around white render and grey window frames. Mixed patio pack of four sizes, laid random.' })
sand('kandla-grey-22mm-sandstone-900', 'kandla-grey-900', 'Kandla Grey 900×600', '900 × 600 mm', '18.90 m² per pack', 18.9, 22.2,
  { tag: 'Splits', blurb: 'The same Kandla Grey in a single 900×600 size for a half-bond or stack-bond lay. This is one of the two packs we\'ll split.' })
sand('raj-green', 'raj-green', 'Raj Green', 'Mixed patio pack', '18.19 m² per pack', 18.19, 22.2,
  { blurb: 'Raj Green is a multicolour: greens, browns, greys and the occasional buff in one pack, and it comes up richer every time it rains. The classic English-garden sandstone.' })
sand('rippon-buff', 'rippon-buff', 'Rippon Buff', 'Mixed patio pack', '18.19 m² per pack', 18.19, 22.2,
  { blurb: 'Rippon Buff runs from pale cream through honey to light brown. Warm against red brick and old stone.' })
sand('autumn-brown', 'autumn-brown', 'Autumn Brown', 'Mixed patio pack', '18.19 m² per pack', 18.19, 24.2,
  { blurb: 'Autumn Brown is the deepest of the sandstones: warm browns and rust with darker bands. It reads like a country-house path and hides leaf litter.' })
sand('fossil-mint', 'fossil-mint', 'Fossil Mint', 'Mixed patio pack', '18.19 m² per pack', 18.19, 22.2,
  { blurb: 'Fossil Mint is pale cream and beige with fossil marks and mint-green veining through some slabs. Light, bright and the sandstone most often chosen for south-facing patios.' })
add({ slug: 'kandla-grey-circle', id: 'kandla-circle', name: 'Kandla Grey Circle Kit', cat: 'sandstone', origin: 'Indian sandstone',
  size: '2.85 m diameter', thick: '22 mm, uncalibrated', pack: 'Complete kit', cover: null, finish: 'Riven, natural', price: 400, was: 450, unit: 'per kit', tag: 'Was £450',
  blurb: 'A complete 2.85 m feature circle in Kandla Grey: centre stone, two rings and the squaring-off pieces to set it into a straight field of the same stone.' })

add({ slug: 'black-limestone', id: 'black-limestone', name: 'Black Limestone', cat: 'limestone', origin: 'Limestone',
  size: '600 × 600 mm', thick: '20 mm', pack: '18.00 m² per pack', cover: 18, finish: 'Honed, sawn edge', price: 19.5, was: 22.5,
  blurb: 'Black Limestone is a honed, sawn-edge 600×600 that lays flat and tight. Charcoal when dry, near-black wet. Seal it and it stays that way.' })
add({ slug: 'egyptian-sinai-pearl-600', id: 'sinai-pearl', name: 'Egyptian Sinai Pearl', cat: 'limestone', origin: 'Egyptian limestone',
  size: '600 × 600 mm', thick: '20 mm', pack: '18.00 m² per pack', cover: 18, finish: 'Honed', price: 26, was: 28,
  blurb: 'Sinai Pearl is a pale, honed Egyptian limestone with fine fossil detail. Cool, even and quietly expensive-looking.' })
add({ slug: 'egyptian-limestone-sinai-pearl-mixed', id: 'sinai-pearl-mixed', name: 'Sinai Pearl Mixed Pack', cat: 'limestone', origin: 'Egyptian limestone',
  size: 'Mixed patio pack', thick: '20 mm', pack: 'Four sizes, laid random', cover: null, finish: 'Honed', price: 26, was: 28,
  blurb: 'The same Sinai Pearl in a four-size mixed pack for a random lay.' })

const out900 = (slug, id, name, cover, was = 25.5, finish = 'Matt, R11', blurb) => add({
  slug, id, name, cat: 'outdoor', origin: 'Vitrified porcelain', size: '600 × 900 mm', thick: '20 mm',
  pack: `${cover.toFixed(2)} m² per pallet`, cover, finish, price: 19.5, was, blurb,
})
out900('bodo-white', 'bodo-white', 'Bodo White', 28.08, 25.5, 'Matt, R11', 'Bodo White is a bright, marble-veined 20 mm porcelain. It\'s the slab in most of the modern extensions we supply: pale, rectified, and it stays that colour.')
out900('himalayan-white', 'himalayan-white', 'Himalayan White', 21.6, 25.5, 'Matt, R11', 'Himalayan White blends pale greys and off-whites like a light natural stone, without the maintenance.')
out900('quartz-white', 'quartz-white', 'Quartz White', 21.6, 25.5, 'Matt, R11', 'Quartz White is the cleanest of the whites: a fine, even grain and very little movement across the slab.')
out900('crystal-gris', 'crystal-gris', 'Crystal Gris', 21.6, 25.5, 'Matt, R11', 'Crystal Gris is a mid-grey with a soft stone texture. The safe choice next to grey composite decking and anthracite frames.')
out900('earthstone', 'earthstone-grey', 'Earthstone Grey', 21.6, 25.5, 'Matt, R11', 'Earthstone Grey blends charcoal, grey and white in a textured finish that reads as natural stone.')
out900('kandla-grey-20mm-porcelain', 'kandla-porcelain', 'Kandla Grey Porcelain', 21.6, 24.5, 'Riven-effect, R11', 'The Kandla Grey look in a calibrated 20 mm porcelain: riven surface, no shade variation, no sealing.')
out900('noor-grigio', 'noor-grigio', 'Noor Grigio', 28.08, 25.5, 'Matt, R11', 'Noor Grigio is a soft limestone-effect grey with subtle fossil marks.')
out900('hs-beige', 'hs-beige', 'HS Beige', 28.08, 25.5, 'Matt, R11', 'HS Beige is a warm sand-coloured porcelain for gardens that want the Rippon Buff tone without the upkeep.')
out900('copper-slate', 'copper-slate', 'Copper Slate', 21.6, 25.5, 'Riven-effect, R11', 'Copper Slate is a rust-and-charcoal slate-effect porcelain with a riven face. Lay it on a full bed and point it dark.')
const out600 = (slug, id, name, blurb) => add({
  slug, id, name, cat: 'outdoor', origin: 'Vitrified porcelain', size: '600 × 600 mm', thick: '16 mm',
  pack: '28.08 m² per pallet', cover: 28.08, finish: 'Matt', price: 491.4, was: 589.68, unit: 'per pallet', tag: 'Pallet deal', blurb,
})
out600('beige-porcelain', 'beige-porcelain', 'Beige Porcelain', 'A plain, even beige 600×600 in 16 mm, sold by the pallet. £17.50 per m² at pallet price.')
out600('light-grey-porcelain', 'light-grey-porcelain', 'Light Grey Porcelain', 'A plain light grey 600×600 in 16 mm, sold by the pallet. £17.50 per m² at pallet price.')
out600('black-porcelain', 'black-porcelain', 'Black Porcelain', 'A plain black 600×600 in 16 mm, sold by the pallet. £17.50 per m² at pallet price.')

const indoor = (slug, id, name, size, blurb, was = null) => add({
  slug, id, name, cat: 'indoor', origin: 'Indoor porcelain', size, thick: '8 mm', pack: 'Sold by the m²', cover: null,
  finish: 'Matt or gloss, slip resistant', price: 22.8, was, blurb,
})
indoor('calacatta-blanco', 'calacatta-blanco', 'Calacatta Blanco', '600 × 1200 mm', 'Calacatta Blanco brings the veined white marble look at 600×1200 in an 8 mm rectified tile.')
indoor('miracle-statuario', 'miracle-statuario', 'Miracle Statuario', '600 × 1200 mm', 'Miracle Statuario has the bold grey veining of the real thing with a high-gloss finish.', 24.8)
indoor('modern-statuario', 'modern-statuario', 'Modern Statuario', '600 × 1200 mm', 'Modern Statuario is a quieter white marble effect with fine, widely spaced veins.')
indoor('saint-lawrence', 'saint-lawrence', 'Saint Lawrence Black Diamond', '600 × 1200 mm', 'A black marble effect with white and gold veins. Made for a statement floor.')
indoor('lobbies-silver', 'lobbies-silver', 'Lobbies Silver', '600 × 1200 mm', 'Lobbies Silver is a cool grey with a subtle texture. Metropolitan, hard-wearing.')
indoor('jiniva-natural', 'jiniva-natural', 'Jiniva Natural', '600 × 1200 mm', 'Jiniva Natural is a soft grey-beige stone effect that works with almost anything.')
indoor('brit-raven', 'brit-raven', 'Brit Raven', '600 × 600 mm', 'Brit Raven is a deep charcoal 600×600 with a matt concrete finish.')
indoor('aspire-grey', 'aspire-grey', 'Aspire Grey', '300 × 600 mm', 'Aspire Grey is a subtle stone-effect grey in a 300×600 format.')
indoor('dark-stonella', 'dark-stonella', 'Dark Stonella', '300 × 600 mm', 'Dark Stonella is a rich dark grey with a fine speckle.')
indoor('eden-ash', 'eden-ash', 'Eden Ash', '300 × 600 mm', 'Eden Ash is a pale, brushed-concrete grey.')
indoor('rovero-dark-grey', 'rovero-dark-grey', 'Rovero Dark Grey', '300 × 600 mm', 'Rovero Dark Grey is a deep matt grey with subtle texture.')
indoor('sand-grigio', 'sand-grigio', 'Sand Grigio', '300 × 600 mm', 'Sand Grigio is a soft grey with a sandy grain.')
indoor('unika-gris', 'unika-gris', 'Unika Gris', '300 × 600 mm', 'Unika Gris is a smooth, even grey. Timeless.')

add({ slug: 'stone-cladding', id: 'cladding', name: 'Stone Cladding', cat: 'cladding', origin: 'Natural stone',
  size: '600 × 150 mm', thick: '22 mm, split face', pack: 'Sold by the m²', cover: null, finish: 'Split face, running bond', price: 28.8, was: null,
  blurb: 'Split-face natural stone strips in mixed greys and buffs, laid in a running bond. Garden walls, fireplaces, the wall behind the TV.' })

export const PRODUCTS = P
export const byId = (id) => PRODUCTS.find(p => p.id === id)

export const SAMPLE = { id: 'sample', name: 'Sample piece', size: '100 × 100 mm', price: 5, unit: 'each', img: null }

export const SCENES = [
  { img: sceneAutumn, title: 'Autumn Brown, laid random', sub: 'Mixed patio pack, four sizes, wide pointed joints — photographed wet, which is how it looks most of the year.', product: 'autumn-brown' },
  { img: sceneBodo, title: 'Bodo White, 20 mm porcelain', sub: 'Single size 600×900 half bond running straight out from the bifolds.', product: 'bodo-white' },
  { img: sceneCircle, title: 'Kandla Grey circle kit', sub: '2.85 m feature circle set into a straight field of the same stone.', product: 'kandla-circle' },
  { img: sceneRajWet, title: 'Raj Green, wet', sub: 'Riven Indian sandstone straight after rain — greens, browns and rust come up together.', product: 'raj-green' },
  { img: sceneHimalayan, title: 'Himalayan White terrace', sub: '600×900 porcelain with a fenced boundary and lawn edge.', product: 'himalayan-white' },
  { img: scenePool, title: 'Poolside in porcelain', sub: 'R11 slip-rated, hoses clean, doesn\'t hold algae.', product: 'quartz-white' },
  { img: sceneCopper, title: 'Copper Slate, riven-effect', sub: 'Porcelain that reads as slate — laid on a full bed, pointed dark.', product: 'copper-slate' },
]

export const MIXED = [[900, 600], [600, 600], [600, 295], [295, 295]]
export const PATTERNS = [
  { title: 'Mixed patio pack', sub: '900×600, 600×600, 600×295, 295×295 — laid random, no repeat.', kind: 'mixed', tint: '#8A957F' },
  { title: '600×900 half bond', sub: 'Single size, each course offset by half. The standard porcelain lay.', kind: 'half', w: 900, h: 600, tint: '#B9B8B3' },
  { title: '600×600 stack bond', sub: 'Square, grid-aligned. Unforgiving of an out-of-square patio.', kind: 'stack', w: 600, h: 600, tint: '#3A3C36' },
  { title: '600×150 running bond', sub: 'Cladding, third-offset up a wall.', kind: 'third', w: 600, h: 150, tint: '#8C8377' },
]

export const FAQ = [
  ['Are your outdoor slabs calibrated or uncalibrated?', 'Uncalibrated. Thickness varies across the pack, so lay them on a full wet bed and work to the top face, not the bottom. Our 20 mm outdoor porcelain is the opposite — dead consistent, if that\'s what you\'d rather lay.'],
  ['Why are some of my slabs slightly different shades?', 'Because they\'re natural stone. Depending on the batch number there can be a slight difference in shade between pallets. It\'s not a fault, and it\'s the reason experienced layers mix from three or four packs at once rather than working through one pallet at a time.'],
  ['Do you split packs?', 'We split outdoor porcelain packs and Kandla Grey 600×900 packs. Mixed sandstone patio packs can\'t be split — the four sizes come banded as a set.'],
  ['How long does delivery take, and what happens on the day?', 'Three to four working days once payment has been received. Delivery lands between 8am and 6pm, we call you on the day, and someone needs to be there to sign for it.'],
  ['Is there a minimum order?', 'No minimum if you\'re collecting from the warehouse. There is a minimum for delivery — it depends on quantity and where you are, so ring and we\'ll tell you straight away.'],
  ['Can I order and pay over the phone?', 'Yes. Call 0330 236 9227 during yard hours and we\'ll take the order and the payment on the same call.'],
  ['Can we make custom orders?', 'Yes, at 120 m² and above we can customise size, colour or finish. Allow up to eight weeks for production and delivery.'],
  ['Are your indoor tiles slip resistant, and what finishes are there?', 'Yes, they are. Standard stock comes matt or gloss. On a custom order you choose the finish, subject to the 120 m² minimum.'],
]

export const REVIEWS = [
  { quote: 'Great service, great stones — fast delivery! Highly recommended.', who: 'Laura Cooper', what: 'Sandstone patio' },
  { quote: 'Top quality porcelain outdoor tiles. Definitely recommend.', who: 'Rajan Sahonte', what: '20 mm outdoor porcelain' },
]

export const money = (n) => '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ---------- curated structure (Fruit Plug system) ---------- */

// Three tiers. Every product here is real stock at the shop price; the tiers
// are the curation, not a different price list.
export const EDITIONS = [
  { num: 'Edition I', name: 'Essentials', why: 'The stones most patios in Hertfordshire are laid in. Riven sandstone and honed limestone at the yard\'s straightest price.',
    ids: ['kandla-grey', 'raj-green', 'rippon-buff', 'autumn-brown', 'fossil-mint', 'black-limestone'], from: 19.5 },
  { num: 'Edition II', name: 'Premium Select', why: '20 mm vitrified porcelain: calibrated, R11, frost-proof, and it stays the colour you chose. The most-laid tier this season.',
    ids: ['bodo-white', 'himalayan-white', 'copper-slate', 'crystal-gris', 'earthstone-grey', 'quartz-white'], from: 19.5, featured: true },
  { num: 'Edition III', name: 'Signature', why: 'Egyptian limestone, marble-effect large format for inside, and the circle kit. The pieces that make a garden a project.',
    ids: ['sinai-pearl', 'calacatta-blanco', 'saint-lawrence', 'miracle-statuario', 'kandla-circle', 'cladding'], from: 22.8 },
]

// This season's palette — a short, honest edit of what's on the ground now.
export const SEASON = { title: 'Autumn palette', ids: ['autumn-brown', 'raj-green', 'copper-slate', 'black-limestone'] }

// Stone families: where each material actually comes from and how it behaves.
export const FAMILIES = [
  { key: 'sandstone', name: 'Indian sandstone', lat: 'Rajasthan · sedimentary', cat: 'sandstone',
    text: 'Quarried and hand-split along its bedding planes, which is why the face is riven and no two slabs match. Kandla, Raj, Rippon, Autumn and Fossil are quarry districts, not brands.',
    note: '22 mm · uncalibrated · seal it or let it weather' },
  { key: 'limestone', name: 'Limestone', lat: 'Sinai & Kota · sedimentary', cat: 'limestone',
    text: 'Fine-grained and dense enough to saw and hone flat. Black Limestone is near-black wet and charcoal dry; Sinai Pearl carries fossil detail in a pale ground.',
    note: '20 mm · honed · sawn edges' },
  { key: 'outdoor', name: 'Vitrified porcelain', lat: 'Spain & Gujarat · fired at 1,200 °C', cat: 'outdoor',
    text: 'Pressed clay fired until it turns glassy: near-zero absorption, so it doesn\'t stain, freeze or grow algae. Calibrated, so it lays flat off a thin bed.',
    note: '20 mm R11 outside · 8 mm rectified inside' },
  { key: 'cladding', name: 'Split-face stone', lat: 'Mixed quarries · cleft', cat: 'cladding',
    text: 'Strips cleft from sandstone and quartzite blocks so each face breaks differently. Laid in a running bond it reads as a dry-stone wall.',
    note: '600 × 150 mm · 22 mm · walls only' },
]

// Colour drawn from the stones: one hue per family, used for tags, kickers,
// tints and the guides. Sand is the existing accent.
export const FAMILY_COLOUR = {
  sandstone: { c: '#3F6B4F', tint: '#EAF0EB', name: 'Raj green' },
  limestone: { c: '#4E6172', tint: '#E9EDF1', name: 'Kandla slate' },
  outdoor: { c: '#B5552E', tint: '#F6EAE2', name: 'Autumn rust' },
  indoor: { c: '#8A6D3B', tint: '#F3EDE1', name: 'Rippon buff' },
  cladding: { c: '#6B5E52', tint: '#EFEAE4', name: 'Cleft stone' },
}
