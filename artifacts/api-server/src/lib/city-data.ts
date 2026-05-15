export type ScoreKey =
  | "safety"
  | "family"
  | "affordability"
  | "environment"
  | "transport"
  | "tourism"
  | "walkability"
  | "overall";

export type UserMode = "resident" | "tourist" | "student" | "investor" | "family" | "professional" | "retiree" | "expat";

export interface CityDistrict {
  id: number;
  name: string;
  nameLt: string;
  city: string;
  population: number;
  areaKm2: number;
  lat: number;
  lng: number;
  overallScore: number;
  description: string;
  descriptionLt: string;
  highlights: string[];
  highlightsLt: string[];
  scores: Record<ScoreKey, number>;
  metrics: {
    housingPriceEurM2: number;
    rentEurMonth: number;
    crimeIndex: number;
    airQuality: number;
    noiseDb: number;
    lightPollution: number;
    transitStops: number;
    parksWithin15Min: number;
    clinicsWithin15Min: number;
    schoolsWithin15Min: number;
    nightlifeIndex: number;
    tourismIndex: number;
  };
}

export interface OverlayFeature {
  id: string;
  lat: number;
  lng: number;
  value: number;
  label: string;
  category: string;
  city: string;
  districtId: number;
}

export interface PoiRecord {
  id: number;
  name: string;
  nameLt: string;
  category: "attraction" | "restaurant" | "hotel" | "nightlife" | "transport" | "emergency" | "pharmacy" | "park";
  lat: number;
  lng: number;
  city: string;
  description: string;
  descriptionLt: string;
  rating: number;
  districtId: number;
}

export const DATA_SOURCES = [
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org" },
  { name: "Vilnius Open Data Portal", url: "https://data-vplanas.opendata.arcgis.com" },
  { name: "Lithuanian Open Data Portal", url: "https://data.gov.lt" },
  { name: "Registrų Centras real estate statistics", url: "https://www.registrucentras.lt" },
  { name: "Statistics Lithuania", url: "https://osp.stat.gov.lt" },
  { name: "Environmental Protection Agency", url: "https://aaa.lrv.lt" },
  { name: "Lithuanian Police public crime statistics", url: "https://policija.lrv.lt" },
  { name: "Public transport GTFS and stop registries", url: "https://data.gov.lt" },
];

