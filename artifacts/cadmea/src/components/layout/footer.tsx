import { Radar } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { language } = useI18n();
  const subtitle = language === "lt" ? "Miesto AI įžvalgos" : "Urban AI Intelligence";
  const copyright = language === "lt"
    ? `Autorių teisės ${new Date().getFullYear()} Cadmea. Skaidrios viešųjų duomenų miesto įžvalgos.`
    : `Copyright ${new Date().getFullYear()} Cadmea. Transparent public-data city intelligence.`;

  return (
    <footer className="border-t bg-background/50 py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Radar className="h-5 w-5 text-cyan-500" />
          <span className="font-medium">Cadmea</span>
          <span className="ml-2 border-l pl-2 text-sm">{subtitle}</span>
        </div>
        <p className="text-sm text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  );
}
