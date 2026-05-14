import { useMemo, useState } from "react";
import { MessageSquare, ThumbsUp, Plus, Megaphone, AlertCircle, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useSportsMeta } from "@/lib/sports-api";
import {
  useRequests, useCreateRequest, useSupportRequest, type RequestKind, type RequestType, type ResidentRequest,
} from "@/lib/community-api";
import { getAlias, setAlias } from "@/lib/fingerprint";
import { useToast } from "@/hooks/use-toast";

function kindBadge(k: RequestKind, language: "en" | "lt") {
  const map: Record<RequestKind, { en: string; lt: string; color: string; Icon: typeof MessageSquare }> = {
    issue: { en: "Issue", lt: "Problema", color: "destructive", Icon: AlertCircle },
    request: { en: "Request", lt: "Prašymas", color: "secondary", Icon: MessageSquare },
    petition: { en: "Petition", lt: "Peticija", color: "default", Icon: Megaphone },
  };
  const v = map[k];
  return { label: v[language], color: v.color, Icon: v.Icon };
}

export default function RequestsPage() {
  const { t, language } = useI18n();
  const meta = useSportsMeta();
  const { toast } = useToast();
  const [kind, setKind] = useState<RequestKind | "__all">("__all");
  const [district, setDistrict] = useState<string>("__all");
  const [sport, setSport] = useState<string>("__all");
  const [showForm, setShowForm] = useState(false);

  const requestsQ = useRequests({
    kind: kind === "__all" ? undefined : kind,
    district: district === "__all" ? undefined : district,
    sport: sport === "__all" ? undefined : sport,
  });
  const items = requestsQ.data?.items ?? [];
  const threshold = requestsQ.data?.petitionThreshold ?? 100;

  const create = useCreateRequest();
  const support = useSupportRequest();

  const [form, setForm] = useState({
    kind: "request" as RequestKind,
    title: "",
    description: "",
    district: "",
    sport: "",
    requestType: "build" as RequestType,
    lat: "" as string,
    lng: "" as string,
    alias: getAlias(),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.district) {
      toast({ title: language === "lt" ? "Užpildykite visus laukus" : "Please fill all required fields", variant: "destructive" });
      return;
    }
    const latNum = form.lat.trim() ? Number(form.lat) : null;
    const lngNum = form.lng.trim() ? Number(form.lng) : null;
    try {
      await create.mutateAsync({
        kind: form.kind,
        title: form.title,
        description: form.description,
        district: form.district,
        sport: form.sport || null,
        requestType: form.requestType,
        lat: latNum != null && Number.isFinite(latNum) ? latNum : null,
        lng: lngNum != null && Number.isFinite(lngNum) ? lngNum : null,
        alias: form.alias,
      });
      if (form.alias) setAlias(form.alias);
      toast({ title: language === "lt" ? "Padėka už įrašą!" : "Thanks — your submission is live." });
      setForm((f) => ({ ...f, title: "", description: "", lat: "", lng: "" }));
      setShowForm(false);
    } catch (err) {
      toast({ title: language === "lt" ? "Klaida" : "Failed", description: String(err), variant: "destructive" });
    }
  }

  async function handleSupport(req: ResidentRequest) {
    try {
      await support.mutateAsync(req.id);
    } catch (err) {
      toast({ title: language === "lt" ? "Klaida" : "Failed", description: String(err), variant: "destructive" });
    }
  }

  const grouped = useMemo(() => {
    return {
      petitions: items.filter((i) => i.kind === "petition"),
      requests: items.filter((i) => i.kind === "request"),
      issues: items.filter((i) => i.kind === "issue"),
    };
  }, [items]);

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary font-semibold">
              <MessageSquare className="w-3 h-3 mr-1.5" />
              {language === "lt" ? "Bendruomenė" : "Community"}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {language === "lt" ? "Gyventojų prašymai ir peticijos" : "Resident requests & petitions"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              {language === "lt"
                ? `Praneškite apie problemą, paprašykite naujo objekto arba pasirašykite peticiją. Sulaukus ${threshold} parašų peticija perduodama miestui.`
                : `Report an issue, request a new facility, or sign a petition. Petitions with ${threshold}+ supporters are forwarded to the city.`}
            </p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="font-semibold">
            <Plus className="w-4 h-4 mr-1.5" />
            {showForm ? (language === "lt" ? "Uždaryti" : "Close") : (language === "lt" ? "Naujas įrašas" : "New submission")}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 border-primary/30">
            <CardContent className="p-4">
              <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Tipas" : "Type"}</label>
                  <Select value={form.kind} onValueChange={(v) => setForm((f) => ({ ...f, kind: v as RequestKind }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="issue">{language === "lt" ? "Problema (esamas objektas)" : "Issue (existing facility)"}</SelectItem>
                      <SelectItem value="request">{language === "lt" ? "Prašymas (naujas objektas)" : "Request (new facility)"}</SelectItem>
                      <SelectItem value="petition">{language === "lt" ? "Peticija" : "Petition"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Rajonas" : "District"} *</label>
                  <Select value={form.district} onValueChange={(v) => setForm((f) => ({ ...f, district: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={language === "lt" ? "Pasirinkite" : "Select…"} /></SelectTrigger>
                    <SelectContent>
                      {(meta.data?.districts ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Veiksmas" : "Action"}</label>
                  <Select value={form.requestType} onValueChange={(v) => setForm((f) => ({ ...f, requestType: v as RequestType }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="build">{language === "lt" ? "Statyti naują" : "Build new"}</SelectItem>
                      <SelectItem value="upgrade">{language === "lt" ? "Atnaujinti" : "Upgrade"}</SelectItem>
                      <SelectItem value="maintenance">{language === "lt" ? "Priežiūra / remontas" : "Maintenance / repair"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Sporto šaka" : "Sport"}</label>
                  <Select value={form.sport || "__any"} onValueChange={(v) => setForm((f) => ({ ...f, sport: v === "__any" ? "" : v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={language === "lt" ? "Pasirinkite" : "Select…"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any">{language === "lt" ? "Bet kuri / nenurodyta" : "Any / unspecified"}</SelectItem>
                      {(meta.data?.disciplines ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Antraštė" : "Title"} *</label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={160} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Aprašymas" : "Description"} *</label>
                  <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} maxLength={2000} rows={4} className="mt-1" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Platuma (neprivaloma)" : "Latitude (optional)"}</label>
                  <Input value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))} inputMode="decimal" placeholder="54.6872" className="mt-1" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Ilguma (neprivaloma)" : "Longitude (optional)"}</label>
                  <Input value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))} inputMode="decimal" placeholder="25.2797" className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{language === "lt" ? "Pseudonimas (neprivaloma)" : "Alias (optional)"}</label>
                  <Input value={form.alias} onChange={(e) => setForm((f) => ({ ...f, alias: e.target.value }))} maxLength={60} className="mt-1" placeholder={language === "lt" ? "pvz. Gyventojas" : "e.g. Resident"} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={create.isPending} className="font-semibold">
                    {create.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                    {language === "lt" ? "Pateikti" : "Submit"}
                  </Button>
                </div>
              </form>
              <p className="mt-3 text-[11px] italic text-muted-foreground">
                {language === "lt"
                  ? "Anonimiškumas: jūs identifikuojami pseudoatsitiktiniu naršyklės žymeniu. Vienas balsas vienam įrašui."
                  : "Anonymous: identified by a pseudo-random browser token. One vote per submission."}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-5">
          <CardContent className="p-3 grid gap-2 md:grid-cols-4">
            <div>
              <Select value={kind} onValueChange={(v) => setKind(v as RequestKind | "__all")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">{language === "lt" ? "Visi tipai" : "All types"}</SelectItem>
                  <SelectItem value="issue">{language === "lt" ? "Problemos" : "Issues"}</SelectItem>
                  <SelectItem value="request">{language === "lt" ? "Prašymai" : "Requests"}</SelectItem>
                  <SelectItem value="petition">{language === "lt" ? "Peticijos" : "Petitions"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">{t("filter.allDistricts")}</SelectItem>
                  {(meta.data?.districts ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">{language === "lt" ? "Visos sporto šakos" : "All sports"}</SelectItem>
                  {(meta.data?.disciplines ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground self-center md:text-right">
              {items.length} {language === "lt" ? "įrašų" : "items"}
            </div>
          </CardContent>
        </Card>

        {[
          { title: language === "lt" ? "Peticijos" : "Petitions", arr: grouped.petitions },
          { title: language === "lt" ? "Prašymai" : "Requests", arr: grouped.requests },
          { title: language === "lt" ? "Problemos" : "Issues", arr: grouped.issues },
        ].filter((s) => s.arr.length > 0).map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground mb-2">{section.title}</h2>
            <div className="space-y-2">
              {section.arr.map((r) => {
                const kb = kindBadge(r.kind, language);
                const Icon = kb.Icon;
                return (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge variant={kb.color as "default" | "destructive" | "secondary"} className="text-[10px]"><Icon className="w-3 h-3 mr-1" />{kb.label}</Badge>
                            <Badge variant="outline" className="text-[10px]"><MapPin className="w-3 h-3 mr-1" />{r.district}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{r.status}</Badge>
                            {r.forwardedToCity && (
                              <Badge className="text-[10px] bg-primary text-primary-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />{language === "lt" ? "Perduota miestui" : "Forwarded to city"}</Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-extrabold text-foreground">{r.title}</h3>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {r.sport && <Badge variant="outline" className="text-[10px]">{r.sport}</Badge>}
                            {r.requestType && <Badge variant="outline" className="text-[10px] capitalize">{r.requestType}</Badge>}
                            {r.lat != null && r.lng != null && (
                              <Badge variant="outline" className="text-[10px]"><MapPin className="w-3 h-3 mr-1" />{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">{r.description}</p>
                          <p className="mt-1.5 text-[10px] text-muted-foreground">
                            {r.authorAlias || (language === "lt" ? "Anoniminis" : "Anonymous")} · {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                          {r.kind === "petition" && (
                            <div className="mt-2">
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{r.supporters.length} / {threshold}</span>
                              </div>
                              <Progress value={Math.min(100, (r.supporters.length / threshold) * 100)} className="h-1.5 mt-0.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-stretch gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleSupport(r)} disabled={support.isPending} className="font-semibold">
                            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                            {r.supporters.length}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {items.length === 0 && !requestsQ.isLoading && (
          <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
            {language === "lt" ? "Dar nėra įrašų. Būkite pirmas!" : "No submissions yet. Be the first!"}
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