export const districts: CityDistrict[] = [
  {
    id: 1,
    name: "Senamiestis",
    nameLt: "Senamiestis",
    city: "Vilnius",
    population: 21200,
    areaKm2: 3.6,
    lat: 54.6816,
    lng: 25.2872,
    overallScore: 8.7,
    description: "Historic core with the strongest tourism, culture, dining, and walkability scores, balanced by higher prices and evening noise.",
    descriptionLt: "Istorinis centras su stipriausiais turizmo, kultūros, maitinimo ir pėsčiųjų pasiekiamumo rodikliais.",
    highlights: ["Best for visitors and short stays", "Dense public transport and walkable services", "Higher price and nightlife noise tradeoff"],
    highlightsLt: ["Geriausia lankytojams", "Tankus viešasis transportas", "Aukštesnė kaina ir daugiau triukšmo"],
    scores: { safety: 7.8, family: 7.4, affordability: 4.6, environment: 7.2, transport: 9.5, tourism: 10, walkability: 9.8, overall: 8.7 },
    metrics: { housingPriceEurM2: 3900, rentEurMonth: 980, crimeIndex: 42, airQuality: 63, noiseDb: 64, lightPollution: 74, transitStops: 46, parksWithin15Min: 9, clinicsWithin15Min: 8, schoolsWithin15Min: 7, nightlifeIndex: 95, tourismIndex: 98 },
  },
  {
    id: 2,
    name: "Naujamiestis",
    nameLt: "Naujamiestis",
    city: "Vilnius",
    population: 28600,
    areaKm2: 4.8,
    lat: 54.6771,
    lng: 25.2638,
    overallScore: 8.4,
    description: "Central, creative, and highly connected; a strong fit for students, professionals, and investors looking for growth.",
    descriptionLt: "Centriškas, kūrybiškas ir gerai sujungtas rajonas studentams, profesionalams ir investuotojams.",
    highlights: ["Fast access to rail and bus station", "Strong rental demand", "Good nightlife without full Old Town prices"],
    highlightsLt: ["Greita prieiga prie stoties", "Stipri nuomos paklausa", "Geras naktinis gyvenimas"],
    scores: { safety: 7.4, family: 7.2, affordability: 6.2, environment: 6.9, transport: 9.2, tourism: 8.8, walkability: 9.1, overall: 8.4 },
    metrics: { housingPriceEurM2: 3200, rentEurMonth: 820, crimeIndex: 46, airQuality: 60, noiseDb: 62, lightPollution: 69, transitStops: 41, parksWithin15Min: 8, clinicsWithin15Min: 9, schoolsWithin15Min: 8, nightlifeIndex: 88, tourismIndex: 84 },
  },
  {
    id: 3,
    name: "Žvėrynas",
    nameLt: "Žvėrynas",
    city: "Vilnius",
    population: 12200,
    areaKm2: 2.7,
    lat: 54.6922,
    lng: 25.2538,
    overallScore: 9.1,
    description: "Quiet, green, prestigious, and close to the center; one of the best family and clean-air matches.",
    descriptionLt: "Ramus, žalias, prestižinis ir netoli centro esantis rajonas šeimoms.",
    highlights: ["Excellent parks and river access", "Lower noise than central districts", "Premium housing prices"],
    highlightsLt: ["Puikūs parkai ir upė", "Mažiau triukšmo nei centre", "Aukšta būsto kaina"],
    scores: { safety: 9.2, family: 9.4, affordability: 4.8, environment: 9.5, transport: 8.3, tourism: 7.8, walkability: 8.6, overall: 9.1 },
    metrics: { housingPriceEurM2: 4100, rentEurMonth: 1050, crimeIndex: 21, airQuality: 79, noiseDb: 51, lightPollution: 49, transitStops: 24, parksWithin15Min: 13, clinicsWithin15Min: 7, schoolsWithin15Min: 10, nightlifeIndex: 48, tourismIndex: 70 },
  },
  {
    id: 4,
    name: "Antakalnis",
    nameLt: "Antakalnis",
    city: "Vilnius",
    population: 38500,
    areaKm2: 11.3,
    lat: 54.7067,
    lng: 25.3204,
    overallScore: 8.8,
    description: "Leafy residential district with strong healthcare, schools, nature access, and balanced prices.",
    descriptionLt: "Žalias gyvenamasis rajonas su sveikatos paslaugomis, mokyklomis ir gamta.",
    highlights: ["Best healthcare access", "Large green areas and trails", "Family-friendly density"],
    highlightsLt: ["Geriausias sveikatos pasiekiamumas", "Dideli žalieji plotai", "Patogu šeimoms"],
    scores: { safety: 8.7, family: 9.1, affordability: 6.7, environment: 9.3, transport: 8.1, tourism: 6.9, walkability: 7.8, overall: 8.8 },
    metrics: { housingPriceEurM2: 2750, rentEurMonth: 690, crimeIndex: 27, airQuality: 77, noiseDb: 52, lightPollution: 45, transitStops: 31, parksWithin15Min: 15, clinicsWithin15Min: 12, schoolsWithin15Min: 11, nightlifeIndex: 36, tourismIndex: 58 },
  },
  {
    id: 5,
    name: "Pašilaičiai",
    nameLt: "Pašilaičiai",
    city: "Vilnius",
    population: 33100,
    areaKm2: 4.4,
    lat: 54.7345,
    lng: 25.2229,
    overallScore: 7.9,
    description: "Affordable, practical, and service-rich district with good schools and calmer residential blocks.",
    descriptionLt: "Prieinamas ir praktiškas rajonas su paslaugomis, mokyklomis ir ramesniais kvartalais.",
    highlights: ["Good value for families", "Many daily services nearby", "Longer commute to Old Town"],
    highlightsLt: ["Gera vertė šeimoms", "Daug kasdienių paslaugų", "Ilgesnė kelionė į centrą"],
    scores: { safety: 8.1, family: 8.6, affordability: 8.8, environment: 7.2, transport: 7.0, tourism: 4.5, walkability: 7.1, overall: 7.9 },
    metrics: { housingPriceEurM2: 2150, rentEurMonth: 560, crimeIndex: 31, airQuality: 69, noiseDb: 55, lightPollution: 53, transitStops: 26, parksWithin15Min: 8, clinicsWithin15Min: 8, schoolsWithin15Min: 12, nightlifeIndex: 21, tourismIndex: 28 },
  },
  {
    id: 6,
    name: "Fabijoniškės",
    nameLt: "Fabijoniškės",
    city: "Vilnius",
    population: 36200,
    areaKm2: 4.1,
    lat: 54.7299,
    lng: 25.2413,
    overallScore: 7.6,
    description: "Balanced residential area with solid affordability, schools, and transit links into the city.",
    descriptionLt: "Subalansuotas gyvenamasis rajonas su prieinama kaina, mokyklomis ir transportu.",
    highlights: ["Affordable housing stock", "Good retail and schools", "Average environmental comfort"],
    highlightsLt: ["Prieinamas būstas", "Gera prekyba ir mokyklos", "Vidutinė aplinkos kokybė"],
    scores: { safety: 7.7, family: 8.1, affordability: 8.2, environment: 6.8, transport: 7.6, tourism: 4.2, walkability: 7.0, overall: 7.6 },
    metrics: { housingPriceEurM2: 2250, rentEurMonth: 580, crimeIndex: 36, airQuality: 66, noiseDb: 57, lightPollution: 55, transitStops: 29, parksWithin15Min: 7, clinicsWithin15Min: 6, schoolsWithin15Min: 10, nightlifeIndex: 18, tourismIndex: 24 },
  },
  {
    id: 7,
    name: "Lazdynai",
    nameLt: "Lazdynai",
    city: "Vilnius",
    population: 28500,
    areaKm2: 5.8,
    lat: 54.6767,
    lng: 25.2061,
    overallScore: 8.2,
    description: "Green, calm, and affordable enough for families who prioritize parks, air, and everyday services.",
    descriptionLt: "Žalias, ramus ir gana prieinamas rajonas šeimoms, vertinančioms parkus ir orą.",
    highlights: ["High green-space coverage", "Quiet residential blocks", "Strong family value"],
    highlightsLt: ["Daug žaliųjų plotų", "Ramios gyvenamosios zonos", "Gera vertė šeimoms"],
    scores: { safety: 8.4, family: 8.7, affordability: 7.9, environment: 9.0, transport: 7.2, tourism: 5.2, walkability: 7.4, overall: 8.2 },
    metrics: { housingPriceEurM2: 2350, rentEurMonth: 610, crimeIndex: 28, airQuality: 75, noiseDb: 50, lightPollution: 42, transitStops: 23, parksWithin15Min: 16, clinicsWithin15Min: 7, schoolsWithin15Min: 9, nightlifeIndex: 23, tourismIndex: 38 },
  },
  {
    id: 8,
    name: "Baltupiai",
    nameLt: "Baltupiai",
    city: "Vilnius",
    population: 18200,
    areaKm2: 3.2,
    lat: 54.7251,
    lng: 25.2727,
    overallScore: 8.3,
    description: "Compact and green with strong education access, good bus links, and lower noise than the center.",
    descriptionLt: "Kompaktiškas ir žalias rajonas su geru švietimo pasiekiamumu ir transportu.",
    highlights: ["Strong student and family fit", "Near campuses and green areas", "Good bus connectivity"],
    highlightsLt: ["Tinka studentams ir šeimoms", "Arti kampusų ir gamtos", "Geras autobusų ryšys"],
    scores: { safety: 8.2, family: 8.8, affordability: 7.0, environment: 8.6, transport: 7.9, tourism: 5.8, walkability: 7.7, overall: 8.3 },
    metrics: { housingPriceEurM2: 2600, rentEurMonth: 650, crimeIndex: 30, airQuality: 73, noiseDb: 53, lightPollution: 47, transitStops: 27, parksWithin15Min: 12, clinicsWithin15Min: 7, schoolsWithin15Min: 10, nightlifeIndex: 34, tourismIndex: 46 },
  },
  {
    id: 9,
    name: "Užupis",
    nameLt: "Užupis",
    city: "Vilnius",
    population: 7600,
    areaKm2: 0.9,
    lat: 54.6814,
    lng: 25.2974,
    overallScore: 8.5,
    description: "Creative, scenic, walkable, and tourist-friendly with boutique stays and strong cultural identity.",
    descriptionLt: "Kūrybiškas, vaizdingas ir pėsčiomis patogus rajonas su stipria kultūra.",
    highlights: ["Excellent for culture-led travel", "Walkable to Old Town", "Premium prices and weekend activity"],
    highlightsLt: ["Puiku kultūriniam turizmui", "Pėsčiomis iki centro", "Aukštesnės kainos"],
    scores: { safety: 8.1, family: 7.8, affordability: 5.0, environment: 8.1, transport: 8.2, tourism: 9.4, walkability: 9.3, overall: 8.5 },
    metrics: { housingPriceEurM2: 3850, rentEurMonth: 960, crimeIndex: 34, airQuality: 68, noiseDb: 59, lightPollution: 62, transitStops: 19, parksWithin15Min: 10, clinicsWithin15Min: 6, schoolsWithin15Min: 7, nightlifeIndex: 82, tourismIndex: 91 },
  },
  {
    id: 10,
    name: "Šnipiškės",
    nameLt: "Šnipiškės",
    city: "Vilnius",
    population: 21600,
    areaKm2: 3.1,
    lat: 54.7009,
    lng: 25.2806,
    overallScore: 8.1,
    description: "Fast-changing business and housing district with strong investor signals and excellent central access.",
    descriptionLt: "Sparčiai besikeičiantis verslo ir būsto rajonas su stipriais investiciniais signalais.",
    highlights: ["High development momentum", "Near CBD and river", "Construction and traffic noise in pockets"],
    highlightsLt: ["Stipri plėtra", "Arti verslo centro ir upės", "Vietomis statybų triukšmas"],
    scores: { safety: 7.5, family: 7.1, affordability: 5.8, environment: 6.7, transport: 8.9, tourism: 7.7, walkability: 8.4, overall: 8.1 },
    metrics: { housingPriceEurM2: 3450, rentEurMonth: 870, crimeIndex: 40, airQuality: 58, noiseDb: 65, lightPollution: 67, transitStops: 35, parksWithin15Min: 7, clinicsWithin15Min: 8, schoolsWithin15Min: 6, nightlifeIndex: 69, tourismIndex: 74 },
  },
  {
    id: 11,
    name: "Zaliakalnis",
    nameLt: "Zaliakalnis",
    city: "Kaunas",
    population: 22400,
    areaKm2: 5.4,
    lat: 54.9074,
    lng: 23.9242,
    overallScore: 8.6,
    description: "Kaunas heritage district with parks, universities, clinics, and strong liveability for families and students.",
    descriptionLt: "Kauno paveldo rajonas su parkais, universitetais, klinikomis ir gera gyvenimo kokybe.",
    highlights: ["Strong education and healthcare access", "Quiet streets and parks", "Good central reach"],
    highlightsLt: ["Geras švietimas ir sveikata", "Ramios gatvės ir parkai", "Patogus centras"],
    scores: { safety: 8.5, family: 8.9, affordability: 7.3, environment: 8.8, transport: 7.8, tourism: 6.7, walkability: 7.9, overall: 8.6 },
    metrics: { housingPriceEurM2: 2400, rentEurMonth: 570, crimeIndex: 29, airQuality: 72, noiseDb: 52, lightPollution: 44, transitStops: 22, parksWithin15Min: 13, clinicsWithin15Min: 10, schoolsWithin15Min: 11, nightlifeIndex: 41, tourismIndex: 55 },
  },
  {
    id: 12,
    name: "Kaunas Centras",
    nameLt: "Kauno centras",
    city: "Kaunas",
    population: 18100,
    areaKm2: 2.9,
    lat: 54.8984,
    lng: 23.9036,
    overallScore: 8.3,
    description: "Best Kaunas pick for tourists and students who want cafes, culture, transport, and walkable daily life.",
    descriptionLt: "Geriausias Kauno pasirinkimas turistams ir studentams, norintiems kultūros ir transporto.",
    highlights: ["Strong cafes and culture", "Walkable public services", "Higher noise near main streets"],
    highlightsLt: ["Stiprios kavinės ir kultūra", "Paslaugos pėsčiomis", "Daugiau triukšmo prie pagrindinių gatvių"],
    scores: { safety: 7.7, family: 7.4, affordability: 6.7, environment: 7.1, transport: 8.8, tourism: 8.7, walkability: 9.0, overall: 8.3 },
    metrics: { housingPriceEurM2: 2550, rentEurMonth: 620, crimeIndex: 39, airQuality: 61, noiseDb: 62, lightPollution: 63, transitStops: 34, parksWithin15Min: 8, clinicsWithin15Min: 9, schoolsWithin15Min: 7, nightlifeIndex: 79, tourismIndex: 86 },
  },
  {
    id: 13,
    name: "Klaipėda Senamiestis",
    nameLt: "Klaipėdos senamiestis",
    city: "Klaipėda",
    population: 9800,
    areaKm2: 1.5,
    lat: 55.7108,
    lng: 21.1337,
    overallScore: 8.0,
    description: "Compact port-city center with tourism, dining, hotels, and ferry access, strongest for visitors.",
    descriptionLt: "Kompaktiškas uostamiesčio centras su turizmu, maitinimu, viešbučiais ir keltais.",
    highlights: ["Best for coastal visitors", "Walkable old town grid", "Seasonal tourism demand"],
    highlightsLt: ["Geriausia pajūrio lankytojams", "Patogus senamiestis", "Sezoninė paklausa"],
    scores: { safety: 7.6, family: 7.0, affordability: 6.4, environment: 7.8, transport: 7.6, tourism: 8.9, walkability: 8.5, overall: 8.0 },
    metrics: { housingPriceEurM2: 2500, rentEurMonth: 650, crimeIndex: 41, airQuality: 70, noiseDb: 60, lightPollution: 59, transitStops: 21, parksWithin15Min: 7, clinicsWithin15Min: 6, schoolsWithin15Min: 6, nightlifeIndex: 76, tourismIndex: 90 },
  },
  {
    id: 14,
    name: "Pilaitė",
    nameLt: "Pilaitė",
    city: "Vilnius",
    population: 31500,
    areaKm2: 7.8,
    lat: 54.7095,
    lng: 25.1832,
    overallScore: 8.0,
    description: "Modern western district with lakes, newer housing, family services, and strong affordability for growing households.",
    descriptionLt: "Modernus vakarinis rajonas su ežerais, naujesniu būstu, šeimų paslaugomis ir gera kaina augančioms šeimoms.",
    highlights: ["Good value for newer homes", "Green edges and lakes nearby", "Commute depends on peak-hour traffic"],
    highlightsLt: ["Gera naujesnio būsto vertė", "Šalia žalios zonos ir ežerai", "Kelionė priklauso nuo spūsčių"],
    scores: { safety: 8.3, family: 8.8, affordability: 8.4, environment: 8.4, transport: 6.8, tourism: 4.4, walkability: 6.8, overall: 8.0 },
    metrics: { housingPriceEurM2: 2300, rentEurMonth: 610, crimeIndex: 29, airQuality: 74, noiseDb: 51, lightPollution: 43, transitStops: 21, parksWithin15Min: 12, clinicsWithin15Min: 5, schoolsWithin15Min: 10, nightlifeIndex: 18, tourismIndex: 31 },
  },
  {
    id: 15,
    name: "Justiniškės",
    nameLt: "Justiniškės",
    city: "Vilnius",
    population: 27600,
    areaKm2: 3.0,
    lat: 54.7178,
    lng: 25.2161,
    overallScore: 7.5,
    description: "Dense residential district with affordable apartments, practical services, schools, and good links to western Vilnius.",
    descriptionLt: "Tankus gyvenamasis rajonas su prieinamais butais, paslaugomis, mokyklomis ir patogiais ryšiais į vakarinį Vilnių.",
    highlights: ["Affordable apartment stock", "Daily services close by", "Less tourist and nightlife appeal"],
    highlightsLt: ["Prieinami butai", "Kasdienės paslaugos netoli", "Mažiau turizmo ir naktinio gyvenimo"],
    scores: { safety: 7.4, family: 8.0, affordability: 8.7, environment: 6.6, transport: 7.5, tourism: 3.8, walkability: 7.2, overall: 7.5 },
    metrics: { housingPriceEurM2: 2100, rentEurMonth: 540, crimeIndex: 38, airQuality: 65, noiseDb: 58, lightPollution: 55, transitStops: 27, parksWithin15Min: 6, clinicsWithin15Min: 6, schoolsWithin15Min: 9, nightlifeIndex: 16, tourismIndex: 22 },
  },
  {
    id: 16,
    name: "Karoliniškės",
    nameLt: "Karoliniškės",
    city: "Vilnius",
    population: 26900,
    areaKm2: 4.0,
    lat: 54.6883,
    lng: 25.2146,
    overallScore: 7.8,
    description: "Practical district next to wooded slopes and TV tower area, with solid transit and family affordability.",
    descriptionLt: "Praktiškas rajonas prie miškingų šlaitų ir televizijos bokšto, su geru transportu ir šeimoms prieinama kaina.",
    highlights: ["Green slopes and viewpoints", "Good trolleybus corridors", "Older housing stock"],
    highlightsLt: ["Žali šlaitai ir apžvalgos vietos", "Geri troleibusų koridoriai", "Senesnis būsto fondas"],
    scores: { safety: 7.8, family: 8.2, affordability: 8.1, environment: 8.0, transport: 7.8, tourism: 5.5, walkability: 7.3, overall: 7.8 },
    metrics: { housingPriceEurM2: 2200, rentEurMonth: 570, crimeIndex: 35, airQuality: 71, noiseDb: 54, lightPollution: 50, transitStops: 29, parksWithin15Min: 11, clinicsWithin15Min: 6, schoolsWithin15Min: 9, nightlifeIndex: 20, tourismIndex: 49 },
  },
  {
    id: 17,
    name: "Šeškinė",
    nameLt: "Šeškinė",
    city: "Vilnius",
    population: 34500,
    areaKm2: 4.6,
    lat: 54.7159,
    lng: 25.2559,
    overallScore: 7.9,
    description: "Well-connected northern district with shopping, clinics, sports venues, and a strong balance for commuters.",
    descriptionLt: "Gerai sujungtas šiaurinis rajonas su prekyba, klinikomis, sporto vietomis ir stipriu balansu kasdienėms kelionėms.",
    highlights: ["Strong transport and shopping access", "Good healthcare coverage", "Traffic and noise near main roads"],
    highlightsLt: ["Geras transportas ir prekyba", "Gera sveikatos paslaugų aprėptis", "Daugiau triukšmo prie magistralių"],
    scores: { safety: 7.6, family: 8.0, affordability: 7.5, environment: 6.9, transport: 8.4, tourism: 5.4, walkability: 7.8, overall: 7.9 },
    metrics: { housingPriceEurM2: 2450, rentEurMonth: 630, crimeIndex: 37, airQuality: 64, noiseDb: 61, lightPollution: 58, transitStops: 34, parksWithin15Min: 7, clinicsWithin15Min: 10, schoolsWithin15Min: 8, nightlifeIndex: 34, tourismIndex: 43 },
  },
  {
    id: 18,
    name: "Žirmūnai",
    nameLt: "Žirmūnai",
    city: "Vilnius",
    population: 44500,
    areaKm2: 5.7,
    lat: 54.7116,
    lng: 25.2973,
    overallScore: 8.2,
    description: "Large riverside district close to the center, with strong transit, schools, services, and growing rental demand.",
    descriptionLt: "Didelis paupio rajonas arti centro, su stipriu transportu, mokyklomis, paslaugomis ir augančia nuomos paklausa.",
    highlights: ["Fast access to city center", "River and recreation nearby", "Mixed old and renovated housing"],
    highlightsLt: ["Greitas pasiekimas iki centro", "Netoliese upė ir rekreacija", "Mišrus senesnis ir atnaujintas būstas"],
    scores: { safety: 7.9, family: 8.4, affordability: 6.9, environment: 7.9, transport: 8.9, tourism: 6.6, walkability: 8.2, overall: 8.2 },
    metrics: { housingPriceEurM2: 2750, rentEurMonth: 700, crimeIndex: 34, airQuality: 69, noiseDb: 56, lightPollution: 56, transitStops: 39, parksWithin15Min: 10, clinicsWithin15Min: 9, schoolsWithin15Min: 11, nightlifeIndex: 44, tourismIndex: 58 },
  },
  {
    id: 19,
    name: "Naujininkai",
    nameLt: "Naujininkai",
    city: "Vilnius",
    population: 30300,
    areaKm2: 4.8,
    lat: 54.6598,
    lng: 25.2815,
    overallScore: 7.3,
    description: "Affordable and strategically located near the station and airport corridors, with improvement potential and uneven street comfort.",
    descriptionLt: "Prieinamas ir strategiškai patogus rajonas šalia stoties bei oro uosto krypčių, turintis atsinaujinimo potencialą ir nevienodą gatvių komfortą.",
    highlights: ["Strong price-to-location ratio", "Good station and airport access", "Safety and noise vary by block"],
    highlightsLt: ["Geras kainos ir vietos santykis", "Patogu į stotį ir oro uostą", "Saugumas ir triukšmas skiriasi pagal kvartalą"],
    scores: { safety: 6.6, family: 6.9, affordability: 8.6, environment: 6.4, transport: 8.2, tourism: 5.8, walkability: 7.2, overall: 7.3 },
    metrics: { housingPriceEurM2: 2050, rentEurMonth: 540, crimeIndex: 48, airQuality: 59, noiseDb: 65, lightPollution: 61, transitStops: 32, parksWithin15Min: 6, clinicsWithin15Min: 6, schoolsWithin15Min: 8, nightlifeIndex: 31, tourismIndex: 45 },
  },
  {
    id: 20,
    name: "Viršuliškės",
    nameLt: "Viršuliškės",
    city: "Vilnius",
    population: 16700,
    areaKm2: 2.6,
    lat: 54.7079,
    lng: 25.2269,
    overallScore: 7.7,
    description: "Compact west-side district with good office access, shopping, and housing value between Karoliniškės and Šeškinė.",
    descriptionLt: "Kompaktiškas vakarinis rajonas su gera prieiga prie biurų, prekybos ir būsto verte tarp Karoliniškių bei Šeškinės.",
    highlights: ["Good west-side office access", "Balanced prices and services", "Less green than nearby districts"],
    highlightsLt: ["Patogu į vakarinės dalies biurus", "Subalansuotos kainos ir paslaugos", "Mažiau žalumos nei gretimuose rajonuose"],
    scores: { safety: 7.5, family: 7.7, affordability: 7.8, environment: 6.7, transport: 8.0, tourism: 4.9, walkability: 7.5, overall: 7.7 },
    metrics: { housingPriceEurM2: 2350, rentEurMonth: 610, crimeIndex: 36, airQuality: 65, noiseDb: 59, lightPollution: 56, transitStops: 30, parksWithin15Min: 6, clinicsWithin15Min: 7, schoolsWithin15Min: 8, nightlifeIndex: 28, tourismIndex: 35 },
  },
];

