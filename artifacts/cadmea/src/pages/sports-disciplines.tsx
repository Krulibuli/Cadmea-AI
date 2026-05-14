import { useMemo, useState } from "react";
import { BarChart3, AlertCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import {
  useDisciplineByDistrict, useDistrictKpis,
  DISCIPLINE_LABEL, formatInt, formatEur, type Discipline,
} from "@/lib/sports-api";

const FOCUS: Discipline[] = ["swimming", "basketball", "football", "athletics", "tennis", "fitness", "play"];

function intensity(n: number, max: number): string {
  if (n === 0) return "bg-muted text-muted-foreground";
  const ratio = max > 0 ? n / max : 0;
  if (ratio > 0.66) return "bg-primary text-primary-foreground";
  if (ratio > 0.33) return "bg-primary/55 text-primary-foreground";
  return "bg-primary/25 text-foreground";
}

export default function SportsDisciplines() {
  const { t, language } = useI18n();
  const rows = useDisciplineByDistrict();
  const kpis = useDistrictKpis();
  const [tab, setTab] = useState("coverage");

  const data = rows.data ?? [];
  const kpiData = kpis.data ?? [];

  const maxByDisc = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of FOCUS) m[d] = Math.max(0, ...data.map((r) => r.disciplines[d] ?? 0));
    return m;
  }, [data]);

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {t("nav.sports.disciplines")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === "lt"
              ? "Sporto šakų aprėptis ir efektyvumo rodikliai pagal Vilniaus rajonus."
              : "Discipline coverage and efficiency indicators across Vilnius districts."}
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="coverage">{language === "lt" ? "Šakų aprėptis" : "Discipline coverage"}</TabsTrigger>
            <TabsTrigger value="efficiency">{language === "lt" ? "Efektyvumas" : "Efficiency KPIs"}</TabsTrigger>
          </TabsList>

          <TabsContent value="coverage" className="mt-4">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left p-3 font-bold">{t("label.district")}</th>
                      <th className="text-right p-3 font-bold">{language === "lt" ? "Gyv." : "Pop."}</th>
                      {FOCUS.map((d) => (
                        <th key={d} className="text-center p-3 font-bold">{DISCIPLINE_LABEL[d]}</th>
                      ))}
                      <th className="text-right p-3 font-bold">{language === "lt" ? "Parkai" : "Parks"}</th>
                      <th className="text-right p-3 font-bold">{language === "lt" ? "Aikšt." : "Playgr."}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r) => (
                      <tr key={r.district} className="border-t border-border hover:bg-muted/20">
                        <td className="p-3 font-bold text-foreground">{r.district}</td>
                        <td className="p-3 text-right text-muted-foreground">{formatInt(r.population)}</td>
                        {FOCUS.map((d) => {
                          const n = r.disciplines[d] ?? 0;
                          return (
                            <td key={d} className="p-2 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded text-xs font-extrabold ${intensity(n, maxByDisc[d])}`}>
                                {n}
                              </span>
                            </td>
                          );
                        })}
                        <td className="p-3 text-right text-foreground font-semibold">{r.parks}</td>
                        <td className="p-3 text-right text-foreground font-semibold">{r.playgrounds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <p className="mt-2 text-xs text-muted-foreground italic">{t("label.estimate")}.</p>
          </TabsContent>

          <TabsContent value="efficiency" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {kpiData.map((k) => (
                <Card key={k.district} className={k.disciplinesMissing.length >= 4 ? "border-destructive/40" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-foreground">{k.district}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {formatInt(k.population)}
                        </p>
                      </div>
                      <Badge variant={k.disciplinesMissing.length >= 4 ? "destructive" : "secondary"} className="text-[10px]">
                        {k.disciplinesCovered}/{FOCUS.length} {language === "lt" ? "šakų" : "disciplines"}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">{language === "lt" ? "Užimtumas" : "Utilization"}</p>
                        <p className="text-lg font-extrabold text-foreground">{k.avgUtilization}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === "lt" ? "Automatizavimas" : "Automation"}</p>
                        <p className="text-lg font-extrabold text-foreground">{k.avgAutomation}/100</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === "lt" ? "Išlaidos / met." : "Annual ops"}</p>
                        <p className="text-sm font-bold text-foreground">{formatEur(k.totalAnnualOpsCostEur)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === "lt" ? "Kaina / aps." : "Cost / visit"}</p>
                        <p className="text-sm font-bold text-foreground">€{k.costPerVisitEur.toFixed(2)}</p>
                      </div>
                    </div>
                    {k.disciplinesMissing.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {language === "lt" ? "Trūksta" : "Missing"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {k.disciplinesMissing.map((d) => DISCIPLINE_LABEL[d]).join(", ")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
