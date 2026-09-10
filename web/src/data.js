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

// Product photography as shot by Nitya Stones for the existing shop.
const PRODUCT_IMG = import.meta.glob('./assets/p-*.jpg', { eager: true, import: 'default' })
const pimg = (prefix) => {
  const key = Object.keys(PRODUCT_IMG).find(k => k.startsWith('./assets/p-' + prefix))
  if (!key) throw new Error('No product image for ' + prefix)
  return PRODUCT_IMG[key]
}

export const IMG = { hero, yard, pallets, slabTexture, payments, logoOriginal }

export const CAT_LABEL = {
  sandstone: 'Sandstone',
  limestone: 'Limestone',
  outdoor: 'Outdoor porcelain',
  indoor: 'Indoor porcelain',
  cladding: 'Cladding',
}

/*
 * Sizes, pack coverage and prices exactly as listed on nityastones.co.uk/shop.
 * `price` is per m² ex VAT unless `unit` says otherwise; `was` is the
 * struck-through shop price. `cover` is m² per pack/pallet.
 */
const sand = (prefix, name, size, pack, cover, price, was, extra = {}) => ({
  id: prefix, img: pimg(prefix), name, cat: 'sandstone', origin: 'Indian sandstone',
  size, thick: '22 mm, uncalibrated', pack, cover, finish: 'Riven, natural', price, was, tag: was ? `Was £${was.toFixed(2)}` : null, ...extra,
})
const out900 = (prefix, name, cover, price = 19.5, was = 25.5, finish = 'Matt, R11') => ({
  id: prefix, img: pimg(prefix), name, cat: 'outdoor', origin: 'Vitrified porcelain',
  size: '600 × 900 mm', thick: '20 mm', pack: `${cover.toFixed(2)} m² per pallet`, cover, finish, price, was, tag: `Was £${was.toFixed(2)}`,
})
const out600 = (prefix, name) => ({
  id: prefix, img: pimg(prefix), name, cat: 'outdoor', origin: 'Vitrified porcelain',
  size: '600 × 600 mm', thick: '16 mm', pack: '28.08 m² per pallet · £491.40', cover: 28.08, finish: 'Matt', price: 17.5, was: 21, tag: 'Pallet deal',
})
const indoor = (prefix, name, size, price = 22.8, was = null) => ({
  id: prefix, img: pimg(prefix), name, cat: 'indoor', origin: 'Indoor porcelain',
  size, thick: '8 mm', pack: 'Sold by the m²', cover: null, finish: 'Matt or gloss, slip resistant', price, was, tag: was ? `Was £${was.toFixed(2)}` : null,
})

export const RANGES = [
  sand('kandla-grey-22mm-sandstone-mixed', 'Kandla Grey', 'Mixed patio pack', '18.19 m² per pack', 18.19, 19.5, 22.2),
  sand('kandla-grey-22mm-sandstone-900', 'Kandla Grey 900×600', '900 × 600 mm', '18.90 m² per pack', 18.9, 19.5, 22.2, { tag: 'Splits' }),
  sand('raj-green', 'Raj Green', 'Mixed patio pack', '18.19 m² per pack', 18.19, 19.5, 22.2),
  sand('rippon-buff', 'Rippon Buff', 'Mixed patio pack', '18.19 m² per pack', 18.19, 19.5, 22.2),
  sand('autumn-brown', 'Autumn Brown', 'Mixed patio pack', '18.19 m² per pack', 18.19, 19.5, 24.2),
  sand('fossil-mint', 'Fossil Mint', 'Mixed patio pack', '18.19 m² per pack', 18.19, 19.5, 22.2),
  { id: 'kandla-circle', img: pimg('kandla-grey-circle'), name: 'Kandla Grey Circle Kit', cat: 'sandstone', origin: 'Indian sandstone',
    size: '2.85 m diameter', thick: '22 mm, uncalibrated', pack: 'Complete kit', cover: null, finish: 'Riven, natural', price: 400, was: 450, unit: 'per kit', tag: 'Was £450.00' },

  { id: 'black-limestone', img: pimg('black-limestone'), name: 'Black Limestone', cat: 'limestone', origin: 'Limestone',
    size: '600 × 600 mm', thick: '20 mm', pack: '18.00 m² per pack', cover: 18, finish: 'Honed, sawn edge', price: 19.5, was: 22.5, tag: 'Was £22.50' },
  { id: 'sinai-pearl', img: pimg('egyptian-sinai-pearl-600'), name: 'Egyptian Sinai Pearl', cat: 'limestone', origin: 'Egyptian limestone',
    size: '600 × 600 mm', thick: '20 mm', pack: '18.00 m² per pack', cover: 18, finish: 'Honed', price: 26, was: 28, tag: 'Was £28.00' },
  { id: 'sinai-pearl-mixed', img: pimg('egyptian-limestone-sinai-pearl-mixed'), name: 'Sinai Pearl Mixed Pack', cat: 'limestone', origin: 'Egyptian limestone',
    size: 'Mixed patio pack', thick: '20 mm', pack: 'Four sizes, laid random', cover: null, finish: 'Honed', price: 26, was: 28, tag: 'Was £28.00' },

  out900('bodo-white', 'Bodo White', 28.08),
  out900('himalayan-white', 'Himalayan White', 21.6),
  out900('quartz-white', 'Quartz White', 21.6),
  out900('crystal-gris', 'Crystal Gris', 21.6),
  out900('earthstone-grey', 'Earthstone Grey', 21.6),
  out900('kandla-grey-20mm-porcelain', 'Kandla Grey Porcelain', 21.6, 19.5, 24.5),
  out900('noor-grigio', 'Noor Grigio', 28.08),
  out900('hs-beige', 'HS Beige', 28.08),
  out900('copper-slate', 'Copper Slate', 21.6, 19.5, 25.5, 'Riven-effect, R11'),
  out600('beige-porcelain', 'Beige Porcelain'),
  out600('light-grey-porcelain', 'Light Grey Porcelain'),
  out600('black-porcelain', 'Black Porcelain'),

  indoor('calacatta-blanco', 'Calacatta Blanco', '600 × 1200 mm'),
  indoor('miracle-statuario', 'Miracle Statuario', '600 × 1200 mm', 22.8, 24.8),
  indoor('modern-statuario', 'Modern Statuario', '600 × 1200 mm'),
  indoor('saint-lawrence', 'Saint Lawrence Black Diamond', '600 × 1200 mm'),
  indoor('lobbies-silver', 'Lobbies Silver', '600 × 1200 mm'),
  indoor('jiniva-natural', 'Jiniva Natural', '600 × 1200 mm'),
  indoor('brit-raven', 'Brit Raven', '600 × 600 mm'),
  indoor('aspire-grey', 'Aspire Grey', '300 × 600 mm'),
  indoor('dark-stonella', 'Dark Stonella', '300 × 600 mm'),
  indoor('eden-ash', 'Eden Ash', '300 × 600 mm'),
  indoor('rovero-dark-grey', 'Rovero Dark Grey', '300 × 600 mm'),
  indoor('sand-grigio', 'Sand Grigio', '300 × 600 mm'),
  indoor('unika-gris', 'Unika Gris', '300 × 600 mm'),

  { id: 'cladding', img: pimg('stone-cladding'), name: 'Stone Cladding', cat: 'cladding', origin: 'Natural stone',
    size: '600 × 150 mm', thick: '22 mm, split face', pack: 'Sold by the m²', cover: null, finish: 'Split face, running bond', price: 28.8, was: null, tag: null },
]

