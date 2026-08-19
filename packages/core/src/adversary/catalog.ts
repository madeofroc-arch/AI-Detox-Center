/**
 * The round catalog.
 *
 * Static data. The shipped product performs no inference and needs no key —
 * that half of ADR-0004 is load-bearing and CI proves it. The other half (that
 * the content was authored without a model) was never claimed and is not:
 * candidates are generated, adversarially reviewed, hand-corrected, and
 * shipped as the static set below.
 *
 * Two bars every bluff clears, and the second is the hard one:
 *   1. plausible enough to catch a smart, awake person;
 *   2. the reveal lands as "damn, got me" — never "that's a gotcha" or
 *      "that's ambiguous".
 *
 * The failure mode to design against is LEGIBILITY: templated rhetoric passes
 * bar 1 and fails bar 2 within about thirty rounds, because the player stops
 * reading the argument and starts reading the generator. These 30 carry 30
 * distinct failure modes and no two arguments share a shape — except one
 * adjacency worth watching: `te_submarine_cable_systems` and
 * `mo_fx_daily_turnover` are both "a real quantity treated as a ceiling on a
 * different quantity". Two in thirty is tolerable. A third is not; if you are
 * adding rounds, that shape is taken.
 *
 * The `honest` and `bluff` arguments for a round may push the SAME direction.
 * That is deliberate. If the sound argument always disagreed with the bluff
 * about which way the band was wrong, direction alone would leak the answer.
 *
 * See docs/product/adversary.md.
 */
import type { AdversaryRound } from './types';

