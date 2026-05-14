import { District, DistrictScores } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";
import { getScoreBgColor } from "@/lib/score-color";
import { ScoreRadar } from "./score-radar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";
import { Link } from "wouter";

interface ScoreCardProps {
  district: District;
  scores?: DistrictScores;
  onClick?: () => void;
  className?: string;
}

export function ScoreCard({ district, scores, onClick, className = "" }: ScoreCardProps) {
  const { language } = useI18n();
  const name = language === "lt" ? district.nameLt || district.name : district.name;
  const desc = language === "lt" ? district.descriptionLt || district.description : district.description;
  const bgColor = getScoreBgColor(district.overallScore);

  const inner = (
    <Card className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${className}`} onClick={onClick}>
      <div className="p-5 flex flex-col h-full gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold truncate pr-2">{name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {district.city}
            </div>
          </div>
          <Badge className={`text-base font-bold px-3 py-1 border-0 shadow-none ${bgColor}`} variant="outline">
            {district.overallScore.toFixed(1)}
          </Badge>
        </div>

        {desc && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
            {desc}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
          {district.population && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {(district.population / 1000).toFixed(1)}k
            </div>
          )}
          {district.areaKm2 && (
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 border rounded-sm flex items-center justify-center border-current font-mono text-[8px] leading-none">km2</div>
              {district.areaKm2.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (onClick) return inner;
  return <Link href={`/districts/${district.id}`}>{inner}</Link>;
}
