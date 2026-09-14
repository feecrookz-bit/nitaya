// All the words in the owner pack live here. build.mjs turns this into
// present/index.html. No figures anywhere by design: costs are for the
// conversation, not the page.

export const META = {
  title: 'Nitya Stones Upgrade Pack',
  heading: 'The website upgrade',
  sub: 'A working demonstration of the new nityastones.co.uk, built before any backend is connected, so the decision can be made on the real thing.',
  link: 'https://feecrookz-bit.github.io/nitaya/',
  password: 'nitya2026!!',
  date: 'September 2026',
}

export const ONE_MINUTE = [
  ['What it is', 'Every product, price, sale price and photograph from the current store, in a new front end built for phones as much as desktops. Thirty-six ranges with the store’s own photographs and a studio render of each slab, the two customer reviews the store already shows, and the original logo. Nothing has been invented: where the demo states a fact, it comes from the current site or from you.'],
  ['What it isn’t yet', 'It takes no payments and sends no emails. The bag and checkout are real screens that stop at the last step with a note saying so. Nothing a visitor does is stored anywhere but their own phone. The store’s blog posts, legal pages and account area are not in it yet; what happens to each is set out below.'],
  ['What we need from you', 'A handful of decisions, most of them yes or no, and about half a day at the yard with a phone for photographs. The lists are at the end. Nothing technical.'],
]

// Before/after pairs. `orig` and `neu` are the shot names from shoot.mjs.
export const PAIRS = [
  { key: 'home', title: 'Home', orig: 'orig-d-home', neu: 'new-d-home', points: [
    'One full-width photograph of a real customer’s garden opens the site, with the logo on it, instead of a slider of promotions.',
    'The four things a visitor wants first are on the first screen: what you sell, since when, how quickly it arrives, and trade.',
    'A drag-to-turn slab of Raj Green, the three curated editions, this season’s picks, current offers, the patio builder, the stone families, customers’ gardens, how you buy, the price calculator, reviews and guides follow in that order.',
  ], note: 'The current site’s opening slider is script-driven and did not render in the capture tool, which is why its top band shows blank here; in a browser it shows promotional slides.' },
  { key: 'shop', title: 'Shop', orig: 'orig-d-shop', neu: 'new-d-shop', points: [
    'One shop, filtered by family: sandstone, limestone, outdoor porcelain, indoor porcelain, cladding, and an Offers tab that collects everything below list price.',
    'Search across every range, and sort by price or name.',
    'Four editor’s picks (Kandla Grey, Raj Green, Bodo White, Quartz White) get a wider card with a real garden photograph; the rest sit in a clean grid with the render, size, thickness and the was/now price.',
  ] },
  { key: 'product', title: 'Product page', orig: 'orig-d-product', neu: 'new-d-product', points: [
    'Every photograph the store has for the product, in a gallery with arrows, thumbnails and a full-screen view. Raj Green has six frames; Kandla Grey has seven; Quartz White has ten.',
    'See it in 3D: the slab turned in the hand or laid in its pattern, dry or wet, textured with the yard’s own photograph. A wet/dry slider, the feature list, a specification table, what is in a mixed pack (16 / 16 / 16 / 12 slabs), the description rewritten, laying and care notes, and the store’s own honesty notes about natural variation.',
    'A unit table first: per m², single slab and pack, with the was and now prices. Order by the pack or by the area; ranges that split take whole packs plus loose slabs, and the area line says exactly what leaves the yard (1 × 21.60 m² + 9 × 0.54 m² = 26.46 m²). Pack sizes come from your warehouse database.',
    'Under the button: delivery from a date three working days out, free over £500 inside the M25, collect free from Mark Road with the hours, a delivery estimate by postcode, and a £5 sample. Then what pairs with it, the area calculator and the rest of the family.',
  ] },
  { key: 'cart', title: 'Bag and checkout', orig: 'orig-d-cart', neu: 'new-d-checkout', points: [
    'The bag shows packs and loose slabs with their coverage in square metres, ex-VAT and inc-VAT totals, the pallet count, the earliest delivery date and a delivery estimate for a postcode.',
    'Checkout asks for name, phone, email, address, delivery (from a date, free over £500 inside the M25) or collection from Mark Road (address, map, hours), access notes, and card, Klarna or pay-by-phone, exactly as the live store will.',
    'It stops at the last step with a plain note that nothing is charged in the demo. In the live store this step hands to your existing WooCommerce.',
  ] },
  { key: 'blog', title: 'Blog, becoming Guides', orig: 'orig-d-blog', neu: 'new-d-blog', points: [
    'The current blog is forty-five articles. The demo replaces the format with Guides: the things you tell customers across the counter, written down, with drawings to scale.',
    'Nine guides so far: porcelain or sandstone, laying sandstone, laying porcelain, how many packs, sealing, cleaning, why slabs vary, mixed packs, delivery day.',
    'The existing articles are not in the demo yet. At go-live they move under Guides with redirects from their old addresses so Google keeps sending the traffic.',
  ] },
  { key: 'wholesale', title: 'Wholesale, becoming Trade', orig: 'orig-d-wholesale', neu: 'new-d-wholesale', points: [
    'What an account includes, in four cards, then an application form the landscaper can send from their phone.',
    'The four ranges trade buys most, with the trade sheet described as the shop list with the volume column filled in.',
    'The wording of the offer is yours to confirm; the demo states a typical one.',
  ] },
  { key: 'contact', title: 'Contact', orig: 'orig-d-contact', neu: 'new-d-contact', points: [
    'Both phone numbers, WhatsApp, email, the address with a Google Maps link, and opening hours as a table, all tappable on a phone.',
    'An enquiry form that composes an email, and a call button.',
    'The same details sit in the footer of every page and in the structured data Google reads.',
  ] },
  { key: 'about', title: 'About', orig: 'orig-d-about', neu: 'new-d-about', points: [
    'The yard, in photographs and three lines: bought direct, held on our ground, looked at before it leaves.',
    'How ordering works, delivery bands, collection, and the laying patterns drawn to scale.',
    'The seven project photographs on the current About page now live in Projects, with nine more found in the store’s listings and blog, each captioned with what is in it and linked to the stone or the range.',
  ] },
]

