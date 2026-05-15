import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BestMatchInputLanguage,
  BestMatchInputPrioritiesItem,
  BestMatchInputUserType,
  DistrictDetail,
  useAiBestMatch,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreCard } from "@/components/districts/score-card";
import { useI18n } from "@/lib/i18n";
import {
  ArrowRight,
  Baby,
  BriefcaseBusiness,
  Bus,
  CheckCircle2,
  GraduationCap,
  Hotel,
  Leaf,
  Loader2,
  Map,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Wand2,
} from "lucide-react";
import { motion } from "framer-motion";

type Lang = "en" | "lt";
type UserType = BestMatchInputUserType;
type Priority = BestMatchInputPrioritiesItem;

interface GoalPreset {
  id: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  userType: UserType;
  priorities: Priority[];
  icon: typeof Baby;
}

const goalPresets: GoalPreset[] = [
  {
    id: "family",
    title: { en: "Raise a family", lt: "Gyventi su šeima" },
    subtitle: { en: "Schools, safety, parks, calm streets", lt: "Mokyklos, saugumas, parkai, ramios gatvės" },
    userType: "family",
    priorities: ["family", "safety", "environment"],
    icon: Baby,
  },
  {
    id: "value",
    title: { en: "Best value", lt: "Geriausia vertė" },
    subtitle: { en: "Affordable housing without losing daily services", lt: "Prieinamas būstas neprarandant kasdienių paslaugų" },
    userType: "professional",
    priorities: ["affordability", "transport", "walkability"],
    icon: WalletCards,
  },
  {
    id: "student",
    title: { en: "Study and commute", lt: "Studijos ir kelionės" },
    subtitle: { en: "Budget, transport, walkable services", lt: "Biudžetas, transportas, paslaugos pėsčiomis" },
    userType: "student",
    priorities: ["affordability", "transport", "walkability"],
    icon: GraduationCap,
  },
  {
    id: "visitor",
    title: { en: "Visit the city", lt: "Aplankyti miestą" },
    subtitle: { en: "Hotels, food, nightlife, easy movement", lt: "Viešbučiai, maistas, naktinis gyvenimas, patogus judėjimas" },
    userType: "tourist",
    priorities: ["tourism", "transport", "walkability"],
    icon: Hotel,
  },
  {
    id: "invest",
    title: { en: "Invest or rent out", lt: "Investuoti / nuomoti" },
    subtitle: { en: "Demand, access, growth signals, fair prices", lt: "Paklausa, susisiekimas, augimas, protingos kainos" },
    userType: "professional",
    priorities: ["transport", "affordability", "tourism"],
    icon: BriefcaseBusiness,
  },
  {
    id: "quiet",
    title: { en: "Quiet and healthy", lt: "Ramu ir sveika" },
    subtitle: { en: "Clean air, parks, less noise, safer blocks", lt: "Švarus oras, parkai, mažiau triukšmo, saugesni kvartalai" },
    userType: "retiree",
    priorities: ["environment", "safety", "walkability"],
    icon: Leaf,
  },
];

const priorityOptions: Array<{ id: Priority; label: Record<Lang, string>; icon: typeof ShieldCheck }> = [
  { id: "safety", label: { en: "Low crime", lt: "Saugumas" }, icon: ShieldCheck },
  { id: "family", label: { en: "Schools", lt: "Mokyklos" }, icon: Baby },
  { id: "affordability", label: { en: "Fair prices", lt: "Geros kainos" }, icon: WalletCards },
  { id: "environment", label: { en: "Clean and green", lt: "Žalia aplinka" }, icon: Leaf },
  { id: "transport", label: { en: "Transit", lt: "Transportas" }, icon: Bus },
  { id: "walkability", label: { en: "Walkable", lt: "Pėsčiomis" }, icon: CheckCircle2 },
  { id: "tourism", label: { en: "Food and culture", lt: "Maistas ir kultūra" }, icon: Hotel },
];

