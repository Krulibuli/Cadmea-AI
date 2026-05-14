import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Search, Filter, MapPin, ListIcon, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import {
  useSportsFacilities, useSportsMeta,
  FACILITY_TYPE_LABEL, DISCIPLINE_LABEL, AGE_GROUP_LABEL,
  type FacilityType, type Discipline, type AgeGroup,
} from "@/lib/sports-api";

const TYPE_COLOR: Record<string, string> = {
  swimming_pool: "#0EA5E9",
  stadium: "#16A34A",
  arena: "#C8102E",
  air_dome: "#F59E0B",
  athletics: "#A855F7",
  rowing: "#06B6D4",
  palace_of_sports: "#DC2626",
  sports_centre: "#1F6F8B",
  park: "#22C55E",
  playground: "#EAB308",
  fitness_centre: "#8B5CF6",
  ice_rink: "#0284C7",
  tennis: "#EA580C",
  pitch: "#15803D",
};

export default function SportsMap() {
  const { t, language } = useI18n();
  const [district, setDistrict] = useState<string>("__all");
  const [type, setType] = useState<string>("__all");
  const [discipline, setDiscipline] = useState<string>("__all");
  const [ageGroup, setAgeGroup] = useState<string>("__all");
  const [q, setQ] = useState("");

  const meta = useSportsMeta();
  const facilities = useSportsFacilities({
    district: district === "__all" ? undefined : district,
    type: type === "__all" ? undefined : type,
    discipline: discipline === "__all" ? undefined : discipline,
    ageGroup: ageGroup === "__all" ? undefined : ageGroup,
    q: q || undefined,
  });

  const list = facilities.data ?? [];
  const center = useMemo<[number, number]>(() => {
    if (list.length === 0) return [54.687, 25.279];
    const lat = list.reduce((s, f) => s + f.lat, 0) / list.length;
    const lng = list.reduce((s, f) => s + f.lng, 0) / list.length;
    return [lat, lng];
  }, [list]);

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {t("nav.sports.facilities")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === "lt"
              ? "Visi miesto valdomi sporto objektai, parkai ir žaidimo aikštelės viename žemėlapyje."
              : "All city-managed sports facilities, parks and playgrounds in one map."}
          </p>
        </div>

        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="grid gap-2 md:grid-cols-12">
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("filter.search")}
                  className="pl-9"
                />
              </div>
              <div className="md:col-span-2">
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger><SelectValue placeholder={t("filter.allDistricts")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">{t("filter.allDistricts")}</SelectItem>
                    {(meta.data?.districts ?? []).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder={t("filter.allTypes")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">{t("filter.allTypes")}</SelectItem>
                    {(meta.data?.facilityTypes ?? []).map((tp) => (
                      <SelectItem key={tp} value={tp}>{FACILITY_TYPE_LABEL[tp as FacilityType]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger><SelectValue placeholder={t("filter.allDisciplines")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">{t("filter.allDisciplines")}</SelectItem>
                    {(meta.data?.disciplines ?? []).map((d) => (
                      <SelectItem key={d} value={d}>{DISCIPLINE_LABEL[d as Discipline]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger><SelectValue placeholder={t("filter.allAgeGroups")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">{t("filter.allAgeGroups")}</SelectItem>
                    {(meta.data?.ageGroups ?? ["kids","children","teens","adults","seniors"]).map((a) => (
                      <SelectItem key={a} value={a}>{AGE_GROUP_LABEL[a as AgeGroup][language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="h-[60vh] min-h-[420px]">
              <MapContainer center={center} zoom={11} className="h-full w-full" key={`${center[0]}-${center[1]}`}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {list.map((f) => (
                  <CircleMarker
                    key={f.id}
                    center={[f.lat, f.lng]}
                    radius={f.source === "managed" || f.source === "managed_planned" ? 9 : 6}
                    pathOptions={{
                      color: TYPE_COLOR[f.type] ?? "#1F6F8B",
                      fillColor: TYPE_COLOR[f.type] ?? "#1F6F8B",
                      fillOpacity: f.status === "operational" ? 0.75 : 0.35,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase text-primary">{FACILITY_TYPE_LABEL[f.type]}</p>
                        <p className="font-extrabold text-sm leading-tight">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.district} · {f.address}</p>
                        <Link
                          href={`/sports/facility/${f.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1"
                        >
                          {t("label.viewDetail")} <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="border-b border-border p-3 flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <ListIcon className="w-4 h-4" />
                  {language === "lt" ? "Sąrašas" : "Results"}
                </h3>
                <Badge variant="secondary">{list.length}</Badge>
              </div>
              <div className="max-h-[60vh] min-h-[420px] overflow-y-auto divide-y divide-border">
                {list.map((f) => (
                  <Link key={f.id} href={`/sports/facility/${f.id}`}>
                    <div className="p-3 hover:bg-muted/60 cursor-pointer">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TYPE_COLOR[f.type] }}>
                            {FACILITY_TYPE_LABEL[f.type]}
                          </p>
                          <p className="text-sm font-bold text-foreground line-clamp-2">{f.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {f.district}
                          </p>
                        </div>
                        {f.status === "operational" ? (
                          <Badge variant="secondary" className="text-[10px]">{f.utilization}%</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">{t(`status.${f.status}`)}</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {list.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {language === "lt" ? "Nėra rezultatų." : "No results."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