export const MOBILE = [
  { key: 'm-home', title: 'Home on a phone', orig: 'orig-m-home', neu: 'new-m-home' },
  { key: 'm-product', title: 'Product page on a phone', orig: 'orig-m-product', neu: 'new-m-product' },
  { key: 'm-menu', title: 'The menu on a phone', orig: 'orig-m-menu', neu: 'new-m-menu' },
]
export const MOBILE_NOTE = 'Most visitors to a paving site arrive on a phone, often from the garden. Every screen was checked at five widths from 360 px up; every tap target is at least 44 px; text never drops below 12 px.'

export const NEW_ONLY = [
  { shot: 'new-d-collections', title: 'Collections', text: 'Three editions (Essentials, Premium Select, Signature) arrange the same stock by what it is for. Same prices; the curation is the point.' },
  { shot: 'new-d-build', title: 'Build your patio', text: 'Pick a stone, type the dimensions, pick a laying pattern: it works out whole packs, the price, and saves the design to come back to or reorder from.' },
  { shot: 'new-d-lightbox', title: 'Full-screen photographs', text: 'Every product photograph opens full screen, swipeable, with a counter.' },
  { shot: 'new-d-3d', title: 'See it in 3D', text: 'Every range as one slab turned in the hand, or laid in its pattern with pointed joints (a wall for cladding), dry or wet. The face is the yard’s own photograph.' },
  { shot: 'new-d-product-light', title: 'Light and dark', text: 'The site opens dark, which suits the stone photography. One tap switches to a light version and the choice is remembered. Either can be the default.' },
  { shot: 'new-d-projects', title: 'Projects', text: 'Twenty-three customers’ gardens and rooms: the seven from the current About page and nine more from the listings and the blog, each tapping through to the stone or the range. Grows as you send photographs.' },
  { shot: 'new-d-offers', title: 'Offers', text: 'Everything currently below list price in one place, from the store’s own was/now prices. A pop-up, once a week per visitor, tells a new visitor the biggest saving and how many ranges are on offer; it never appears on the bag or checkout.' },
  { shot: 'new-d-samples', title: 'Samples', text: '£5 samples of every range, added to the bag from the product page or from one page of all of them.' },
  { shot: 'new-m-build', title: 'The builder on a phone', text: 'Works one-handed, standing in the garden.' },
]