export const pois: PoiRecord[] = [
  { id: 1, name: "Cathedral Square", nameLt: "Katedros aikštė", category: "attraction", lat: 54.6858, lng: 25.2877, city: "Vilnius", description: "Main civic square and cultural landmark.", descriptionLt: "Pagrindinė miesto aikštė.", rating: 4.8, districtId: 1 },
  { id: 2, name: "MO Museum", nameLt: "MO muziejus", category: "attraction", lat: 54.6792, lng: 25.2743, city: "Vilnius", description: "Modern art museum near central nightlife and hotels.", descriptionLt: "Modernaus meno muziejus.", rating: 4.7, districtId: 2 },
  { id: 3, name: "Bernardine Garden", nameLt: "Bernardinų sodas", category: "park", lat: 54.6849, lng: 25.2972, city: "Vilnius", description: "Central green space for families and tourists.", descriptionLt: "Centrinis parkas šeimoms ir turistams.", rating: 4.8, districtId: 9 },
  { id: 4, name: "Lukiškės Square", nameLt: "Lukiškių aikštė", category: "park", lat: 54.6898, lng: 25.2701, city: "Vilnius", description: "Urban open space near offices and services.", descriptionLt: "Miesto aikštė prie paslaugų.", rating: 4.5, districtId: 2 },
  { id: 5, name: "Business Stadium Hub", nameLt: "Business Stadium", category: "restaurant", lat: 54.6966, lng: 25.2802, city: "Vilnius", description: "Restaurants and offices in the CBD growth area.", descriptionLt: "Restoranai ir biurai verslo rajone.", rating: 4.4, districtId: 10 },
  { id: 6, name: "Railway Station", nameLt: "Geležinkelio stotis", category: "transport", lat: 54.6706, lng: 25.2841, city: "Vilnius", description: "Regional rail and bus access.", descriptionLt: "Regioninis traukinių ir autobusų mazgas.", rating: 4.1, districtId: 2 },
  { id: 7, name: "Antakalnis Clinics", nameLt: "Antakalnio klinikos", category: "emergency", lat: 54.7221, lng: 25.3166, city: "Vilnius", description: "Major healthcare cluster.", descriptionLt: "Sveikatos paslaugų telkinys.", rating: 4.2, districtId: 4 },
  { id: 8, name: "Islandijos Street Nightlife", nameLt: "Islandijos gatvė", category: "nightlife", lat: 54.6848, lng: 25.2792, city: "Vilnius", description: "Bars and late-night dining.", descriptionLt: "Barai ir naktinis maitinimas.", rating: 4.5, districtId: 1 },
  { id: 9, name: "Žvėrynas River Walk", nameLt: "Žvėryno upės takas", category: "park", lat: 54.6924, lng: 25.2523, city: "Vilnius", description: "Quiet riverside route.", descriptionLt: "Ramus takas palei upę.", rating: 4.7, districtId: 3 },
  { id: 10, name: "Kaunas Liberty Avenue", nameLt: "Laisvės alėja", category: "attraction", lat: 54.8972, lng: 23.9123, city: "Kaunas", description: "Walkable main street with cafes and culture.", descriptionLt: "Pagrindinė pėsčiųjų gatvė.", rating: 4.8, districtId: 12 },
  { id: 11, name: "Kaunas Clinics", nameLt: "Kauno klinikos", category: "emergency", lat: 54.9184, lng: 23.9213, city: "Kaunas", description: "Major hospital campus.", descriptionLt: "Didelis ligonines miestelis.", rating: 4.3, districtId: 11 },
  { id: 12, name: "Klaipėda Theatre Square", nameLt: "Teatro aikštė", category: "attraction", lat: 55.7102, lng: 21.1344, city: "Klaipėda", description: "Old town tourism anchor.", descriptionLt: "Senamiesčio turizmo vieta.", rating: 4.7, districtId: 13 },
  { id: 13, name: "Klaipėda Old Port Hotel Cluster", nameLt: "Uosto viešbučiai", category: "hotel", lat: 55.7089, lng: 21.1299, city: "Klaipėda", description: "Hotels near ferries and old town.", descriptionLt: "Viešbučiai prie keltų ir senamiesčio.", rating: 4.4, districtId: 13 },
  { id: 14, name: "Užupis Cafe Row", nameLt: "Užupio kavinės", category: "restaurant", lat: 54.6818, lng: 25.2958, city: "Vilnius", description: "Small cafes and gallery stops.", descriptionLt: "Kavinės ir galerijos.", rating: 4.6, districtId: 9 },
  { id: 15, name: "Pašilaičiai Family Pharmacy", nameLt: "Pašilaičių vaistinė", category: "pharmacy", lat: 54.7344, lng: 25.2203, city: "Vilnius", description: "Daily healthcare service point.", descriptionLt: "Kasdienės sveikatos paslauga.", rating: 4.2, districtId: 5 },
  { id: 16, name: "Hotel PACAI", nameLt: "Viešbutis PACAI", category: "hotel", lat: 54.6809, lng: 25.2888, city: "Vilnius", description: "Premium old town hotel close to restaurants and museums.", descriptionLt: "Aukštos klasės senamiesčio viešbutis prie restoranų ir muziejų.", rating: 4.8, districtId: 1 },
  { id: 17, name: "Novotel Vilnius Centre", nameLt: "Novotel Vilnius Centre", category: "hotel", lat: 54.6878, lng: 25.2808, city: "Vilnius", description: "Central hotel with strong walkability and transit access.", descriptionLt: "Centrinis viešbutis su patogiu susisiekimu ir paslaugomis pėsčiomis.", rating: 4.5, districtId: 1 },
  { id: 18, name: "Comfort Hotel LT", nameLt: "Comfort Hotel LT", category: "hotel", lat: 54.6709, lng: 25.2788, city: "Vilnius", description: "Good-value hotel near station, nightlife, and Naujamiestis.", descriptionLt: "Geros vertės viešbutis prie stoties, naktinio gyvenimo ir Naujamiesčio.", rating: 4.6, districtId: 2 },
  { id: 19, name: "Hilton Garden Inn", nameLt: "Hilton Garden Inn", category: "hotel", lat: 54.6896, lng: 25.2666, city: "Vilnius", description: "Business-friendly hotel near offices, parks, and central services.", descriptionLt: "Verslui patogus viešbutis prie biurų, parkų ir centro paslaugų.", rating: 4.6, districtId: 2 },
  { id: 20, name: "Downtown Forest Hostel", nameLt: "Downtown Forest Hostel", category: "hotel", lat: 54.6781, lng: 25.3001, city: "Vilnius", description: "Budget stay near Užupis and old town culture.", descriptionLt: "Ekonomiška nakvynė šalia Užupio ir senamiesčio kultūros.", rating: 4.5, districtId: 9 },
  { id: 21, name: "Taste Map Coffee", nameLt: "Taste Map kava", category: "restaurant", lat: 54.6865, lng: 25.2744, city: "Vilnius", description: "Specialty coffee stop for work and city walks.", descriptionLt: "Specialty kavos vieta darbui ir pasivaikščiojimams.", rating: 4.7, districtId: 2 },
  { id: 22, name: "Crooked Nose Coffee", nameLt: "Crooked Nose kava", category: "restaurant", lat: 54.6894, lng: 25.2794, city: "Vilnius", description: "Small specialty cafe near central routes.", descriptionLt: "Maža specialty kavinė prie centrinių maršrutų.", rating: 4.8, districtId: 1 },
  { id: 23, name: "Paupio Market", nameLt: "Paupio turgus", category: "restaurant", lat: 54.6779, lng: 25.2999, city: "Vilnius", description: "Food hall with many cuisines, good for groups and tourists.", descriptionLt: "Maisto halė su įvairiomis virtuvėmis, tinkama grupėms ir turistams.", rating: 4.7, districtId: 9 },
  { id: 24, name: "Hales Market Food Hall", nameLt: "Halės turgus", category: "restaurant", lat: 54.6741, lng: 25.2865, city: "Vilnius", description: "Local market with cafes, food stalls, and station access.", descriptionLt: "Vietinis turgus su kavinėmis, maisto vietomis ir patogia stoties prieiga.", rating: 4.5, districtId: 2 },
  { id: 25, name: "Lukiškės Prison 2.0", nameLt: "Lukiškių kalėjimas 2.0", category: "attraction", lat: 54.6909, lng: 25.2638, city: "Vilnius", description: "Culture, concerts, food, and nightlife in a converted heritage site.", descriptionLt: "Kultūra, koncertai, maistas ir naktinis gyvenimas paveldo erdvėje.", rating: 4.7, districtId: 2 },
  { id: 26, name: "Opera and Ballet Theatre", nameLt: "Operos ir baleto teatras", category: "attraction", lat: 54.6899, lng: 25.2784, city: "Vilnius", description: "Major performing arts venue near hotels and restaurants.", descriptionLt: "Svarbi scenos menų vieta šalia viešbučių ir restoranų.", rating: 4.8, districtId: 1 },
  { id: 27, name: "Vingis Park", nameLt: "Vingio parkas", category: "park", lat: 54.6837, lng: 25.2350, city: "Vilnius", description: "Large urban park for running, concerts, and family time.", descriptionLt: "Didelis miesto parkas bėgimui, koncertams ir šeimoms.", rating: 4.8, districtId: 3 },
  { id: 28, name: "Ozas Shopping and Dining", nameLt: "Ozas prekyba ir maistas", category: "restaurant", lat: 54.7140, lng: 25.2760, city: "Vilnius", description: "Shopping, casual dining, and indoor services.", descriptionLt: "Prekyba, kasdienis maitinimas ir vidaus paslaugos.", rating: 4.4, districtId: 17 },
  { id: 29, name: "Akropolis Vilnius", nameLt: "Akropolis Vilnius", category: "restaurant", lat: 54.7106, lng: 25.2624, city: "Vilnius", description: "Large retail, food, and entertainment hub.", descriptionLt: "Didelis prekybos, maisto ir pramogų centras.", rating: 4.4, districtId: 17 },
  { id: 30, name: "Žirmūnai Riverside", nameLt: "Žirmūnų paupys", category: "park", lat: 54.7118, lng: 25.3037, city: "Vilnius", description: "Riverside walking and cycling route.", descriptionLt: "Paupys pėsčiųjų ir dviračių maršrutams.", rating: 4.6, districtId: 18 },
  { id: 31, name: "Šeškinė Clinic Cluster", nameLt: "Šeškinės klinikų zona", category: "emergency", lat: 54.7180, lng: 25.2504, city: "Vilnius", description: "Healthcare access point for northern districts.", descriptionLt: "Sveikatos paslaugų taškas šiauriniams rajonams.", rating: 4.1, districtId: 17 },
  { id: 32, name: "Pilaitė Lake Walk", nameLt: "Pilaitės ežerų takas", category: "park", lat: 54.7111, lng: 25.1765, city: "Vilnius", description: "Green and quiet lake-side walking area.", descriptionLt: "Žalia ir rami ežerų pasivaikščiojimų vieta.", rating: 4.6, districtId: 14 },
  { id: 33, name: "Pilaitė Cafe Corner", nameLt: "Pilaitės kavinės", category: "restaurant", lat: 54.7086, lng: 25.1865, city: "Vilnius", description: "Local cafes and casual food for families.", descriptionLt: "Vietinės kavinės ir kasdienis maistas šeimoms.", rating: 4.3, districtId: 14 },
  { id: 34, name: "Karoliniškės TV Tower", nameLt: "Vilniaus televizijos bokštas", category: "attraction", lat: 54.6872, lng: 25.2147, city: "Vilnius", description: "Observation point and landmark in western Vilnius.", descriptionLt: "Apžvalgos vieta ir vakarinio Vilniaus orientyras.", rating: 4.6, districtId: 16 },
  { id: 35, name: "Karoliniškės Forest Edge", nameLt: "Karoliniškių draustinio pakraštys", category: "park", lat: 54.6862, lng: 25.2035, city: "Vilnius", description: "Green slopes and trails close to residential blocks.", descriptionLt: "Žali šlaitai ir takai šalia gyvenamųjų kvartalų.", rating: 4.7, districtId: 16 },
  { id: 36, name: "Naujininkai Station Cafes", nameLt: "Naujininkų stoties kavinės", category: "restaurant", lat: 54.6674, lng: 25.2820, city: "Vilnius", description: "Affordable food and coffee near transport corridors.", descriptionLt: "Prieinamas maistas ir kava prie transporto koridorių.", rating: 4.1, districtId: 19 },
  { id: 37, name: "Viršuliškės Office Lunch", nameLt: "Viršuliškių pietūs", category: "restaurant", lat: 54.7074, lng: 25.2314, city: "Vilnius", description: "Lunch spots near offices and shopping.", descriptionLt: "Pietų vietos prie biurų ir prekybos.", rating: 4.2, districtId: 20 },
  { id: 38, name: "Justiniškės Local Services", nameLt: "Justiniškių paslaugos", category: "pharmacy", lat: 54.7185, lng: 25.2166, city: "Vilnius", description: "Everyday pharmacy and service cluster.", descriptionLt: "Kasdienių vaistinių ir paslaugų zona.", rating: 4.0, districtId: 15 },
  { id: 39, name: "Vilnius Airport", nameLt: "Vilniaus oro uostas", category: "transport", lat: 54.6341, lng: 25.2858, city: "Vilnius", description: "Main air travel gateway, useful for tourists and business trips.", descriptionLt: "Pagrindiniai oro vartai turistams ir verslo kelionėms.", rating: 4.2, districtId: 19 },
  { id: 40, name: "Green Hall Riverside Offices", nameLt: "Green Hall paupio biurai", category: "restaurant", lat: 54.7002, lng: 25.2612, city: "Vilnius", description: "Business lunch and office services near Žvėrynas.", descriptionLt: "Verslo pietūs ir biurų paslaugos prie Žvėryno.", rating: 4.3, districtId: 3 },
];