export const SCENES = [
  { img: sceneAutumn, title: 'Autumn Brown, laid random', sub: 'Mixed patio pack, four sizes, wide pointed joints — photographed wet, which is how it looks most of the year.' },
  { img: sceneBodo, title: 'Bodo White, 20 mm porcelain', sub: 'Single size 600×900 half bond running straight out from the bifolds.' },
  { img: sceneCircle, title: 'Kandla Grey circle kit', sub: '2.85 m feature circle set into a straight field of the same stone.' },
  { img: sceneRajWet, title: 'Raj Green, wet', sub: 'Riven Indian sandstone straight after rain — greens, browns and rust come up together.' },
  { img: sceneHimalayan, title: 'Himalayan White terrace', sub: '600×900 porcelain with a fenced boundary and lawn edge.' },
  { img: scenePool, title: 'Poolside in porcelain', sub: 'R11 slip-rated, hoses clean, doesn\'t hold algae.' },
  { img: sceneCopper, title: 'Copper Slate, riven-effect', sub: 'Porcelain that reads as slate — laid on a full bed, pointed dark.' },
]

export const MIXED = [[900, 600], [600, 600], [600, 295], [295, 295]]

export const PATTERNS = [
  { title: 'Mixed patio pack', sub: '900×600, 600×600, 600×295, 295×295 — laid random, no repeat.', kind: 'mixed', tint: '#8A957F' },
  { title: '600×900 half bond', sub: 'Single size, each course offset by half. The standard porcelain lay.', kind: 'half', w: 900, h: 600, tint: '#B9B8B3' },
  { title: '600×600 stack bond', sub: 'Square, grid-aligned. Unforgiving of an out-of-square patio.', kind: 'stack', w: 600, h: 600, tint: '#3A3C36' },
  { title: '600×150 running bond', sub: 'Cladding, third-offset up a wall.', kind: 'third', w: 600, h: 150, tint: '#8C8377' },
]

export const FAQ = [
  ['Are your outdoor slabs calibrated or uncalibrated?',
   'Uncalibrated. Thickness varies across the pack, so lay them on a full wet bed and work to the top face, not the bottom. Our 20 mm outdoor porcelain is the opposite — dead consistent, if that\'s what you\'d rather lay.'],
  ['Why are some of my slabs slightly different shades?',
   'Because they\'re natural stone. Depending on the batch number there can be a slight difference in shade between pallets. It\'s not a fault, and it\'s the reason experienced layers mix from three or four packs at once rather than working through one pallet at a time.'],
  ['Do you split packs?',
   'We split outdoor porcelain packs and Kandla Grey 600×900 packs. Mixed sandstone patio packs can\'t be split — the four sizes come banded as a set.'],
  ['How long does delivery take, and what happens on the day?',
   'Three to four working days once payment has been received. Delivery lands between 8am and 6pm, we call you on the day, and someone needs to be there to sign for it.'],
  ['Is there a minimum order?',
   'No minimum if you\'re collecting from the warehouse. There is a minimum for delivery — it depends on quantity and where you are, so ring and we\'ll tell you straight away.'],
  ['Can I order and pay over the phone?',
   'Yes. Call 0330 236 9227 during yard hours and we\'ll take the order and the payment on the same call.'],
  ['Are your indoor tiles slip resistant, and what finishes are there?',
   'Yes, they are. Standard stock comes matte or gloss. On a custom order you choose the finish, subject to the 120 m² minimum.'],
]

export const REVIEWS = [
  { quote: 'Great service, great stones — fast delivery! Highly recommended.', who: 'Laura Cooper', what: 'Sandstone patio' },
  { quote: 'Top quality porcelain outdoor tiles. Definitely recommend.', who: 'Rajan Sahonte', what: '20 mm outdoor porcelain' },
]

export const money = (n) => '£' + n.toFixed(2)