export const KEPT = [
  'All 36 products, with the four sample-only listings folded into the £5 sample flow.',
  'Every price and every sale price as listed today, including the pallet prices for the 16 mm porcelain.',
  'The original logo, cleaned up and used at every size: header, footer, hero, the preview gate, favicon.',
  'All 136 photographs from the store, including the project photographs on its About page, in its listings and in its blog, graded to sit together, with the duplicate uploads removed.',
  'Phone numbers, WhatsApp, email, address and opening hours as on the current site.',
  'The two customer reviews the store shows today, word for word.',
  'The store’s own honesty notes: natural variation, batch variation, order ten per cent over, renders are illustrative.',
]

export const NOT_YET = [
  ['Blog (45 articles)', 'Moves under Guides at go-live with redirects from the old addresses, so search rankings hold.'],
  ['Terms & Conditions, Privacy, Refund & Returns, Delivery Terms', 'Come across as they are, linked from the footer.'],
  ['My Account', 'Comes with WooCommerce when the checkout is connected.'],
  ['Designer page', 'A product-designer plugin on the current site. Tell us if it is used; if not, it is dropped.'],
  ['Special Deal page', 'Becomes the Offers tab, which already exists.'],
  ['Delivery rates', 'The demo shows indicative bands marked as such, and follows your published terms for the rest. Your real per-pallet rates replace the bands when convenient.'],
]

export const DECISIONS = [
  { h: 'Copy the demo states as fact, from your current listings', items: [
    'Trading since 2016.',
    'Price match.',
    'Split packs: outdoor porcelain and Kandla Grey 600 × 900 only; mixed sandstone packs never.',
    'Custom sizes, colours or finishes from 120 m², up to eight weeks.',
    'Klarna accepted.',
    'Samples £5 each. (Or free, or refunded against a first order?)',
    'Delivery: 3–5 working days standard; free standard delivery on orders over £500 inside the M25. Both from your Delivery Terms page.',
  ] },
  { h: 'Where your current listings disagree with themselves', items: [
    'Sandstone is calibrated to 22 mm (the listings say so; the demo says so).',
    'Egyptian Sinai Pearl is shown as honed (the listing bullet says riven; the photograph says honed).',
    'Black Limestone is shown as riven with hand-dressed edges (per the listing).',
    'The 600 × 900 porcelain pallets: 28.08 m² for Bodo White, HS Beige and Noor Grigio and 21.60 m² for the rest, per the product titles. The attribute box on every listing says 21.30.',
    'Indoor tiles: all £22.80 per m², no sale price.',
    'The Kandla Grey Circle Kit listing carries a Copper Slate description by mistake; the demo describes the circle.',
  ] },
  { h: 'Choices', items: [
    'Your Kandla Grey listing says “we operate our own stone quarries in India”. If that is right, it is the strongest line on the site and we will use it. If not, we leave it out.',
    'Dark or light as the default look.',
    'The mobile number and WhatsApp on the site, as on the current one? (Yes in the demo.)',
    'The current site links a Twitter/X account. Keep it?',
    'The trade offer in your words: terms, pallet pricing, who the contact is.',
    'A see-it-laid visualiser: yes, later, or no. The options are below.',
    'Projects: which stone is in each photograph? Your site names only the Quartz White terrace. The rest are captioned by what can be seen and by where you filed them (Kandla Grey, Raj Green, Copper Slate). Tell us the stone for the others and the captions change.',
    'Two grey-patio photographs on your home page carry another supplier’s file names. They are left out until you confirm they are yours.',
  ] },
  { h: 'Pack sizes: settled by your warehouse database', items: [
    'The demo follows the database sheet everywhere: mixed sandstone 18.19 m²; Kandla Grey 900 × 600, 40 slabs; Black Limestone 22 mm, 38 slabs; Fossil Mint as the active 900 × 600 pack of 37 slabs; 600 × 900 porcelain 40 slabs; 16 mm 600 × 600 pallets 80 slabs in boxes of 2; indoor tiles and cladding by the box.',
    'Five listings on the current store say something else and want correcting: Kandla Grey 900 × 600 (18.90 m²), Black Limestone (18 m² at 20 mm), Bodo White, Noor Grigio and HS Beige (28.08 m²), Fossil Mint (mixed pack), the 16 mm pallets (28.08 m²).',
    'Sinai Pearl is not in the sheet; the demo assumes 50 slabs of 600 × 600. Add it to the sheet.',
    'Where the sheet and the shop use different names we matched by size: the 16 mm pallets to the Clorado rows, Aspire Grey to Aspire Anthra. A name tidy in the sheet removes the guesswork.',
    'Steps, edging, granite setts, cobbles, jointing compounds and primer from the database are now on the site as Essentials, priced at the counter, with an Ask for a price button. Give us the prices and they become ordinary products.',
    'Cladding: your listing shows six colourways with no names, so the demo sells six products named by colour (Buff Mix, Silver Quartz, Mint, Slate Green, Kandla Grey, Pale Grey). The database names four: Mandawar, Kandla Grey, Jack Black, Rock Face Mint. Which is which?',
  ] },
  { h: 'Against Royale Stones (their site, read on 14 September)', items: [
    'On every range you both sell, your listed price is level or under theirs, before VAT. Say so once the price-match line is confirmed.',
    'They charge £80 to split a pallet and offer a paid cutting service. Do you? The demo splits outdoor porcelain and Kandla Grey 900 × 600 with no fee shown.',
    'They sell the mixed patio pack in 5 m² and 10 m² sizes at a higher rate. Do you want to?',
    'They show seventy-two reviews on one product and a Trustpilot slider. A Google Business or Trustpilot link is on the yard list.',
  ] },
]

