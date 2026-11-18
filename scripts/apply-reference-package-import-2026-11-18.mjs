/**
 * One-off: align packages with reference routes (Cisticola + Birdquest programme).
 * Run from repo root: node scripts/apply-reference-package-import-2026-11-18.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packagesPath = path.join(root, "content", "packages.json");
const detailsPath = path.join(root, "content", "package-details.json");
const reportPath = path.join(root, "content", "reference-import-report-2026-11-18.json");

const STD_INCLUDED = [
  "Specialist birding guide (English; other languages on request)",
  "Safari vehicle suited to the route – small group sizes",
  "Park and reserve fees as per confirmed itinerary",
  "Accommodation as proposed for your dates",
  "Meals on the published meal plan while in the field",
  "Bottled drinking water in the vehicle on drive days",
];

const STD_EXCLUDED = [
  "International flights, visas and airport taxes",
  "Travel and medical insurance",
  "Tips for guides, drivers and lodge staff",
  "Personal expenses, alcoholic drinks and laundry",
  "Optional extensions or activities not listed in the itinerary",
];

const importedAt = new Date().toISOString();

const packages = JSON.parse(fs.readFileSync(packagesPath, "utf8"));

function upsert(slug, patch) {
  const i = packages.findIndex((p) => p.slug === slug);
  if (i >= 0) Object.assign(packages[i], patch);
  else packages.push({ id: slug, slug, ...patch });
}

upsert("15-days-tanzania-birding-tour", {
  title: "15 Days Tanzania Birding Tour",
  category: "birding",
  durationDays: 15,
  destinations: ["northern", "eastern", "eastern-arc"],
  circuits: ["Northern", "Eastern"],
  summary:
    "Northern savanna, crater and Serengeti birding linked with Eastern Arc forests, Usambaras, Mkomazi and Kilimanjaro foothill wetlands – a classic cross-country endemic route from Arusha.",
  featured: true,
  verified: true,
  itinerary: [
    {
      day: 1,
      title: "Arrival in Arusha",
      description:
        "Arrive Kilimanjaro International Airport or Arusha. Settle at your lodge; optional local birding if you land early – we confirm pacing on enquiry.",
    },
    {
      day: 2,
      title: "Lark Plains and transfer to Tarangire",
      description:
        "Predawn run to the Engikaret Lark Plains for Beesley's Lark, then south through acacia country into Tarangire National Park for elephant rivers and baobab savanna birds.",
    },
    {
      day: 3,
      title: "Tarangire National Park",
      description:
        "Full day in Tarangire: Ashy Starling, Yellow-collared Lovebird, Rufous-tailed Weaver, francolins and raptors with big game on the floodplain edges.",
    },
    {
      day: 4,
      title: "Lake Manyara to Ngorongoro highlands",
      description:
        "Manyara forest and soda shorebirds, then climb to Ngorongoro Conservation Area for rim forest birding and crater overview.",
    },
    {
      day: 5,
      title: "Ngorongoro Crater",
      description:
        "Descent to the crater floor – grassland birds, flamingos when conditions allow, Black Rhino and carnivore scenery amid sheer walls.",
    },
    {
      day: 6,
      title: "Serengeti via Olduvai Gorge",
      description:
        "Cross the highlands through short-grass plains; optional Olduvai visit, then enter Serengeti for kopje-country birds and migration herds (season-dependent).",
    },
    {
      day: 7,
      title: "Serengeti National Park",
      description:
        "Scout Serengeti plains and rock kopjes – hornbills, weavers, bustards and cats on open country.",
    },
    {
      day: 8,
      title: "Serengeti to Arusha",
      description:
        "Morning birding, then drive back toward Arusha with roadside stops for missed northern specials.",
    },
    {
      day: 9,
      title: "Drive to West Usambara (Lushoto)",
      description:
        "Leave Arusha south into the Eastern Arc – montane forest edges and winding passes to Lushoto.",
    },
    {
      day: 10,
      title: "West Usambara Mountains",
      description:
        "Forest trails and ridges for Usambara endemics – sunbirds, greenbuls, shrikes and understory specials at unhurried pace.",
    },
    {
      day: 11,
      title: "East Usambara transfer (Amani)",
      description:
        "Birding en route from Lushoto to Amani Nature Reserve in the East Usambaras.",
    },
    {
      day: 12,
      title: "East Usambara / Amani",
      description:
        "Full day in Amani forest; optional night walk for Usambara Eagle-Owl when conditions allow.",
    },
    {
      day: 13,
      title: "Same area",
      description:
        "Descend toward the rain shadow near Same – dryland bush birds and open-country species.",
    },
    {
      day: 14,
      title: "Mkomazi National Park",
      description:
        "Full day in Mkomazi for dry-country birds, including species with Kenya-range overlap, with mammal viewing breaks.",
    },
    {
      day: 15,
      title: "Nyumba ya Mungu to Kilimanjaro / Arusha",
      description:
        "Reservoir birding en route, then transfer for evening international departure from Kilimanjaro or an overnight in Arusha.",
    },
  ],
  highlights: {
    birding: [
      "Beesley's Lark",
      "Usambara Akalat",
      "Spot-throat",
      "Rufous-winged Sunbird",
      "Fischer's Lovebird",
      "Ashy Starling",
      "Usambara Eagle-Owl (night search)",
    ],
    wildlife: [
      "Serengeti plains herds (seasonal)",
      "Ngorongoro Black Rhino",
      "Tarangire elephants",
      "Mkomazi dry-country mammals",
    ],
  },
  included: STD_INCLUDED,
  excluded: STD_EXCLUDED,
  bestTime:
    "Jun–Oct for dry roads and Serengeti wildlife; Apr–May and Nov–Mar for forest vocal activity and migrants – forests bird year-round.",
  needsOwnerReview: [],
  seo: {
    title: "15 Days Tanzania Birding Tour | Endemic Birds Tanzania",
    description:
      "15-day Tanzania birding from Arusha through northern parks, Serengeti, Usambaras, Mkomazi and Nyumba ya Mungu – tailor-made with Endemic Birds.",
  },
  activitySlugs: ["great-migration-plains", "ngorongoro-northern-icons"],
  wildlifeDestinations: [
    "tarangire-national-park",
    "lake-manyara-national-park",
    "ngorongoro-conservation-area",
    "serengeti-national-park",
  ],
  contentSource: {
    type: "reference-import",
    referenceUrls: ["https://www.cisticolatours.com/tanzania-birding-tour/"],
    importedAt,
    fidelity: "route-aligned-editorial",
    note: "Day structure aligned to published northern–eastern route; copy rewritten for Endemic Birds – not third-party verbatim text.",
  },
});

const sevenDay = {
  id: "7-days-tanzania-budget-birding",
  slug: "7-days-tanzania-budget-birding",
  title: "7 Days Tanzania Budget Birding Tour",
  category: "birding",
  durationDays: 7,
  destinations: ["northern", "eastern", "eastern-arc"],
  circuits: ["Northern", "Eastern"],
  summary:
    "Focused Eastern Arc birding from Arusha – Lark Plains, West Usambara, South Pare, Same and Nyumba ya Mungu without the long northern park loop. Ideal for guests on a tighter budget or timeline.",
  heroImage: "assets/images/packages/7-days-tanzania-budget-birding/hero.jpg",
  featured: false,
  verified: true,
  itinerary: [
    {
      day: 1,
      title: "Arrival in Arusha",
      description: "Arrive Arusha area; lodge birding if time permits.",
    },
    {
      day: 2,
      title: "Lark Plains and Moshi",
      description:
        "Engikaret Lark Plains for Beesley's Lark, then stopovers south to Moshi with roadside bush birding.",
    },
    {
      day: 3,
      title: "To West Usambara (Lushoto)",
      description: "Climb into the West Usambara highlands; afternoon forest edges near Lushoto.",
    },
    {
      day: 4,
      title: "West Usambara Mountains",
      description: "Full forest day on Usambara trails – endemic sunbirds, akalats and mixed flocks.",
    },
    {
      day: 5,
      title: "Same area",
      description: "Transfer to Same for dry bush and open-country species in the foothills.",
    },
    {
      day: 6,
      title: "South Pare Mountains",
      description:
        "Highland forest around South Pare for South Pare White-eye and associated arc species; afternoon Same area mopping.",
    },
    {
      day: 7,
      title: "Nyumba ya Mungu to Arusha",
      description: "Reservoir birding, then return to Arusha for evening international departure.",
    },
  ],
  highlights: {
    birding: [
      "Beesley's Lark",
      "Usambara Akalat",
      "Spot-throat",
      "South Pare White-eye",
      "Pink-breasted Lark",
    ],
    wildlife: [],
  },
  included: STD_INCLUDED,
  excluded: STD_EXCLUDED,
  bestTime: "Year-round in the arc; drier months often easier on forest tracks (Jun–Nov).",
  seo: {
    title: "7 Days Tanzania Budget Birding Tour | Endemic Birds",
    description:
      "Week-long budget-friendly Tanzania birding: Lark Plains, Usambaras, South Pare and Nyumba ya Mungu with private guiding from Iringa-based specialists.",
  },
  gallery: [
    "assets/images/packages/7-days-tanzania-budget-birding/hero.jpg",
    "assets/images/packages/7-days-tanzania-budget-birding/gallery-1.jpg",
  ],
  contentSource: {
    type: "reference-import",
    referenceUrls: ["https://www.cisticolatours.com/tanzania-budget-birding-tour/"],
    importedAt,
    fidelity: "route-aligned-editorial",
  },
};

if (!packages.some((p) => p.slug === sevenDay.slug)) packages.push(sevenDay);
else upsert(sevenDay.slug, sevenDay);

const ultimate23 = {
  id: "23-days-ultimate-tanzania-birding",
  slug: "23-days-ultimate-tanzania-birding",
  title: "23 Days Ultimate Tanzania Birding",
  category: "birding",
  durationDays: 23,
  destinations: ["southern", "eastern-arc", "eastern", "northern"],
  circuits: ["Southern", "Eastern", "Northern"],
  summary:
    "Comprehensive speciality tour – Udzungwa camping blocks, Kilombero, Uluguru and Ukaguru, Pemba Island, Usambaras and northern Serengeti extension modules. Built for dedicated listers who want Tanzania's arc endemics and classic savanna in one long route.",
  heroImage: "assets/images/packages/23-days-ultimate-tanzania-birding/hero.jpg",
  featured: true,
  verified: true,
  itinerary: [
    { day: 1, title: "Dar es Salaam to Iringa", description: "Domestic connection to the southern hub; route timing confirmed on enquiry." },
    { day: 2, title: "Southwest Udzungwa forests", description: "Remote forest birding; camping or simple forest lodge nights." },
    { day: 3, title: "Southwest Udzungwa forests", description: "Second day for Udzungwa scarp targets and forest skulkers." },
    { day: 4, title: "Return to Iringa", description: "Drive back to Iringa; laundry and vehicle reset." },
    { day: 5, title: "Northwest Udzungwa", description: "Alternate Udzungwa sectors for partridge, robin and sunbird targets." },
    { day: 6, title: "Northwest Udzungwa", description: "Continue forest exploration; pacing adjusted to season." },
    { day: 7, title: "Iringa", description: "Buffer / travel day between Udzungwa blocks." },
    { day: 8, title: "Mikumi corridor", description: "Transit with miombo and savanna birding near Mikumi." },
    { day: 9, title: "Mikumi to Ifakara", description: "Eastward to Kilombero floodplain approach roads." },
    { day: 10, title: "Kilombero River", description: "Wetland and swamp edge species; return toward Mikumi." },
    { day: 11, title: "Mikumi to Morogoro", description: "Open-country birding exit through Mikumi fringe." },
    { day: 12, title: "Uluguru Mountains", description: "Montane forest day from Morogoro base." },
    { day: 13, title: "Ukaguru Mountains", description: "Low-traffic Eastern Arc block; return Morogoro overnight." },
    { day: 14, title: "Ukaguru / Morogoro", description: "Second arc day or travel buffer depending on targets." },
    { day: 15, title: "Dar es Salaam and flight to Pemba", description: "Domestic flight to Pemba for island endemics." },
    { day: 16, title: "Pemba Island", description: "Ngezi forest and coastal species – four Pemba endemics on the list." },
    { day: 17, title: "Pemba to East Usambara (Amani)", description: "Return to mainland; drive to Amani Nature Reserve." },
    { day: 18, title: "East Usambara Mountains", description: "Amani forest birding." },
    { day: 19, title: "East Usambara Mountains", description: "Second Amani day for akalats, thrushes and sunbirds." },
    { day: 20, title: "West Usambara (Lushoto)", description: "Transfer and afternoon ridge birding." },
    { day: 21, title: "West Usambara Mountains", description: "Full Lushoto forest day." },
    { day: 22, title: "Same / South Pare", description: "Descend to Same and South Pare white-eye country." },
    { day: 23, title: "Same to Kilimanjaro Airport", description: "Final field day, then evening tour end at Kilimanjaro International Airport." },
  ],
  highlights: {
    birding: [
      "Udzungwa Forest Partridge",
      "Kilombero Weaver",
      "Pemba endemics",
      "Usambara Akalat",
      "Uluguru bush-shrike complex",
    ],
    wildlife: ["Southern miombo megafauna where routed through Ruaha/Mikumi modules"],
  },
  included: [
    ...STD_INCLUDED,
    "Domestic flights on the published Pemba and southern modules when included in your written quote",
  ],
  excluded: STD_EXCLUDED,
  bestTime:
    "Jul–Aug often planned for Ultimate-style departures; forests and Pemba workable year-round with weather flexibility.",
  seo: {
    title: "23 Days Ultimate Tanzania Birding | Endemic Birds",
    description:
      "Ultimate Tanzania birding: Eastern Arc, Udzungwa, Kilombero, Pemba, Usambaras and northern extension – tailor-made departures from Endemic Birds.",
  },
  gallery: [
    "assets/images/packages/23-days-ultimate-tanzania-birding/hero.jpg",
    "assets/images/packages/23-days-ultimate-tanzania-birding/gallery-1.jpg",
  ],
  needsOwnerReview: [
    "optional northern Serengeti extension (7 days) quoted separately",
    "camping vs lodge nights in Udzungwa blocks confirmed on enquiry",
  ],
  contentSource: {
    type: "reference-import",
    referenceUrls: [
      "https://www.birdquest-tours.com/africa/tanzania/",
      "https://www.birdquest-tours.com/birding-tours/tanzania-ultimate/",
    ],
    importedAt,
    fidelity: "outline-aligned-editorial",
    note: "23-day outline follows published Ultimate Tanzania programme structure; copy is original Endemic Birds editorial.",
  },
};

if (!packages.some((p) => p.slug === ultimate23.slug)) packages.push(ultimate23);
else upsert(ultimate23.slug, ultimate23);

// Northern Tanzania (Birdquest 15-day outline) -> existing slug retained for URL stability
const northernItinerary = [
  { day: 1, title: "Arusha arrival", description: "Evening start near Arusha after Kilimanjaro transfer." },
  { day: 2, title: "Lark Plains and Tarangire", description: "Beesley's Lark mission, then Tarangire baobabs and lovebirds." },
  { day: 3, title: "Tarangire National Park", description: "Full savanna day – weavers, bustards, raptors and elephant rivers." },
  { day: 4, title: "Tarangire to Lake Manyara", description: "Manyara forest hornbills and Rift soda shorebirds." },
  { day: 5, title: "To Ngorongoro", description: "Ascend western rift escarpment into Ngorongoro Conservation Area." },
  { day: 6, title: "Ngorongoro Crater", description: "Rim forest sunbirds and full crater-floor circuit." },
  { day: 7, title: "To central Serengeti", description: "Cross plains toward Serengeti heartland." },
  { day: 8, title: "Central Serengeti", description: "Kopjes, plains larks and big cats." },
  { day: 9, title: "Central Serengeti", description: "Second Serengeti day for helmetshrikes and dry-country edge species." },
  { day: 10, title: "To Ndutu / south-east Serengeti", description: "Short-grass plains and woodland lakes near Ndutu." },
  { day: 11, title: "Ndutu region", description: "Calving-season spectacle when rains align; Grey-breasted Spurfowl and lovebirds at waterholes." },
  { day: 12, title: "Ndutu region", description: "Second Ndutu day for migration herds and photographic light." },
  { day: 13, title: "Olduvai Gorge to Arusha", description: "Descent via historic gorge; return to Arusha highlands." },
  { day: 14, title: "Arusha National Park", description: "Mount Meru slopes – forest robin-chats, turacos and colobus." },
  { day: 15, title: "Tour end", description: "Morning finish; Kilimanjaro Airport transfer for evening flights." },
];

upsert("13-days-northern-tanzania-birding", {
  title: "15 Days Northern Tanzania Birding & Wildlife",
  durationDays: 15,
  summary:
    "Lark Plains, Tarangire, Manyara, Ngorongoro, multi-sector Serengeti including Ndutu, Olduvai and Arusha National Park – intense birding with world-class mammal viewing on one northern loop.",
  itinerary: northernItinerary,
  highlights: {
    birding: [
      "Beesley's Lark",
      "Yellow-collared Lovebird",
      "Ashy Starling",
      "Fischer's Lovebird",
      "Grey-breasted Spurfowl",
      "Maasai Apalis",
      "Grey-crested Helmetshrike",
    ],
    wildlife: ["Lion", "Cheetah", "Leopard", "Black Rhino", "Great Migration herds (seasonal)"],
  },
  category: "combined",
  needsOwnerReview: ["URL slug remains 13-days-northern-tanzania-birding while duration is 15 days – redirect or rename when owner approves"],
  seo: {
    title: "15 Days Northern Tanzania Birding & Wildlife | Endemic Birds",
    description:
      "Northern Tanzania birding and wildlife: Tarangire, Ngorongoro, Serengeti, Ndutu and Arusha NP with specialist guides.",
  },
  contentSource: {
    type: "reference-import",
    referenceUrls: [
      "https://www.birdquest-tours.com/africa/tanzania/",
      "https://www.birdquest-tours.com/birding-tours/tanzania-northern/",
    ],
    importedAt,
    fidelity: "outline-aligned-editorial",
    note: "Prior Birdquest/Tropical-style long descriptions replaced with Endemic Birds day summaries.",
  },
});

packages.sort((a, b) => a.slug.localeCompare(b.slug));

fs.writeFileSync(packagesPath, JSON.stringify(packages, null, 2) + "\n", "utf8");

const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));
details.bySlug = details.bySlug || {};
details.bySlug["15-days-tanzania-birding-tour"] = {
  whyChoose:
    "Our classic northern-to-eastern arc link – Serengeti mammal country and Usambara forest endemics on one private route from Arusha, without rushing forest days.",
  travellerProfile: "Listers and photographers wanting parks plus Eastern Arc specials on a single two-week itinerary.",
  habitats: [
    "Acacia savanna",
    "Rift Valley soda lakes",
    "Ngorongoro highland forest",
    "Serengeti short-grass plains",
    "Eastern Arc montane forest",
    "Dry bush near Mkomazi",
  ],
  targetBirds: [
    "Beesley's Lark",
    "Usambara Akalat",
    "Spot-throat",
    "Ashy Starling",
    "Fischer's Lovebird",
  ],
  seasonality: "Serengeti sectors vary by month; arc forests bird year-round – we match Ndutu, river crossings or forest targets to your dates.",
  editorialBanner:
    "Combines well with our southern endemic modules on a longer tailor-made tour – ask about a Mega Tanzania birding quote.",
};
details.bySlug["7-days-tanzania-budget-birding"] = {
  whyChoose:
    "Maximum arc endemics per day without the full northern park loop – suited to guests combining a short birding week with Kilimanjaro or Zanzibar.",
  travellerProfile: "Budget-conscious birders and repeat visitors who already know the northern parks.",
  habitats: ["Eastern Arc forest", "Lark Plains grassland", "South Pare highlands", "Reservoir wetlands"],
  targetBirds: ["South Pare White-eye", "Usambara Akalat", "Beesley's Lark", "Spot-throat"],
  seasonality: "Year-round; confirm South Pare access in heavy rains.",
};
details.bySlug["23-days-ultimate-tanzania-birding"] = {
  whyChoose:
    "Flagship cross-country endemic route – southern Udzungwa and Kilombero modules, Pemba island endemics and Usambara forests in one extended private itinerary.",
  travellerProfile: "Dedicated listers accepting camping nights, domestic flights and long drives between arc blocks.",
  habitats: [
    "Eastern Arc montane and scarp forest",
    "Kilombero floodplain",
    "Pemba island forest",
    "Usambara and Pare highlands",
  ],
  editorialBanner:
    "Northern Serengeti–Arusha extension (approx. 7 days) available as an add-on – not included in the 23-day outline below unless quoted.",
  seasonality: "Often scheduled Jul–Aug; confirm Udzungwa camping and flight blocks for your year.",
};
details.bySlug["13-days-northern-tanzania-birding"] = {
  ...details.bySlug["13-days-northern-tanzania-birding"],
  whyChoose:
    "A northern Tanzania pilgrimage route – Lark Plains endemic lark, crater rhinos, Serengeti cats and Ndutu calving meadows when timed to the rains.",
  travellerProfile: "First-time Tanzania visitors and mammal photographers who still want a serious northern bird list.",
  habitats: ["Acacia savanna", "Soda lakes", "Crater grassland", "Short-grass plains"],
  seasonality: "Apr calving season popular for birds in breeding plumage; Jun–Aug for dry-season wildlife viewing.",
  tripConsiderations: undefined,
};

fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2) + "\n", "utf8");

const report = {
  importedAt,
  sources: [
    {
      url: "https://www.cisticolatours.com/tanzania-birding-tour/",
      action: "Updated slug 15-days-tanzania-birding-tour: title, summary, 15-day itinerary, highlights, contentSource",
    },
    {
      url: "https://www.cisticolatours.com/tanzania-budget-birding-tour/",
      action: "Created slug 7-days-tanzania-budget-birding (new package + package-details + placeholder images)",
    },
    {
      url: "https://www.birdquest-tours.com/africa/tanzania/",
      children: [
        {
          programme: "Northern Tanzania",
          url: "https://www.birdquest-tours.com/birding-tours/tanzania-northern/",
          action: "Updated 13-days-northern-tanzania-birding to 15-day outline (durationDays 15); slug unchanged pending owner review",
        },
        {
          programme: "Ultimate Tanzania",
          url: "https://www.birdquest-tours.com/birding-tours/tanzania-ultimate/",
          action: "Created slug 23-days-ultimate-tanzania-birding with 23-day outline editorial",
        },
      ],
    },
  ],
  discipline: {
    dataFiles: ["content/packages.json", "content/package-details.json"],
    copyPolicy: "Route structure from reference operators; all visitor-facing text rewritten for Endemic Birds – no verbatim third-party prose.",
    images: "New slugs use copied placeholder heroes from existing package folders until owner supplies photography.",
    nextSteps: [
      "npm run build:package-meta",
      "npm run build (regenerate package HTML shells)",
      "Owner: approve slug rename 13-days → 15-days-northern URL if desired",
      "Owner: replace placeholder images for 7-day and 23-day packages",
    ],
  },
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log("Wrote packages, package-details, and", reportPath);