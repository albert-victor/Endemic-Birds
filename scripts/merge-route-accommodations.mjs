import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const jsonPath = path.join(root, "content", "accommodations.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const photo = (src, alt, credit) => ({
  photos: [{ src, alt, credit, verifiedPhoto: false }],
});

const newOnes = [
  {
    id: "fq-hotel",
    slug: "fq-hotel",
    name: "FQ Hotel",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "lodge",
    circuit: "Eastern",
    location: "Tanzania – branch to be confirmed",
    categoryLabel: "Hotel / Transit stay · Tanzania",
    tagline: "A comfortable pause between journeys.",
    detailHighlights: ["City accommodation", "Convenient safari stopover"],
    services: ["Transit", "City base"],
    summary:
      "Transit hotel used between safari legs – branch confirmed with your proposal.",
    birdingSetting: "Town stopovers en route to forest or park modules.",
    nearbyDestinationSlugs: [],
    nearbyWildlifeSlugs: [],
    packageSlugs: [],
    facilities: [],
    website: "https://fqhotel.co.tz/our-hotels/",
    confirmationPending: true,
    ...photo(
      "assets/images/from-live-site/destinations/eastern-destination.jpg",
      "Tanzania city hotel district – illustrative",
      "Illustrative – replace with licensed property photo"
    ),
  },
  {
    id: "pemba-paradise-beach-resort",
    slug: "pemba-paradise-beach-resort",
    displayName: "Pemba Paradise Beach Resort",
    name: "Pemba Paradise",
    verified: true,
    comfortLevel: "luxury",
    propertyType: "villa",
    circuit: "Eastern",
    location: "Pemba Island",
    categoryLabel: "Beach resort · Pemba Island",
    tagline: "Island tranquillity along the Indian Ocean.",
    detailHighlights: ["Beachfront surroundings", "Island retreat"],
    services: ["Beach", "Island retreat"],
    summary: "Coastal resort nights on Pemba island modules.",
    birdingSetting: "Pemba endemics and coastal birding from an island base.",
    nearbyDestinationSlugs: ["pemba-island-birding"],
    packageSlugs: ["22-days-birding-itinerary-north-east-south-pemba"],
    website: "https://pembaparadise.com/",
    ...photo(
      "assets/images/from-live-site/misc/watchingstunningbirdsonpembaislandtanzaniaontheswahilidiversproperty-370x270.jpeg",
      "Pemba Island coastal setting",
      "Regional Pemba image"
    ),
  },
  {
    id: "morogoro-hotel",
    slug: "morogoro-hotel",
    name: "Morogoro Hotel",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "lodge",
    circuit: "Eastern",
    location: "Morogoro",
    categoryLabel: "Hotel · Morogoro",
    tagline: "Comfort beneath the Uluguru Mountains.",
    detailHighlights: ["Mountain surroundings", "Morogoro stopover"],
    services: ["Mountain views", "Stopover"],
    summary: "Morogoro town hotel between eastern arc and southern transfers.",
    birdingSetting: "Uluguru foothill birding and eastern arc access roads.",
    nearbyDestinationSlugs: ["eastern-destination"],
    packageSlugs: [],
    website: "https://www.morogorohotel.com/",
    ...photo(
      "assets/images/from-live-site/destinations/eastern-destination.jpg",
      "Uluguru Mountains above Morogoro",
      "Illustrative regional image"
    ),
  },
  {
    id: "sunset-hotel",
    slug: "sunset-hotel",
    name: "Sunset",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "lodge",
    circuit: "Southern",
    location: "To be confirmed",
    categoryLabel: "Hotel · Location TBC",
    tagline: "A restful retreat after a day of exploration.",
    detailHighlights: ["Hotel accommodation", "Location to be confirmed"],
    services: ["En route stays"],
    summary: "Property match pending – possible Iringa Sunset Hotel.",
    birdingSetting:
      "Highlands or town-edge birding once property and base are confirmed.",
    confirmationPending: true,
    nearbyDestinationSlugs: [],
    packageSlugs: [],
    ...photo(
      "assets/images/from-live-site/destinations/southern-destination.jpg",
      "Southern highlands town",
      "Illustrative until property confirmed"
    ),
  },
  {
    id: "uluti-campsite",
    slug: "uluti-campsite",
    name: "Uluti Campsite",
    verified: true,
    comfortLevel: "budget",
    propertyType: "campsite",
    circuit: "Southern",
    location: "Udzungwa Scarp area",
    categoryLabel: "Remote birding camp · Udzungwa Scarp",
    tagline: "Beyond the familiar paths, into the forest.",
    detailHighlights: ["Remote forest setting", "Expedition camping"],
    services: ["Fly camp", "Forest access"],
    summary:
      "Remote expedition camping on scarp birding – not a brick-and-mortar lodge.",
    birdingSetting: "Udzungwa scarp specialists – mobile camp rhythm.",
    nearbyDestinationSlugs: ["udzungwa-mountains", "uluti-mountain"],
    packageSlugs: [],
    ...photo(
      "assets/images/from-live-site/destinations/southern-destination.jpg",
      "Udzungwa forest scarp – illustrative",
      "Illustrative expedition setting"
    ),
  },
  {
    id: "luala-camp",
    slug: "luala-camp",
    name: "Luala Camp",
    verified: true,
    comfortLevel: "budget",
    propertyType: "campsite",
    circuit: "Southern",
    location: "West Udzungwa Mountains",
    categoryLabel: "Remote expedition camp · West Udzungwa",
    tagline: "An expedition deep into the mountains.",
    detailHighlights: ["Remote forest access", "Mountain expedition"],
    services: ["Expedition camp", "Forest trails"],
    summary: "Mountain expedition camp character – calm, remote access.",
    birdingSetting:
      "West Udzungwa forest birding on multi-day scarp approaches.",
    nearbyDestinationSlugs: ["udzungwa-mountains"],
    packageSlugs: [],
    ...photo(
      "endemics/southern-destination.jpg",
      "Southern Tanzania mountain forest",
      "Illustrative forest camp setting"
    ),
  },
  {
    id: "hondo-hondo-udzungwa-forest-lodge",
    slug: "hondo-hondo-udzungwa-forest-lodge",
    displayName: "Hondo Hondo – Udzungwa Forest Lodge",
    name: "Hondo Hondo",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "lodge",
    circuit: "Southern",
    location: "Udzungwa Mountains",
    categoryLabel: "Forest lodge · Udzungwa",
    tagline: "At the edge of the rainforest.",
    detailHighlights: ["Forest surroundings", "Udzungwa Mountains"],
    services: ["Nature stays", "Forest edge"],
    summary: "Rainforest-edge lodge for Udzungwa birding modules.",
    birdingSetting: "Forest trail access and camp birding at the park margin.",
    nearbyDestinationSlugs: ["udzungwa-mountains"],
    packageSlugs: ["14-days-southern-tanzania-birding-tour"],
    website: "https://udzungwaforestlodge.com/",
    ...photo(
      "assets/images/from-live-site/destinations/southern-destination.jpg",
      "Udzungwa rainforest margin",
      "Illustrative – owner photo pending"
    ),
  },
  {
    id: "tan-swiss-lodge",
    slug: "tan-swiss-lodge",
    displayName: "Tan-Swiss Lodge",
    name: "Tan-Swiss",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "lodge",
    circuit: "Southern",
    location: "Mikumi, Morogoro",
    categoryLabel: "Safari lodge · Mikumi",
    tagline: "A welcoming retreat along the safari trail.",
    detailHighlights: ["Safari stopover", "Mikumi surroundings"],
    services: ["Safari hub", "Mikumi access"],
    summary:
      "Comfortable lodge between Dar es Salaam corridor and Mikumi birding.",
    birdingSetting: "Mikumi NP margins and miombo roadside species.",
    nearbyDestinationSlugs: [],
    nearbyWildlifeSlugs: ["mikumi-national-park"],
    website: "https://tan-swiss.com/",
    ...photo(
      "assets/images/wildlife/destinations/mikumi-national-park/hero.jpg",
      "Mikumi National Park landscape",
      "Mikumi habitat image"
    ),
  },
  {
    id: "amani-nature-reserve",
    slug: "amani-nature-reserve",
    displayName: "Amani Nature Reserve Accommodation",
    name: "Amani NR",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "bush-retreat",
    circuit: "Eastern",
    location: "East Usambara Mountains, Tanga",
    categoryLabel: "Nature reserve stay · Amani",
    tagline: "Stay surrounded by the Eastern Arc forests.",
    detailHighlights: ["Forest reserve setting", "Nature exploration"],
    services: ["Reserve stay", "Forest trails"],
    summary: "Protected reserve accommodation – not a private luxury resort.",
    birdingSetting: "Eastern Arc forest endemics from reserve trails.",
    nearbyDestinationSlugs: ["amani-nature-reserve", "west-usambara-magamba"],
    packageSlugs: [],
    website: "https://www.tfs.go.tz/forests/amani-nature-forest-reserves",
    ...photo(
      "assets/images/from-live-site/destinations/eastern-destination.jpg",
      "Eastern Arc moist forest",
      "Illustrative Eastern Arc image"
    ),
  },
  {
    id: "mullas-lodge",
    slug: "mullas-lodge",
    name: "Mulla's",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "lodge",
    circuit: "Eastern",
    location: "To be confirmed",
    categoryLabel: "Lodge · Location TBC",
    tagline: "A quiet stay amidst Tanzania's highlands.",
    detailHighlights: ["Lodge-style accommodation", "Location to be confirmed"],
    services: ["Highland lodge"],
    summary:
      "Property identification pending – possible Mullers Mountain Lodge, Lushoto.",
    confirmationPending: true,
    birdingSetting: "Usambara highland birding once base is confirmed.",
    nearbyDestinationSlugs: ["west-usambara-magamba"],
    packageSlugs: [],
    ...photo(
      "assets/images/from-live-site/destinations/eastern-destination.jpg",
      "Eastern Arc highlands",
      "Illustrative highland image"
    ),
  },
  {
    id: "elephant-motel",
    slug: "elephant-motel",
    name: "Elephant Motel",
    verified: true,
    comfortLevel: "budget",
    propertyType: "lodge",
    circuit: "Eastern",
    location: "Same, Kilimanjaro Region",
    categoryLabel: "Motel / Safari stopover · Same",
    tagline: "A peaceful stop near the Pare Mountains.",
    detailHighlights: ["Mountain surroundings", "Safari stopover"],
    services: ["Stopover", "Pare Mountains"],
    summary: "Stopover motel on northern-eastern transfer days.",
    birdingSetting: "Pare Mountains and lowland transfer birding.",
    nearbyDestinationSlugs: ["south-pare-chome"],
    packageSlugs: [],
    website: "https://elephantmotel.com/",
    ...photo(
      "assets/images/from-live-site/destinations/eastern-destination.jpg",
      "Kilimanjaro region highlands",
      "Illustrative regional image"
    ),
  },
  {
    id: "eliboru-lodge",
    slug: "eliboru-lodge",
    name: "Eliboru Lodge",
    verified: true,
    comfortLevel: "mid-range",
    propertyType: "lodge",
    circuit: "Northern",
    location: "To be confirmed",
    categoryLabel: "Lodge · Details TBC",
    tagline: "A restful stop along the journey.",
    detailHighlights: ["Lodge accommodation", "Details to be confirmed"],
    services: ["En route lodge"],
    summary:
      "Listed on operator routes – address and facilities to be confirmed.",
    confirmationPending: true,
    birdingSetting: "Route-dependent – confirmed with your written proposal.",
    nearbyDestinationSlugs: [],
    packageSlugs: [],
    ...photo(
      "assets/images/wildlife/destinations/arusha-national-park/hero.jpg",
      "Northern Tanzania landscape",
      "Illustrative until property verified"
    ),
  },
];

for (const entry of newOnes) {
  entry.accessibility = entry.accessibility ?? null;
  entry.familySuitability = entry.familySuitability ?? null;
  entry.nearbyWildlifeSlugs = entry.nearbyWildlifeSlugs ?? [];
  entry.facilities = entry.facilities ?? [];
  entry.seo = {
    title: `${entry.displayName || entry.name} | Safari stay | Endemic Birds`,
    description: entry.summary,
  };
}

const slugs = new Set(data.accommodations.map((a) => a.slug));
const merged = [
  ...data.accommodations,
  ...newOnes.filter((a) => !slugs.has(a.slug)),
];
data.accommodations = merged;
fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Accommodations: ${merged.length} (${newOnes.length} route entries merged)`);