import { useState } from "react";
import { useListDistricts, useGetPlatformSummary } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";
import { ScoreCard } from "@/components/districts/score-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowDownAZ } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function DistrictsPage() {
  const { language } = useI18n();
  const isLt = language === "lt";
  const { data: districts, isLoading } = useListDistricts();
  const { data: summary } = useGetPlatformSummary();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score-desc");

  const cities = summary ? Array.from(new Set(districts?.map(d => d.city) || [])).filter(Boolean) : ["Vilnius", "Kaunas", "Klaipėda"];

  const filteredDistricts = districts
    ?.filter((d) => {
      const name = language === "lt" ? d.nameLt : d.name;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === "all" || d.city === cityFilter;
      return matchesSearch && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === "score-desc") return b.overallScore - a.overallScore;
      if (sortBy === "score-asc") return a.overallScore - b.overallScore;
      const nameA = language === "lt" ? a.nameLt : a.name;
      const nameB = language === "lt" ? b.nameLt : b.name;
      if (sortBy === "name-asc") return nameA.localeCompare(nameB);
      if (sortBy === "name-desc") return nameB.localeCompare(nameA);
      return 0;
    });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{isLt ? "Rajonų naršyklė" : "District Explorer"}</h1>
          <p className="text-muted-foreground text-lg">{isLt ? "Naršyk ir analizuok rajonus Lietuvoje" : "Browse and analyze all districts across Lithuania"}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isLt ? "Ieškoti rajonų..." : "Search districts..."}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-districts"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-city">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={isLt ? "Miestas" : "City"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isLt ? "Visi miestai" : "All Cities"}</SelectItem>
              {cities.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]" data-testid="select-sort">
              <ArrowDownAZ className="w-4 h-4 mr-2" />
              <SelectValue placeholder={isLt ? "Rikiuoti" : "Sort"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score-desc">{isLt ? "Aukščiausias balas" : "Highest Score"}</SelectItem>
              <SelectItem value="score-asc">{isLt ? "Žemiausias balas" : "Lowest Score"}</SelectItem>
              <SelectItem value="name-asc">{isLt ? "Pavadinimas (A-Ž)" : "Name (A-Z)"}</SelectItem>
              <SelectItem value="name-desc">{isLt ? "Pavadinimas (Ž-A)" : "Name (Z-A)"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5 h-48 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-12 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full mt-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDistricts?.map((district, i) => (
            <motion.div
              key={district.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }}
            >
              <ScoreCard district={district} />
            </motion.div>
          ))}
          {filteredDistricts?.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">{isLt ? "Rajonų nerasta" : "No districts found"}</h3>
              <p>{isLt ? "Pabandyk pakeisti paiešką arba filtrus." : "Try adjusting your search or filters."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