const copy = {
  en: {
    badge: "Start here",
    title: "Find the best area for a real-life decision",
    subtitle: "Pick your situation. Cadmea turns city data into a short list with reasons, tradeoffs, and next actions.",
    goal: "What are you trying to do?",
    tune: "Tune the decision",
    city: "City",
    priorities: "Priorities",
    analyze: "Find my best areas",
    analyzing: "Analyzing",
    resultTitle: "Decision brief",
    topAreas: "Best areas for you",
    why: "Why this result",
    tradeoffs: "What to double-check",
    next: "Next action",
    map: "Open map",
    compare: "Compare",
    reset: "Start over",
    priorityLimit: "Choose up to 3. Tap a selected chip to remove it.",
    noPriority: "Choose at least one priority.",
    tradeoffText: "Visit the top area at morning and evening, check commute time, and compare rental listings before committing.",
    nextText: "Open the map to inspect overlays and nearby places, then compare your top two areas side by side.",
    source: "Uses public-data style indicators for safety, housing, air, noise, transport, schools, healthcare, parks, walkability, and tourism.",
  },
  lt: {
    badge: "Pradėk čia",
    title: "Rask geriausią vietovę realiam sprendimui",
    subtitle: "Pasirink situaciją. Cadmea paverčia miesto duomenis trumpu sąrašu su priežastimis, kompromisais ir kitu veiksmu.",
    goal: "Ką nori nuspręsti?",
    tune: "Patikslink sprendimą",
    city: "Miestas",
    priorities: "Prioritetai",
    analyze: "Rasti geriausias vietoves",
    analyzing: "Analizuoja",
    resultTitle: "Sprendimo santrauka",
    topAreas: "Geriausios vietovės tau",
    why: "Kodėl toks rezultatas",
    tradeoffs: "Ką dar patikrinti",
    next: "Kitas veiksmas",
    map: "Atidaryti žemėlapį",
    compare: "Palyginti",
    reset: "Pradėti iš naujo",
    priorityLimit: "Pasirink iki 3. Paspausk pasirinktą, kad pašalintum.",
    noPriority: "Pasirink bent vieną prioritetą.",
    tradeoffText: "Aplankyk pirmą vietovę ryte ir vakare, patikrink kelionės laiką ir palygink nuomos skelbimus prieš apsisprendžiant.",
    nextText: "Atidaryk žemėlapį sluoksniams ir vietoms patikrinti, tada palygink dvi stipriausias vietoves.",
    source: "Naudojami viešųjų duomenų tipo rodikliai: saugumas, būstas, oras, triukšmas, transportas, mokyklos, sveikata, parkai, pėsčiųjų pasiekiamumas ir turizmas.",
  },
} satisfies Record<Lang, Record<string, string>>;

