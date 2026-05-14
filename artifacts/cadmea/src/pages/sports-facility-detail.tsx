import React from "react";
import { useRoute, Link } from "wouter";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import {
  ArrowLeft, MapPin, Activity, Wallet, Users, Zap, Wrench,
  Gauge, Lightbulb, Shield, Scan, ExternalLink, Navigation, Calendar,
  Accessibility as AccessibilityIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import {
  useSportsFacility, useRecommendations, useFacilityOccupancy,
  FACILITY_TYPE_LABEL, DISCIPLINE_LABEL, AGE_GROUP_LABEL, ACCESSIBILITY_LABEL,
  BOOKING_PROVIDER_LABEL,
  formatEur, formatInt,
} from "@/lib/sports-api";
import { FacilityReviews } from "@/components/facility-reviews";

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

function occupancyColor(v: number) {
  if (v >= 85) return "#C8102E";
  if (v >= 60) return "#F59E0B";
  if (v >= 35) return "#1F6F8B";
  return "#16A34A";
}

export default function SportsFacilityDetail() {
  const { t, language } = useI18n();
  const [, params] = useRoute<{ id: string }>("/sports/facility/:id");
  const id = params?.id;
  const facility = useSportsFacility(id);
  const recs = useRecommendations();
  const occ = useFacilityOccupancy(id);
  const facRecs = (recs.data ?? []).filter((r) => r.facilityId === id);

  if (facility.isLoading) {
    return <div className="container mx-auto px-4 py-10 text-muted-foreground">Loading…</div>;
  }
  if (facility.isError || !facility.data) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-lg font-bold">Facility not found.</p>
        <Link href="/sports/map" className="inline-block mt-3">
          <Button variant="outline">Back to map</Button>
        </Link>
      </div>
    );
  }
  const f = facility.data;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`;

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Link href="/sports/map" className="inline-block">
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

        {/* Booking + directions strip */}
        <Card className="mt-4 border-primary/30">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {f.bookingProvider === "none"
                  ? t("fac.dropIn")
                  : `${t("fac.book")} ${BOOKING_PROVIDER_LABEL[f.bookingProvider]}`}
              </p>
              <p className="mt-1 text-sm text-foreground">
                <span className="font-bold">{t("fac.priceFrom")}:</span>{" "}
                {f.entryType === "free" || f.priceFromEur === 0
                  ? t("fac.free")
                  : `€${f.priceFromEur}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {f.bookingUrl && (
                <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="font-semibold">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {t("fac.book")} {BOOKING_PROVIDER_LABEL[f.bookingProvider]}
                    <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Button>
                </a>
              )}
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="font-semibold">
                  <Navigation className="w-4 h-4 mr-1.5" />
                  {t("fac.directions")}
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Age groups + accessibility */}
        {(f.ageGroups.length > 0 || f.accessibility.length > 0) && (
          <Card className="mt-3">
            <CardContent className="p-4 grid gap-3 md:grid-cols-2">
              {f.ageGroups.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {t("fac.ageGroups")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.ageGroups.map((a) => (
                      <Badge key={a} variant="secondary" className="text-[11px]">
                        {AGE_GROUP_LABEL[a][language]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {f.accessibility.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <AccessibilityIcon className="w-3.5 h-3.5" />
                    {t("fac.accessibility")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.accessibility.map((a) => (
                      <Badge key={a} variant="outline" className="text-[11px]">
                        {ACCESSIBILITY_LABEL[a][language]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4">
          <Stat label={t("kpi.utilization")} value={`${f.utilization}%`} sub={`${language === "lt" ? "savaitinis" : "weekly avg"}`} />
          <Stat label={language === "lt" ? "Talpa" : "Capacity"} value={formatInt(f.capacity)} />
          <Stat label={t("kpi.visits")} value={formatInt(f.annualVisits)} />
          <Stat label={t("kpi.opsCost")} value={formatEur(f.annualOpsCostEur)} />
          {typeof f.reviewCount === "number" && (
            <Stat
              label={language === "lt" ? "Srautas" : "Traffic"}
              value={`${f.trafficScore ?? f.utilization}/100`}
              sub={`${formatInt(f.reviewCount)} reviews${typeof f.rating === "number" ? ` · ${f.rating.toFixed(1)}★` : ""}`}
            />
          )}
        </div>

        {/* Live occupancy panel */}
        {occ.data && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  {t("fac.occupancy.title")}
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  {occ.data.source === "live" ? "Live" : language === "lt" ? "Modelis" : "Modelled"}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("fac.occupancy.now")}
                  </p>
                  <p
                    className="mt-1 text-3xl font-extrabold"
                    style={{ color: occupancyColor(occ.data.current) }}
                  >
                    {occ.data.current}%
                  </p>
                  <Progress value={occ.data.current} className="h-1.5 mt-2" />
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("fac.occupancy.today")}
                  </p>
                  <div className="flex items-end gap-px h-16">
                    {occ.data.today.map((v, h) => (
                      <div
                        key={h}
                        title={`${h}:00 — ${v}%`}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${Math.max(4, v)}%`,
                          backgroundColor: occupancyColor(v),
                          opacity: h === occ.data!.hour ? 1 : 0.55,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("fac.occupancy.week")}
                </p>
                <div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-px text-[9px]">
                  <div />
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="text-center text-muted-foreground">
                      {h % 6 === 0 ? h : ""}
                    </div>
                  ))}
                  {(language === "lt"
                    ? ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"]
                    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day, d) => (
                    <React.Fragment key={`row-${d}`}>
                      <div className="pr-1 text-right text-muted-foreground self-center">
                        {day}
                      </div>
                      {(occ.data!.week[d] ?? []).map((v, h) => (
                        <div
                          key={`c-${d}-${h}`}
                          title={`${day} ${h}:00 — ${v}%`}
                          className="rounded-sm"
                          style={{
                            height: 12,
                            backgroundColor: occupancyColor(v),
                            opacity: 0.2 + (v / 100) * 0.8,
                          }}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {occ.data.notes && (
                <p className="mt-3 text-[11px] italic text-muted-foreground">{occ.data.notes}</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
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

        <div className="mt-4">
          <FacilityReviews facilityId={f.id} />
        </div>

        <p className="mt-4 text-xs text-muted-foreground italic">{t("label.estimate")}.</p>
      </div>
    </div>
  );
}
