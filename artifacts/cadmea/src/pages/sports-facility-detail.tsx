import { useRoute, Link } from "wouter";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import {
  ArrowLeft, MapPin, Activity, Wallet, Users, Zap, Wrench,
  Gauge, Lightbulb, Shield, Scan,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import {
  useSportsFacility, useRecommendations,
  FACILITY_TYPE_LABEL, DISCIPLINE_LABEL, formatEur, formatInt,
} from "@/lib/sports-api";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function AutomationBar({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          {label}
        </span>
        <span className="font-bold text-foreground">{value}/100</span>
      </div>
      <Progress value={value} className="h-1.5 mt-1" />
    </div>
  );
}

export default function SportsFacilityDetail() {
  const { t, language } = useI18n();
  const [, params] = useRoute<{ id: string }>("/sports/facility/:id");
  const id = params?.id;
  const facility = useSportsFacility(id);
  const recs = useRecommendations();
  const facRecs = (recs.data ?? []).filter((r) => r.facilityId === id);

  if (facility.isLoading) {
    return <div className="container mx-auto px-4 py-10 text-muted-foreground">Loading…</div>;
  }
  if (facility.isError || !facility.data) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-lg font-bold">Facility not found.</p>
        <Link href="/sports/map"><Button variant="outline" className="mt-3">Back to map</Button></Link>
      </div>
    );
  }
  const f = facility.data;

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Link href="/sports/map">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {language === "lt" ? "Atgal į žemėlapį" : "Back to map"}
          </Button>
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {FACILITY_TYPE_LABEL[f.type]}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">{f.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {f.address} · {f.district}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={f.status === "operational" ? "secondary" : "outline"}>
              {t(`status.${f.status}`)}
            </Badge>
            {(f.source === "managed" || f.source === "managed_planned") && (
              <Badge className="bg-primary text-primary-foreground">{language === "lt" ? "Miesto valdomas" : "City-managed"}</Badge>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4">
          <Stat label={t("kpi.utilization")} value={`${f.utilization}%`} sub={`${language === "lt" ? "savaitinis" : "weekly avg"}`} />
          <Stat label={language === "lt" ? "Talpa" : "Capacity"} value={formatInt(f.capacity)} />
          <Stat label={t("kpi.visits")} value={formatInt(f.annualVisits)} />
          <Stat label={t("kpi.opsCost")} value={formatEur(f.annualOpsCostEur)} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                {language === "lt" ? "Automatizavimo brandos rodikliai" : "Automation maturity scores"}
              </h2>
              <div className="space-y-3">
                <AutomationBar icon={Zap} label={language === "lt" ? "Energija" : "Energy"} value={f.automation.energy} />
                <AutomationBar icon={Lightbulb} label={language === "lt" ? "Apšvietimas" : "Lighting"} value={f.automation.lighting} />
                <AutomationBar icon={Shield} label={language === "lt" ? "Saugumas" : "Security"} value={f.automation.security} />
                <AutomationBar icon={Scan} label={language === "lt" ? "Savitarna" : "Self-service"} value={f.automation.selfService} />
                <AutomationBar icon={Gauge} label={language === "lt" ? "Nuotolinis valdymas" : "Remote mgmt."} value={f.automation.remoteManagement} />
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "lt" ? "Bendras balas" : "Overall"}
                </span>
                <span className="text-2xl font-extrabold text-primary">{f.automation.overall}/100</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3">
                {language === "lt" ? "Eksploataciniai rodikliai" : "Operational metrics"}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />{language === "lt" ? "Energija" : "Energy"}</span>
                  <span className="font-bold text-foreground">{f.energyIntensity} kWh/m²</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" />{language === "lt" ? "Remonto poreikis" : "Maintenance"}</span>
                  <span className="font-bold text-foreground">{f.maintenanceBacklog}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" />{language === "lt" ? "Kaina / aps." : "Cost/visit"}</span>
                  <span className="font-bold text-foreground">
                    {f.annualVisits > 0 ? `€${(f.annualOpsCostEur / f.annualVisits).toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{language === "lt" ? "Talpa" : "Capacity"}</span>
                  <span className="font-bold text-foreground">{formatInt(f.capacity)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t("label.disciplines")}</p>
                <div className="flex flex-wrap gap-1">
                  {f.disciplines.map((d) => (
                    <Badge key={d} variant="outline" className="text-[10px]">{DISCIPLINE_LABEL[d]}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 overflow-hidden">
            <div className="h-72">
              <MapContainer center={[f.lat, f.lng]} zoom={15} className="h-full w-full" key={f.id}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <CircleMarker center={[f.lat, f.lng]} radius={12} pathOptions={{ color: "#C8102E", fillColor: "#C8102E", fillOpacity: 0.7, weight: 3 }} />
              </MapContainer>
            </div>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3">
                {language === "lt" ? "Rekomendacijos" : "Recommendations"}
              </h2>
              {facRecs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{language === "lt" ? "Šis objektas veikia gerai." : "This facility is performing well."}</p>
              ) : (
                <div className="space-y-3">
                  {facRecs.map((r) => (
                    <div key={r.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">
                          {t(`label.priority.${r.priority}`)}
                        </Badge>
                        {r.estimatedSavingsEur ? (
                          <span className="text-primary font-bold">{formatEur(r.estimatedSavingsEur)}/yr</span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 font-bold text-foreground">{r.title}</p>
                      <p className="mt-1 text-muted-foreground">{r.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="mt-4 text-xs text-muted-foreground italic">{t("label.estimate")}.</p>
      </div>
    </div>
  );
}
