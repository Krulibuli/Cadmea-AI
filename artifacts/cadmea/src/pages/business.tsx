import { Wallet, Building2, Handshake, GraduationCap, Sparkles, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

interface Stream {
  icon: React.ComponentType<{ className?: string }>;
  payer: string;
  product: string;
  pricing: string;
  rationale: string;
  status: "active" | "pilot" | "planned";
}

export default function BusinessPage() {
  const { t, language } = useI18n();

  const streams: Stream[] = [
    {
      icon: Building2,
      payer: language === "lt" ? "Vilniaus miesto savivaldybė" : "City of Vilnius",
      product: language === "lt" ? "Pagrindinė platforma + analitika" : "Core platform + analytics SaaS",
      pricing: language === "lt" ? "Metinė licencija ~ €60–90k" : "Annual licence ~ €60–90k",
      rationale: language === "lt"
        ? "Pakeičia rankinį KPI rinkimą, suteikia vieną duomenų šaltinį planavimui."
        : "Replaces manual KPI collection, single source of truth for planning.",
      status: "pilot",
    },
    {
      icon: Handshake,
      payer: "ActiveVilnius",
      product: language === "lt"
        ? "Užimtumo valdiklis + duomenų API"
        : "Live-occupancy widget + data API",
      pricing: language === "lt"
        ? "Pajamų pasidalijimas: 1–3 % iš nukreiptų rezervacijų"
        : "Rev-share: 1–3 % of referred bookings",
      rationale: language === "lt"
        ? "Mes siunčiame jiems gyventojus, jie dalijasi konversija. Win-win partnerystė."
        : "We send them residents, they share conversions. Win-win partnership.",
      status: "planned",
    },
    {
      icon: GraduationCap,
      payer: language === "lt" ? "Sporto klubai ir mokyklos" : "Sports clubs & schools",
      product: language === "lt" ? "Premium objektų profiliai" : "Premium facility profiles",
      pricing: "€15–40 / mo",
      rationale: language === "lt"
        ? "Logo, nuotraukos, treneriai, treniruočių grafikas. Padeda išsiskirti tarp 9+ valdomų objektų."
        : "Logo, photos, coaches, schedules. Stand out among 9+ city-managed venues.",
      status: "planned",
    },
    {
      icon: BarChart3,
      payer: language === "lt" ? "Kiti Lietuvos miestai" : "Other Lithuanian cities",
      product: language === "lt" ? "White-label diegimas" : "White-label deployment",
      pricing: language === "lt"
        ? "Vienkartinis €20k + €18k / metus"
        : "€20k setup + €18k / yr",
      rationale: language === "lt"
        ? "Kaunas, Klaipėda, Šiauliai – ta pati problema, ta pati platforma."
        : "Kaunas, Klaipėda, Šiauliai — same problem, same platform.",
      status: "planned",
    },
    {
      icon: Sparkles,
      payer: language === "lt" ? "Sponsoriai (sveikatos draudikai)" : "Sponsors (health insurers)",
      product: language === "lt"
        ? "Pažymėti sveikatingumo iššūkiai"
        : "Sponsored wellness challenges",
      pricing: "€2–5k / kampanija",
      rationale: language === "lt"
        ? "Skatina aktyvumą, skirsto naudą gyventojams, ne kuria reklamą."
        : "Drives activity, gives back to residents — no display ads.",
      status: "planned",
    },
  ];

  const principles = [
    {
      title: language === "lt" ? "Be reklamų gyventojams" : "No ads for residents",
      desc: language === "lt"
        ? "Naudojimas yra ir liks visiškai nemokamas Vilniaus gyventojams."
        : "Use is and will remain entirely free for Vilnius residents.",
    },
    {
      title: language === "lt" ? "Be rezervacijos komisinio" : "No booking commission",
      desc: language === "lt"
        ? "Mes nukreipiame į ActiveVilnius — neimame komisinio iš gyventojo."
        : "We deep-link out to ActiveVilnius — no commission charged to residents.",
    },
    {
      title: language === "lt" ? "Atviri duomenys lieka atviri" : "Open data stays open",
      desc: language === "lt"
        ? "Visos miesto valdomų objektų ataskaitos prieinamos viešai."
        : "All city-facility reports remain publicly downloadable.",
    },
  ];

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary font-semibold">
            <Wallet className="w-3 h-3 mr-1.5" />
            {language === "lt" ? "Verslo modelis" : "Business model"}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{t("biz.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{t("biz.subtitle")}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 mb-8">
          {principles.map((p) => (
            <Card key={p.title} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <h3 className="text-sm font-extrabold text-foreground">{p.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-extrabold text-foreground mb-3">
          {language === "lt" ? "Pajamų srautai" : "Revenue streams"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {streams.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.payer} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 text-primary p-2 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {s.payer}
                        </p>
                        <Badge
                          variant={s.status === "active" ? "default" : s.status === "pilot" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {s.status === "active"
                            ? language === "lt" ? "Aktyvu" : "Active"
                            : s.status === "pilot"
                              ? language === "lt" ? "Bandymas" : "Pilot"
                              : language === "lt" ? "Planuojama" : "Planned"}
                        </Badge>
                      </div>
                      <h3 className="mt-1 text-sm font-extrabold text-foreground leading-snug">{s.product}</h3>
                      <p className="mt-1.5 text-sm font-bold text-primary">{s.pricing}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">{s.rationale}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-6 text-xs italic text-muted-foreground">{t("label.estimate")}.</p>
      </div>
    </div>
  );
}
