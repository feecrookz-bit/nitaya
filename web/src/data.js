import hero from './assets/hero.jpg'
import sandstoneBuff from './assets/sandstone-buff.jpg'
import sandstoneWarm from './assets/sandstone-warm.jpg'
import sandstoneMint from './assets/sandstone-mint.jpg'
import claddingBlack from './assets/cladding-black.jpg'
import claddingRustic from './assets/cladding-rustic.jpg'
import slabGrey from './assets/slab-grey.jpg'
import quarry from './assets/quarry.jpg'
import terracePorcelain from './assets/terrace-porcelain.jpg'
import gardenFlagstone from './assets/garden-flagstone.jpg'
import pavingCircle from './assets/paving-circle.jpg'
import indoorPorcelain from './assets/indoor-porcelain.jpg'

export const IMG = {
  hero, sandstoneBuff, sandstoneWarm, sandstoneMint, claddingBlack, claddingRustic,
  slabGrey, quarry, terracePorcelain, gardenFlagstone, pavingCircle, indoorPorcelain,
}

// Placeholder photography, all from Pexels (free licence, commercial use).
// Replace with yard photography before launch.
export const CREDITS = [
  ['Hero terrace', 'Arlind Photography'],
  ['Sandstone textures', 'Christian Hembert, Alfo Medeiros'],
  ['Grey slab', 'cottonbro'],
  ['Quarry', 'Sumant Sagar'],
  ['Porcelain terrace', 'Pexels contributor'],
  ['Flagstone garden', 'Brett A'],
  ['Circular paving', 'Strannik SK'],
  ['Indoor porcelain', 'Lisa Anna'],
  ['Cladding', 'Sora Noao, Nicole Amelia Objio'],
]

export const CAT_LABEL = {
  sandstone: 'Sandstone',
  limestone: 'Limestone',
  outdoor: 'Outdoor porcelain',
  indoor: 'Indoor porcelain',
  cladding: 'Cladding',
}