export const overlayMetadata: Record<string, { label: string; labelLt: string; unit: string | null; source: string }> = {
  air_quality: { label: "Air Quality", labelLt: "Oro kokybė", unit: "AQI", source: "Environmental Protection Agency / OpenAQ style feed" },
  crime: { label: "Crime Risk", labelLt: "Nusikalstamumo rizika", unit: "index", source: "Lithuanian Police public statistics" },
  transport: { label: "Public Transport Access", labelLt: "Viešojo transporto pasiekiamumas", unit: "stops", source: "GTFS and OpenStreetMap" },
  schools: { label: "Schools Nearby", labelLt: "Mokyklos netoliese", unit: "count", source: "Education registers and OpenStreetMap" },
  healthcare: { label: "Healthcare Access", labelLt: "Sveikatos pasiekiamumas", unit: "facilities", source: "Health facility registers and OpenStreetMap" },
  green_spaces: { label: "Green Space Access", labelLt: "Žalieji plotai", unit: "parks", source: "OpenStreetMap landuse and park polygons" },
  noise: { label: "Noise Levels", labelLt: "Triukšmo lygis", unit: "dB", source: "Municipal noise maps" },
  light_pollution: { label: "Light Pollution", labelLt: "Šviesos tarša", unit: "index", source: "Copernicus night light products" },
  walkability: { label: "Walkability", labelLt: "Pėsčiųjų pasiekiamumas", unit: "score", source: "OpenStreetMap street graph" },
  bike_paths: { label: "Bike Path Access", labelLt: "Dviračių takų pasiekiamumas", unit: "score", source: "OpenStreetMap cycling network" },
  housing_prices: { label: "Housing Prices", labelLt: "Būsto kainos", unit: "EUR/m2", source: "Registrų Centras market statistics" },
  pharmacies: { label: "Pharmacy Access", labelLt: "Vaistinių pasiekiamumas", unit: "count", source: "OpenStreetMap and business registers" },
};

