import { useEffect, useState } from "react";
import { useListPois, useListDistricts, ListPoisCategory, Poi } from "@workspace/api-client-react";
import { MapView } from "@/components/map/map-view";
import { Button } from "@/components/ui/button";
import { Compass, Camera, Utensils, Bed, Music, TreePine } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export default function TouristPage() {
  const { language } = useI18n();
  const isLt = language === "lt";
  const [activeCategory, setActiveCategory] = useState<ListPoisCategory | null>(null);
  const [city, setCity] = useState("Vilnius");
  const [selectedPoiId, setSelectedPoiId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([54.6872, 25.2797]);
  const [mapZoom, setMapZoom] = useState(12);
  
  const { data: pois } = useListPois({ city, category: activeCategory || undefined });
  const { data: districts } = useListDistricts();
  
  const cityCenter: [number, number] = city === "Vilnius" ? [54.6872, 25.2797] :
                                      city === "Kaunas" ? [54.8985, 23.9036] :
                                      [55.7108, 21.1337];
  const visibleDistricts = districts?.filter((district) => normalizeCity(district.city) === normalizeCity(city));

  useEffect(() => {
    setMapCenter(cityCenter);
    setMapZoom(city === "Vilnius" ? 12 : 13);
    setSelectedPoiId(null);
  }, [city]);

  const focusPoi = (poi: Poi) => {
    setSelectedPoiId(poi.id);
    setMapCenter([poi.lat, poi.lng]);
    setMapZoom(15);
  };

  const categories = [
    { id: "attraction", label: isLt ? "Lankytinos vietos" : "Attractions", icon: Camera },
    { id: "restaurant", label: isLt ? "Kavinės ir maistas" : "Dining", icon: Utensils },
    { id: "nightlife", label: isLt ? "Naktinis gyvenimas" : "Nightlife", icon: Music },
    { id: "hotel", label: isLt ? "Viešbučiai" : "Hotels", icon: Bed },
    { id: "park", label: isLt ? "Parkai" : "Parks", icon: TreePine },
  ] as const;
  const cityOptions = ["Vilnius", "Kaunas", "Klaipėda"];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-auto lg:flex-row lg:overflow-hidden">
      <div className="z-10 flex w-full flex-col border-r bg-card shadow-xl lg:w-[360px] lg:max-h-[calc(100vh-4rem)]">
        <div className="p-6 border-b">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 mb-4 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> {isLt ? "Turisto režimas" : "Tourist Mode"}
          </div>
          <h1 className="text-2xl font-bold mb-4">{isLt ? "Atrask" : "Discover"} {city}</h1>
          
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            {cityOptions.map(c => (
              <Button 
                key={c}
                variant={city === c ? "default" : "ghost"}
                size="sm"
                className={`flex-1 rounded-md text-xs h-8 ${city === c ? 'shadow-sm' : ''}`}
                onClick={() => setCity(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
        
        <ScrollArea className="max-h-[42vh] flex-1 p-4 lg:max-h-none">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{isLt ? "Kategorijos" : "Categories"}</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={activeCategory === null ? "default" : "outline"} 
                className="justify-start text-xs h-9"
                onClick={() => setActiveCategory(null)}
              >
                <Compass className="w-3.5 h-3.5 mr-2" /> {isLt ? "Viskas" : "All"}
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"} 
                  className="justify-start text-xs h-9"
                  onClick={() => setActiveCategory(cat.id as ListPoisCategory)}
                >
                  <cat.icon className="w-3.5 h-3.5 mr-2" /> {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {pois?.length || 0} {isLt ? "vietų rasta" : "places found"}
            </h3>
            {pois?.slice(0, 50).map(poi => (
              <Card
                key={poi.id}
                className={`p-3 shadow-sm transition-shadow cursor-pointer hover:shadow-md ${
                  selectedPoiId === poi.id ? "border-cyan-400 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/30" : ""
                }`}
                onClick={() => focusPoi(poi)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm line-clamp-1">{isLt ? poi.nameLt || poi.name : poi.name}</h4>
                  {poi.rating && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-2 shrink-0">★ {poi.rating}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {categoryLabel(poi.category, isLt)}
                </div>
              </Card>
            ))}
            {pois?.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                {isLt ? "Šioje kategorijoje vietų nerasta." : "No places found in this category."}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="relative min-h-[52vh] flex-1 lg:min-h-0">
        <MapView 
          pois={pois}
          districts={visibleDistricts}
          activePoiId={selectedPoiId ?? undefined}
          onPoiClick={focusPoi}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
    </div>
  );
}

function categoryLabel(category: string, isLt: boolean) {
  if (!isLt) return category;
  const labels: Record<string, string> = {
    attraction: "lankytina vieta",
    restaurant: "kavinė / restoranas",
    nightlife: "naktinis gyvenimas",
    hotel: "viešbutis",
    park: "parkas",
    transport: "transportas",
    emergency: "sveikata",
    pharmacy: "vaistinė",
  };
  return labels[category] ?? category;
}

function normalizeCity(value: string) {
  return value.toLocaleLowerCase("lt-LT").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
