import { Link } from "wouter";
import {
  Activity, Map as MapIcon, BarChart3, Settings2, Sparkles, ArrowRight,
  Building2, Trees, Baby, Wallet, Users, Zap, TrendingUp, Wrench,
  ExternalLink, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import {
  useSportsSummary, useSportsFacilities, useDistrictKpis, useRecommendations,
  formatEur, formatInt, FACILITY_TYPE_LABEL,
} from "@/lib/sports-api";

function Kpi({
  icon: Icon, label, value, sub, accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-primary/40 bg-primary/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`rounded-lg p-2 ${accent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { t, language } = useI18n();
  const summary = useSportsSummary();
  const managed = useSportsFacilities({ source: "managed" });
  const kpis = useDistrictKpis();
  const recs = useRecommendations();

  const s = summary.data;
  const topRecs = (recs.data ?? []).slice(0, 4);
  const sortedKpis = [...(kpis.data ?? [])].sort((a, b) => b.population - a.population).slice(0, 6);
  const lowestCoverage = [...(kpis.data ?? [])]
    .filter((k) => k.population > 12000)
    .sort((a, b) => a.disciplinesCovered - b.disciplinesCovered)
    .slice(0, 3);

  return (
    <div className="bg-grid">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background to-card/40">
        <div className="absolute inset-0 bg-grid-strong opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 text-primary font-semibold">
              <Sparkles className="w-3 h-3 mr-1.5" />
              {t("sports.hero.eyebrow")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              {t("sports.hero.title")}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl">
              {t("sports.hero.subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/sports/map">
                <Button size="lg" className="font-semibold">
                  <MapIcon className="w-4 h-4 mr-2" />
                  {t("sports.hero.cta.map")}
                </Button>
              </Link>
              <Link href="/sports/operator">
                <Button size="lg" variant="outline" className="font-semibold">
                  <Settings2 className="w-4 h-4 mr-2" />
                  {t("sports.hero.cta.ops")}
                </Button>
              </Link>
              <Link href="/sports/disciplines">
                <Button size="lg" variant="ghost" className="font-semibold">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t("sports.hero.cta.coverage")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Kpi icon={Activity} label={t("kpi.facilities")} value={formatInt(s?.totalFacilities ?? 0)} sub={`${s?.districtsCovered ?? 0} ${t("kpi.coverage").toLowerCase()}`} accent />
          <Kpi icon={Building2} label={t("kpi.managed")} value={formatInt(s?.managedFacilities ?? 0)} sub={`+${s?.plannedFacilities ?? 0} ${t("kpi.planned").toLowerCase()}`} />
          <Kpi icon={Trees} label={t("kpi.parks")} value={formatInt(s?.parks ?? 0)} />
          <Kpi icon={Baby} label={t("kpi.playgrounds")} value={formatInt(s?.playgrounds ?? 0)} />
          <Kpi icon={Users} label={t("kpi.visits")} value={formatInt(s?.totalAnnualVisits ?? 0)} sub={`${s?.avgUtilization ?? 0}% ${t("kpi.utilization").toLowerCase()}`} />
          <Kpi icon={Wallet} label={t("kpi.opsCost")} value={formatEur(s?.totalAnnualOpsCostEur ?? 0)} sub={`${formatEur(s?.estimatedAnnualSavingsEur ?? 0)} ${language === "lt" ? "santaupų" : "savings"}`} />
        </div>
      </section>

      {/* Two-column layout: managed facilities + recommendations */}
      <section className="container mx-auto px-4 pb-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-extrabold text-foreground">{t("section.topFacilities")}</h2>
            <Link href="/sports/map" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              {language === "lt" ? "Visas sąrašas" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(managed.data ?? []).slice(0, 8).map((f) => (
              <Link key={f.id} href={`/sports/facility/${f.id}`}>
                <Card className="hover-elevate cursor-pointer transition-shadow hover:shadow-md h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                          {FACILITY_TYPE_LABEL[f.type]}
                        </p>
                        <h3 className="mt-1 text-sm font-extrabold leading-snug text-foreground line-clamp-2">{f.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{f.district}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {f.utilization}%
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">{language === "lt" ? "Talpa" : "Capacity"}</p>
                        <p className="font-bold text-foreground">{formatInt(f.capacity)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === "lt" ? "Autom." : "Auto."}</p>
                        <p className="font-bold text-foreground">{f.automation.overall}/100</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === "lt" ? "Išlaidos" : "Ops"}</p>
                        <p className="font-bold text-foreground">{formatEur(f.annualOpsCostEur)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-extrabold text-foreground">{t("section.recommendations")}</h2>
            <Link href="/sports/operator" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              {language === "lt" ? "Visos" : "All"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {topRecs.map((r) => (
              <Card key={r.id} className="border-l-4" style={{ borderLeftColor: r.priority === "high" ? "hsl(var(--primary))" : r.priority === "medium" ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))" }}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 rounded bg-muted p-1.5">
                      {r.category === "energy" ? <Zap className="w-3.5 h-3.5" />
                        : r.category === "maintenance" ? <Wrench className="w-3.5 h-3.5" />
                        : r.category === "coverage" ? <TrendingUp className="w-3.5 h-3.5" />
                        : <Lightbulb className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground line-clamp-2">{r.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                        <Badge variant={r.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">
                          {t(`label.priority.${r.priority}`)}
                        </Badge>
                        {r.estimatedSavingsEur ? (
                          <span className="text-primary">{formatEur(r.estimatedSavingsEur)}/yr</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage table */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-extrabold text-foreground">{t("section.coverage")}</h2>
          <Link href="/sports/disciplines" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            {language === "lt" ? "Pilnas vaizdas" : "Full view"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">{language === "lt" ? "Didžiausi rajonai" : "Largest districts"}</h3>
              <div className="space-y-2">
                {sortedKpis.map((d) => (
                  <div key={d.district} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-foreground truncate">{d.district}</span>
                        <span className="text-muted-foreground">{formatInt(d.population)}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(d.disciplinesCovered / 7) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                      {d.disciplinesCovered}/7
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                {language === "lt" ? "Didžiausi aprėpties spragos" : "Biggest coverage gaps"}
              </h3>
              <div className="space-y-3">
                {lowestCoverage.map((d) => (
                  <div key={d.district} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-foreground">{d.district}</span>
                      <span className="text-muted-foreground">{formatInt(d.population)} {language === "lt" ? "gyv." : "residents"}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {language === "lt" ? "Trūksta" : "Missing"}:{" "}
                      <span className="text-foreground font-semibold">
                        {d.disciplinesMissing.slice(0, 4).join(", ")}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Urban context */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <h2 className="text-xl font-extrabold text-foreground">{t("section.urbanContext")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("section.urbanContext.desc")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/map"><Button variant="outline" size="sm"><MapIcon className="w-3.5 h-3.5 mr-1.5" />{t("nav.map")}</Button></Link>
              <Link href="/wizard"><Button variant="outline" size="sm">{t("nav.wizard")}</Button></Link>
              <Link href="/districts"><Button variant="outline" size="sm">{t("nav.districts")}</Button></Link>
              <Link href="/compare"><Button variant="outline" size="sm">{t("nav.compare")}</Button></Link>
              <Link href="/tourist"><Button variant="outline" size="sm">{t("nav.tourist")}</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