export const YARD = [
  ['The photographs you already have', 'Send the originals, full size, not through WhatsApp: the straight-down slab shots (dry and hosed), the laid patios and any finished gardens. A shared folder or a memory stick at the yard is fine. They replace the simulated wet view, sharpen the 3D one and fill Projects.'],
  ['A twenty-second video', 'Landscape, phone: a hose over a Raj Green slab, then a slow walk across a laid patio. It becomes the opening of the site.'],
  ['Reviews', 'A Google Business or Trustpilot link if there is one, and any written reviews with the customer’s permission.'],
  ['The logo as a vector or a large file', 'AI, EPS, SVG or PDF, or a PNG at least 2,000 px wide. The demo uses the small web logo cleaned up; it holds on screen but print needs the original.'],
  ['Trade', 'What an account actually includes.'],
  ['Delivery rates', 'Real per-pallet rates by area, when convenient.'],
  ['Instagram', 'Switch the account to a Business profile (free) if you want the feed on the site.'],
]

export const GO_LIVE = [
  ['You', 'Confirm the copy and the choices above.'],
  ['You', 'Half a day at the yard for the photographs and the video.'],
  ['Us', 'Connect the demo to your existing WooCommerce: products, stock, payments, orders and emails come from it. The same fields you use now.'],
  ['Us', 'Move the blog articles under Guides and bring the legal pages across, with redirects from every old address.'],
  ['Us', 'Put your real delivery rates in.'],
  ['You and us', 'Point nityastones.co.uk at the new site and remove the preview password. The old site stays available until you are happy.'],
]

export const OPTIONS = [
  ['Built into the site', 'A customer photographs their garden, taps the four corners of the patio, and the chosen stone is laid onto the photograph in the chosen pattern. Uses the textures and pattern engine already in the site. Needs the four straight-down photographs above. On brand, no monthly fee, and it drives the £5 sample.'],
  ['A licensed tool', 'A one-line embed from a visualiser company. Quick to switch on; indoor-first; the customer’s leads sit in their system; a monthly fee for as long as it runs.'],
  ['The slab in your garden', 'The existing 3D slab exported so a phone can place one slab on the ground through the camera. Free to add; one slab rather than a laid patio.'],
]
export const OPTIONS_NOTE = 'Recommendation if you want it: build it into the site, add the free single-slab view, and trial a licensed tool alongside as a comparison. None of this is needed for go-live.'

export const HOW_TO_VIEW = [
  'Open the link on a phone or a computer and enter the password. The page decrypts in your browser; nothing is sent anywhere.',
  'Tap the sun/moon button in the header to switch between dark and light.',
  'Add things to the bag and go through checkout; nothing is charged and nothing is stored beyond your own device.',
  'Everything you see is a real screen. If a detail is wrong, it is a five-minute change.',
]
