import { Shield, Database, RefreshCcw, Activity, FileDown, Lock, Megaphone, Sparkles, MapPin, Radar, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useSportsSummary } from "@/lib/sports-api";
import {
  useDemandSummary, useRequests, useSetRequestStatus, useAiRecommendations,
  type RequestStatus, type ResidentRequest,
} from "@/lib/community-api";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS: RequestStatus[] = ["open", "forwarded", "acknowledged", "planned", "rejected"];

function PetitionRow({ r }: { r: ResidentRequest }) {
  const { language } = useI18n();
  const { toast } = useToast();
  const setStatus = useSetRequestStatus();
  return (
    <div className="border-b border-border pb-3 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <Badge className="text-[10px] bg-primary text-primary-foreground"><Megaphone className="w-3 h-3 mr-1" />{r.kind}</Badge>
        <Badge variant="outline" className="text-[10px]"><MapPin className="w-3 h-3 mr-1" />{r.district}</Badge>
        <Badge variant="secondary" className="text-[10px]">{r.supporters.length} {language === "lt" ? "balsų" : "supporters"}</Badge>
        {r.forwardedToCity && (
          <Badge className="text-[10px] bg-emerald-600 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />{language === "lt" ? "Perduota" : "Forwarded"}</Badge>
        )}
      </div>
      <p className="text-sm font-bold text-foreground">{r.title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
      <div className="mt-2 flex items-center gap-2">
        <Select
          value={r.status}
          onValueChange={async (v) => {
            try {
              await setStatus.mutateAsync({ id: r.id, status: v as RequestStatus });
              toast({ title: language === "lt" ? "Atnaujinta" : "Status updated" });
            } catch (err) {
              toast({ title: "Failed", description: String(err), variant: "destructive" });
            }
          }}
        >
          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t, language } = useI18n();
  const summary = useSportsSummary();
  const demand = useDemandSummary();
  const petitionsQ = useRequests({ kind: "petition" });
  const requestsQ = useRequests({ kind: "request" });
  const aiQ = useAiRecommendations();
  const s = summary.data;

  const apiBase = `${window.location.origin}/api/integrations/active-vilnius`;
  const petitions = petitionsQ.data?.items ?? [];
  const requests = requestsQ.data?.items ?? [];

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary font-semibold">
              <Shield className="w-3 h-3 mr-1.5" />
              {language === "lt" ? "Administravimas" : "Admin"}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{t("admin.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("admin.subtitle")}</p>
          </div>
          <Badge variant="secondary" className="text-[11px]">
            <Lock className="w-3 h-3 mr-1" />
            {language === "lt" ? "Nepatvirtinta sesija" : "Unauthenticated preview"}
          </Badge>
        </div>

        <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <p className="text-sm text-foreground">{t("admin.authNote")}</p>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-4 mb-6">
          <Card><CardContent className="p-4">
            <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Objektai" : "Facilities"}</p>
            <p className="mt-1 text-2xl font-extrabold">{s?.totalFacilities ?? "—"}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Aktyvios peticijos" : "Active petitions"}</p>
            <p className="mt-1 text-2xl font-extrabold">{petitions.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Atviri prašymai" : "Open requests"}</p>
            <p className="mt-1 text-2xl font-extrabold">{requests.filter((r) => r.status === "open").length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{language === "lt" ? "Trūkumo indeksas" : "Shortage idx"}</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">{demand.data?.averageShortageIndex ?? "—"}</p>
          </CardContent></Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                {language === "lt" ? "DI rekomendacijos: kur statyti" : "AI-assisted: where to build"}
              </h2>
              <p className="text-[11px] italic text-muted-foreground mb-3">
                {aiQ.data?.methodology}
              </p>
              {aiQ.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {(aiQ.data?.items ?? []).map((rec) => (
                  <div key={rec.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{rec.confidence} {language === "lt" ? "patikimumas" : "confidence"}</p>
                        <p className="text-sm font-extrabold text-foreground">{rec.district} · {rec.sport}</p>
                        <Badge variant="secondary" className="text-[10px] mt-1">{rec.action}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-primary">{rec.score}</p>
                        <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">/100</p>
                      </div>
                    </div>
                    <Progress value={rec.score} className="h-1.5 mt-2" />
                    <details className="mt-2">
                      <summary className="text-[11px] font-bold text-primary cursor-pointer">
                        {language === "lt" ? "Įrodymai" : "Evidence"}
                      </summary>
                      <ul className="mt-2 space-y-1">
                        {rec.evidence.map((e, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground">
                            <span className="font-bold text-foreground">{e.label}</span> ({Math.round(e.weight * 100)}%): {e.detail}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                ))}
                {(aiQ.data?.items ?? []).length === 0 && !aiQ.isLoading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {language === "lt" ? "Nėra duomenų." : "No data."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-primary" />
                {language === "lt" ? "Peticijų eilė" : "Petition queue"}
              </h2>
              {petitionsQ.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {petitions.map((r) => <PetitionRow key={r.id} r={r} />)}
                {petitions.length === 0 && !petitionsQ.isLoading && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {language === "lt" ? "Peticijų dar nėra." : "No petitions yet."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <Radar className="w-4 h-4 text-primary" />
                {language === "lt" ? "Paklausos radaras" : "Demand Radar"}
              </h2>
              {demand.data ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">{language === "lt" ? "Stebimos šakos" : "Sports tracked"}</span><span className="font-bold">{demand.data.sportsRanked}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">{language === "lt" ? "Vid. trūkumas" : "Avg shortage"}</span><span className="font-bold">{demand.data.averageShortageIndex}/100</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">{language === "lt" ? "Didžiausias" : "Top shortage"}</span><span className="font-bold text-right">{demand.data.topShortage}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">{language === "lt" ? "Greičiausiai auga" : "Fastest growing"}</span><span className="font-bold text-right">{demand.data.topGrowingNeed}</span></li>
                </ul>
              ) : <Loader2 className="w-4 h-4 animate-spin" />}
              <p className="mt-3 text-[11px] italic text-muted-foreground">
                {language === "lt" ? "Šaltinis: Active Vilnius Demand Radar v0.2 (proxy modelis)" : "Source: Active Vilnius Demand Radar v0.2 (proxy model)"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                {language === "lt" ? "Sistemos būsena" : "System status"}
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-muted-foreground">Demand JSON</span><Badge variant="secondary" className="text-[10px]">Ingested</Badge></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Requests store</span><Badge variant="secondary" className="text-[10px]">File-backed</Badge></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Reviews store</span><Badge variant="secondary" className="text-[10px]">File-backed</Badge></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Auth</span><Badge variant="outline" className="text-[10px]">Deferred</Badge></li>
              </ul>
              <Button size="sm" disabled className="mt-3 w-full">
                <RefreshCcw className="w-4 h-4 mr-1.5" />
                {language === "lt" ? "Iš naujo paimti duomenis" : "Re-ingest data"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
              <FileDown className="w-4 h-4 text-primary" />
              {language === "lt" ? "Eksportas partneriams" : "Partner exports"}
            </h2>
            <div className="grid gap-2 md:grid-cols-3">
              <a href={`${apiBase}/export.json`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">JSON catalogue →</a>
              <a href={`${apiBase}/export.csv`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">CSV catalogue →</a>
              <a href={`${apiBase}/widget/facility/mgd-lazdynai-swimming-pool`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">Sample widget →</a>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 border-dashed">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <Database className="w-3 h-3 inline mr-1" />
              {language === "lt"
                ? "Įrašai laikomi vietiniame faile (.data/). Postgres bus pridėtas vėlesnėje užduotyje."
                : "Submissions are stored in a local file (.data/). Postgres will be added in a follow-up task."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
