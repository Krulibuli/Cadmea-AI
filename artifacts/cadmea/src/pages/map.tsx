import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  District,
  GetTopDistrictsScoreType,
  Poi,
  getGetDistrictQueryKey,
  getGetOverlayDataQueryKey,
  useAiUrbanQuery,
  useGetDistrict,
  useGetOverlayData,
  useGetPlatformSummary,
  useGetTopDistricts,
  useListDistricts,
  useListPois,
} from "@workspace/api-client-react";
import {
  Activity,
  Baby,
  Bot,
  BriefcaseBusiness,
  Bus,
  CheckCircle2,
  CircleDollarSign,
  GraduationCap,
  HeartPulse,
  Home,
  Hotel,
  Layers,
  Leaf,
  LocateFixed,
  LucideIcon,
  MapPin,
  Moon,
  Route,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  SunMedium,
  Trees,
  Users,
  Volume2,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MapView } from "@/components/map/map-view";
import { AiSidebar } from "@/components/chat/ai-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreCard } from "@/components/districts/score-card";
import { useI18n } from "@/lib/i18n";

type OverlayType =
  | "air_quality"
  | "crime"
  | "transport"
  | "schools"
  | "healthcare"
  | "green_spaces"
  | "noise"
  | "light_pollution"
  | "walkability"
  | "bike_paths"
  | "housing_prices"
  | "pharmacies";

type Persona = "resident" | "family" | "student" | "investor" | "tourist";
type Lang = "en" | "lt";
type MobilePanel = "ask" | "results" | "places";
type CityFilter = "Vilnius" | "Kaunas" | "Klaipėda" | "all";

interface LocalizedText {
  en: string;
  lt: string;
}

interface PersonaConfig {
  id: Persona;
  label: LocalizedText;
  icon: LucideIcon;
  query: LocalizedText;
  scoreType: GetTopDistrictsScoreType;
}

interface OverlayConfig {
  id: OverlayType;
  label: LocalizedText;
  icon: LucideIcon;
  tone: string;
}

const personas: PersonaConfig[] = [
  {
    id: "resident",
    label: { en: "Resident", lt: "Gyventojas" },
    icon: Home,
    query: {
      en: "Find balanced neighborhoods with safety, transport, parks, and fair housing prices.",
      lt: "Rask subalansuotus rajonus su saugumu, transportu, parkais ir teisingomis būsto kainomis.",
    },
    scoreType: GetTopDistrictsScoreType.overall,
  },
  {
    id: "family",
    label: { en: "Family", lt: "Šeima" },
    icon: Baby,
    query: {
      en: "Where is the best place to live with a child, good schools, safety, clean air, and parks?",
      lt: "Kur geriausia gyventi su vaiku, kad būtų mokyklos, saugumas, švarus oras ir parkai?",
    },
    scoreType: GetTopDistrictsScoreType.family,
  },
  {
    id: "student",
    label: { en: "Student", lt: "Studentas" },
    icon: GraduationCap,
    query: {
      en: "Which areas are affordable for students with public transport and walkable services?",
      lt: "Kur studentams nebrangu gyventi, patogu viešasis transportas ir paslaugos pėsčiomis?",
    },
    scoreType: GetTopDistrictsScoreType.affordability,
  },
  {
    id: "investor",
    label: { en: "Investor", lt: "Investuotojas" },
    icon: BriefcaseBusiness,
    query: {
      en: "Which neighborhoods have strong rental demand, growth, transport, and reasonable prices?",
      lt: "Kurie rajonai turi stiprią nuomos paklausą, augimą, transportą ir protingas kainas?",
    },
    scoreType: GetTopDistrictsScoreType.transport,
  },
  {
    id: "tourist",
    label: { en: "Tourist", lt: "Turistas" },
    icon: Hotel,
    query: {
      en: "Where should tourists stay with nightlife, transport, dining, and walkable attractions?",
      lt: "Kur turistams apsistoti, kad būtų naktinis gyvenimas, transportas, maistas ir lankytinos vietos pėsčiomis?",
    },
    scoreType: GetTopDistrictsScoreType.tourism,
  },
];