// Sizes, pack coverage and prices as listed on the Nitya Stones shop.
// `price` is per m² ex VAT; null means no published rate ("Ask the yard").
// `tint` is the range colour laid over a representative riven texture.
export const RANGES = [
  { id: 'kandla-grey', name: 'Kandla Grey', cat: 'sandstone', origin: 'Indian sandstone',
    size: '600 × 900 mm', thick: '22 mm, uncalibrated', pack: 'Mixed patio pack or single size',
    cover: null, finish: 'Riven, natural', price: null, was: null, tag: 'Splits',
    tint: '#9AA0A8', texture: 'buff' },
  { id: 'raj-green', name: 'Raj Green', cat: 'sandstone', origin: 'Indian sandstone',
    size: 'Mixed patio pack', thick: '22 mm, uncalibrated', pack: 'Four sizes, laid random',
    cover: null, finish: 'Riven, natural', price: null, was: null, tag: null,
    tint: '#8A957F', texture: 'mint' },
  { id: 'rippon-buff', name: 'Rippon Buff', cat: 'sandstone', origin: 'Indian sandstone',
    size: 'Mixed patio pack', thick: '22 mm, uncalibrated', pack: 'Four sizes, laid random',
    cover: null, finish: 'Riven, natural', price: null, was: null, tag: null,
    tint: '#D4B98C', texture: 'buff' },
  { id: 'autumn-brown', name: 'Autumn Brown', cat: 'sandstone', origin: 'Indian sandstone',
    size: 'Mixed patio pack', thick: '22 mm, uncalibrated', pack: '18.19 m² per pack',
    cover: 18.19, finish: 'Riven, natural', price: 19.5, was: 24.2, tag: 'Was £24.20',
    tint: '#A87E58', texture: 'warm' },
  { id: 'fossil-mint', name: 'Fossil Mint', cat: 'sandstone', origin: 'Indian sandstone',
    size: 'Mixed patio pack', thick: '22 mm, uncalibrated', pack: 'Four sizes, laid random',
    cover: null, finish: 'Riven, natural', price: null, was: null, tag: null,
    tint: '#D6D2B4', texture: 'mint' },
  { id: 'black-limestone', name: 'Black Limestone', cat: 'limestone', origin: 'Limestone',
    size: '600 × 600 mm', thick: '20 mm', pack: '18.00 m² per pack',
    cover: 18, finish: 'Honed, sawn edge', price: 19.5, was: 22.5, tag: 'Was £22.50',
    tint: '#3A3C36', texture: 'grey' },
  { id: 'sinai-pearl', name: 'Egyptian Sinai Pearl', cat: 'limestone', origin: 'Limestone',
    size: '600 × 600 mm', thick: '20 mm', pack: 'Ask for current pack',
    cover: null, finish: 'Honed', price: null, was: null, tag: null,
    tint: '#DDD4C2', texture: 'grey' },
  { id: 'bodo-white', name: 'Bodo White Porcelain', cat: 'outdoor', origin: 'Vitrified porcelain',
    size: '600 × 900 mm', thick: '20 mm', pack: '21.60 m² per pallet',
    cover: 21.6, finish: 'Matt, R11', price: 19.5, was: 25.5, tag: 'Was £25.50',
    tint: '#E4E1DA', texture: 'grey' },
  { id: 'crystal-gris', name: 'Crystal Gris Porcelain', cat: 'outdoor', origin: 'Vitrified porcelain',
    size: '600 × 900 mm', thick: '20 mm', pack: '21.60 m² per pallet',
    cover: 21.6, finish: 'Matt, R11', price: 19.5, was: 25.5, tag: 'Was £25.50',
    tint: '#A3A3A0', texture: 'grey' },
  { id: 'copper-slate', name: 'Copper Slate Porcelain', cat: 'outdoor', origin: 'Vitrified porcelain',
    size: '600 × 900 mm', thick: '20 mm', pack: '21.60 m² per pallet',
    cover: 21.6, finish: 'Riven-effect, R11', price: 19.5, was: 25.5, tag: 'Was £25.50',
    tint: '#7A6252', texture: 'warm' },
  { id: 'earthstone-grey', name: 'Earthstone Grey Porcelain', cat: 'outdoor', origin: 'Vitrified porcelain',
    size: '600 × 900 mm', thick: '20 mm', pack: '21.60 m² per pallet',
    cover: 21.6, finish: 'Matt, R11', price: 19.5, was: 25.5, tag: 'Was £25.50',
    tint: '#787A76', texture: 'grey' },
  { id: 'beige-porcelain', name: 'Beige Porcelain', cat: 'outdoor', origin: 'Vitrified porcelain',
    size: '600 × 600 mm', thick: '16 mm', pack: '28.08 m² per pallet · £491.40',
    cover: 28.08, finish: 'Matt', price: 17.5, was: 21, tag: 'Pallet deal',
    tint: '#D3C6B0', texture: 'grey' },
  { id: 'calacatta', name: 'Calacatta Blanco', cat: 'indoor', origin: 'Indoor porcelain',
    size: '600 × 1200 mm', thick: '8 mm', pack: 'Sold by the m²',
    cover: null, finish: 'Matt or gloss, slip resistant', price: 22.8, was: null, tag: null,
    tint: '#F0EDE7', texture: 'indoor' },
  { id: 'aspire-grey', name: 'Aspire Grey', cat: 'indoor', origin: 'Indoor porcelain',
    size: '300 × 600 mm', thick: '8 mm', pack: 'Sold by the m²',
    cover: null, finish: 'Matt or gloss, slip resistant', price: 22.8, was: null, tag: null,
    tint: '#ACAEAB', texture: 'indoor' },
  { id: 'brit-raven', name: 'Brit Raven', cat: 'indoor', origin: 'Indoor porcelain',
    size: '600 × 600 mm', thick: '8 mm', pack: 'Sold by the m²',
    cover: null, finish: 'Matt or gloss, slip resistant', price: 22.8, was: null, tag: null,
    tint: '#54585A', texture: 'indoor' },
  { id: 'cladding', name: 'Stone Cladding', cat: 'cladding', origin: 'Natural stone',
    size: '600 × 150 mm', thick: 'Split face', pack: 'Ask for current pack',
    cover: null, finish: 'Split face, running bond', price: null, was: null, tag: null,
    tint: null, texture: 'cladding' },
]

export const TEXTURE = {
  buff: sandstoneBuff,
  warm: sandstoneWarm,
  mint: sandstoneMint,
  grey: slabGrey,
  indoor: indoorPorcelain,
  cladding: claddingRustic,
}

export const SCENES = [
  { img: gardenFlagstone, title: 'Riven sandstone, laid random', sub: 'Mixed patio pack, four sizes, wide pointed joints. The classic English garden lay.' },
  { img: terracePorcelain, title: '20 mm porcelain terrace', sub: 'Single size 600×900 half bond. Calibrated, non-slip, hoses clean.' },
  { img: pavingCircle, title: 'Circle and border', sub: 'A feature circle set into a straight field — cut from the same pack.' },
  { img: claddingRustic, title: 'Split-face cladding', sub: '600×150 strips in a running bond on a garden wall or a fireplace.' },
]

// The four sizes that come banded together in a mixed patio pack.
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
