import { Activity, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSportsMeta } from "@/lib/sports-api";

export function Footer() {
  const { language, t } = useI18n();
  const { data: meta } = useSportsMeta();
  const subtitle = t("brand.subtitle");
  const copyright = language === "lt"
    ? `© ${new Date().getFullYear()} Cadmea. Skaidrūs atvirų duomenų rodikliai.`
    : `© ${new Date().getFullYear()} Cadmea. Transparent open-data analytics.`;

  return (
    <footer className="border-t border-border bg-card/40 py-10 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="bg-primary p-1.5 rounded">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-extrabold">{t("brand.title")}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">{subtitle}</p>
            <p className="mt-4 text-xs text-muted-foreground">{copyright}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold text-foreground mb-3">{t("section.dataSources")}</h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              {(meta?.dataSources ?? []).map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground italic">
              {t("label.estimate")}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