const overlays: OverlayConfig[] = [
  { id: "housing_prices", label: { en: "Housing", lt: "Būstas" }, icon: CircleDollarSign, tone: "text-amber-500" },
  { id: "air_quality", label: { en: "Air", lt: "Oras" }, icon: Wind, tone: "text-cyan-500" },
  { id: "noise", label: { en: "Noise", lt: "Triukšmas" }, icon: Volume2, tone: "text-rose-500" },
  { id: "crime", label: { en: "Safety", lt: "Saugumas" }, icon: ShieldAlert, tone: "text-red-500" },
  { id: "transport", label: { en: "Transit", lt: "Transportas" }, icon: Bus, tone: "text-blue-500" },
  { id: "green_spaces", label: { en: "Parks", lt: "Parkai" }, icon: Leaf, tone: "text-emerald-500" },
  { id: "schools", label: { en: "Schools", lt: "Mokyklos" }, icon: GraduationCap, tone: "text-violet-500" },
  { id: "healthcare", label: { en: "Health", lt: "Sveikata" }, icon: HeartPulse, tone: "text-teal-500" },
  { id: "walkability", label: { en: "Walk", lt: "Pėsčiomis" }, icon: Route, tone: "text-pink-500" },
  { id: "bike_paths", label: { en: "Bike", lt: "Dviračiai" }, icon: Activity, tone: "text-lime-500" },
  { id: "light_pollution", label: { en: "Light", lt: "Šviesa" }, icon: Moon, tone: "text-indigo-500" },
  { id: "pharmacies", label: { en: "Pharmacy", lt: "Vaistinės" }, icon: CheckCircle2, tone: "text-green-500" },
];

const exampleQueries: LocalizedText[] = [
  { en: "Where is the best place to live with a child?", lt: "Kur geriausia gyventi su vaiku?" },
  { en: "Which neighborhoods are safest and affordable?", lt: "Kurie rajonai saugiausi ir prieinami pagal kainą?" },
  { en: "Where should tourists stay with good nightlife and transport?", lt: "Kur turistams apsistoti su geru naktiniu gyvenimu ir transportu?" },
  { en: "Find quiet areas with clean air and parks nearby.", lt: "Rask ramius rajonus su švariu oru ir parkais netoliese." },
];