export const ADVERSARY_CATALOG: readonly AdversaryRound[] = [
  {
    id: 'tr_china_parcels_2023',
    domain: 'transport',
    question:
      'In 2023, how many parcels did China\'s express delivery industry handle in total, according to its State Post Bureau?',
    unit: 'parcels in the year',
    trueValue: 132_070_000_000,
    sourceNote:
      'China State Post Bureau annual figures: 132.07 billion parcels handled in 2023, up 19.4% on 2022 (reported January 2024).',
    axisMin: 2_000_000_000,
    axisMax: 300_000_000_000,
    difficulty: 1,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Anchor on people, not on shops. China has about 1.4 billion residents, and its platforms run on many small, cheap items shipped separately rather than one large basket, so one parcel per person per week — ordinary for an active urban shopper — is already 70 billion a year. Delivery there is cheap enough that heavy users order daily, and rural coverage is near universal.',
      verdict:
        'Sound. Per-capita reasoning is the right frame for a parcel count, and China\'s parcel intensity really does run above 90 per person per year, so anything in the low billions is far too small.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Use the richest large market as the ceiling. The United States ships roughly 22 billion parcels a year for 340 million people — about 65 each — and it has the world\'s deepest consumer spending. China\'s income per head is around a sixth of the US level, so its per-person rate has to sit well below that: 1.4 billion people at even 20 parcels each lands under 30 billion.',
      verdict:
        'That was a bluff. Income correlates with parcel volume across countries, but it is not the mechanism — parcel counts are driven by e-commerce penetration, cheap last-mile labour, and low-value orders shipped one item at a time. China averaged about 94 parcels per person in 2023, roughly 1.5 times the US rate, on a fraction of the income.',
      fallacy: 'correlation offered as a mechanism (income treated as the driver of parcel volume)',
      bluffValue: 28_000_000_000,
    },
  },
  {
    id: 'tr_shanghai_port_teu_2023',
    domain: 'transport',
    question:
      'In 2023, how many TEU (twenty-foot equivalent container units) did the Port of Shanghai handle in total?',
    unit: 'TEU in the year',
    trueValue: 49_160_000,
    sourceNote:
      'Shanghai municipal government / Shanghai International Port Group: 49.16 million TEU in 2023, the world\'s busiest container port for the 14th consecutive year.',
    axisMin: 1_000_000,
    axisMax: 150_000_000,
    difficulty: 2,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'The top of this table is easy to underrate. The world\'s twenty busiest container ports together moved about 390 million TEU in 2023, and Shanghai has led that list for more than a decade, running roughly a quarter ahead of second-place Singapore. A figure in the single-digit millions would place the world\'s number one port below dozens of ordinary regional terminals.',
      verdict:
        'Sound. Anchoring on the top-twenty aggregate and Shanghai\'s known margin over Singapore gets you to the right order of magnitude from public, checkable figures.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'There are only about 51 million TEU of shipping containers in existence anywhere on Earth — every box on every ship, yard, chassis and inland depot combined. For a single port to handle 40 or 50 million TEU in one year, essentially every container on the planet would have to pass through Shanghai and nowhere else. The size of the physical box population caps what any one port can plausibly move.',
      verdict:
        'That was a bluff. It compares a stock with a flow. Containers do not sit still — a box makes several loaded voyages a year and is counted again at every port that lifts it on or off — so annual throughput vastly exceeds the box population. The top twenty ports alone handled about 390 million TEU in 2023 against that same 51-million-TEU fleet.',
      fallacy: 'stock vs flow',
      bluffValue: 8_000_000,
    },
  },
  {
    id: 'tr_panama_canal_transits_day',
    domain: 'transport',
    question:
      'In 2019, before the drought restrictions, how many ocean-going commercial ships transited the Panama Canal per day on average?',
    unit: 'vessel transits per day',
    trueValue: 34,
    sourceNote:
      'Panama Canal Authority traffic tables, fiscal year 2019: 12,281 ocean-going commercial transits (small commercial craft excluded), about 33.6 per day — the last full year before drought-driven slot cuts.',
    axisMin: 5,
    axisMax: 20_000,
    difficulty: 3,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'The binding constraint here is water, not appetite. Every lockage drains on the order of 200 million litres of fresh water from rain-fed Gatun Lake out to the sea, which is exactly why the canal rations slots and auctions them, and why a drought forced cuts in 2023. That budget keeps daily transits in the dozens, not the hundreds people picture from the volume of trade the route carries.',
      verdict:
        'Sound. The freshwater budget is a real, binding physical limit on lockages per day, and the 2023-24 restrictions are the demonstration that it binds.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Work it out from the transit time. A full passage takes eight to ten hours — up through the Gatun locks, across the lake, down the other side — so one ship occupies the canal for most of a working day. Even running around the clock in both directions, that is two or three ships per lane per day, so under ten in total.',
      verdict:
        'That was a bluff. It confuses how long one ship takes with how many ships fit. The canal is a pipeline: many vessels are under way inside it at once, with the locks cycling continuously behind each one. Transit duration is latency; throughput is set by lockage cycle time, lane count, and the fresh water the lake can spare. That is how 2019 averaged about 34 transits a day rather than eight.',
      fallacy: 'latency treated as throughput (serial reasoning about a pipelined system)',
      bluffValue: 8,
    },
  },
  {
    id: 'tr_air_cargo_tonnes_year',
    domain: 'transport',
    question:
      'In 2023, how many tonnes of cargo did the world\'s commercial airlines carry in total, worldwide?',
    unit: 'tonnes in the year',
    trueValue: 58_000_000,
    sourceNote:
      'IATA Global Outlook for Air Transport, December 2023: about 58 million tonnes of cargo carried in 2023 (ICAO\'s scheduled-freight series gives 57.4 million tonnes) — roughly a third of world trade by value, but under 1% by volume.',
    axisMin: 10_000_000,
    axisMax: 20_000_000_000,
    difficulty: 4,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Do not picture only freighters. Roughly half of all air cargo rides in the bellies of ordinary passenger flights, and there are on the order of 100,000 commercial flights a day worldwide. Something like a tonne of belly freight on an average departure, before you count a single dedicated freighter, already puts the annual total in the tens of millions of tonnes.',
      verdict:
        'Sound. Belly capacity is the part people forget, and flights-per-day multiplied by tonnes-per-flight lands squarely in the right decade: about 58 million tonnes in 2023.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Start from the value. Air carries about 35% of world trade by value, and world merchandise exports were roughly $23.8 trillion in 2023 — call it $8.3 trillion of goods flying. World merchandise trade averages on the order of $1,500 per tonne shipped. Divide one by the other and it comes out at something like five billion tonnes moving by air — billions, not millions.',
      verdict:
        'That was a bluff. The average dollars-per-tonne of all trade cannot be applied to air cargo, because goods are put on aircraft precisely when their value density is extreme — pharmaceuticals, semiconductors, urgent spare parts. Spread $8.3 trillion over about 58 million tonnes and you get roughly $143,000 a tonne, some ninety-five times the all-trade average. That gap is the reason those goods fly and iron ore does not.',
      fallacy: 'a population average applied to a subsample selected on that very variable',
      bluffValue: 5_000_000_000,
    },
  },
  {
    id: 'tr_containers_lost_at_sea_year',
    domain: 'transport',
    question:
      'Worldwide, how many shipping containers were lost at sea per year on average over 2008-2022 (World Shipping Council survey)?',
    unit: 'containers lost per year',
    trueValue: 1566,
    sourceNote:
      'World Shipping Council, \'Containers Lost at Sea — 2023 Update\': an average of 1,566 per year across 2008-2022, reported by carriers operating about 90% of global vessel container capacity.',
    axisMin: 5,
    axisMax: 50_000,
    difficulty: 5,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Two things pull this down, and together they give a number. The responding carriers operate about 90% of the world\'s container capacity and report their own losses, so this is close to a census rather than an extrapolation — and the rate they report runs in the single digits of containers lost per million shipped. Against roughly 250 million container journeys a year, that puts the annual mean in the low thousands, not the tens of thousands.',
      verdict:
        'Sound on both legs: near-census coverage means little is missing from the count, and a single-digit loss rate per million shipments applied to world container traffic lands right on the reported 1,566 a year.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Roughly 250 million container journeys are made by sea each year. Suppose just one box in ten thousand goes over the side — a failure rate any other transport mode would call excellent, and shipping is not a safer industry than aviation or rail. That alone is 25,000 a year, before a single stack collapse.',
      verdict:
        'That was a bluff. The 250 million journeys are right; the loss rate was never measured, it was chosen because it sounded modest. Carriers report losses of roughly six containers per million shipped, not a hundred — about sixteen times better than the \'conservative\' figure — which puts the annual average near 1,566. A rate you have not looked up is not a lower bound just because it feels careful.',
      fallacy: 'an invented rate treated as a floor because it sounds conservative',
      bluffValue: 25_000,
    },
  },
  {
    id: 'en_petrol_co2_per_litre',
    domain: 'energy',
    question:
      'Burning one litre of petrol (gasoline) in a car engine releases roughly how many kilograms of CO2?',
    unit: 'kg CO2 per litre of fuel',
    trueValue: 2.3,
    sourceNote:
      'Standard fuel-carbon emission factor used in national inventories: about 2.3 kg CO2 per litre of motor gasoline (US EPA: 8.89 kg per US gallon). Fixed by fuel chemistry, unchanged for decades.',
    axisMin: 0.02,
    axisMax: 10,
    difficulty: 1,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Almost everyone anchors on what a litre of fuel weighs — about 0.75 kg — and puts the answer there or below. But combustion is not a repackaging of the fuel: every carbon atom leaves with two oxygen atoms attached, and carbon is 12 grams per mole against CO2\'s 44. Whatever the blend, the CO2 comes out several times heavier than the fuel, so anything near 1 kg is too low.',
      verdict:
        'Sound. The 12-to-44 ratio is the whole story: the roughly 0.64 kg of carbon in a litre of petrol leaves the exhaust as about 2.3 kg of CO2, so any figure near the fuel\'s own mass sits low.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'A litre of petrol weighs about 0.75 kg, and that is the entire mass that ever goes into the tank. Everything leaving the exhaust — CO2, water vapour, the lot — has to be carved out of that budget, so the CO2 alone certainly cannot exceed it. Anything above one kilogram per litre is quietly claiming more mass out than went in.',
      verdict:
        'That was a bluff. Mass is conserved across the whole reaction, and the reaction has a second input the argument never counts: roughly 2.5 kg of atmospheric oxygen is drawn in per litre burned. The 0.64 kg of carbon in the fuel leaves as about 2.3 kg of CO2 because 32 of every 44 grams came out of the air. The tank was only half the ledger.',
      fallacy: 'closed system assumed where mass enters from outside',
      bluffValue: 0.7,
    },
  },
  {
    id: 'en_datacentre_share_world_electricity',
    domain: 'energy',
    question:
      'In 2024, what share of world electricity consumption did all data centres use, excluding cryptocurrency mining?',
    unit: '% of world electricity consumption',
    trueValue: 1.5,
    sourceNote:
      'IEA, 2024: data centres consumed roughly 415 TWh, about 1.5% of world electricity consumption; cryptocurrency mining is counted separately.',
    axisMin: 0.4,
    axisMax: 60,
    difficulty: 2,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'World electricity consumption is around 28,000 TWh a year, and it is dominated by things that dwarf computing: industrial motors, heating and cooling, and lighting for eight billion people. Fast growth from a small base is still a small base — a double-digit share would put data centres in the same league as all of global industry. That puts it in the low single digits of a percent, not the tens.',
      verdict:
        'Sound. Anchoring on the size of the denominator rather than on the growth rate points the right way: about 415 TWh against roughly 28,000 TWh is near 1.5%.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Data centres were already about 1% of world electricity back in 2015, and demand has compounded at 20 to 30% a year ever since — that is what every industry tracker shows. Nine years of 25% compounding is a factor of seven and a half, which takes 1% to something like 8%, and that is before the last two years of AI build-out are counted.',
      verdict:
        'That was a bluff, and the growth rate is real — it belongs to workloads, not to watts. Data-centre compute grew several-fold over that decade while electricity use stayed close to flat, because the work migrated into efficient hyperscale sites and cooling and hardware improved at almost the rate demand rose. Energy only started climbing again with the recent AI build-out, and the IEA puts 2024 at about 415 TWh — near 1.5%.',
      fallacy: 'a growth rate borrowed from a different quantity',
      bluffValue: 8,
    },
  },
  {
    id: 'en_beef_water_footprint_per_kg',
    domain: 'energy',
    question:
      'Global-average total water footprint of 1 kg of beef — rain on pasture and feed, irrigation, dilution water — in litres?',
    unit: 'litres per kg of beef',
    trueValue: 15_400,
    sourceNote:
      'Mekonnen & Hoekstra (2010) global average water footprint of bovine meat: 15,415 litres per kg, of which about 94% is green water (rainfall).',
    axisMin: 100,
    axisMax: 50_000,
    difficulty: 3,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Most bands here get built from the animal\'s drinking water, which is tens of thousands of litres across a whole life and lands you in the hundreds per kilogram. On the definition given, drinking water is a rounding error. Follow the feed chain instead: a kilogram of grain carries roughly 1,500 litres of water, it takes several kilograms of feed per kilogram of live weight, and several kilograms of live weight per kilogram of boneless meat — multiply that through and you are in the thousands of litres, not the hundreds.',
      verdict:
        'Sound, and the chain multiplies out correctly: in the standard accounting, feed production is about 98% of beef\'s water footprint and drinking water barely over 1%, which is why the total lands near 15,000 litres per kilogram.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Run the global check: humanity withdraws about 4,000 cubic kilometres of fresh water a year for everything — all farming, all industry, every city. World beef output is roughly 70 million tonnes, so at 15,000 litres per kilogram beef alone would claim over 1,000 cubic kilometres, a quarter of all the water people take, for one meat. Nothing in the water statistics leaves room for that, so the answer belongs in the hundreds.',
      verdict:
        'That was a bluff. Both numbers are correct and they measure different things: withdrawal statistics count blue water pumped or diverted, while the beef figure is about 94% green water — rain falling on pasture and feed crops, which nobody withdraws and which never enters that 4,000 cubic kilometres. Beef\'s blue-water footprint is around 550 litres per kilogram, about 1% of withdrawals. The clash was between two ledgers, not two facts.',
      fallacy: 'two accounting bases compared as if they were one',
      bluffValue: 400,
    },
  },
  {
    id: 'en_atmospheric_water_column',
    domain: 'energy',
    question:
      'Condense all the water vapour in the air column above one square metre of Earth: how many litres? (global average)',
    unit: 'litres per square metre',
    trueValue: 25,
    sourceNote:
      'Global mean total column water vapour, about 25 kg per square metre (roughly 12.7 x 10^15 kg of vapour over 5.1 x 10^14 square metres); a long-term climatological mean.',
    axisMin: 5,
    axisMax: 1500,
    difficulty: 4,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Physics caps this tightly. Even fully saturated air at 25 °C carries only about 23 grams of water per cubic metre, and vapour thins out fast with height — nearly all of it sits in the lowest couple of kilometres. The wettest tropical column on Earth condenses to about 60 millimetres of water, so the global mean has to sit in the tens of litres, not the hundreds.',
      verdict:
        'Sound. Saturation vapour pressure plus a vapour scale height of roughly two kilometres bounds any column at a few tens of kilograms per square metre; the global mean is near 25 and the tropical maximum near 60.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Anchor it on what actually falls. Global mean precipitation is about 1,000 millimetres a year, and one millimetre of rain is one litre per square metre — so a tonne of water per square metre comes out of the sky annually. All of that water is in the atmosphere before it falls, so the column has to be holding something on that order at any given moment; bands in the tens are far too low.',
      verdict:
        'That was a bluff. The 1,000 mm is a year\'s throughput, not what is up there at any moment — the same air is refilled by evaporation and wrung out by rain about forty times a year. Divide the year\'s rain by that turnover and you get what the column holds: roughly 25 litres per square metre, which is why a water molecule spends about nine days in the air rather than a year.',
      fallacy: 'annual flow mistaken for an instantaneous stock',
      bluffValue: 1000,
    },
  },
  {
    id: 'en_swro_desal_energy_per_m3',
    domain: 'energy',
    question:
      'A modern seawater reverse-osmosis plant, whole plant end to end: how many kWh of electricity per cubic metre of drinking water?',
    unit: 'kWh per cubic metre',
    trueValue: 3.5,
    sourceNote:
      'Typical modern large-scale seawater reverse osmosis, whole plant: 3-4 kWh per cubic metre (state-of-the-art plants near the bottom of that range); thermodynamic minimum for the separation is about 1 kWh per cubic metre.',
    axisMin: 0.8,
    axisMax: 2000,
    difficulty: 5,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Desalination\'s reputation for being ruinously energy-hungry comes from its capital cost and its brine, not from the separation itself. The minimum thermodynamic work to pull fresh water out of seawater at plant recovery rates is about 1 kWh per cubic metre; real membranes need two to three times that, and intake, pre-treatment and post-treatment add a little on top — three to four kWh in total. Nothing in that chain gets anywhere near the hundreds.',
      verdict:
        'Sound, and it lands on the figure: the roughly 1 kWh per cubic metre minimum separation work is a hard anchor, real membrane trains sit a small multiple above it, and whole-plant consumption comes out at 3 to 4.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Separating water from dissolved salt means getting the water out of the solution, and that has a known physical price: the latent heat of vaporisation is 2,260 kJ per kilogram, which is 627 kWh for a cubic metre. Clever engineering recovers part of it, but nothing puts you an order of magnitude below a fundamental heat of phase change. Bands sitting at a handful of kWh per cubic metre are far too low.',
      verdict:
        'That was a bluff. Latent heat is the price of one particular route — boiling — not of the separation. Reverse osmosis never makes vapour: it pushes water through a membrane against seawater\'s osmotic pressure, and the free energy of that separation is only about 1 kWh per cubic metre. A path-dependent cost was dressed up as a thermodynamic floor; real plants run near 3 to 4.',
      fallacy: 'one process\'s cost treated as the physical floor',
      bluffValue: 63,
    },
  },
  {
    id: 'hu_births_per_day',
    domain: 'human scale',
    question:
      'Worldwide, roughly how many human babies are born alive on an average day? (Reference year: 2024.)',
    unit: 'live births per day',
    trueValue: 360_000,
    sourceNote:
      'UN World Population Prospects, 2024 revision: about 132 million live births a year, so roughly 360,000 a day; the figure has drifted down slowly since the 2010s.',
    axisMin: 5000,
    axisMax: 1_000_000,
    difficulty: 1,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Check the flow against the stock. Eight billion people with a global life expectancy near 73 years means that simply holding the total steady requires something like 110 million arrivals a year, and the population is not steady — it is still climbing. That floor on its own is already three hundred thousand a day.',
      verdict:
        'Sound. The stationary-population check — population divided by life expectancy — gives about 110 million births a year, and because the world\'s age structure is still young and growing, the real figure sits above that floor: roughly 132 million a year, about 360,000 a day.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Use the rate demographers actually publish. The UN\'s crude birth rate is about 17 per thousand per year, and eight billion people at 17 per thousand looks like 136 million a year — but that rate is measured per thousand of the reproductive-age population, not per thousand of everyone. Apply it to its real denominator, roughly two billion women of childbearing age, and you get nearer 35 million a year: under 100,000 a day.',
      verdict:
        'That was a bluff, and it turned on the word \'crude\'. A crude rate is defined per thousand of the total population — that is precisely what distinguishes it from the general fertility rate, which is per thousand women aged 15 to 49 and runs near 65, not 17. Applied to the denominator it was actually measured against, 17 per thousand of eight billion is about 132 million births a year: roughly 360,000 a day.',
      fallacy: 'a rate re-based onto a denominator it was never measured against',
      bluffValue: 95_000,
    },
  },
  {
    id: 'hu_heart_litres_per_day',
    domain: 'human scale',
    question:
      'At resting cardiac output, roughly how many litres of blood does a healthy adult human heart pump in 24 hours?',
    unit: 'litres per 24 hours',
    trueValue: 7200,
    sourceNote:
      'Standard physiology (Guyton & Hall): resting cardiac output about 5 litres per minute in a 70 kg adult; 5 x 1,440 minutes is roughly 7,200 litres. A stable textbook value.',
    axisMin: 200,
    axisMax: 20_000,
    difficulty: 2,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Reason from the flow rate, not from how much blood a body holds. The whole five litres completes a circuit in roughly a minute at rest — that is why an injected drug reaches your fingertips in seconds rather than hours. One lap a minute across 1,440 minutes puts the day\'s total a little over seven thousand litres.',
      verdict:
        'Sound. Circulation time and cardiac output are two views of the same quantity: five litres per minute times 1,440 minutes is a little over 7,000 litres a day. Reasoning from the rate rather than from the volume held is exactly the right move here.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Do it from the beat, which is the only part you can actually measure on yourself. A resting adult heart runs about 70 beats a minute, and each beat ejects roughly 20 millilitres — you can feel how small a pulse is. That is 1.4 litres a minute, so a full day comes to about 2,000 litres.',
      verdict:
        'That was a bluff, and this time the method was fine: beats per minute times millilitres per beat times 1,440 is exactly the calculation. The figure inside it was wrong. Resting stroke volume in an adult is about 70 millilitres, not 20 — the left ventricle holds roughly 120 millilitres and ejects a bit more than half of it each beat. Put 70 back in and you get 4.9 litres a minute, about 7,000 litres a day. The numbers inside a good argument are worth checking too.',
      fallacy: 'sound structure carrying one wrong figure — stroke volume understated',
      bluffValue: 2000,
    },
  },
  {
    id: 'hu_chickens_alive',
    domain: 'human scale',
    question:
      'Worldwide, roughly how many live chickens exist at any one moment — farmed and backyard, all ages counted together?',
    unit: 'live chickens at any one moment',
    trueValue: 26_000_000_000,
    sourceNote:
      'FAOSTAT live-animal stocks, early 2020s: about 26 billion chickens standing at any instant. It grows slowly and steadily, so the order of magnitude is stable across years.',
    axisMin: 500_000_000,
    axisMax: 200_000_000_000,
    difficulty: 3,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Anchor on how many birds the world eats. Chicken is the most-eaten meat on Earth and about 75 billion birds are slaughtered every year — nine times the human population. Even at six or seven weeks a bird, sustaining that flow needs something like nine billion broilers standing at every instant, already above the human population. And broilers are only one part of the flock.',
      verdict:
        'Sound. The annual slaughter total is what forces the standing number up: about 75 billion birds a year at six or seven weeks each already requires roughly nine billion broilers alive at any instant. Fast turnover keeps the standing flock well below the annual flow, not above it — the rest of the 26 billion is laying hens, pullets, breeding stock and backyard birds, which works out to roughly three chickens per living person.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Anchor on the meat statistics, which are the only hard numbers here. World chicken meat production runs about 100 million tonnes a year at roughly 1.5 kg of meat per bird, so call it 70 billion birds slaughtered annually. But that is a yearly total, and a broiler stands for only about six weeks, so at any instant barely an eighth of the year\'s birds actually exist — under 10 billion.',
      verdict:
        'That was a bluff, and the conversion from a year\'s slaughter to a standing flock was actually correct. The population it was applied to was not: broilers are only one part of the flock. Billions of laying hens live a year or more and never enter meat production, and the replacement pullets behind them, the breeding stock behind those, and the world\'s backyard birds appear in no slaughter statistic at all — which is how the standing total reaches about 26 billion, roughly three per living person.',
      fallacy: 'a sample that is not the population',
      bluffValue: 8_750_000_000,
    },
  },
  {
    id: 'hu_humans_ever_born',
    domain: 'human scale',
    question:
      'Roughly how many modern humans have ever been born alive, from the origin of the species to today, including everyone now living?',
    unit: 'people ever born',
    trueValue: 117_000_000_000,
    sourceNote:
      'Population Reference Bureau, \'How Many People Have Ever Lived on Earth?\' (2022 update): about 117 billion born since roughly 190,000 BCE.',
    axisMin: 5_000_000_000,
    axisMax: 300_000_000_000,
    difficulty: 4,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Do not anchor on how few people were alive at once — anchor on how fast they were replaced. For nearly all of human history life expectancy at birth sat around 30 years, largely because an enormous share of children died young, and every one of those short lives was still a birth. A world of a few hundred million that turns over three times a century produces billions of births per century while barely growing.',
      verdict:
        'Sound. Births are a flow through the population, and high mortality makes that flow very fast: turnover, not headcount, is what accumulates over time. That is how the pre-modern world supplies the great majority of an estimated 117 billion people ever born.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Think about what doubling means. Each doubling of a population is as large as everything beneath it combined — which is exactly why the claim that most people who ever lived are alive today keeps resurfacing. Eight billion are alive now, every earlier era was smaller than the one after it, and the world held under a billion before 1800. Sum that shrinking series and you cannot get far past twenty billion in total.',
      verdict:
        'That was a bluff. \'Each doubling equals everything before it\' describes a standing population, not the number of people born: at every level, births keep arriving for as long as that level lasts, and pre-industrial populations lasted a very long time while barely growing. With birth rates of 60 to 80 per thousand — the level a species needs just to survive when most children die young — a world of a few hundred million produced two or three billion births per century, century after century. On the Population Reference Bureau\'s numbers, 46 billion arrive between 8000 B.C.E. and 1 C.E. alone and 97.6 billion — 83 per cent of the total — before 1750. The total is about 117 billion, which makes the living roughly 7 per cent.',
      fallacy: 'a doubling-series intuition applied to cumulative births',
      bluffValue: 20_000_000_000,
    },
  },
  {
    id: 'hu_red_cells_per_second',
    domain: 'human scale',
    question:
      'In a healthy adult, roughly how many new red blood cells enter the bloodstream each second?',
    unit: 'red blood cells per second',
    trueValue: 2_400_000,
    sourceNote:
      'Standard haematology: about 2.5 x 10^13 red cells in an adult and a mean lifespan near 120 days, so roughly 2-3 million replaced per second. A textbook-stable derivation.',
    axisMin: 100_000,
    axisMax: 5_000_000_000,
    difficulty: 5,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Get the cell count from the haematocrit and everything else follows. Red cells are about 45% of blood by volume, so five litres carries roughly 2.2 litres of packed cells, and one red cell is about 90 femtolitres — that is a count with fourteen digits. All of them are scrapped on a four-month clock, and four months is only ten million seconds.',
      verdict:
        'Sound, and the arithmetic checks out: 2.2 litres of packed cells at 90 femtolitres each is about 2.5 x 10^13 red cells, and dividing by the ten million seconds in 120 days gives roughly 2.4 million new cells a second.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Get the cell count from haemoglobin instead — it is measured directly on every blood test rather than inferred. Haemoglobin runs about 15 grams per decilitre and a body holds five litres of blood, so call it 75 grams of haemoglobin in total; each red cell carries roughly 30 picograms of it, which puts the whole red cell population near 2.5 trillion. Spread that across a 120-day lifespan and replacement is a couple of hundred thousand cells a second, not millions.',
      verdict:
        'That was a bluff, and it turned on a single unit. A decilitre is a tenth of a litre, so five litres is fifty decilitres: about 750 grams of haemoglobin, not 75. Every other step was right — 750 grams at 30 picograms per cell is 2.5 x 10^13 red cells, and over 120 days that comes to roughly 2.4 million new cells every second.',
      fallacy: 'unit slip — decilitres read as litres',
      bluffValue: 240_000,
    },
  },
  {
    id: 'te_soc_transistor_count',
    domain: 'technology and computing',
    question:
      'Apple\'s A17 Pro chip, in the 2023 iPhone 15 Pro: how many individual transistors are on the die?',
    unit: 'transistors',
    trueValue: 19_000_000_000,
    sourceNote:
      'Apple\'s published figure at the September 2023 launch: 19 billion transistors, on a die of roughly 100 square millimetres built on TSMC\'s 3 nm process.',
    axisMin: 100_000_000,
    axisMax: 200_000_000_000,
    difficulty: 1,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Anchor on the part it replaced rather than on intuition. Apple\'s A16, a year earlier, was published at 16 billion transistors on a die of comparable size, and a full node shrink adds density — chips do not go backwards. A ceiling in the low billions would put the newest phone chip below one that was already several generations old.',
      verdict:
        'Sound. Generation-over-generation anchoring is the reliable route here: 16 billion the year before, a node shrink on top, and the published A17 Pro figure is 19 billion.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Estimate it from the silicon, which is the only first-principles route. The die is about 100 square millimetres, and TSMC\'s 3 nm process is quoted at roughly two billion transistors per square millimetre. That is 200 billion transistors on this die alone, so a ceiling in the tens of billions is a factor of ten short.',
      verdict:
        'That was a bluff, and the method was right: die area times process density is exactly how you estimate this. The density was not. Leading 3 nm logic runs near 200 million transistors per square millimetre — no process in production is anywhere near a billion per square millimetre — the densest logic shipping today is about five times below that figure. Put 200 million back in and 100 square millimetres gives about 20 billion, which is the published 19. A confident constant in the middle of a good method is still worth checking.',
      fallacy: 'correct method carrying an inflated constant — process density overstated tenfold',
      bluffValue: 200_000_000_000,
    },
  },
  {
    id: 'te_accelerator_board_power',
    domain: 'technology and computing',
    question:
      'One NVIDIA H100 SXM data-centre GPU board at maximum rated load: how many watts does it draw? (2022-2023 spec)',
    unit: 'watts',
    trueValue: 700,
    sourceNote:
      'NVIDIA\'s H100 datasheet: 700 W maximum board power for the SXM5 module (814 square millimetre die, 80 GB HBM3), unchanged since the 2022 launch.',
    axisMin: 15,
    axisMax: 2000,
    difficulty: 2,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Anchor on the consumer part and adjust upward. Top desktop graphics cards already sit at 350 to 450 watts on air, and the data-centre module is a reticle-limit die with stacked high-bandwidth memory, clocked for continuous rather than bursty load, and cooled by a server chassis instead of a case fan. A ceiling below about 400 watts leaves no room for any of that.',
      verdict:
        'Sound. Starting from the 450 W desktop ceiling and adding the HBM stacks, the larger die and the sustained duty cycle points the right way; the rated figure is 700 W.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Look at how the power physically gets there. A PCIe slot delivers 75 watts, and the supplementary connectors on an accelerator are rated at 150 watts each — two of them is 375 watts, and that is what the connector standard allows. Nothing draws more than its connectors are rated to carry, so a figure near 700 is above what the socket can deliver.',
      verdict:
        'That was a bluff, and every rating in it is real — for a card in a slot. The PCIe version of this accelerator is indeed capped near 350 watts for exactly that reason. But SXM is not a card: the module bolts onto a baseboard and is fed by busbars sized for the job, which is the whole reason the form factor exists. The question named SXM, and its rated maximum is 700 watts.',
      fallacy: 'a real limit imported from a different form factor',
      bluffValue: 375,
    },
  },
  {
    id: 'te_transatlantic_round_trip',
    domain: 'technology and computing',
    question:
      'Typical round-trip latency between London and New York over commercial internet fibre, in milliseconds?',
    unit: 'milliseconds (round trip)',
    trueValue: 70,
    sourceNote:
      'Cloud and CDN latency dashboards have reported a 65-75 ms floor between the two cities for over a decade; purpose-built low-latency cables reach about 59 ms, and physics puts the hard floor near 55 ms.',
    axisMin: 1.5,
    axisMax: 200,
    difficulty: 3,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'This number is set by physics, not by equipment. Light in glass moves at about two-thirds of its vacuum speed, roughly 200,000 km per second, and the laid cable route between the two cities runs some 5,500 to 6,000 km, longer than the straight line. That is already close to 30 ms in each direction before a single router touches the packet, so a ceiling below 50 ms cannot hold.',
      verdict:
        'Sound. The two-thirds-of-c propagation speed in fibre, over a route longer than the great circle, sets a hard round-trip floor in the mid-fifties, and the everyday measured figure sits just above it.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Take the distance seriously. New York to London is 5,570 km, and light covers that in 18.6 milliseconds. Double it for the return leg, add a few milliseconds for the handful of routers in the path, and you are in the mid-forties at the very worst — your floor is set too high.',
      verdict:
        'That was a bluff, and every number in it is true: the distance is right and light really does cross it in 18.6 ms. The step that never gets stated is that the signal travels at that speed. In glass the refractive index is about 1.47, so it moves at roughly two-thirds of c, and the cable route is longer than the straight line. Those two omitted corrections are the entire gap.',
      fallacy: 'an idealised constant applied to the wrong medium',
      bluffValue: 45,
    },
  },
  {
    id: 'te_submarine_cable_systems',
    domain: 'technology and computing',
    question:
      'How many submarine fibre-optic cable systems were in service worldwide in 2025, excluding planned ones?',
    unit: 'cable systems in service',
    trueValue: 570,
    sourceNote:
      'TeleGeography\'s submarine cable database, 2025: 570 in-service systems plus roughly 80 more planned, totalling roughly 1.4 million km of cable.',
    axisMin: 15,
    axisMax: 1500,
    difficulty: 4,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Count the landings rather than the traffic. The industry maps plot well over a thousand cable landing stations, and a single system touches only a couple of them plus the odd branch. Add that separately owned systems built decades apart share the busy corridors, and that old cables are retired slowly, and you compound into the high hundreds — a ceiling near a hundred is far too low.',
      verdict:
        'Sound. Landing-station count divided by the two or three landings a typical system has is the right structure, and it lands close to the real figure of about 570.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Think about the economics. A single modern system carries more capacity than entire continents exchange at peak, costs hundreds of millions of dollars, and takes years of surveys, permits and scarce ship time. Nobody lays that to sit idle, and the same handful of carriers and content companies fund nearly all of it — which is why they pool into consortia on shared routes rather than proliferating separate cables. A count in the dozens already covers the world\'s traffic.',
      verdict:
        'That was a bluff. The economics are described correctly, and they are exactly why systems get shared — but capacity is not what sets the count, because a cable joins two specific places. Spare capacity on a Singapore-to-Marseille system does nothing for a Chile-to-New-Zealand route. The number is driven by how many distinct pairs of coastlines need joining, by redundancy against anchor and earthquake cuts, by separate ownership, and by the fact that a 1990s cable keeps earning: 570 in service.',
      fallacy: 'a real constraint that does not bind',
      bluffValue: 60,
    },
  },
  {
    id: 'te_euv_scanner_shipments',
    domain: 'technology and computing',
    question:
      'In 2023, how many EUV lithography systems did ASML physically ship worldwide? (Units shipped, not units booked as revenue.)',
    unit: 'machines shipped',
    trueValue: 42,
    sourceNote:
      'ASML\'s Q4/full-year 2023 results (24 January 2024): EUV system sales of €9.1 billion, with revenue recognised on 53 systems and 42 systems shipped. The annual report reports only the 53 revenue-recognised units. Annual EUV output has stayed in the tens every year since the tool went into production.',
    axisMin: 6,
    axisMax: 5000,
    difficulty: 5,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Start from who can actually buy one. EUV is only needed at the leading edge of logic and the newest DRAM — five companies in total, one of them dominant, with a handful of leading-edge fabs between them. A single tool costs on the order of 150 to 200 million euros, arrives in dozens of freight containers and takes months to assemble and qualify on site, and ASML\'s own build rate is the bottleneck for the whole industry — all of which keeps annual shipments in the tens, not the hundreds.',
      verdict:
        'Sound. A five-name customer list, a nine-figure price and months of assembly per unit cap the annual figure in the tens, which is where the reported number sits.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Look at the order book. ASML closed 2023 with a backlog around 39 billion euros, and EUV systems run roughly 180 million each. That is well over two hundred machines of committed, paid-for demand, and a company that is sold out ships everything it can build — so a ceiling in the low dozens is under the mark.',
      verdict:
        'That was a bluff. The backlog figure is genuine, but a backlog is an accumulated queue: it covers several years of scheduled deliveries, and it mixes EUV with the far more numerous DUV systems that make up most of the units in it. Dividing an order book by a unit price tells you how much committed demand exists, never how many machines leave the factory in a year — that is set by how many ASML can physically build, which is a few dozen.',
      fallacy: 'a multi-year order book divided by a unit price and read as an annual rate',
      bluffValue: 216,
    },
  },
  {
    id: 'mo_world_gdp_per_person',
    domain: 'money and economy',
    question:
      'World GDP in 2023 at market exchange rates, divided by world population: how many US dollars per person?',
    unit: 'US dollars per person per year',
    trueValue: 13_200,
    sourceNote:
      'World Bank / IMF: world GDP was about $105 trillion in 2023 across about 8.0 billion people; the ratio moves only a few percent a year.',
    axisMin: 2000,
    axisMax: 300_000,
    difficulty: 1,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Nearly everyone anchors this on the country they happen to live in, and lands above the answer. Four-fifths of humanity lives in countries producing under $15,000 per head, and India alone — one person in six — is under $3,000. This figure is a population-weighted total, so it sits far below any high-income intuition.',
      verdict:
        'Sound. The number is world output divided by world population, and the population sits overwhelmingly in low- and middle-income countries, so the answer lands near the level of a middle-income economy rather than a rich one.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Every league table puts world output at around $23,000 a head — that is the figure the IMF and the World Bank publish for the world aggregate, and it is what every cross-country comparison is scaled against. That published average is where this answer sits; anything near $15,000 is a long way below it.',
      verdict:
        'That was a bluff, and the $23,000 is real — it is output per head at purchasing power parity. The question named market exchange rates, and the two differ by design: PPP revalues what a dollar buys in low-income countries and lifts their measured output by a factor of two or three, which covers most of humanity. At market rates world GDP was about $105 trillion across eight billion people — $13,200 each.',
      fallacy: 'a different measure substituted for the one the question named',
      bluffValue: 23_000,
    },
  },
  {
    id: 'mo_world_merchandise_exports',
    domain: 'money and economy',
    question:
      'In 2023, the combined value of all merchandise exports worldwide — goods only, services excluded — in US dollars?',
    unit: 'US dollars in the year',
    trueValue: 23_800_000_000_000,
    sourceNote:
      'WTO world trade statistics: world merchandise exports were about $23.8 trillion in 2023 (about $24.9 trillion in 2022).',
    axisMin: 300_000_000_000,
    axisMax: 60_000_000_000_000,
    difficulty: 2,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Most people build this from finished products they can picture — cars, phones, clothes — and land an order of magnitude short. The bulk of the value is literally bulk: crude oil, gas, ores, grain, chemicals, chips, and half-finished components moving between factories in different countries, each crossing recorded at full price. Recorded goods exports run near a fifth to a quarter of world output, which on $105 trillion is above $20 trillion, not below $10 trillion.',
      verdict:
        'Sound, and the ratio is the right one to reach for: commodities and intermediate goods carry most of the traded value and every crossing is booked at full price, which puts world merchandise exports near $23.8 trillion.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'World output is about $105 trillion a year, and the overwhelming majority of it never crosses a border — services, housing, construction, government, health, retail. Traded goods are a slice of the manufacturing slice of that, and manufacturing is under a fifth of world output. So the traded-goods total has to sit comfortably below the manufacturing part of what the world makes in a year.',
      verdict:
        'That was a bluff. GDP counts value added once; exports count gross value every time goods cross a border, so a phone\'s components can be recorded three or four times over before the finished unit ships. That is why recorded goods exports reach about $24 trillion — close to a quarter of world GDP — while \'most output never leaves home\' stays perfectly true. The two numbers are not measuring the same thing.',
      fallacy: 'a gross flow read as if it were a value-added measure',
      bluffValue: 15_000_000_000_000,
    },
  },
  {
    id: 'mo_japan_government_debt_usd',
    domain: 'money and economy',
    question:
      'Japan\'s gross general government debt at end-2023, converted at market exchange rates: how many US dollars?',
    unit: 'US dollars',
    trueValue: 10_500_000_000_000,
    sourceNote:
      'IMF World Economic Outlook: Japan\'s general government gross debt was about 240% of a 616-trillion-yen economy at end-2023 — roughly 1,480 trillion yen, or about $10.5 trillion at about 140 yen to the dollar.',
    axisMin: 1_500_000_000_000,
    axisMax: 500_000_000_000_000,
    difficulty: 3,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Debt-to-GDP is a ratio, and it is the ratio that is extreme here, not the absolute total. Japan\'s economy is about $4 trillion at market exchange rates — roughly a sixth of the United States\', and the weak yen is a large part of why that ratio is so low. Two and a half times $4 trillion is about $10 trillion; scaling up from US debt totals overshoots badly.',
      verdict:
        'Sound, and the arithmetic lands on the answer: about 250% of a roughly $4 trillion economy is near $10 trillion, well under the US total even though the ratio is far worse.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Japan has been the quadrillion-debt economy since 2013, when its government debt crossed one quadrillion, and it has climbed every year since. A quadrillion is a thousand trillion. Even allowing for every argument about what counts as government debt, that leaves the total in the hundreds of trillions, not the low tens.',
      verdict:
        'That was a bluff. The quadrillion is yen — the argument never named a currency and let the word carry the weight. At roughly 140 yen to the dollar, Japan\'s 1,400 to 1,500 trillion yen of gross government debt is about $10.5 trillion: the heaviest debt burden relative to output in the developed world, and about a hundredth of what \'a thousand trillion\' implies in dollars.',
      fallacy: 'unit slip — an unnamed currency',
      bluffValue: 1_000_000_000_000_000,
    },
  },
  {
    id: 'mo_fx_daily_turnover',
    domain: 'money and economy',
    question:
      'Global foreign-exchange turnover, all instruments, averaged per trading day in April 2022: how many US dollars?',
    unit: 'US dollars per day',
    trueValue: 7_500_000_000_000,
    sourceNote:
      'BIS Triennial Central Bank Survey, April 2022: $7.5 trillion per day across spot, outright forwards, swaps and options (the 2019 reading was $6.6 trillion).',
    axisMin: 50_000_000_000,
    axisMax: 30_000_000_000_000,
    difficulty: 4,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Whatever you built from trade and investment flows is too small, because turnover counts transactions, not needs. Cross-border payment need runs on the order of $100 billion a day; roughly half the market is FX swaps with maturities of a week or less, rolled again and again, and dealers pass positions among themselves several times before a trade reaches a final holder. Multiply a hundred billion by turnover of that intensity and you are in the trillions per day, not the hundreds of billions.',
      verdict:
        'Sound. Swaps are about half of all turnover and their maturities run in days, so the same underlying exposure is transacted many times over — which is exactly how $100 billion of daily need becomes $7.5 trillion of measured turnover.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'Currency trades exist to settle cross-border payments: trade in goods and services, plus investment flows. World trade runs around $31 trillion a year and cross-border investment adds a few trillion more — under $100 billion a day of genuine underlying need. Markets add churn on top of that, but not a hundredfold; trillions a day would have nothing underneath it.',
      verdict:
        'That was a bluff. Underlying need is not a ceiling on turnover. Close to half the market is FX swaps with very short maturities, rolled over again and again, and each position is passed between dealers before it reaches a final holder. The BIS measured about $7.5 trillion a day — roughly eighty times the underlying flow, and both numbers are correct.',
      fallacy: 'constraint that does not bind',
      bluffValue: 300_000_000_000,
    },
  },
  {
    id: 'mo_world_average_tariff',
    domain: 'money and economy',
    question:
      'Across all countries in 2022, the trade-weighted average tariff applied to world merchandise imports, in percent?',
    unit: '%',
    trueValue: 2.5,
    sourceNote:
      'WTO Tariff & Trade Data: the trade-weighted average of effectively applied tariffs across WTO members was 2.5% in 2021 (down from 6.8% in 1996); the trade-weighted MFN average was 3.7%. Pinned to 2022, before the 2025 tariff changes.',
    axisMin: 0.5,
    axisMax: 60,
    difficulty: 5,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Two structural facts pull this far below the rates that make headlines. Well over half of world imports by value enter at zero duty — energy, ores, semiconductors, aircraft, and everything moving inside a free-trade agreement — and the genuinely high-tariff sectors, agriculture and apparel, are small shares of trade value. Mix a majority at zero with a minority averaging under 10% and the weighted result is in the low single digits.',
      verdict:
        'Sound, and the mix is what does it: duty-free and preferential trade dominates world imports by value, so the average actually paid comes out near 2.5%, far below any schedule average.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Duty is charged at every border, and a modern good crosses three or four before it is finished — components in, subassembly out, assembly in, finished unit out. Even at 2 or 3 per cent a crossing, the duty a finished product has accumulated by the time it reaches a buyer runs to high single digits. Averaged across world imports that is nearer 8 per cent than 2.',
      verdict:
        'That was a bluff, and the compounding it describes is real — the cumulative duty carried by a finished good genuinely can be several times the rate at any one border. But the figure asked for is duty collected divided by the value of imports, and every extra crossing adds to both sides of that ratio: the same 2 or 3 per cent is charged again on a larger declared value, so the average per import does not move. World duty collected against world merchandise imports is about 2.5 per cent.',
      fallacy: 'a chain of crossings counted into a per-crossing ratio',
      bluffValue: 8,
    },
  },
  {
    id: 'ph_ocean_mean_depth',
    domain: 'the physical world',
    question:
      'Taken over the whole area of the world ocean, what is the mean depth of the seafloor, in metres?',
    unit: 'metres',
    trueValue: 3682,
    sourceNote:
      'Charette & Smith (2010) global ocean volume and area give a mean depth of 3,682 m; a geophysical constant on human timescales.',
    axisMin: 100,
    axisMax: 8000,
    difficulty: 1,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'Seventy per cent of the planet is ocean, and most of that area is abyssal basin lying 4 to 6 km down; the continental shelves shallower than 200 m are a narrow fringe worth under a tenth of the area. An area-weighted average gets pulled towards the basins, not towards the coasts. Anything under a kilometre would require those basins not to exist.',
      verdict:
        'Sound. Abyssal basins really do floor the majority of the ocean\'s area at 4-6 km while shelves hold under a tenth of it, so the area-weighted mean has to sit near them: 3,682 m.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_high',
      argument:
        'The seafloor is really two surfaces: continental shelf and slope at a few hundred metres, and abyssal plain around four kilometres. Every continent is ringed by an enormous margin — shelves, slopes and rises, with the marginal and shelf seas sitting on top of them — and taken together those margins are comparable in extent to the deep basins. Average two surfaces that appear in similar measure and you land nearer two kilometres than four.',
      verdict:
        'That was a bluff. Both surfaces are real and described correctly; the weights are not. Shelves shallower than 200 m are about 8% of ocean area and the slopes and rises another 15 or so, while more than half the seafloor is abyssal plain deeper than 4,000 m. Weight each surface by the area it actually covers rather than by how prominent it looks on a map, and the mean comes out at 3,682 m.',
      fallacy: 'a mixture averaged as if its parts were equal',
      bluffValue: 2000,
    },
  },
  {
    id: 'ph_sea_horizon_distance',
    domain: 'the physical world',
    question:
      'Your eyes are 1.7 m above a calm sea. Ignoring refraction, how far is the horizon — where water meets sky — in kilometres?',
    unit: 'kilometres',
    trueValue: 4.65,
    sourceNote:
      'Pure geometry: d = sqrt(2Rh) with R = 6,371 km and h = 1.7 m gives 4.65 km; fixed, not time-dependent.',
    axisMin: 0.8,
    axisMax: 500,
    difficulty: 2,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'The sea surface falls away as roughly d squared over 2R: about 0.8 m at 3 km, 2 m at 5 km, 30 m at 20 km. The eye here is only 1.7 m up, so the water curves out of the line of sight almost as soon as that drop passes eye height. An answer in the tens of kilometres quietly assumes a sight line over tens of metres of curvature.',
      verdict:
        'Sound. The drop really does go as d squared over 2R, and it passes your 1.7 m eye height at about 4.7 km — which is the horizon, by definition.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'On a clear day from a beach you can pick out a lighthouse or a headland 30 or 40 km out, and a departing ship stays in view far longer than a couple of minutes. If the horizon genuinely stopped at a few kilometres, none of that light could reach your eye at all. Sight lines over open water plainly run to tens of kilometres.',
      verdict:
        'That was a bluff. Distance to the horizon and distance you can see are two different lengths, and the geometry adds a term for each height: about 3.6(sqrt h_eye + sqrt h_object) in km with heights in metres. A 50 m lighthouse supplies roughly 25 of those 30 km; your 1.7 m supplies 4.7 — and that 4.7 is the horizon. Tall things are visible past it precisely because they stick up over it.',
      fallacy: 'borrowed figure that contains a second term',
      bluffValue: 30,
    },
  },
  {
    id: 'ph_eiffel_iron_mass',
    domain: 'the physical world',
    question:
      'The Eiffel Tower\'s iron lattice — the metal frame alone, excluding lifts and foundations — has what mass, in tonnes?',
    unit: 'tonnes',
    trueValue: 7300,
    sourceNote:
      'The tower operator\'s published figures: 7,300 t of puddled iron in the frame, 10,100 t all-in; unchanged since 1889.',
    axisMin: 1000,
    axisMax: 500_000,
    difficulty: 3,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Ask what the structure actually carries: itself, and wind. There are no floors, no cladding, no crowds spread over 300 metres — it is open lattice, mostly air, with members measured in centimetres of iron. Mass follows the fill fraction of the frame, not the height of the silhouette, and an open frame is a very thin thing.',
      verdict:
        'Sound. Fill fraction is the right variable: those 7,300 tonnes would melt down into a slab about 6 cm thick spread over the tower\'s 125 m square base. Height buys silhouette, not mass.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Structural steel in a modern 300-metre tower runs 30,000 to 50,000 tonnes. The Eiffel Tower is 1880s puddled iron — a weaker material, sized before modern stress analysis, so its members had to be generously oversized. Whatever a contemporary tower of that height weighs, a nineteenth-century one should weigh more, not an order of magnitude less.',
      verdict:
        'That was a bluff — the analogy imports loads that are not there. A skyscraper\'s steel is sized to hold up seventy floors of slab, occupants, services and cladding, so its mass tracks the floor area it carries, not its height. The tower carries almost no floor area; it holds up only itself, against gravity and wind. 7,300 tonnes.',
      fallacy: 'false analogy — mechanism does not transfer',
      bluffValue: 40_000,
    },
  },
  {
    id: 'ph_atmosphere_total_mass',
    domain: 'the physical world',
    question:
      'What is the total mass of Earth\'s entire atmosphere, in kilograms?',
    unit: 'kilograms',
    trueValue: 5_150_000_000_000_000_000,
    sourceNote:
      'Mean surface pressure times Earth\'s area divided by g; Trenberth & Smith (2005) give 5.148 x 10^18 kg, steady on human timescales.',
    axisMin: 200_000_000_000_000_000,
    axisMax: 60_000_000_000_000_000_000,
    difficulty: 4,
    honest: {
      kind: 'honest',
      direction: 'too_low',
      argument:
        'A barometer reading of 101 kPa is a statement about mass: it is the weight of the whole air column standing on each square metre, about 10,300 kg — ten tonnes per square metre, everywhere on the planet. Multiply by Earth\'s 5.1 x 10^14 square metres and the total sits in the 10^18 range. Air feels like nothing, but there is an enormous depth of it.',
      verdict:
        'Sound, and it is the standard derivation: mass equals surface pressure times area divided by g — 101,325 x 5.1 x 10^14 / 9.81, about 5.2 x 10^18 kg. The barometer was telling you the answer all along.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Density falls from about 1.2 kilograms per cubic metre at the surface to essentially nothing by 100 km. Average the two ends, call it 0.6, and multiply by the shell — Earth\'s 5.1 x 10^14 square metres by 100 km of depth is 5.1 x 10^19 cubic metres — and the atmosphere comes to about 3 x 10^19 kg.',
      verdict:
        'That was a bluff. Density does not fall linearly, it falls exponentially, and the mean of an exponential over a long column is nowhere near the midpoint of its ends: it is surface density times scale height over column height — 1.2 x 8.5 / 100, about 0.10 kilograms per cubic metre, six times under the 0.6 the argument used. Multiply that through and you get 5.1 x 10^18 kg, which is simply surface pressure divided by g: 10,300 kilograms standing on every square metre.',
      fallacy: 'linear mean taken of an exponential profile',
      bluffValue: 30_000_000_000_000_000_000,
    },
  },
  {
    id: 'ph_river_standing_water',
    domain: 'the physical world',
    question:
      'At any one instant, how much liquid water stands in all the world\'s rivers and streams combined, in cubic kilometres?',
    unit: 'cubic kilometres',
    trueValue: 2120,
    sourceNote:
      'Shiklomanov\'s world water balance, as used in the USGS water-distribution table: rivers hold about 2,120 cubic kilometres at any moment.',
    axisMin: 500,
    axisMax: 100_000,
    difficulty: 5,
    honest: {
      kind: 'honest',
      direction: 'too_high',
      argument:
        'Run the geometry: a 1,000 km river 200 m wide and 5 m deep holds exactly 1 cubic kilometre. Rivers are ribbons — long, but metres deep and at most a couple of kilometres wide in the extreme cases — so even summing every large river on Earth keeps you in the low thousands. That is less water than a single deep lake: Baikal alone holds about 23,000 cubic kilometres.',
      verdict:
        'Sound. Channel geometry is what binds here, and it lands right on the measured figure: about 2,120 cubic kilometres, roughly a tenth of Lake Baikal on its own.',
    },
    bluff: {
      kind: 'bluff',
      direction: 'too_low',
      argument:
        'Picture the lower Amazon: tens of metres deep, kilometres wide, and running like that for well over a thousand kilometres before it reaches the sea — that one channel is hundreds of cubic kilometres of standing water on its own. Now add the Congo, the Yangtze, the Mississippi, the Ob, the Ganges and every other continental-scale river, and the world total has to run into the tens of thousands.',
      verdict:
        'That was a bluff. The Amazon really is that big — and it is the single largest river channel on Earth, carrying about a fifth of all river discharge by itself, which makes it the worst possible template for the rest. The median river on the planet is metres deep and tens of metres wide, and channel volume falls away faster than discharge does, because narrower rivers are shallower too. Sum the whole distribution instead of scaling its largest member and you get about 2,120 cubic kilometres.',
      fallacy: 'the largest member of a set treated as its typical member',
      bluffValue: 30_000,
    },
  },
];
