import { Radar, TrendingUp, AlertTriangle, MapPin, Sparkles, Info, Hash, Grid3x3, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useDemandReport, useDemandSummary } from "@/lib/community-api";

function Bar({ value, color = "#1F6F8B" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full bg-muted rounded">
      <div className="h-full rounded" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function scoreColor(v: number): string {
  if (v >= 80) return "#C8102E";
  if (v >= 60) return "#F59E0B";
  if (v >= 40) return "#1F6F8B";
  return "#16A34A";
}

export default function DemandRadarPage() {
  const { language } = useI18n();
  const report = useDemandReport();
  const summary = useDemandSummary();
  const r = report.data;

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary font-semibold">
            <Radar className="w-3 h-3 mr-1.5" />
            {language === "lt" ? "Paklausos radaras" : "Demand Radar"}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {language === "lt" ? "Ko ieško Vilniaus gyventojai" : "What Vilnius residents are looking for"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
            {language === "lt"
              ? "Skaidri paieškos / poreikio analizė pagal raktažodžius, sezono tendencijas ir žinomus infrastruktūros trūkumus. Naudojama planuojant kur statyti ar atnaujinti."
              : "A transparent search/need proxy combining keyword clusters, seasonality, and known infrastructure gaps. Used to inform where to build or upgrade."}
          </p>
          {summary.data && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              {language === "lt" ? "Sugeneruota" : "Generated"}: {new Date(summary.data.generatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {summary.data && (
          <div className="grid gap-3 md:grid-cols-4 mb-6">
            <Card><CardContent className="p-4">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Sporto šakų" : "Sports tracked"}</p>
              <p className="mt-1 text-2xl font-extrabold">{summary.data.sportsRanked}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Vid. trūkumo indeksas" : "Avg shortage idx"}</p>
              <p className="mt-1 text-2xl font-extrabold" style={{ color: scoreColor(summary.data.averageShortageIndex) }}>
                {summary.data.averageShortageIndex}
              </p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Didžiausias trūkumas" : "Top shortage"}</p>
              <p className="mt-1 text-sm font-bold leading-tight">{summary.data.topShortage}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Greičiausiai auga" : "Fastest growing"}</p>
              <p className="mt-1 text-sm font-bold leading-tight">{summary.data.topGrowingNeed}</p>
            </CardContent></Card>
          </div>
        )}

        <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          {language === "lt" ? "Sporto šakų populiarumas" : "Sport popularity"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2 mb-8">
          {(r?.sport_popularity_ranked ?? []).map((s) => (
            <Card key={s.rank}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      #{s.rank}
                    </p>
                    <h3 className="text-base font-extrabold text-foreground">{s.sport}</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px]" style={{ borderColor: scoreColor(s.shortage_index_0_100), color: scoreColor(s.shortage_index_0_100) }}>
                    {language === "lt" ? "Trūkumas" : "Shortage"}: {s.shortage_index_0_100}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between"><span>{language === "lt" ? "Paklausa" : "Demand"}</span><span className="font-bold">{s.demand_index_0_100}</span></div>
                    <Bar value={s.demand_index_0_100} color="#1F6F8B" />
                  </div>
                  <div>
                    <div className="flex justify-between"><span>{language === "lt" ? "Augimas" : "Trend"}</span><span className="font-bold">{s.trend_index_0_100}</span></div>
                    <Bar value={s.trend_index_0_100} color="#16A34A" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{language === "lt" ? "Prioritetiniai objektų tipai" : "Priority facility types"}</p>
                  <div className="flex flex-wrap gap-1">
                    {s.priority_facility_types.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          {language === "lt" ? "Didžiausi trūkumai" : "Biggest shortages"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2 mb-8">
          {(r?.biggest_shortages ?? []).map((s) => (
            <Card key={s.shortage} className="border-l-4" style={{ borderLeftColor: scoreColor(s.shortage_index_0_100) }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-foreground">{s.shortage}</h3>
                  <span className="text-xl font-extrabold" style={{ color: scoreColor(s.shortage_index_0_100) }}>{s.shortage_index_0_100}</span>
                </div>
                <Progress value={s.shortage_index_0_100} className="h-1.5 mt-1.5" />
                <p className="mt-3 text-xs text-foreground"><strong>{language === "lt" ? "Veiksmas" : "Action"}:</strong> {s.action}</p>
                <div className="mt-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">{language === "lt" ? "Paliesti rajonai" : "Affected districts"}</p>
                  <div className="flex flex-wrap gap-1">
                    {s.affected_districts.map((d) => (
                      <Badge key={d} variant="outline" className="text-[10px]"><MapPin className="w-2.5 h-2.5 mr-1" />{d}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          {language === "lt" ? "Greičiausiai auga" : "What's growing fastest"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2 mb-8">
          {(r?.what_is_growing_fastest ?? []).map((g) => (
            <Card key={g.sport_or_need} className="border-l-4" style={{ borderLeftColor: scoreColor(g.growth_proxy_0_100) }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-extrabold text-foreground">{g.sport_or_need}</h3>
                  <span className="text-xl font-extrabold" style={{ color: scoreColor(g.growth_proxy_0_100) }}>
                    {g.growth_proxy_0_100}
                  </span>
                </div>
                <Progress value={g.growth_proxy_0_100} className="h-1.5 mt-1.5" />
                <p className="mt-2 text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                  {language === "lt" ? "Įrodymo tipas" : "Evidence type"}
                </p>
                <p className="text-xs text-foreground">{g.evidence_type}</p>
                <p className="mt-2 text-xs text-foreground"><strong>{language === "lt" ? "Rekomendacija" : "Recommendation"}:</strong> {g.recommendation}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {g.keywords.slice(0, 5).map((k) => (
                    <Badge key={k} variant="outline" className="text-[10px]"><Hash className="w-2.5 h-2.5 mr-0.5" />{k}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {r?.keyword_clusters_to_import_or_scrape_legally && (
          <>
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              {language === "lt" ? "Raktažodžių grupės" : "Keyword clusters"}
            </h2>
            <Card className="mb-8">
              <CardContent className="p-4">
                <p className="text-xs italic text-muted-foreground mb-3">
                  {language === "lt"
                    ? "Importuojami / teisėtai surenkami raktažodžiai pagal sporto sritis."
                    : "Cluster of keywords to import or legally scrape, grouped by sport area."}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(r.keyword_clusters_to_import_or_scrape_legally).map(([cluster, kws]) => (
                    <div key={cluster} className="border border-border rounded-lg p-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1.5">{cluster.replace(/_/g, " ")}</p>
                      <div className="flex flex-wrap gap-1">
                        {kws.map((k) => (
                          <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {r?.district_keyword_matrix_sample && (
          <>
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-primary" />
              {language === "lt" ? "Rajonų raktažodžių matrica" : "District keyword matrix"}
            </h2>
            <Card className="mb-8 overflow-x-auto">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left p-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Rajonas" : "District"}</th>
                      <th className="text-left p-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Pagrindinės šakos" : "Top sports"}</th>
                      <th className="text-left p-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Raktažodžiai" : "Must-test keywords"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.district_keyword_matrix_sample.map((row) => (
                      <tr key={row.district} className="border-b border-border last:border-b-0">
                        <td className="p-3 font-bold text-foreground"><MapPin className="w-3 h-3 inline mr-1 text-primary" />{row.district}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {row.top_sports.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {row.must_test_keywords.map((k) => <Badge key={k} variant="secondary" className="text-[10px]"><Hash className="w-2.5 h-2.5 mr-0.5" />{k}</Badge>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {language === "lt" ? "Rajonų rekomendacijos" : "District recommendations"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(r?.top_district_recommendations ?? []).map((d) => (
            <Card key={`${d.rank}-${d.district}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">#{d.rank} · {d.confidence}</p>
                    <h3 className="text-base font-extrabold text-foreground">{d.district} · {d.sport}</h3>
                  </div>
                  <span className="text-xl font-extrabold" style={{ color: scoreColor(d.priority_score_0_100) }}>{d.priority_score_0_100}</span>
                </div>
                <Badge className="text-[10px] mt-1" variant="secondary">{d.action}</Badge>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                  {d.reasons.slice(0, 4).map((reason, i) => <li key={i}>{reason}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