const mapCopy = {
  en: {
    badge: "AI city intelligence",
    title: "Lithuania Live Map",
    placeholder: "Ask about safety, hotels, cafes, schools, parks, prices...",
    ask: "Ask",
    analyzing: "Analyzing",
    profile: "Lifestyle profile",
    overlays: "Public data overlays",
    pois: "POIs",
    dataModel: "Transparent data model",
    dataNote: "Sources include OpenStreetMap, Lithuanian open data, Registrų Centras market statistics, environmental indicators, police statistics, and GTFS-style transport data.",
    districts: "Districts",
    cities: "Cities",
    places: "Places",
    layerAvg: "Layer avg",
    bestMatches: "Best matches",
    rankingText: "ranking with active public-data layer.",
    aiRecommendation: "AI recommendation",
    fallbackNotice: "AI narrative was unavailable, but the public-data ranking is still live.",
    suggestedPlaces: "Suggested places",
    suggestedText: "Based on your prompt, profile, and top-ranked neighborhoods.",
    noPlaces: "Turn POIs on to show cafes, restaurants, hotels, parks, and services.",
    liveOverlays: "Live public-data overlays",
    sourceModel: "Transparent source model",
    fitMap: "Fit view",
    cityScope: "Search area",
    lithuaniaOnly: "Lithuania-only map",
    allLithuania: "All Lithuania",
    askTab: "Ask",
    resultsTab: "Results",
    placesTab: "Places",
    topMatch: "Top match",
    activeLayer: "Layer",
    viewResults: "View results",
    safety: "Safety",
    family: "Family",
    transit: "Transit",
    nature: "Nature",
    match: "match",
  },
  lt: {
    badge: "AI miesto įžvalgos",
    title: "Lietuvos gyvas žemėlapis",
    placeholder: "Klausk apie saugumą, viešbučius, kavines, mokyklas, parkus, kainas...",
    ask: "Klausti",
    analyzing: "Analizuoja",
    profile: "Gyvenimo būdo profilis",
    overlays: "Viešųjų duomenų sluoksniai",
    pois: "Vietos",
    dataModel: "Skaidrus duomenų modelis",
    dataNote: "Šaltiniai: OpenStreetMap, Lietuvos atviri duomenys, Registrų Centras, aplinkos rodikliai, policijos statistika ir GTFS tipo transporto duomenys.",
    districts: "Rajonai",
    cities: "Miestai",
    places: "Vietos",
    layerAvg: "Sluoksnio vid.",
    bestMatches: "Geriausi atitikimai",
    rankingText: "reitingas su aktyviu viešųjų duomenų sluoksniu.",
    aiRecommendation: "AI rekomendacija",
    fallbackNotice: "AI tekstas nepasiekiamas, bet viešųjų duomenų reitingas vis tiek veikia.",
    suggestedPlaces: "Siūlomos vietos",
    suggestedText: "Pagal tavo užklausą, profilį ir geriausius rajonus.",
    noPlaces: "Įjunk vietas, kad matytum kavines, restoranus, viešbučius, parkus ir paslaugas.",
    liveOverlays: "Gyvi viešųjų duomenų sluoksniai",
    sourceModel: "Skaidrus šaltinių modelis",
    fitMap: "Rodyti pasirinktą vietą",
    cityScope: "Paieškos vieta",
    lithuaniaOnly: "Žemėlapis tik Lietuvoje",
    allLithuania: "Visa Lietuva",
    askTab: "Klausti",
    resultsTab: "Rezultatai",
    placesTab: "Vietos",
    topMatch: "Geriausia",
    activeLayer: "Sluoksnis",
    viewResults: "Rezultatai",
    safety: "Saugumas",
    family: "Šeima",
    transit: "Transportas",
    nature: "Gamta",
    match: "atitikimas",
  },
} satisfies Record<Lang, Record<string, string>>;

const lowerIsBetter = new Set<OverlayType>(["crime", "noise", "light_pollution", "housing_prices"]);
const cityOptions: CityFilter[] = ["Vilnius", "Kaunas", "Klaipėda", "all"];
const cityCenters: Record<CityFilter, { center: [number, number]; zoom: number }> = {
  Vilnius: { center: [54.7008, 25.2606], zoom: 11 },
  Kaunas: { center: [54.8985, 23.9036], zoom: 12 },
  Klaipėda: { center: [55.7108, 21.1337], zoom: 13 },
  all: { center: [55.1694, 23.8813], zoom: 7 },
};

