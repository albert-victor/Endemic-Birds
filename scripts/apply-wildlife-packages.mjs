import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesPath = path.join(root, "content", "packages.json");
const activitiesPath = path.join(root, "content", "wildlife-activities.json");
const destPath = path.join(root, "content", "wildlife-destinations.json");

const packages = JSON.parse(fs.readFileSync(packagesPath, "utf8"));
const activities = JSON.parse(fs.readFileSync(activitiesPath, "utf8"));
const wildlifeDests = JSON.parse(fs.readFileSync(destPath, "utf8"));

const img = (slug, file = "hero.jpg") =>
  `assets/images/wildlife/destinations/${slug}/${file}`;

const standardIncluded = [
  "Professional safari guide (English; other languages on request)",
  "Safari vehicle with pop-up roof – maximum six guests, window seats",
  "Park fees as per confirmed itinerary",
  "Accommodation as listed per day",
  "Meals on full-board basis while on safari unless noted",
  "Bottled drinking water in the vehicle",
];

const standardExcluded = [
  "International flights and visas",
  "Travel insurance",
  "Tips for guides and camp staff",
  "Personal expenses, drinks and laundry",
  "Optional activities not listed in the itinerary",
];

function days(n, items) {
  return items.map((item, i) => ({
    day: i + 1,
    title: item.title,
    description: item.description,
  }));
}

