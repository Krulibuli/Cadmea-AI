import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Settings2, Zap, Wrench, TrendingUp, Lightbulb, Users, Wallet,
  ArrowRight, AlertCircle, Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import {
  useRecommendations, useSportsSummary, useSportsMeta, useSportsFacilities,
  formatEur, formatInt, FACILITY_TYPE_LABEL,
} from "@/lib/sports-api";

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  energy: Zap,
  maintenance: Wrench,
  coverage: TrendingUp,
  automation: Lightbulb,
  staffing: Users,
  investment: Wallet,
};

export default function SportsOperator() {
  const { t, language } = useI18n();
  const [district, setDistrict] = useState<string>("__all");
  const [category, setCategory] = useState<string>("__all");
  const [priority, setPriority] = useState<string>("__all");

  const summary = useSportsSummary();
  const meta = useSportsMeta();
  const recs = useRecommendations({
    district: district === "__all" ? undefined : district,
    category: category === "__all" ? undefined : category,
    priority: priority === "__all" ? undefined : priority,
  });
  const lowAuto = useSportsFacilities({ source: "managed" });

  const list = recs.data ?? [];
  const totalSavings = useMemo(() => list.reduce((s, r) => s + (r.estimatedSavingsEur ?? 0), 0), [list]);
  const byPriority = useMemo(() => ({
    high: list.filter((r) => r.priority === "high").length,
    medium: list.filter((r) => r.priority === "medium").length,
    low: list.filter((r) => r.priority === "low").length,
  }), [list]);

  const lowAutoFacilities = (lowAuto.data ?? [])
    .filter((f) => f.status === "operational")
    .sort((a, b) => a.automation.overall - b.automation.overall)
    .slice(0, 5);

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" />
            {t("nav.sports.operator")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === "lt"
              ? "Įžvalgos ir veiksmai sporto objektų operatoriams: energija, automatizavimas, priežiūra ir aprėpties spragos."
              : "Insights and actions for sports facility operators: energy, automation, maintenance and coverage gaps."}
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-5">
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("kpi.savings")}</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">{formatEur(totalSavings)}</p>
              <p className="text-xs text-muted-foreground">{language === "lt" ? "per metus, jei įgyvendinta" : "per year if implemented"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Aukšto prioriteto" : "High priority"}</p>
              <p className="mt-1 text-2xl font-extrabold text-destructive">{byPriority.high}</p>
              <p className="text-xs text-muted-foreground">{language === "lt" ? "veiksmai" : "actions"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Vidutinio" : "Medium"}</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">{byPriority.medium}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Vid. automat." : "Avg automation"}</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">{summary.data?.avgAutomation ?? 0}/100</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <Card>
              <CardContent className="p-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger><SelectValue placeholder={t("filter.allDistricts")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">{t("filter.allDistricts")}</SelectItem>
                      {(meta.data?.districts ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder={language === "lt" ? "Kategorija" : "Category"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">{language === "lt" ? "Visos kategorijos" : "All categories"}</SelectItem>
                      <SelectItem value="energy">{language === "lt" ? "Energija" : "Energy"}</SelectItem>
                      <SelectItem value="automation">{language === "lt" ? "Automatizavimas" : "Automation"}</SelectItem>
                      <SelectItem value="maintenance">{language === "lt" ? "Priežiūra" : "Maintenance"}</SelectItem>
                      <SelectItem value="staffing">{language === "lt" ? "Personalas" : "Staffing"}</SelectItem>
                      <SelectItem value="coverage">{language === "lt" ? "Aprėptis" : "Coverage"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue placeholder={language === "lt" ? "Prioritetas" : "Priority"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">{language === "lt" ? "Visi" : "All"}</SelectItem>
                      <SelectItem value="high">{t("label.priority.high")}</SelectItem>
                      <SelectItem value="medium">{t("label.priority.medium")}</SelectItem>
                      <SelectItem value="low">{t("label.priority.low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {list.map((r) => {
                const Icon = CATEGORY_ICON[r.category] ?? Lightbulb;
                return (
                  <Card
                    key={r.id}
                    className="border-l-4"
                    style={{
                      borderLeftColor:
                        r.priority === "high" ? "hsl(var(--destructive))"
                        : r.priority === "medium" ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground))",
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted p-2 mt-0.5">
                          <Icon className="w-4 h-4 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge variant={r.priority === "high" ? "destructive" : "secondary"} className="text-[10px] font-bold uppercase">
                              {t(`label.priority.${r.priority}`)}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] capitalize">{r.category}</Badge>
                            {r.district && <Badge variant="outline" className="text-[10px]">{r.district}</Badge>}
                            {r.estimatedSavingsEur ? (
                              <span className="ml-auto text-sm font-extrabold text-primary">
                                {formatEur(r.estimatedSavingsEur)}/yr
                              </span>
                            ) : null}
                          </div>
                          <h3 className="text-sm font-extrabold text-foreground">{r.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground italic">{r.estimatedImpact}</p>
                            {r.facilityId && (
                              <Link href={`/sports/facility/${r.facilityId}`}>
                                <Button size="sm" variant="ghost" className="h-7 text-xs">
                                  {t("label.viewDetail")} <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {list.length === 0 && (
                <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                  {language === "lt" ? "Nėra rekomendacijų pagal pasirinktus filtrus." : "No recommendations match the current filters."}
                </CardContent></Card>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Card className="border-destructive/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  {language === "lt" ? "Mažiausiai automatizuoti objektai" : "Least automated facilities"}
                </h3>
                <div className="mt-3 space-y-3">
                  {lowAutoFacilities.map((f) => (
                    <Link key={f.id} href={`/sports/facility/${f.id}`}>
                      <div className="hover:bg-muted/50 -mx-1 px-1 py-1.5 rounded cursor-pointer">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-foreground line-clamp-1">{f.name}</p>
                          <Badge variant="destructive" className="text-[10px] shrink-0">{f.automation.overall}/100</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{FACILITY_TYPE_LABEL[f.type]} · {f.district}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/10 border-accent/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-accent" />
                  {language === "lt" ? "Strateginis tikslas" : "Strategic goal"}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {language === "lt"
                    ? "Pakelti vidutinį miesto valdomų objektų automatizavimo balą iki 70/100 per 24 mėn., kad būtų sumažintas eksploatavimo personalo poreikis 15–25 % off-peak metu."
                    : "Raise the average automation score of city-managed facilities to 70/100 within 24 months — reducing off-peak staffing demand by 15–25%."}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{language === "lt" ? "Dabar" : "Now"}</span>
                  <span className="font-extrabold text-foreground">{summary.data?.avgAutomation ?? 0} → 70</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground italic">{t("label.estimate")}.</p>
      </div>
    </div>
  );
}
