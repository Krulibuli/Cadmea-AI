import { useParams, Link } from "wouter";
import { useGetDistrict, getGetDistrictQueryKey } from "@workspace/api-client-react";
import { ScoreRadar } from "@/components/districts/score-radar";
import { ScoreBar } from "@/components/districts/score-bar";
import { MapView } from "@/components/map/map-view";
import { useI18n } from "@/lib/i18n";
import { getScoreBgColor } from "@/lib/score-color";
import { ArrowLeft, MapPin, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DistrictDetailPage() {
  const { id } = useParams<{ id: string }>();
  const districtId = Number(id);
  const { language } = useI18n();
  const isLt = language === "lt";

  const { data: district, isLoading } = useGetDistrict(districtId, {
    query: { enabled: !!districtId, queryKey: getGetDistrictQueryKey(districtId) }
  });

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">{isLt ? "Kraunama..." : "Loading..."}</div>;
  }

  if (!district) {
    return <div className="flex-1 flex items-center justify-center">{isLt ? "Rajonas nerastas." : "District not found."}</div>;
  }

  const name = language === "lt" ? district.nameLt || district.name : district.name;
  const desc = language === "lt" ? district.descriptionLt || district.description : district.description;
  const highlights = language === "lt" ? district.highlightsLt : district.highlights;
  const scores = district.scores ?? {
    districtId: district.id,
    safety: district.overallScore,
    family: district.overallScore,
    affordability: district.overallScore,
    environment: district.overallScore,
    transport: district.overallScore,
    tourism: district.overallScore,
    walkability: district.overallScore,
    overall: district.overallScore,
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/districts" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> {isLt ? "Grįžti į rajonus" : "Back to Districts"}
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{name}</h1>
            <div className="flex items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {district.city}</div>
              {district.population && <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {(district.population / 1000).toFixed(1)}k {isLt ? "gyventojų" : "residents"}</div>}
            </div>
            {desc && (
              <p className="text-lg leading-relaxed mb-8">{desc}</p>
            )}
            
            <div className="bg-card border rounded-2xl p-6 shadow-sm mb-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> {isLt ? "Svarbiausi privalumai" : "Key Highlights"}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights?.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="w-full md:w-[400px] shrink-0 bg-card border rounded-3xl p-8 shadow-sm flex flex-col items-center">
            <div className="text-center mb-6">
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{isLt ? "Bendras balas" : "Overall Score"}</div>
              <div className={`text-6xl font-black ${getScoreBgColor(district.overallScore).split(' ')[1]} mb-2`}>
                {district.overallScore.toFixed(1)}
              </div>
            </div>
            
            <div className="w-full mb-8">
              <ScoreRadar scores={scores} />
            </div>

            <div className="w-full space-y-5">
              <ScoreBar label={isLt ? "Saugumas" : "Safety"} score={scores.safety} delay={0.1} />
              <ScoreBar label={isLt ? "Šeimai" : "Family"} score={scores.family} delay={0.2} />
              <ScoreBar label={isLt ? "Prieinamumas" : "Affordability"} score={scores.affordability} delay={0.3} />
              <ScoreBar label={isLt ? "Aplinka" : "Environment"} score={scores.environment} delay={0.4} />
              <ScoreBar label={isLt ? "Transportas" : "Transport"} score={scores.transport} delay={0.5} />
              <ScoreBar label={isLt ? "Turizmas" : "Tourism"} score={scores.tourism} delay={0.6} />
              <ScoreBar label={isLt ? "Pėsčiomis" : "Walkability"} score={scores.walkability} delay={0.7} />
            </div>
            
            <Link href="/compare" className="w-full mt-8">
              <Button variant="outline" className="w-full">{isLt ? "Palyginti su kitais" : "Compare with others"}</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full border-t">
        <MapView 
          districts={[district]} 
          activeDistrictId={district.id} 
          center={[district.lat, district.lng]} 
          zoom={14} 
        />
      </div>
    </div>
  );
}