const newPackages = [
  {
    id: "5-days-serengeti-migration-focus",
    slug: "5-days-serengeti-migration-focus",
    title: "5 Days Serengeti Migration Focus Safari",
    category: "wildlife",
    durationDays: 5,
    activitySlugs: ["great-migration-plains"],
    wildlifeDestinations: ["serengeti-national-park", "ngorongoro-conservation-area"],
    destinations: ["northern"],
    circuits: ["Northern"],
    summary:
      "Five-day Serengeti-centred safari timed for migration viewing – Ndutu or central/northern sectors depending on season.",
    heroImage: img("serengeti-national-park"),
    featured: true,
    verified: true,
    itinerary: days(5, [
      { title: "Arusha to Serengeti", description: "Drive or fly to Serengeti; afternoon game drive on arrival sector." },
      { title: "Full day Serengeti", description: "Dawn drive for cats and herds; picnic lunch on the plains." },
      { title: "Migration sector full day", description: "Follow herd movements with guide updates from park networks." },
      { title: "Serengeti to Ngorongoro rim", description: "Morning drive en route; crater rim sunset viewpoints." },
      { title: "Crater floor & return", description: "Half-day Ngorongoro Crater drive; return to Arusha." },
    ]),
    highlights: { birding: [], wildlife: ["Wildebeest migration", "Ngorongoro Crater floor", "Plains predators"] },
    included: standardIncluded,
    excluded: standardExcluded,
    bestTime: "Calving Dec–Mar (Ndutu); river crossings Jul–Oct (north) – confirm sector when booking.",
    needsOwnerReview: [],
    seo: {
      title: "5 Days Serengeti Migration Safari | Endemic Birds",
      description: "Five-day Serengeti migration wildlife safari with Ngorongoro Crater – small groups.",
    },
  },
  {
    id: "4-days-ngorongoro-crater-escape",
    slug: "4-days-ngorongoro-crater-escape",
    title: "4 Days Ngorongoro Crater Escape",
    category: "wildlife",
    durationDays: 4,
    activitySlugs: ["ngorongoro-northern-icons"],
    wildlifeDestinations: [
      "arusha-national-park",
      "lake-manyara-national-park",
      "ngorongoro-conservation-area",
    ],
    destinations: ["northern"],
    circuits: ["Northern"],
    summary: "Compact northern safari – Momella Lakes, Lake Manyara and a full Ngorongoro Crater descent.",
    heroImage: img("ngorongoro-conservation-area"),
    featured: false,
    verified: true,
    itinerary: days(4, [
      { title: "Arusha NP", description: "Game drive and Momella Lakes viewpoints; overnight near Arusha." },
      { title: "Lake Manyara", description: "Forest and lake loop; transfer to Ngorongoro highlands." },
      { title: "Ngorongoro Crater", description: "Full crater floor drive – rhino, flamingo and dense game." },
      { title: "Return", description: "Optional Empakai or cultural stop; return to Arusha." },
    ]),
    highlights: { birding: [], wildlife: ["Crater black rhino", "Flamingo lakes", "Manyara forest elephants"] },
    included: standardIncluded,
    excluded: standardExcluded,
    bestTime: "Year-round; dry season (Jun–Oct) for clearer crater views.",
    needsOwnerReview: [],
    seo: {
      title: "4 Days Ngorongoro Safari | Endemic Birds",
      description: "Four-day Ngorongoro Crater safari with Manyara and Arusha National Park.",
    },
  },
  {
    id: "8-days-northern-tarangire-manyara-ngorongoro-serengeti",
    slug: "8-days-northern-tarangire-manyara-ngorongoro-serengeti",
    title: "8 Days Tarangire, Manyara, Ngorongoro & Serengeti",
    category: "wildlife",
    durationDays: 8,
    activitySlugs: ["ngorongoro-northern-icons"],
    wildlifeDestinations: [
      "tarangire-national-park",
      "lake-manyara-national-park",
      "ngorongoro-conservation-area",
      "serengeti-national-park",
    ],
    destinations: ["northern"],
    circuits: ["Northern"],
    summary: "Classic eight-day northern circuit – elephants, crater, and extended Serengeti time.",
    heroImage: img("tarangire-national-park"),
    featured: true,
    verified: true,
    itinerary: days(8, [
      { title: "Arusha to Tarangire", description: "Baobab country and river-line elephants." },
      { title: "Tarangire full day", description: "Extended drives on dry-season wildlife corridors." },
      { title: "Lake Manyara", description: "Groundwater forest and lake viewpoints." },
      { title: "Ngorongoro highlands", description: "Crater rim overnight; optional Empakai." },
      { title: "Crater & Serengeti", description: "Morning crater descent; transfer to Serengeti." },
      { title: "Serengeti full day", description: "Plains predators and kopje circuits." },
      { title: "Serengeti full day", description: "Second full day in migration or central sector." },
      { title: "Serengeti to Arusha", description: "Morning drive; return to Arusha or airport." },
    ]),
    highlights: { birding: [], wildlife: ["Tarangire elephants", "Crater floor", "Serengeti cats"] },
    included: standardIncluded,
    excluded: standardExcluded,
    bestTime: "Jun–Oct dry season; migration timing varies by month.",
    needsOwnerReview: [],
    seo: {
      title: "8 Days Northern Circuit Safari | Endemic Birds",
      description: "Eight-day Tarangire, Manyara, Ngorongoro and Serengeti wildlife safari.",
    },
  },
  {
    id: "7-days-mahale-gombe-chimp-safari",
    slug: "7-days-mahale-gombe-chimp-safari",
    title: "7 Days Mahale & Gombe Chimp Safari",
    category: "wildlife",
    durationDays: 7,
    activitySlugs: ["chimps-lake-forests"],
    wildlifeDestinations: ["mahale-mountains-national-park"],
    destinations: ["western"],
    circuits: ["Western"],
    summary: "Week-long western Tanzania primate safari – Lake Tanganyika lodges and chimp treks.",
    heroImage: img("mahale-mountains-national-park"),
    featured: false,
    verified: true,
    itinerary: days(7, [
      { title: "Dar es Salaam to Kigoma/Mahale", description: "Regional flights and boat transfer to lakeshore camp." },
      { title: "Mahale chimp trek", description: "Guided forest walk to chimp communities." },
      { title: "Mahale forest & lake", description: "Second trek or kayaking/snorkelling on Tanganyika." },
      { title: "Transfer Gombe", description: "Boat to Gombe Stream; afternoon forest walk." },
      { title: "Gombe chimps", description: "Full-day tracking with park rangers." },
      { title: "Gombe waterfalls", description: "Forest trails and Kakombe Falls option." },
      { title: "Return", description: "Boat and flight back to Dar es Salaam." },
    ]),
    highlights: { birding: [], wildlife: ["Chimpanzee tracking", "Lake Tanganyika", "Forest primates"] },
    included: [...standardIncluded, "Park chimp tracking fees where listed", "Boat transfers between lakeshore camps"],
    excluded: standardExcluded,
    bestTime: "Dry months (May–Oct) for clearer forest trails.",
    needsOwnerReview: [],
    seo: {
      title: "7 Days Mahale Gombe Chimp Safari | Endemic Birds",
      description: "Seven-day Mahale and Gombe chimpanzee safari on Lake Tanganyika.",
    },
  },
  {
    id: "8-days-ruaha-mikumi-safari",
    slug: "8-days-ruaha-mikumi-safari",
    title: "8 Days Ruaha & Mikumi Safari",
    category: "wildlife",
    durationDays: 8,
    activitySlugs: ["southern-western-wilderness"],
    wildlifeDestinations: ["mikumi-national-park", "ruaha-national-park"],
    destinations: ["southern"],
    circuits: ["Southern"],
    summary: "Southern savanna loop – Mkata plains then Ruaha’s baobab wilds and Ruaha River game.",
    heroImage: img("ruaha-national-park"),
    featured: true,
    verified: true,
    itinerary: days(8, [
      { title: "Dar to Mikumi", description: "Scenic drive; afternoon Mkata floodplain drive." },
      { title: "Mikumi full day", description: "Open savanna wildlife and hippo pools." },
      { title: "Mikumi to Ruaha", description: "Transfer via Iringa; evening at lodge." },
      { title: "Ruaha full day", description: "River-line elephants and miombo specials." },
      { title: "Ruaha full day", description: "Remote sectors for kudu, lion and wild dog if luck permits." },
      { title: "Ruaha full day", description: "Photographic drives on baobab ridges." },
      { title: "Ruaha to Mikumi/ Iringa", description: "Morning drive; overnight transit." },
      { title: "Return Dar", description: "Drive to Dar es Salaam or regional airport." },
    ]),
    highlights: { birding: [], wildlife: ["Ruaha elephants", "Mikumi zebras", "Baobab landscapes"] },
    included: standardIncluded,
    excluded: standardExcluded,
    bestTime: "Dry season Jun–Nov for Ruaha wildlife concentrations.",
    needsOwnerReview: [],
    seo: {
      title: "8 Days Ruaha Mikumi Safari | Endemic Birds",
      description: "Eight-day southern Tanzania Ruaha and Mikumi wildlife safari.",
    },
  },
  {
    id: "10-days-nyerere-katavi-expedition",
    slug: "10-days-nyerere-katavi-expedition",
    title: "10 Days Nyerere & Katavi Expedition",
    category: "wildlife",
    durationDays: 10,
    activitySlugs: ["southern-western-wilderness"],
    wildlifeDestinations: ["nyerere-national-park", "katavi-national-park"],
    destinations: ["southern", "western"],
    circuits: ["Southern", "Western"],
    summary: "Fly-in expedition combining Rufiji boat safaris with Katavi’s remote hippo and buffalo plains.",
    heroImage: img("nyerere-national-park"),
    featured: false,
    verified: true,
    itinerary: days(10, [
      { title: "Dar to Nyerere", description: "Light aircraft to airstrip; afternoon boat on Rufiji." },
      { title: "Nyerere game drives", description: "Full-day drives and optional walking (where permitted)." },
      { title: "Nyerere boat safari", description: "Hippo, crocodile and waterbird viewing from the river." },
      { title: "Fly to Katavi", description: "Charter to Katavi; afternoon drive to camp." },
      { title: "Katavi plains", description: "Dry-season hippo pools and buffalo herds." },
      { title: "Katavi full day", description: "Remote floodplain circuits with picnic lunch." },
      { title: "Katavi full day", description: "Second full day for photography and predator tracking." },
      { title: "Return flight west", description: "Morning drive; fly to Dar or connect north." },
      { title: "Buffer / beach optional", description: "Rest day or extension on request." },
      { title: "Depart", description: "International connection from Dar es Salaam." },
    ]),
    highlights: { birding: [], wildlife: ["Rufiji boat safari", "Katavi hippo congregations", "Wild dog (if encountered)"] },
    included: [...standardIncluded, "Internal flights as listed between parks"],
    excluded: standardExcluded,
    bestTime: "Jul–Oct for Katavi dry-season wildlife; Nyerere strong year-round.",
    needsOwnerReview: [],
    seo: {
      title: "10 Days Nyerere Katavi Safari | Endemic Birds",
      description: "Ten-day Nyerere and Katavi fly-in wilderness safari in Tanzania.",
    },
  },
];

