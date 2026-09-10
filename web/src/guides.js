/*
 * Guides — the old blog, rebuilt as things a customer actually needs to know
 * before and after buying. Every figure here is standard UK paving practice;
 * where an installer's judgement matters, the guide says so.
 */
export const GUIDES = [
  {
    slug: 'porcelain-or-sandstone', family: 'outdoor', minutes: 5,
    title: 'Porcelain or sandstone? Choosing for a UK garden.',
    standfirst: 'The honest trade-offs between riven Indian sandstone and 20 mm vitrified porcelain, so you pick for the garden you have rather than the photo you saw.',
    sections: [
      { h: 'What you\'re actually choosing between', p: ['Sandstone is quarried, hand-split rock. Every slab is different, the face is riven, and the thickness varies across a pack. Porcelain is pressed clay fired until it turns glassy: dead flat, calibrated, and identical slab to slab.', 'Neither is "better". They behave differently, and they suit different gardens and different budgets for the work, not just the stone.'] },
      { h: 'Where sandstone wins', p: ['Character: no two slabs match, and the colour deepens when it\'s wet. It suits older houses, brick, and planting that spills over edges. It\'s also more forgiving to lay by hand: an uncalibrated riven slab on a full mortar bed hides a slightly uneven base.', 'Cost of the stone is the same as our porcelain per m², but sandstone doesn\'t need a primer slurry or a rectified-joint finish, so the labour is usually cheaper.'] },
      { h: 'Where porcelain wins', p: ['Maintenance. Porcelain absorbs almost nothing, so it doesn\'t stain, doesn\'t grow algae in the shade, doesn\'t need sealing and hoses clean. It stays the colour you chose. Around a pool, a barbecue, or under trees that drop fruit, that matters.', 'Consistency. If you want a tight, modern grid with 3–5 mm joints running straight out from bifold doors, porcelain is the only way to get it.'] },
      { h: 'The two questions that decide it', p: ['Who\'s laying it? A landscaper who lays porcelain weekly will get a perfect finish; sandstone is kinder to a first-time DIY job.', 'How much shade? North-facing and under trees, sandstone will green up and need an annual clean. Porcelain won\'t.', 'Still torn: order a £5 sample of each, put them on the ground where the patio is going, and look at them wet and dry over a weekend.'] },
    ],
    related: ['raj-green', 'bodo-white', 'kandla-grey', 'crystal-gris'],
  },
  {
    slug: 'laying-indian-sandstone', family: 'sandstone', minutes: 7,
    title: 'How to lay Indian sandstone.',
    standfirst: 'Full bed, primed backs, 10 mm joints and a fall of 1 in 80. The method that stops slabs rocking and stops the patio holding water.',
    sections: [
      { h: 'Base', p: ['Dig out to 150 mm below finished level (more on clay). Lay 100 mm of MOT Type 1 in two compacted layers, wacker-plated, with a fall of at least 1 in 80 away from the house — 12.5 mm per metre. Falls are set in the base, not made up in the mortar.'] },
      { h: 'Bed', p: ['Riven sandstone is uncalibrated: slabs in one pack vary by several millimetres. That\'s why it goes on a full wet bed of 4:1 sharp sand to cement, 30–40 mm thick, never on dabs. Dabs leave voids that hold water, freeze and lift the slab.', 'Prime the back of every slab with an SBR or proprietary primer slurry before it goes down. It bonds the stone to the bed and stops the picture-framing you see on patios laid dry.'] },
      { h: 'Laying', p: ['Work to the top face, not the bottom. Tap each slab down to the line with a rubber mallet and check it with a level across two slabs at a time. Mix from three or four packs as you go so the shade variation spreads across the patio rather than banding.', 'Mixed patio packs are four sizes to be laid random: no straight joint should run more than about 1.5 m in either direction. Sketch a few courses before you start.'] },
      { h: 'Joints', p: ['10 mm is the standard joint for riven sandstone; the riven edge needs the room. Point with a 3:1 sand and cement mix, or a brush-in jointing compound once the bed has cured. Keep cement off the face — it stains, and sandstone won\'t take acid to clean it off.'] },
      { h: 'After', p: ['Keep foot traffic off for 48 hours. Wait a few weeks before any sealer, so the stone has dried out fully. Whether you seal at all is covered in the sealing guide.'] },
    ],
    related: ['kandla-grey', 'raj-green', 'rippon-buff', 'autumn-brown'],
  },
  {
    slug: 'laying-20mm-porcelain', family: 'outdoor', minutes: 6,
    title: 'Laying 20 mm porcelain outside.',
    standfirst: 'Porcelain is unforgiving of shortcuts. Slurry primer, a solid bed, tight joints, and the right jointing compound.',
    sections: [
      { h: 'Why it\'s different', p: ['Porcelain absorbs almost no water, which is the point of it — and also why plain mortar won\'t grip the back. Every slab needs a coat of slurry primer on the underside, applied wet and laid straight into the bed. Skip it and the slabs will lift within a winter.'] },
      { h: 'Base and bed', p: ['Same base as sandstone: 100 mm compacted Type 1 with falls of 1 in 80. Bed is a full 30–40 mm of 4:1 sharp sand and cement, or a proprietary porcelain bedding mortar. Because the slabs are calibrated, the bed can be laid level and the slabs just tapped in — no working to the top face.'] },
      { h: 'Cutting', p: ['A wet-cut diamond blade on a bridge saw or a rail saw. Porcelain chips with a grinder and won\'t score-and-snap. Cut with the face up, slowly, and keep the blade wet. Factor the 10% cutting allowance into your order — the calculator does.'] },
      { h: 'Joints', p: ['Rectified porcelain takes 3–5 mm joints. Use a two-part resin or a proper brush-in porcelain compound; standard sand-and-cement pointing will crack against a slab that doesn\'t move. Clean the face as you go — resin haze is much harder to shift once cured.'] },
      { h: 'Alternatives to a mortar bed', p: ['On a roof terrace or over a membrane, 20 mm porcelain goes down on adjustable pedestals or a grid system, dry, with open joints. Ask us before ordering if that\'s the job — the slab is the same, the accessories aren\'t.'] },
    ],
    related: ['bodo-white', 'himalayan-white', 'copper-slate', 'earthstone-grey'],
  },
  {
    slug: 'how-many-packs', family: 'sandstone', minutes: 3,
    title: 'How many packs? Measuring a patio properly.',
    standfirst: 'Length by width, plus an allowance for cuts, rounded up to whole packs. The maths that stops you being one pack short on a Sunday.',
    sections: [
      { h: 'Measure', p: ['Measure the finished paved area in metres — length by width. For an L-shape, split it into rectangles and add them. For a circle, it\'s π × radius², but you\'ll be buying a circle kit anyway.'] },
      { h: 'Add cuts', p: ['Add 10% for a straight patio with simple edges. Add 15–20% for diagonals, curves, steps, or a lot of edge against a house or a wall. This isn\'t waste; it\'s the pieces that are cut and can\'t be used elsewhere.'] },
      { h: 'Round to packs', p: ['Divide by the pack coverage and round up. A mixed sandstone pack covers 18.19 m²; a 600×900 porcelain pallet 21.60 or 28.08 m². Mixed sandstone packs can\'t be split, so a 30 m² patio is two packs — 36.38 m² — and the extra stays in the garage for the day a slab cracks.', 'Outdoor porcelain and Kandla Grey 600×900 packs can be split, so on those you can order closer to the number.'] },
      { h: 'Do it for you', p: ['The Build Your Patio tool does all of this and puts the packs in the bag. Or ring the yard with the dimensions.'] },
    ],
    related: ['kandla-grey-900', 'fossil-mint', 'bodo-white'],
  },
  {
    slug: 'sealing-sandstone', family: 'sandstone', minutes: 4,
    title: 'Sealing sandstone: whether, when and what.',
    standfirst: 'Sealing isn\'t compulsory. It changes how the stone looks and how it ages, so decide before the first winter.',
    sections: [
      { h: 'Whether', p: ['Unsealed sandstone weathers: it greys a little, takes on lichen in shade, and shows a wet patch after rain. Plenty of people want exactly that. Sealed, it holds its dry colour, sheds water, and is easier to keep clean — but any sealer has to be re-applied every few years and, done badly, can leave a patchy sheen.'] },
      { h: 'When', p: ['Not straight after laying. The bed and the pointing need to cure and the stone needs to dry out fully — four to six weeks of dry weather, longer over winter. Sealing damp stone traps moisture and the sealer fails.'] },
      { h: 'What', p: ['An impregnating (penetrating) sealer keeps the natural matt look and is the safe choice. A colour-enhancing sealer deepens the tones to roughly the "wet look" permanently — striking on Raj Green and Autumn Brown, but test it on a spare slab first because there is no going back.', 'Never use a topical acrylic "wet-look" coating on riven sandstone: it sits on the surface, peels, and yellows.'] },
      { h: 'Limestone is different', p: ['Black Limestone in particular fades in sunlight and marks with anything acidic. Most people seal it with a colour-enhancer within the first weeks, and re-do it every couple of years. Ask us when you order.'] },
    ],
    related: ['raj-green', 'autumn-brown', 'black-limestone'],
  },
  {
    slug: 'cleaning-a-patio', family: 'limestone', minutes: 4,
    title: 'Cleaning a patio without wrecking it.',
    standfirst: 'What each stone will and won\'t tolerate — acids, pressure washers and the bleach your neighbour swears by.',
    sections: [
      { h: 'Sandstone', p: ['Warm water, a stiff brush and a patio cleaner meant for natural stone. Pressure washers are fine on a fan setting at a distance; a jet nozzle up close will blow out the joints and lift the riven surface. Never use brick acid or any acid-based cleaner — it will burn the stone.'] },
      { h: 'Limestone', p: ['Alkaline cleaners only. Anything acidic — brick acid, vinegar, a lot of "patio" products, even a spilled glass of wine — etches limestone and leaves a pale mark. Black Limestone shows it worst. Rinse spills straight away.'] },
      { h: 'Porcelain', p: ['Almost anything. It doesn\'t absorb, so a hose and a brush do it most of the time, and a pressure washer won\'t hurt the slab. Watch the joints: resin joints are robust, brush-in joints less so.'] },
      { h: 'Green and black growth', p: ['Algae and lichen come with shade and damp, not with a fault in the stone. A stone-safe biocide wash in spring, and a second in autumn, keeps it off. On sandstone, a sealer slows it down; on porcelain it barely takes hold.'] },
    ],
    related: ['black-limestone', 'sinai-pearl', 'kandla-grey'],
  },
  {
    slug: 'why-slabs-vary', family: 'sandstone', minutes: 3,
    title: 'Why slabs vary in shade, and what to do about it.',
    standfirst: 'It\'s rock. The variation is the point — but it needs managing when you lay.',
    sections: [
      { h: 'The reason', p: ['Sandstone is cut from a quarry face that changes as it\'s worked. Two pallets from the same range, weeks apart, can differ noticeably in tone. Riven faces also catch the light differently depending on which way the bedding runs. None of this is a defect, and it isn\'t something a supplier can grade out.'] },
      { h: 'What we do', p: ['We keep batch numbers with every pallet. If you\'re ordering more than one pack, tell us it\'s for one patio and we\'ll pull from the same batch where we can. If you come back a year later for an extension, we\'ll tell you honestly whether the current batch will match.'] },
      { h: 'What you do', p: ['Open every pack before you start and lay out slabs from all of them. Mix as you go — never work through one pallet and then start the next, or the patio will have a visible line across it. Lay with the riven grain running the same way. And look at it wet: the differences flatten out.'] },
    ],
    related: ['raj-green', 'rippon-buff', 'fossil-mint'],
  },
  {
    slug: 'mixed-patio-pack', family: 'sandstone', minutes: 3,
    title: 'Reading a mixed patio pack.',
    standfirst: 'Four sizes, one pack, no repeat. What\'s inside and how to lay it so it doesn\'t look like a grid.',
    sections: [
      { h: 'What\'s in the pack', p: ['A mixed patio pack covers 18.19 m² with four sizes: 900×600, 600×600, 600×295 and 295×295 mm, banded together in fixed proportions. The sizes are modular — two 295s plus a joint equal a 600 — so any combination fits together.'] },
      { h: 'The random lay', p: ['The aim is no long straight joints. Start a course with a 900×600, follow it with a 600×600 and a pair of 295s, then shift the next course so its joints don\'t line up with the one below. Sketch three or four courses on paper first; once the rhythm is set, you can freelance.'] },
      { h: 'What not to do', p: ['Don\'t sort the pack into sizes and use up the big ones first — you\'ll end the patio in a strip of small pieces. Don\'t run the 900s in a line. And don\'t try to split the pack: the proportions only work as a set, which is why we can\'t sell a mixed pack by the half.'] },
    ],
    related: ['kandla-grey', 'autumn-brown', 'fossil-mint'],
  },
  {
    slug: 'delivery-day', family: 'cladding', minutes: 3,
    title: 'Delivery day: what turns up and where it goes.',
    standfirst: 'A pallet of stone weighs a tonne. Here\'s what to expect and what to have ready.',
    sections: [
      { h: 'Timing', p: ['Three to four working days from cleared payment. We call on the morning of delivery. The lorry arrives between 8am and 6pm, and someone needs to be there to sign.'] },
      { h: 'Where it goes', p: ['Kerbside, on a tail-lift and pallet truck, onto a hard flat surface. A pallet truck can\'t cross gravel, grass or a step, and it won\'t climb a steep drive. If the only flat ground is the road, that\'s where it lands — have a plan to move the slabs, and a few pairs of hands.'] },
      { h: 'Check it', p: ['Look the pallet over before you sign. Riven stone can have the odd chipped corner — that\'s normal and those slabs become your cuts. A broken slab is different: photograph it on the pallet, note it on the delivery, and ring us the same day.'] },
      { h: 'Or collect', p: ['No minimum, no delivery charge. We\'ll fork a pallet onto a suitable vehicle, or you can load loose slabs into a car — a 900×600 sandstone slab is around 25 kg, so a boot takes a few at a time.'] },
    ],
    related: ['kandla-grey', 'bodo-white', 'cladding'],
  },
]
export const guideBySlug = (s) => GUIDES.find(g => g.slug === s)