const overlayMetricMap: Record<string, keyof CityDistrict["metrics"] | ScoreKey> = {
  air_quality: "airQuality",
  crime: "crimeIndex",
  transport: "transitStops",
  schools: "schoolsWithin15Min",
  healthcare: "clinicsWithin15Min",
  green_spaces: "parksWithin15Min",
  noise: "noiseDb",
  light_pollution: "lightPollution",
  walkability: "walkability",
  bike_paths: "walkability",
  housing_prices: "housingPriceEurM2",
  pharmacies: "clinicsWithin15Min",
};

export function listDistricts() {
  return districts.map(({ scores, highlights, highlightsLt, metrics, ...district }) => district);
}

export function getDistrict(id: number) {
  const d = districts.find((district) => district.id === id);
  if (!d) return null;
  return {
    ...d,
    scores: d.scores,
    highlights: d.highlights,
    highlightsLt: d.highlightsLt,
  };
}

export function compareDistricts(ids: number[]) {
  return ids.slice(0, 4).map(getDistrict).filter(Boolean);
}

export function listPois(city = "Vilnius", category?: string) {
  const normalized = normalizeText(city);
  return pois.filter((poi) => {
    const cityMatches = !city || normalized === "any" || normalizeText(poi.city) === normalized;
    const categoryMatches = !category || poi.category === category;
    return cityMatches && categoryMatches;
  });
}

