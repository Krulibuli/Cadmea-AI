import { Shield, Database, RefreshCcw, Users, Activity, FileDown, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSportsSummary } from "@/lib/sports-api";

export default function AdminPage() {
  const { t, language } = useI18n();
  const summary = useSportsSummary();
  const s = summary.data;

  const apiBase = `${window.location.origin}/api/integrations/active-vilnius`;

  return (
    <div className="bg-grid">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
            {language === "lt" ? "Skaitoma" : "Read-only preview"}
          </Badge>
        </div>

        <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <p className="text-sm text-foreground">{t("admin.authNote")}</p>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "lt" ? "Iš viso objektų" : "Facilities"}
                </p>
                <Database className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-2xl font-extrabold">{s?.totalFacilities ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "lt" ? "Miesto valdomi" : "City-managed"}
                </p>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-2xl font-extrabold">{s?.managedFacilities ?? "—"}</p>
              <p className="text-xs text-muted-foreground">+{s?.plannedFacilities ?? 0} planned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "lt" ? "Aktyvūs naudotojai" : "Active residents"}
                </p>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-2xl font-extrabold">—</p>
              <p className="text-xs text-muted-foreground">{language === "lt" ? "Auth dar neįjungtas" : "Auth not wired"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "lt" ? "Rajonai" : "Districts"}
                </p>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-2xl font-extrabold">{s?.districtsCovered ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <RefreshCcw className="w-4 h-4 text-primary" />
                {language === "lt" ? "Duomenų atnaujinimas" : "Data refresh"}
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Open Vilnius API</span>
                  <Badge variant="secondary" className="text-[10px]">{language === "lt" ? "Pasiruošta" : "Ready"}</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vilnius GIS overlay</span>
                  <Badge variant="secondary" className="text-[10px]">Ready</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">ActiveVilnius webhook</span>
                  <Badge variant="outline" className="text-[10px]">{language === "lt" ? "Laukia partnerystės" : "Pending partner"}</Badge>
                </li>
              </ul>
              <Button size="sm" disabled className="mt-3 w-full">
                <RefreshCcw className="w-4 h-4 mr-1.5" />
                {language === "lt" ? "Atnaujinti dabar" : "Refresh now"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                <FileDown className="w-4 h-4 text-primary" />
                {language === "lt" ? "Eksportas partneriams" : "Partner exports"}
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground truncate">JSON catalogue</span>
                  <a
                    href={`${apiBase}/export.json`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    Download →
                  </a>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground truncate">CSV catalogue</span>
                  <a
                    href={`${apiBase}/export.csv`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    Download →
                  </a>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground truncate">Sample widget</span>
                  <a
                    href={`${apiBase}/widget/facility/mgd-lazdynu-swimming-pool`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    Open →
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground italic">
                {language === "lt"
                  ? "Specifikacija: docs/activevilnius-integration.md"
                  : "Spec: docs/activevilnius-integration.md"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
