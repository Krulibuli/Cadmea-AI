import { useState } from "react";
import { Circle, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Flame, Info, Map as MapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DISCIPLINE_LABEL,
  useSportsHeatmap,
  useSportsMeta,
  type Discipline,
  type SportsHeatmapCell,
} from "@/lib/sports-api";

const VILNIUS_CENTER: [number, number] = [54.6872, 25.2797];
const FOCUS_DISCIPLINES: Discipline[] = [
  "basketball",
  "football",
  "swimming",
  "tennis",
  "fitness",
  "athletics",
  "running",
  "cycling",
  "outdoor",
  "play",
];

function scoreColor(value: number) {
  if (value >= 78) return "#dc2626";
  if (value >= 62) return "#eab308";
  if (value >= 42) return "#0ea5e9";
  return "#16a34a";
}

function needLabel(value: number) {
  if (value >= 78) return "Kritinis";
  if (value >= 62) return "Aukštas";
  if (value >= 42) return "Vidutinis";
  return "Žemas";
}

function radiusForCell(cell: SportsHeatmapCell) {
  return 420 + cell.needScore * 18;
}

export default function SportsHeatmapPage() {
  const [discipline, setDiscipline] = useState("__all");
  const heatmap = useSportsHeatmap(discipline);
  const meta = useSportsMeta();
  const cells = heatmap.data?.cells ?? [];
  const topCells = cells.slice(0, 6);
  const disciplineOptions = [
    ...FOCUS_DISCIPLINES,
    ...(meta.data?.disciplines ?? []).filter((item) => !FOCUS_DISCIPLINES.includes(item)),
  ];

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary font-semibold">
              <Flame className="mr-1.5 h-3 w-3" />
              Administratoriams
            </Badge>
            <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">Sporto šakų heatmapai</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Rajonų poreikio žemėlapiai pagal sporto šaką. Skaičiavimas remiasi Active Vilnius Demand Radar / Strava proxy poreikio signalu, infrastruktūros aprėptimi, objektų tankiu ir užimtumu.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Sporto šaka" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Visos sporto šakos</SelectItem>
                {disciplineOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {DISCIPLINE_LABEL[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden">
            <div className="relative h-[68vh] min-h-[520px]">
              <MapContainer center={VILNIUS_CENTER} zoom={11} className="h-full w-full" scrollWheelZoom>
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {cells.map((cell) => {
                  const color = scoreColor(cell.needScore);
                  return (
                    <Circle
                      key={`${cell.district}-${cell.discipline}-${cell.needScore}`}
                      center={[cell.lat, cell.lng]}
                      radius={radiusForCell(cell)}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.22,
                        opacity: 0.85,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="max-w-[260px] space-y-1">
                          <p className="font-extrabold">{cell.district}</p>
                          <p className="text-xs font-semibold" style={{ color }}>
                            {needLabel(cell.needScore)} poreikis: {cell.needScore}/100
                          </p>
                          <p className="text-xs text-slate-600">{cell.recommendedAction}</p>
                          <p className="text-xs text-slate-600">Atitinkantys objektai: {cell.matchingFacilities}</p>
                        </div>
                      </Popup>
                    </Circle>
                  );
                })}
              </MapContainer>
              <div className="absolute bottom-3 left-3 z-[500] rounded-md border border-border bg-card/95 p-2 text-[11px] shadow-lg backdrop-blur">
                <div className="mb-1 font-bold text-foreground">Poreikio indeksas</div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Žemas", color: "#16a34a" },
                    { label: "Vid.", color: "#0ea5e9" },
                    { label: "Aukštas", color: "#eab308" },
                    { label: "Kritinis", color: "#dc2626" },
                  ].map((item) => (
                    <span key={item.label} className="flex items-center gap-1 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <aside className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-foreground">
                  <MapIcon className="h-4 w-4 text-primary" />
                  Prioritetiniai rajonai
                </h2>
                <div className="space-y-2">
                  {topCells.map((cell) => (
                    <div key={`${cell.district}-rank`} className="rounded-md border border-border bg-muted/25 p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-foreground">{cell.district}</span>
                        <Badge variant="outline" className="text-[10px]" style={{ borderColor: scoreColor(cell.needScore), color: scoreColor(cell.needScore) }}>
                          {cell.needScore}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{cell.recommendedAction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-foreground">
                  <Info className="h-4 w-4 text-primary" />
                  Metodika
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {heatmap.data?.methodology ?? "Need score = demand signal + coverage gap + density penalty + utilization/recommendation boost."}
                </p>
                {heatmap.data?.generatedAt && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Sugeneruota: {new Date(heatmap.data.generatedAt).toLocaleString("lt-LT")}
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