export function getOverlay(type: string) {
  const meta = overlayMetadata[type];
  if (!meta) return null;
  const metric = overlayMetricMap[type];
  const features: OverlayFeature[] = districts.map((district) => {
    const metricValue =
      metric in district.metrics
        ? Number(district.metrics[metric as keyof CityDistrict["metrics"]])
        : Number(district.scores[metric as ScoreKey]);
    return {
      id: `${type}-${district.id}`,
      lat: district.lat,
      lng: district.lng,
      value: metricValue,
      label: `${district.name}: ${formatMetric(type, metricValue)}`,
      category: metricCategory(type, metricValue),
      city: district.city,
      districtId: district.id,
    };
  });

  return {
    type,
    features,
    metadata: {
      ...meta,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function platformSummary() {
  const cities = new Set(districts.map((d) => d.city));
  const topSafe = rankDistricts("safety", 1)[0]?.district.name ?? "N/A";
  const topFamily = rankDistricts("family", 1)[0]?.district.name ?? "N/A";
  const topAffordable = rankDistricts("affordability", 1)[0]?.district.name ?? "N/A";
  const topEnvironment = rankDistricts("environment", 1)[0]?.district.name ?? "N/A";
  const avgOverall = districts.reduce((sum, d) => sum + d.overallScore, 0) / districts.length;

  return {
    totalDistricts: districts.length,
    totalCities: cities.size,
    totalPois: pois.length,
    avgOverallScore: Math.round(avgOverall * 10) / 10,
    topSafeDistrict: topSafe,
    topFamilyDistrict: topFamily,
    topAffordableDistrict: topAffordable,
    topEnvironmentDistrict: topEnvironment,
    lastDataRefresh: new Date().toISOString(),
  };
}

export function rankDistricts(scoreType: string, limit = 5, city?: string) {
  const key = isScoreKey(scoreType) ? scoreType : "overall";
  const normalizedCity = city ? normalizeText(city) : undefined;
  return districts
    .filter((d) => !normalizedCity || normalizedCity === "any" || normalizeText(d.city) === normalizedCity)
    .map((district) => ({ district: listDistricts().find((d) => d.id === district.id)!, score: district.scores[key] ?? district.overallScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(limit, 20))
    .map((item, index) => ({ rank: index + 1, ...item, scoreType: key }));
}

export function bestMatch(priorities: string[], userType: UserMode = "resident", city?: string, language: "en" | "lt" = "en") {
  const weights = weightsFor(userType);
  for (const priority of priorities) {
    if (isScoreKey(priority)) weights[priority] = (weights[priority] ?? 0) + 2;
  }

  const normalizedCity = city ? normalizeText(city) : undefined;
  const ranked = districts
    .filter((d) => !normalizedCity || normalizedCity === "any" || normalizeText(d.city) === normalizedCity)
    .map((district) => {
      const score = weightedScore(district, weights);
      return { district, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const priorityText = priorities.length ? priorities.join(", ") : "balanced liveability";
  const reasoning = language === "lt"
    ? `Cadmea pasvėrė prioritetus (${priorityText}) ${profileLabel(userType, language)} profiliui ir palygino būsto kainas, viešąsias paslaugas, saugumą, aplinką, transportą bei pėsčiųjų pasiekiamumą. Geriausios vietos atrenkamos pagal gyvenimo būdo atitikimą, kartu paliekant aiškius kompromisus.`
    : `Cadmea weighted ${priorityText} for a ${userType} profile, then balanced the result against housing price, public services, safety, environment, transport, and walkability indicators. The top areas score best on the requested lifestyle fit while keeping tradeoffs visible.`;
  return {
    topDistricts: ranked.map(({ district }) => getDistrict(district.id)!),
    reasoning,
    language,
  };
}

export function answerUrbanQuestion(question: string, mode: UserMode = "resident", city?: string, language: "en" | "lt" = "en") {
  const inferredPriorities = inferPriorities(question, mode);
  const match = bestMatch(inferredPriorities, mode, city, language);
  const names = match.topDistricts.map((d) => districtName(d, language)).join(", ");
  const first = match.topDistricts[0];
  const second = match.topDistricts[1];

  const answer = first && second
    ? language === "lt"
      ? `${districtName(first, language)} yra stipriausias atitikmuo: ${explainDistrict(first.id, inferredPriorities, language)}. ${districtName(second, language)} yra artima alternatyva, jei svarbu ${secondaryAngle(second.id, inferredPriorities, language)}.`
      : `${first.name} is the strongest match, with ${explainDistrict(first.id, inferredPriorities, language)}. ${second.name} is a close alternative if you want ${secondaryAngle(second.id, inferredPriorities, language)}.`
    : language === "lt"
      ? "Nepavyko rasti pakankamai duomenų šiai užklausai."
      : "I could not find enough matching district data for that request.";

  const reasoning = language === "lt"
    ? `Aptikti prioritetai: ${inferredPriorities.map((priority) => scoreLabel(priority, language)).join(", ")}. Rekomenduojamos vietos: ${names}. Balai skaičiuojami iš viešųjų duomenų tipo rodiklių: saugumo, kainų, oro, triukšmo, žaliųjų erdvių, mokyklų, sveikatos paslaugų, transporto, pėsčiųjų pasiekiamumo, turizmo ir būsto kainų.`
    : `Detected priorities: ${inferredPriorities.join(", ")}. Recommended areas: ${names}. Scores are calculated from public-data style indicators covering safety, affordability, air, noise, green space, schools, healthcare, transport, walkability, tourism, and housing prices.`;

  return {
    answer,
    recommendedDistricts: match.topDistricts.map(({ scores, highlights, highlightsLt, metrics, ...district }) => district),
    reasoning,
    scores: match.topDistricts.map((district) => district.scores),
    recommendedPois: recommendPoisForQuestion(question, mode, city),
    dataSource: language === "lt"
      ? "Skaidrus viešųjų duomenų modelis: OpenStreetMap, Lietuvos atvirų duomenų portalai, Registrų Centras, aplinkos ir viešojo saugumo duomenys."
      : "Transparent public-data model: OpenStreetMap, Lithuanian open data portals, Registrų Centras market statistics, environmental and public-safety datasets.",
    language,
    citations: DATA_SOURCES.map((source) => ({ ...source, retrievedAt: new Date().toISOString() })),
    latencyMs: 40,
  };
}

export function recommendPoisForQuestion(question: string, mode: UserMode = "resident", city = "Vilnius") {
  const normalizedQuestion = normalizeText(question);
  const categories = new Set<PoiRecord["category"]>();

  if (/(tourist|visit|travel|trip|stay|hotel|airbnb|nightlife|bar|lank|turist|kelion|viešbut|viesbut|nakvyn|naktin|bar)/.test(normalizedQuestion) || mode === "tourist") {
    categories.add("hotel");
    categories.add("restaurant");
    categories.add("attraction");
    categories.add("nightlife");
    categories.add("transport");
  }
  if (/(cafe|coffee|restaurant|food|dining|kavin|restoran|maist|piet)/.test(normalizedQuestion)) categories.add("restaurant");
  if (/(child|kid|family|park|green|quiet|vaik|šeim|seim|park|žal|zal|ram)/.test(normalizedQuestion)) {
    categories.add("park");
    categories.add("restaurant");
    categories.add("pharmacy");
  }
  if (/(health|clinic|hospital|pharmacy|sveikat|klin|ligonin|vaistin)/.test(normalizedQuestion)) {
    categories.add("emergency");
    categories.add("pharmacy");
  }

  if (categories.size === 0) {
    categories.add("attraction");
    categories.add("restaurant");
    categories.add("hotel");
    categories.add("park");
  }

  const matchedDistrictIds = new Set(bestMatch(inferPriorities(question, mode), mode, city).topDistricts.map((district) => district.id));
  return listPois(city)
    .filter((poi) => categories.has(poi.category))
    .map((poi) => ({ poi, score: poi.rating + (matchedDistrictIds.has(poi.districtId) ? 1.25 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ poi }) => poi);
}

function inferPriorities(question: string, mode: UserMode): ScoreKey[] {
  const text = normalizeText(question);
  const priorities = new Set<ScoreKey>();
  const add = (key: ScoreKey) => priorities.add(key);

  if (/child|kid|family|school|kindergarten|safe to raise|vaik|šeim|seim|mokykl|daržel|darzel/.test(text)) {
    add("family");
    add("safety");
    add("environment");
  }
  if (/safe|crime|secure|danger|saug|nusikalst|pavoj/.test(text)) add("safety");
  if (/affordable|cheap|price|rent|budget|housing|buy|invest|pigu|kain|nuom|būst|bust|pirkt|invest/.test(text)) add("affordability");
  if (/quiet|noise|calm|peace|tyl|ram|triukšm|triuksm/.test(text)) {
    add("environment");
    add("safety");
  }
  if (/air|clean|pollution|green|park|nature|oras|švar|svar|tarš|tars|žal|zal|gamta/.test(text)) add("environment");
  if (/transport|bus|train|station|commute|metro|autobus|stot|kelion|susisiek/.test(text)) add("transport");
  if (/walk|walkable|nearby|15.?min|pėsč|pesc|arti|netoli/.test(text)) add("walkability");
  if (/tourist|visit|hotel|nightlife|bar|restaurant|airbnb|stay|turist|lank|viešbut|viesbut|nakvyn|naktin|kavin|restoran/.test(text)) {
    add("tourism");
    add("transport");
    add("walkability");
  }
  if (/student|university|campus|universitet|bendrab/.test(text)) {
    add("affordability");
    add("transport");
    add("walkability");
  }

  if (priorities.size === 0) {
    for (const key of Object.keys(weightsFor(mode)) as ScoreKey[]) {
      if (key !== "overall") add(key);
    }
  }
  return [...priorities].slice(0, 5);
}

function normalizeText(value = "") {
  return value
    .toLocaleLowerCase("lt-LT")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function weightsFor(mode: UserMode): Partial<Record<ScoreKey, number>> {
  const base: Partial<Record<ScoreKey, number>> = { overall: 1, safety: 1, affordability: 1, environment: 1, transport: 1, walkability: 1 };
  const presets: Record<string, Partial<Record<ScoreKey, number>>> = {
    family: { safety: 3, family: 4, environment: 2, affordability: 2, transport: 1 },
    resident: { safety: 2, family: 2, affordability: 2, environment: 2, transport: 2, walkability: 2 },
    professional: { transport: 3, walkability: 2, safety: 2, affordability: 1 },
    student: { affordability: 4, transport: 3, walkability: 2, tourism: 1 },
    investor: { affordability: 2, transport: 3, tourism: 2, walkability: 2, overall: 2 },
    tourist: { tourism: 4, walkability: 3, transport: 3, safety: 2 },
    retiree: { safety: 3, healthcare: 0, environment: 3, walkability: 2, family: 1 } as Partial<Record<ScoreKey, number>>,
    expat: { transport: 2, walkability: 3, tourism: 2, safety: 2, environment: 1 },
  };
  return { ...base, ...(presets[mode] ?? {}) };
}

function weightedScore(district: CityDistrict, weights: Partial<Record<ScoreKey, number>>) {
  let weighted = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(weights) as Array<[ScoreKey, number]>) {
    if (!weight) continue;
    weighted += (district.scores[key] ?? district.overallScore) * weight;
    totalWeight += weight;
  }
  const score = totalWeight > 0 ? weighted / totalWeight : district.overallScore;
  const pricePenalty = district.metrics.housingPriceEurM2 > 3600 ? 0.2 : 0;
  const noisePenalty = district.metrics.noiseDb > 63 ? 0.15 : 0;
  return score - pricePenalty - noisePenalty;
}

function explainDistrict(id: number, priorities: ScoreKey[], language: "en" | "lt" = "en") {
  const district = districts.find((d) => d.id === id);
  if (!district) return language === "lt" ? "stiprūs bendri balai" : "strong overall scores";
  const reasons = priorities.length
    ? priorities.slice(0, 3).map((priority) => `${scoreLabel(priority, language)} ${district.scores[priority].toFixed(1)}`)
    : [`${scoreLabel("overall", language)} ${district.overallScore.toFixed(1)}`];
  return reasons.join(", ");
}

function secondaryAngle(id: number, priorities: ScoreKey[], language: "en" | "lt" = "en") {
  const district = districts.find((d) => d.id === id);
  if (!district) return language === "lt" ? "subalansuota alternatyva" : "a balanced alternative";
  const best = priorities
    .map((priority) => ({ priority, score: district.scores[priority] }))
    .sort((a, b) => b.score - a.score)[0];
  if (!best) return language === "lt" ? "subalansuota alternatyva" : "a balanced alternative";
  return language === "lt"
    ? `stiprus rodiklis "${scoreLabel(best.priority, language)}" (${best.score.toFixed(1)})`
    : `strong ${best.priority} (${best.score.toFixed(1)})`;
}

function districtName(district: Pick<CityDistrict, "name" | "nameLt">, language: "en" | "lt") {
  return language === "lt" ? district.nameLt || district.name : district.name;
}

function scoreLabel(key: ScoreKey, language: "en" | "lt") {
  const labelsLt: Record<ScoreKey, string> = {
    safety: "saugumas",
    family: "šeimos patogumas",
    affordability: "prieinamumas",
    environment: "aplinka",
    transport: "transportas",
    tourism: "turizmas",
    walkability: "pėsčiųjų pasiekiamumas",
    overall: "bendras balas",
  };
  return language === "lt" ? labelsLt[key] : key;
}

function profileLabel(mode: UserMode, language: "en" | "lt") {
  if (language !== "lt") return mode;
  const labels: Record<UserMode, string> = {
    resident: "gyventojo",
    tourist: "turisto",
    student: "studento",
    investor: "investuotojo",
    family: "šeimos",
    professional: "profesionalo",
    retiree: "senjoro",
    expat: "atvykusio gyventojo",
  };
  return labels[mode] ?? mode;
}

function isScoreKey(key: string): key is ScoreKey {
  return ["safety", "family", "affordability", "environment", "transport", "tourism", "walkability", "overall"].includes(key);
}

function formatMetric(type: string, value: number) {
  const unit = overlayMetadata[type]?.unit;
  if (type === "housing_prices") return `EUR ${Math.round(value).toLocaleString("en-US")}/m2`;
  if (unit) return `${Math.round(value * 10) / 10} ${unit}`;
  return `${Math.round(value * 10) / 10}`;
}

function metricCategory(type: string, value: number) {
  if (["crime", "noise", "light_pollution", "housing_prices"].includes(type)) {
    if (value >= 65 || (type === "housing_prices" && value >= 3500)) return "high";
    if (value >= 45 || (type === "housing_prices" && value >= 2600)) return "medium";
    return "low";
  }
  if (value >= 75 || (["transport", "green_spaces", "schools", "healthcare"].includes(type) && value >= 10)) return "excellent";
  if (value >= 55 || (["transport", "green_spaces", "schools", "healthcare"].includes(type) && value >= 6)) return "good";
  return "limited";
}
