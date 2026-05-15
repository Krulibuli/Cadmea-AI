import { useState } from "react";
import { useCompareDistricts, useListDistricts, District, DistrictDetail } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Plus, X, GitCompare, MapPin, Loader2, Sparkles } from "lucide-react";
import { ScoreBar } from "@/components/districts/score-bar";
import { ScoreRadar } from "@/components/districts/score-radar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getScoreBgColor } from "@/lib/score-color";

export default function ComparePage() {
  const { language } = useI18n();
  const { data: allDistricts } = useListDistricts();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const compareMutation = useCompareDistricts();
  const results = compareMutation.data;

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id) || selectedIds.length >= 4) return;
    setSelectedIds([...selectedIds, id]);
  };

  const handleRemove = (id: number) => {
    const nextSelectedIds = selectedIds.filter((x) => x !== id);
    setSelectedIds(nextSelectedIds);
    if (nextSelectedIds.length < 2) {
      compareMutation.reset();
    }
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      compareMutation.mutate({ data: { districtIds: selectedIds } });
    }
  };

  const getName = (d: District | DistrictDetail) => language === "lt" ? d.nameLt || d.name : d.name;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 flex flex-col">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 text-sm font-medium">
          <GitCompare className="w-4 h-4" />
          <span>Head-to-Head Comparison</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Compare Districts</h1>
        <p className="text-muted-foreground text-lg">
          Select up to 4 districts to compare their livability scores side by side.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <AnimatePresence>
            {selectedIds.map((id) => {
              const d = allDistricts?.find((x) => x.id === id);
              if (!d) return null;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-card border rounded-full pl-4 pr-1 py-1 flex items-center gap-3 shadow-sm"
                >
                  <span className="font-medium text-sm">{getName(d)}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(id)} className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {selectedIds.length < 4 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={(val) => handleSelect(Number(val))} value="">
                <SelectTrigger className="w-[200px] rounded-full border-dashed bg-muted/30">
                  <Plus className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Add district..." />
                </SelectTrigger>
                <SelectContent>
                  {allDistricts
                    ?.filter((d) => !selectedIds.includes(d.id))
                    .sort((a, b) => getName(a).localeCompare(getName(b)))
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {getName(d)} <span className="text-muted-foreground text-xs ml-2">({d.city})</span>
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button 
          size="lg" 
          onClick={handleCompare} 
          disabled={selectedIds.length < 2 || compareMutation.isPending}
          className="rounded-full px-8 shadow-md"
          data-testid="btn-run-compare"
        >
          {compareMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitCompare className="w-4 h-4 mr-2" />}
          Compare Selected ({selectedIds.length}/4)
        </Button>
      </div>

      {results && results.length >= 2 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {results.map((district, i) => {
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
            <Card key={district.id} className="overflow-hidden border-2 flex flex-col">
              <div className="p-6 border-b bg-muted/10 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4 shadow-sm ${getScoreBgColor(district.overallScore)}`}>
                  {district.overallScore.toFixed(1)}
                </div>
                <h3 className="text-xl font-bold mb-1">{getName(district)}</h3>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> {district.city}
                </div>
              </div>
              
              <div className="p-6 border-b">
                <ScoreRadar scores={scores} color={`var(--chart-${(i % 5) + 1})`} />
              </div>

              <div className="p-6 flex flex-col gap-5 flex-1 bg-card">
                <ScoreBar label="Safety" score={scores.safety} delay={0.1} />
                <ScoreBar label="Family" score={scores.family} delay={0.2} />
                <ScoreBar label="Affordability" score={scores.affordability} delay={0.3} />
                <ScoreBar label="Environment" score={scores.environment} delay={0.4} />
                <ScoreBar label="Transport" score={scores.transport} delay={0.5} />
                <ScoreBar label="Tourism" score={scores.tourism} delay={0.6} />
                <ScoreBar label="Walkability" score={scores.walkability} delay={0.7} />
              </div>
            </Card>
            );
          })}
        </motion.div>
      )}

      {selectedIds.length === 0 && !results && (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center text-muted-foreground border-2 border-dashed rounded-3xl p-12 max-w-md w-full">
            <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No districts selected</h3>
            <p className="text-sm">Select at least two districts above to see their detailed comparison.</p>
          </div>
        </div>
      )}
    </div>
  );
}