export default function WizardPage() {
  const { language } = useI18n();
  const lang = language === "lt" ? "lt" : "en";
  const t = copy[lang];
  const bestMatchMutation = useAiBestMatch();
  const [selectedGoalId, setSelectedGoalId] = useState("family");
  const [city, setCity] = useState("Vilnius");
  const selectedGoal = goalPresets.find((goal) => goal.id === selectedGoalId) ?? goalPresets[0];
  const [priorities, setPriorities] = useState<Priority[]>(selectedGoal.priorities);

  const results = bestMatchMutation.data?.topDistricts ?? [];
  const winningDistrict = results[0];
  const resultSummary = useMemo(() => winningDistrict ? buildDecisionSummary(winningDistrict, priorities, lang) : null, [lang, priorities, winningDistrict]);

  const chooseGoal = (goal: GoalPreset) => {
    setSelectedGoalId(goal.id);
    setPriorities(goal.priorities);
    bestMatchMutation.reset();
  };

  const togglePriority = (priority: Priority) => {
    bestMatchMutation.reset();
    setPriorities((current) => {
      if (current.includes(priority)) return current.filter((item) => item !== priority);
      if (current.length >= 3) return [...current.slice(1), priority];
      return [...current, priority];
    });
  };

  const runDecision = () => {
    if (!priorities.length) return;
    bestMatchMutation.mutate({
      data: {
        userType: selectedGoal.userType,
        city: city === "any" ? "any" : city,
        priorities,
        language: language as BestMatchInputLanguage,
      },
    });
  };

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <Badge variant="secondary" className="mb-3 gap-2 rounded-md bg-cyan-500/10 px-3 py-1.5 text-cyan-700 dark:text-cyan-300">
              <Sparkles className="h-4 w-4" />
              {t.badge}
            </Badge>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{t.subtitle}</p>
          </div>
          <Card className="border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/30">
            <div className="text-sm font-black text-cyan-900 dark:text-cyan-100">{t.source}</div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-5">
            <Card className="p-4 md:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <Wand2 className="h-4 w-4" />
                {t.goal}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {goalPresets.map((goal) => {
                  const Icon = goal.icon;
                  const selected = selectedGoalId === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => chooseGoal(goal)}
                      className={`min-h-32 rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-cyan-400 bg-cyan-50 shadow-sm dark:border-cyan-700 dark:bg-cyan-950/40"
                          : "border-border bg-card hover:border-cyan-300 hover:bg-muted/40"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected ? "bg-cyan-500 text-white" : "bg-muted text-foreground"}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        {selected && <CheckCircle2 className="h-5 w-5 text-cyan-600" />}
                      </div>
                      <div className="font-black">{goal.title[lang]}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{goal.subtitle[lang]}</p>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4 md:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                {t.tune}
              </div>
              <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                <div>
                  <div className="mb-2 text-sm font-bold">{t.city}</div>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                    {["Vilnius", "Kaunas", "Klaipėda", "any"].map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={city === option ? "default" : "outline"}
                        className="h-11 justify-start rounded-md"
                        onClick={() => {
                          setCity(option);
                          bestMatchMutation.reset();
                        }}
                      >
                        {option === "any" ? (lang === "lt" ? "Visa Lietuva" : "Any city") : option}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm font-bold">{t.priorities}</div>
                    <div className="text-xs text-muted-foreground">{priorities.length}/3</div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {priorityOptions.map((priority) => {
                      const Icon = priority.icon;
                      const selected = priorities.includes(priority.id);
                      return (
                        <button
                          key={priority.id}
                          type="button"
                          onClick={() => togglePriority(priority.id)}
                          className={`flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm font-bold transition ${
                            selected
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{priority.label[lang]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{t.priorityLimit}</p>
                </div>
              </div>
            </Card>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden">
              <div className="border-b bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                <div className="text-xs font-bold uppercase text-cyan-200 dark:text-cyan-700">{selectedGoal.title[lang]}</div>
                <div className="mt-2 text-2xl font-black">{t.resultTitle}</div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
                    <span>{t.priorities}</span>
                    <span>{priorities.length}/3</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {priorities.length ? priorities.map((priority) => (
                      <Badge key={priority} variant="secondary" className="rounded-md">
                        {priorityOptions.find((option) => option.id === priority)?.label[lang] ?? priority}
                      </Badge>
                    )) : <span className="text-sm text-destructive">{t.noPriority}</span>}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="h-12 w-full rounded-md"
                  disabled={bestMatchMutation.isPending || priorities.length === 0}
                  onClick={runDecision}
                  data-testid="btn-find-match"
                >
                  {bestMatchMutation.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t.analyzing}</>
                  ) : (
                    <><Wand2 className="mr-2 h-5 w-5" /> {t.analyze}</>
                  )}
                </Button>

                {resultSummary && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">#1 {lang === "lt" ? "rekomendacija" : "recommendation"}</div>
                      <div className="mt-1 text-lg font-black">{lang === "lt" ? winningDistrict.nameLt || winningDistrict.name : winningDistrict.name}</div>
                      <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">{resultSummary}</p>
                    </div>

                    <div className="rounded-xl border bg-muted/30 p-4">
                      <div className="mb-2 text-sm font-black">{t.why}</div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{bestMatchMutation.data?.reasoning}</p>
                    </div>

                    <DecisionMini title={t.tradeoffs} body={t.tradeoffText} />
                    <DecisionMini title={t.next} body={t.nextText} />

                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/map">
                        <Button variant="default" className="w-full rounded-md">
                          <Map className="mr-2 h-4 w-4" />
                          {t.map}
                        </Button>
                      </Link>
                      <Link href="/compare">
                        <Button variant="outline" className="w-full rounded-md">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          {t.compare}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </aside>
        </div>

        {results.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">{t.topAreas}</h2>
              <Button variant="ghost" className="rounded-md" onClick={() => bestMatchMutation.reset()}>
                {t.reset}
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {results.map((district, index) => (
                <motion.div key={district.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                  <div className="relative">
                    {index === 0 && (
                      <div className="absolute -right-2 -top-2 z-10 rounded-md bg-amber-500 px-3 py-1 text-xs font-black text-white shadow-lg">
                        #1
                      </div>
                    )}
                    <ScoreCard district={district} className={index === 0 ? "border-cyan-400 ring-1 ring-cyan-300" : ""} />
                    <div className="mt-2 rounded-lg border bg-card p-3">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold">
                        <span>{lang === "lt" ? "Atitikimas" : "Fit"}</span>
                        <span>{district.overallScore.toFixed(1)}</span>
                      </div>
                      <Progress value={district.overallScore * 10} className="h-2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

function DecisionMini({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm font-black">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        {title}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function buildDecisionSummary(district: DistrictDetail, priorities: Priority[], language: Lang) {
  const scoreLabels: Record<Priority, Record<Lang, string>> = {
    safety: { en: "safety", lt: "saugumas" },
    family: { en: "family fit", lt: "šeimos patogumas" },
    affordability: { en: "affordability", lt: "prieinamumas" },
    environment: { en: "environment", lt: "aplinka" },
    transport: { en: "transport", lt: "transportas" },
    tourism: { en: "tourism", lt: "turizmas" },
    walkability: { en: "walkability", lt: "pėsčiųjų pasiekiamumas" },
  };
  const scores = district.scores ?? {
    safety: district.overallScore,
    family: district.overallScore,
    affordability: district.overallScore,
    environment: district.overallScore,
    transport: district.overallScore,
    tourism: district.overallScore,
    walkability: district.overallScore,
  };
  return priorities.map((priority) => `${scoreLabels[priority][language]} ${scores[priority].toFixed(1)}`).join(", ");
}