export default function MapPage() {
  const { language } = useI18n();
  const lang = language === "lt" ? "lt" : "en";
  const copy = mapCopy[lang];
  const [persona, setPersona] = useState<Persona>("resident");
  const [activeDistrictId, setActiveDistrictId] = useState<number | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>("housing_prices");
  const [query, setQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [showPois, setShowPois] = useState(true);
  const [cityFilter, setCityFilter] = useState<CityFilter>("Vilnius");
  const [mapCenter, setMapCenter] = useState<[number, number]>([54.7008, 25.2606]);
  const [mapZoom, setMapZoom] = useState(11);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("ask");
  const [focusedPoiId, setFocusedPoiId] = useState<number | null>(null);

  const activePersona = personas.find((item) => item.id === persona) ?? personas[0];
  const { data: districts = [] } = useListDistricts();
  const { data: summary } = useGetPlatformSummary();
  const { data: topDistricts } = useGetTopDistricts({ scoreType: activePersona.scoreType, limit: 20 });
  const { data: poiData = [] } = useListPois({ city: cityFilter === "all" ? "any" : cityFilter });
  const { data: activeDistrict } = useGetDistrict(activeDistrictId ?? 0, {
    query: { enabled: !!activeDistrictId, queryKey: getGetDistrictQueryKey(activeDistrictId ?? 0) },
  });
  const { data: overlayData } = useGetOverlayData(activeOverlay, {
    query: { enabled: !!activeOverlay, queryKey: getGetOverlayDataQueryKey(activeOverlay) },
  });
  const aiQuery = useAiUrbanQuery();
  const visibleDistricts = useMemo(
    () => districts.filter((district) => cityFilter === "all" || normalizeForSearch(district.city) === normalizeForSearch(cityFilter)),
    [cityFilter, districts],
  );
  const visibleDistrictIds = useMemo(() => new Set(visibleDistricts.map((district) => district.id)), [visibleDistricts]);
  const visibleOverlayData = useMemo(() => {
    if (!overlayData) return undefined;
    if (cityFilter === "all") return overlayData;
    const normalizedCity = normalizeForSearch(cityFilter);
    return {
      ...overlayData,
      features: overlayData.features.filter((feature) => {
        const featureCity = typeof feature.city === "string" ? normalizeForSearch(feature.city) : "";
        if (featureCity) return featureCity === normalizedCity;
        return typeof feature.districtId === "number" && visibleDistrictIds.has(feature.districtId);
      }),
    };
  }, [cityFilter, overlayData, visibleDistrictIds]);

  useEffect(() => {
    const view = cityCenters[cityFilter];
    setActiveDistrictId(null);
    setFocusedPoiId(null);
    setMapCenter(view.center);
    setMapZoom(view.zoom);
  }, [cityFilter]);

  const recommendationRows = useMemo(() => {
    const sourceDistricts = visibleDistricts.length ? visibleDistricts : (topDistricts ?? []).map((item) => item.district);
    const topScores = new Map((topDistricts ?? []).map((item) => [item.district.id, item.score ?? item.district.overallScore]));
    const features = visibleOverlayData?.features?.filter((feature) => typeof feature.value === "number") ?? [];
    const featureByDistrict = new Map(features.map((feature) => [feature.districtId ?? -1, feature]));
    const values = features.map((feature) => Number(feature.value));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 10;
    const range = Math.max(0.01, max - min);

    return sourceDistricts
      .map((district) => {
        const personaScore = topScores.get(district.id) ?? district.overallScore ?? 0;
        const feature = featureByDistrict.get(district.id);
        const rawValue = typeof feature?.value === "number" ? Number(feature.value) : null;
        const normalized = rawValue === null ? 0.5 : (rawValue - min) / range;
        const overlayScore = rawValue === null
          ? 6
          : lowerIsBetter.has(activeOverlay)
            ? (1 - normalized) * 10
            : normalized * 10;
        const matchScore = activeOverlay ? personaScore * 0.62 + overlayScore * 0.38 : personaScore;

        return {
          district,
          matchScore: clamp(matchScore, 0, 10),
          personaScore: clamp(personaScore, 0, 10),
          overlayScore: clamp(overlayScore, 0, 10),
          overlayValue: rawValue,
          overlayCategory: feature?.category ?? null,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 7);
  }, [activeOverlay, topDistricts, visibleDistricts, visibleOverlayData]);

  const overlayStats = useMemo(() => {
    const values = visibleOverlayData?.features?.map((feature) => Number(feature.value)).filter(Number.isFinite) ?? [];
    if (!values.length) return null;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      min: Math.min(...values),
      average,
      max: Math.max(...values),
    };
  }, [visibleOverlayData]);

  const suggestedPois = useMemo(() => {
    const aiPois = (aiQuery.data as { recommendedPois?: Poi[] } | undefined)?.recommendedPois;
    if (aiPois?.length) return aiPois.slice(0, 8);

    const searchText = normalizeForSearch(`${query || text(activePersona.query, lang)} ${persona}`);
    const categories = new Set<string>();
    if (/tourist|turist|hotel|viesbut|nakvyn|night|nakt|bar|stay|lank/.test(searchText) || persona === "tourist") {
      ["hotel", "restaurant", "attraction", "nightlife", "transport"].forEach((category) => categories.add(category));
    }
    if (/cafe|coffee|kavin|restaurant|restoran|food|maist|piet/.test(searchText)) categories.add("restaurant");
    if (/child|kid|family|vaik|seim|park|green|zal|quiet|tyl|ram/.test(searchText) || persona === "family") {
      ["park", "restaurant", "pharmacy"].forEach((category) => categories.add(category));
    }
    if (/health|clinic|hospital|pharmacy|sveikat|klin|ligonin|vaistin/.test(searchText)) {
      ["emergency", "pharmacy"].forEach((category) => categories.add(category));
    }
    if (!categories.size) ["attraction", "restaurant", "hotel", "park"].forEach((category) => categories.add(category));

    const topDistrictIds = new Set(recommendationRows.slice(0, 5).map((row) => row.district.id));
    return poiData
      .filter((poi) => categories.has(poi.category))
      .map((poi) => ({
        poi,
        score: (poi.rating ?? 4) + (poi.districtId && topDistrictIds.has(poi.districtId) ? 1.25 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ poi }) => poi);
  }, [activePersona, aiQuery.data, lang, persona, poiData, query, recommendationRows]);

  const selectedOverlay = overlays.find((overlay) => overlay.id === activeOverlay);
  const selectedOverlayLabel = lang === "lt"
    ? visibleOverlayData?.metadata.labelLt ?? text(selectedOverlay?.label, lang)
    : visibleOverlayData?.metadata.label ?? text(selectedOverlay?.label, lang);
  const selectedName = activeDistrict ? getDistrictName(activeDistrict, lang) : null;
  const activeScores = activeDistrict?.scores ?? (activeDistrict ? {
    districtId: activeDistrict.id,
    safety: activeDistrict.overallScore,
    family: activeDistrict.overallScore,
    affordability: activeDistrict.overallScore,
    environment: activeDistrict.overallScore,
    transport: activeDistrict.overallScore,
    tourism: activeDistrict.overallScore,
    walkability: activeDistrict.overallScore,
    overall: activeDistrict.overallScore,
  } : null);

  const askAi = (e?: FormEvent, preset?: string) => {
    e?.preventDefault();
    const question = (preset ?? query).trim() || text(activePersona.query, lang);
    const mode = (persona === "family" ? "resident" : persona) as "resident" | "tourist" | "student" | "investor";
    setQuery(question);
    setMobilePanel("results");
    aiQuery.mutate({ data: { question, language: lang, mode, city: cityFilter === "all" ? "any" : cityFilter } });
  };

  const handleDistrictClick = (id: number) => {
    setActiveDistrictId(id);
    setFocusedPoiId(null);
    setMobilePanel("results");
    const district = districts.find((item) => item.id === id) ?? recommendationRows.find((item) => item.district.id === id)?.district;
    if (district) {
      setMapCenter([district.lat, district.lng]);
      setMapZoom((zoom) => Math.max(zoom, 13));
    }
  };

  const handlePoiClick = (poi: Poi) => {
    setFocusedPoiId(poi.id);
    setMapCenter([poi.lat, poi.lng]);
    setMapZoom((zoom) => Math.max(zoom, 15));
    if (poi.districtId) setActiveDistrictId(poi.districtId);
    setMobilePanel("places");
  };

  const resetVilniusView = () => {
    setFocusedPoiId(null);
    const view = cityCenters[cityFilter];
    setMapCenter(view.center);
    setMapZoom(view.zoom);
  };

  const topRecommendation = recommendationRows[0]?.district;
  const askPanelClass = mobilePanel === "ask" ? "block" : "hidden lg:block";
  const resultsPanelClass = mobilePanel === "results" || mobilePanel === "places" ? "block" : "hidden lg:block";
  const resultsOnlyClass = mobilePanel === "places" ? "hidden lg:block" : "";
  const placesOnlyClass = mobilePanel === "results" ? "hidden lg:block" : "";

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-y-auto bg-slate-950 text-slate-950 lg:overflow-hidden">
      <div className="relative z-0 h-[46vh] min-h-[340px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0">
        <MapView
          districts={visibleDistricts}
          pois={showPois ? poiData : []}
          activeDistrictId={activeDistrictId ?? undefined}
          activePoiId={focusedPoiId ?? undefined}
          onDistrictClick={handleDistrictClick}
          onPoiClick={handlePoiClick}
          overlayData={visibleOverlayData}
          center={mapCenter}
          zoom={mapZoom}
        />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 lg:hidden">
          <div className="rounded-xl border border-white/15 bg-slate-950/85 p-3 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase text-cyan-200">{copy.topMatch}</div>
                <div className="truncate text-sm font-black">{topRecommendation ? getDistrictName(topRecommendation, lang) : copy.bestMatches}</div>
              </div>
              <button
                type="button"
                onClick={() => setMobilePanel("results")}
                className="pointer-events-auto shrink-0 rounded-md bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950"
              >
                {copy.viewResults}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-300">
              <span className="truncate">{cityLabel(cityFilter, lang)} · {copy.activeLayer}: {selectedOverlayLabel}</span>
              <span className="shrink-0">{suggestedPois.length} {copy.places.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100 lg:hidden">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          <MobileTab active={mobilePanel === "ask"} label={copy.askTab} icon={Search} onClick={() => setMobilePanel("ask")} />
          <MobileTab active={mobilePanel === "results"} label={copy.resultsTab} icon={Sparkles} onClick={() => setMobilePanel("results")} />
          <MobileTab active={mobilePanel === "places"} label={copy.placesTab} icon={MapPin} onClick={() => setMobilePanel("places")} />
        </div>
      </div>

      <div className="pointer-events-none relative z-20 grid w-full grid-cols-1 gap-3 p-3 lg:grid-cols-[380px_1fr_360px] lg:p-5">
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className={`pointer-events-auto overflow-hidden rounded-xl border border-white/20 bg-white/94 shadow-2xl backdrop-blur-xl dark:bg-slate-950/90 dark:text-slate-100 lg:max-h-[calc(100vh-7rem)] ${askPanelClass}`}
        >
          <ScrollArea className="max-h-[72vh] lg:h-full lg:max-h-none">
            <div className="space-y-5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="mb-2 gap-1 rounded-md bg-cyan-500/12 text-cyan-700 dark:text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    {copy.badge}
                  </Badge>
                  <h1 className="text-2xl font-black tracking-tight">{copy.title}</h1>
                </div>
                <Button size="icon" className="rounded-md" onClick={() => setChatOpen(true)} data-testid="btn-open-ai-panel" aria-label={copy.aiRecommendation}>
                  <Bot className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {copy.cityScope}
                  </div>
                  <Badge variant="outline" className="rounded-md text-[10px]">{copy.lithuaniaOnly}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cityOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={cityFilter === option ? "default" : "outline"}
                      className="h-10 justify-start rounded-md text-xs"
                      onClick={() => setCityFilter(option)}
                    >
                      {cityLabel(option, lang)}
                    </Button>
                  ))}
                </div>
              </div>

              <form onSubmit={askAi} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={copy.placeholder}
                    className="h-12 rounded-lg border-slate-200 bg-white pl-9 pr-28 shadow-none dark:border-slate-800 dark:bg-slate-900"
                    data-testid="input-map-ai-query"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1.5 top-1.5 h-9 rounded-md px-3"
                    disabled={aiQuery.isPending}
                    data-testid="btn-map-ai-query"
                  >
                    {aiQuery.isPending ? copy.analyzing : copy.ask}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {exampleQueries.map((example) => {
                    const label = text(example, lang);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => askAi(undefined, label)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </form>

              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  {copy.profile}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {personas.map((item) => {
                    const Icon = item.icon;
                    const selected = persona === item.id;
                    return (
                      <Button
                        key={item.id}
                        variant={selected ? "default" : "outline"}
                        className="h-10 justify-start rounded-md text-xs"
                        onClick={() => setPersona(item.id)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {text(item.label, lang)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    <Layers className="h-3.5 w-3.5" />
                    {copy.overlays}
                  </div>
                  <Button variant={showPois ? "secondary" : "outline"} size="sm" className="h-7 rounded-md text-xs" onClick={() => setShowPois((value) => !value)}>
                    {copy.pois}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {overlays.map((overlay) => {
                    const Icon = overlay.icon;
                    const selected = activeOverlay === overlay.id;
                    return (
                      <button
                        key={overlay.id}
                        type="button"
                        onClick={() => setActiveOverlay(overlay.id)}
                        className={`min-h-14 rounded-lg border px-2 py-2 text-left transition ${
                          selected
                            ? "border-cyan-300 bg-cyan-50 shadow-sm dark:border-cyan-700 dark:bg-cyan-950/50"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <Icon className={`mb-1 h-4 w-4 ${overlay.tone}`} />
                        <span className="block text-[11px] font-semibold leading-tight">{text(overlay.label, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <SlidersHorizontal className="h-4 w-4 text-cyan-500" />
                  {copy.dataModel}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <TrustMetric label={copy.districts} value={visibleDistricts.length || summary?.totalDistricts || districts.length} />
                  <TrustMetric label={copy.cities} value={cityFilter === "all" ? summary?.totalCities ?? 3 : 1} />
                  <TrustMetric label={copy.places} value={poiData.length || summary?.totalPois || 0} />
                  <TrustMetric label={copy.layerAvg} value={overlayStats ? formatOverlayValue(activeOverlay, overlayStats.average, visibleOverlayData?.metadata.unit) : "N/A"} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{copy.dataNote}</p>
              </div>
            </div>
          </ScrollArea>
        </motion.aside>

        <div className="pointer-events-none hidden lg:block" />

        <motion.aside
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          className={`pointer-events-auto overflow-hidden rounded-xl border border-white/20 bg-white/94 shadow-2xl backdrop-blur-xl dark:bg-slate-950/90 dark:text-slate-100 lg:max-h-[calc(100vh-7rem)] ${resultsPanelClass}`}
        >
          <ScrollArea className="max-h-[78vh] lg:h-full lg:max-h-none">
            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="mb-2 gap-1 rounded-md">
                    {selectedOverlay && <selectedOverlay.icon className={`h-3.5 w-3.5 ${selectedOverlay.tone}`} />}
                    {selectedOverlayLabel}
                  </Badge>
                  <h2 className="text-xl font-black">{copy.bestMatches}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {text(activePersona.label, lang)} {copy.rankingText}
                  </p>
                </div>
                <Button variant="outline" size="icon" className="rounded-md" onClick={resetVilniusView} title={copy.fitMap} aria-label={copy.fitMap}>
                  <LocateFixed className="h-4 w-4" />
                </Button>
              </div>

              {aiQuery.data && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-950/40">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-800 dark:text-cyan-200">
                    <Bot className="h-4 w-4" />
                    {copy.aiRecommendation}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{aiQuery.data.answer}</p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{aiQuery.data.reasoning}</p>
                </motion.div>
              )}

              {aiQuery.isError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
                  {copy.fallbackNotice}
                </div>
              )}

              <div className={`space-y-3 ${resultsOnlyClass}`}>
                {recommendationRows.map((row, index) => (
                  <button
                    key={row.district.id}
                    type="button"
                    onClick={() => handleDistrictClick(row.district.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      activeDistrictId === row.district.id
                        ? "border-cyan-400 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/40"
                        : "border-slate-200 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                            {index + 1}
                          </span>
                          <span className="truncate font-bold">{getDistrictName(row.district, lang)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {row.district.city}
                        </div>
                      </div>
                      <div className="rounded-md bg-emerald-500 px-2 py-1 text-sm font-black text-white">{row.matchScore.toFixed(1)}</div>
                    </div>
                    <Progress value={row.matchScore * 10} className="mt-3 h-2" />
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
                      <span>{copy.match}: {row.personaScore.toFixed(1)}</span>
                      <span>{formatOverlayValue(activeOverlay, row.overlayValue, visibleOverlayData?.metadata.unit)}</span>
                    </div>
                    {row.district.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {getDistrictDescription(row.district, lang)}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className={`rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 ${placesOnlyClass}`}>
                <div className="mb-1 flex items-center gap-2 text-sm font-black">
                  <MapPin className="h-4 w-4 text-cyan-500" />
                  {copy.suggestedPlaces}
                </div>
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{showPois ? copy.suggestedText : copy.noPlaces}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {(showPois ? suggestedPois : []).map((poi) => (
                    <button
                      key={poi.id}
                      type="button"
                      onClick={() => handlePoiClick(poi)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-cyan-950/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 text-xs font-bold">{getPoiName(poi, lang)}</span>
                        {poi.rating && <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-black dark:bg-slate-900">{poi.rating.toFixed(1)}</span>}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold capitalize text-slate-500">{categoryLabel(poi.category, lang)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {activeDistrict && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-black">{selectedName}</h3>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setActiveDistrictId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScoreCard district={activeDistrict} scores={activeScores ?? undefined} className="border-0 shadow-none" />
                    {activeScores && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <MiniScore label={copy.safety} value={activeScores.safety} icon={ShieldAlert} />
                        <MiniScore label={copy.family} value={activeScores.family} icon={Baby} />
                        <MiniScore label={copy.transit} value={activeScores.transport} icon={Bus} />
                        <MiniScore label={copy.nature} value={activeScores.environment} icon={Trees} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </motion.aside>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 rounded-xl border border-white/20 bg-slate-950/80 px-4 py-3 text-white shadow-2xl backdrop-blur-xl lg:block">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-2"><SunMedium className="h-4 w-4 text-cyan-300" /> {copy.liveOverlays}</span>
          <span className="h-4 w-px bg-white/20" />
          <span>{visibleOverlayData?.metadata.source ?? copy.sourceModel}</span>
        </div>
      </div>

      <AiSidebar
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        contextParams={activeDistrict ? { districtId: activeDistrict.id, city: activeDistrict.city, mode: persona } : { city: cityFilter === "all" ? "any" : cityFilter, mode: persona }}
      />
    </div>
  );
}

function text(value: LocalizedText | undefined, language: Lang) {
  if (!value) return "";
  return value[language] || value.en;
}

function getDistrictName(district: Pick<District, "name" | "nameLt">, language: Lang) {
  return language === "lt" ? district.nameLt || district.name : district.name;
}

function getDistrictDescription(district: Pick<District, "description" | "descriptionLt">, language: Lang) {
  return language === "lt" ? district.descriptionLt || district.description : district.description;
}

function getPoiName(poi: Poi, language: Lang) {
  return language === "lt" ? poi.nameLt || poi.name : poi.name;
}

function categoryLabel(category: string, language: Lang) {
  const labels: Record<string, LocalizedText> = {
    attraction: { en: "attraction", lt: "lankytina vieta" },
    restaurant: { en: "cafe / restaurant", lt: "kavinė / restoranas" },
    hotel: { en: "hotel", lt: "viešbutis" },
    nightlife: { en: "nightlife", lt: "naktinis gyvenimas" },
    transport: { en: "transport", lt: "transportas" },
    emergency: { en: "healthcare", lt: "sveikata" },
    pharmacy: { en: "pharmacy", lt: "vaistinė" },
    park: { en: "park", lt: "parkas" },
  };
  return text(labels[category], language) || category;
}

function cityLabel(city: CityFilter, language: Lang) {
  if (city === "all") return language === "lt" ? "Visa Lietuva" : "All Lithuania";
  return city;
}

function formatOverlayValue(type: OverlayType, value?: number | null, unit?: string | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  if (type === "housing_prices") return `€${Math.round(value).toLocaleString("en-US")}/m²`;
  if (!unit) return `${Math.round(value * 10) / 10}`;
  return `${Math.round(value * 10) / 10} ${unit}`;
}

function normalizeForSearch(value: string) {
  return value.toLocaleLowerCase("lt-LT").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TrustMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-2 dark:bg-slate-950">
      <div className="break-words text-lg font-black">{value}</div>
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
    </div>
  );
}

function MobileTab({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-xs font-black transition ${
        active
          ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function MiniScore({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 font-semibold text-slate-500"><Icon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{label}</span></span>
        <span className="font-black">{value.toFixed(1)}</span>
      </div>
      <Progress value={value * 10} className="h-1.5" />
    </div>
  );
}