const wildlifeUpdates = {
  "6-days-tanzania-safari": {
    activitySlugs: ["ngorongoro-northern-icons"],
    wildlifeDestinations: ["tarangire-national-park", "ngorongoro-conservation-area", "serengeti-national-park"],
    heroImage: img("serengeti-national-park"),
    itinerary: days(6, [
      { title: "Arusha to Tarangire", description: "Elephants and baobabs; lodge overnight." },
      { title: "Tarangire to Serengeti", description: "Drive via Ngorongoro highlands; enter Serengeti." },
      { title: "Serengeti full day", description: "Plains game drives." },
      { title: "Serengeti full day", description: "Predator and migration sector focus." },
      { title: "Ngorongoro Crater", description: "Crater descent from rim lodge." },
      { title: "Return Arusha", description: "Morning crater or lake stop; return." },
    ]),
    included: standardIncluded,
    excluded: standardExcluded,
    bestTime: "Year-round; Jun–Oct peak dry season.",
    needsOwnerReview: [],
    highlights: { birding: [], wildlife: ["Big five focus", "Serengeti plains", "Ngorongoro Crater"] },
  },
  "7-days-wildebeest-migration-hadzabe": {
    activitySlugs: ["great-migration-plains"],
    wildlifeDestinations: ["serengeti-national-park", "ngorongoro-conservation-area"],
    heroImage: img("serengeti-national-park", "gallery-1.jpg"),
    itinerary: days(7, [
      { title: "Arusha to Ndutu/Serengeti south", description: "Calving-season sector when timing allows." },
      { title: "Migration viewing", description: "Full-day plains drives for herds and predators." },
      { title: "Serengeti central", description: "Move with herd intelligence from guides." },
      { title: "Hadzabe experience", description: "Cultural visit near Lake Eyasi (route dependent)." },
      { title: "Serengeti full day", description: "Photography-focused drive." },
      { title: "Ngorongoro highlands", description: "Crater rim and conservation area viewpoints." },
      { title: "Crater & depart", description: "Crater floor morning; return to Arusha." },
    ]),
    included: standardIncluded,
    excluded: standardExcluded,
    needsOwnerReview: [],
  },
  "8-days-wildebeest-calving-migration": {
    activitySlugs: ["great-migration-plains"],
    wildlifeDestinations: ["serengeti-national-park", "ngorongoro-conservation-area"],
    heroImage: img("ngorongoro-conservation-area", "gallery-2.jpg"),
    itinerary: days(8, [
      { title: "Arusha to Ndutu", description: "Calving flats wildlife immersion." },
      { title: "Ndutu full day", description: "Wildebeest calving and predator action." },
      { title: "Ndutu full day", description: "Second day in southern Serengeti ecosystem." },
      { title: "Serengeti move north", description: "Transfer with game drives en route." },
      { title: "Serengeti full day", description: "Plains cats and vultures on kills." },
      { title: "Serengeti full day", description: "Flexible sector based on reports." },
      { title: "Ngorongoro", description: "Crater rim overnight." },
      { title: "Crater & exit", description: "Crater floor; return to Arusha." },
    ]),
    included: standardIncluded,
    excluded: standardExcluded,
    needsOwnerReview: [],
  },
  "9-days-wildlife-safari-zanzibar": {
    activitySlugs: ["bush-beach-luxury"],
    wildlifeDestinations: ["serengeti-national-park", "ngorongoro-conservation-area"],
    heroImage: img("serengeti-national-park", "gallery-4.jpg"),
    itinerary: days(9, [
      { title: "Arusha to Tarangire/Serengeti", description: "Start northern wildlife loop." },
      { title: "Serengeti", description: "Full-day game drives." },
      { title: "Serengeti", description: "Second full day on plains." },
      { title: "Ngorongoro", description: "Crater descent." },
      { title: "Fly/drive to Zanzibar", description: "Transfer to Stone Town or beach." },
      { title: "Zanzibar leisure", description: "Beach time and optional spice tour." },
      { title: "Zanzibar leisure", description: "Snorkel or dhow cruise on request." },
      { title: "Zanzibar", description: "Free day." },
      { title: "Depart", description: "Airport transfer from Zanzibar." },
    ]),
    included: [...standardIncluded, "Zanzibar beach lodge as confirmed", "Domestic flight safari-Zanzibar if listed"],
    excluded: standardExcluded,
    needsOwnerReview: [],
  },
  "10-days-luxury-flying-safari": {
    activitySlugs: ["bush-beach-luxury"],
    wildlifeDestinations: ["serengeti-national-park", "ngorongoro-conservation-area", "ruaha-national-park"],
    heroImage: img("ruaha-national-park", "gallery-1.jpg"),
    itinerary: days(10, [
      { title: "Arusha", description: "Briefing; light aircraft to Serengeti camp." },
      { title: "Serengeti", description: "Fly-in camp game drives." },
      { title: "Serengeti", description: "Full day with private guide." },
      { title: "Ngorongoro", description: "Fly or drive to crater highlands lodge." },
      { title: "Crater", description: "Private crater floor drive." },
      { title: "Fly Ruaha", description: "Charter south to Ruaha wilderness." },
      { title: "Ruaha", description: "River and baobab drives." },
      { title: "Ruaha", description: "Remote sector exploration." },
      { title: "Return", description: "Charter to Dar or Arusha." },
      { title: "Depart", description: "International flight." },
    ]),
    included: [...standardIncluded, "Scheduled charters as per confirmed quote", "Premium camp accommodation"],
    excluded: standardExcluded,
    needsOwnerReview: [],
  },
  "10-days-chimpanzee-tracking": {
    activitySlugs: ["chimps-lake-forests"],
    wildlifeDestinations: ["mahale-mountains-national-park"],
    heroImage: img("mahale-mountains-national-park", "gallery-4.jpg"),
    itinerary: days(10, [
      { title: "Dar to Mahale", description: "Flight and boat to lakeshore lodge." },
      { title: "Chimp trek", description: "Full-day forest tracking." },
      { title: "Mahale", description: "Second trek or lake activities." },
      { title: "Mahale", description: "Rest and optional snorkel." },
      { title: "Gombe transfer", description: "Boat to Gombe Stream." },
      { title: "Gombe chimps", description: "Tracking day." },
      { title: "Gombe", description: "Waterfalls hike." },
      { title: "Kigoma", description: "Lake Tanganyika town overnight." },
      { title: "Return Dar", description: "Flight to Dar es Salaam." },
      { title: "Buffer", description: "Departure day flexibility." },
    ]),
    included: standardIncluded,
    excluded: standardExcluded,
    needsOwnerReview: [],
  },
};

let merged = packages.filter((p) => !newPackages.some((n) => n.slug === p.slug));
for (const pkg of merged) {
  const upd = wildlifeUpdates[pkg.slug];
  if (upd) Object.assign(pkg, upd);
}
merged = [...merged, ...newPackages];

fs.writeFileSync(packagesPath, JSON.stringify(merged, null, 2), "utf8");

for (const dest of wildlifeDests) {
  dest.packageSlugs = [];
  dest.activitySlugs = [];
  for (const act of activities) {
    if (act.destinationSlugs?.includes(dest.slug)) dest.activitySlugs.push(act.slug);
  }
  for (const pkg of merged) {
    if (pkg.category !== "wildlife") continue;
    if ((pkg.wildlifeDestinations || []).includes(dest.slug)) dest.packageSlugs.push(pkg.slug);
  }
  dest.activitySlugs = [...new Set(dest.activitySlugs)];
  dest.packageSlugs = [...new Set(dest.packageSlugs)];
  delete dest._scrapeNote;
}

fs.writeFileSync(destPath, JSON.stringify(wildlifeDests, null, 2), "utf8");
console.log(`Packages: ${merged.length} total (${newPackages.length} new wildlife). Linked destination package counts.`);
