import { Link } from "wouter";
import { ArrowRight, Building2, Compass, Map, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForumSummary } from "@/lib/forum-api";
import { formatInt, useSportsSummary } from "@/lib/sports-api";

export default function Home() {
  const sports = useSportsSummary();
  const forum = useForumSummary();

  return (
    <div className="bg-grid">
      <section className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center px-4 py-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)]">
          <div className="flex min-w-0 flex-col justify-center">
            <Badge variant="outline" className="mb-4 w-fit border-primary/40 bg-primary/10 text-primary font-semibold">
              <Sparkles className="mr-1.5 h-3 w-3" />
              Cadmea
            </Badge>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
              Miesto sporto objektai ir gyventojų idėjos vienoje vietoje.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Pradėkite nuo viešo objektų žemėlapio arba eikite į forumą, kur gyventojai gali siūlyti vietas, pranešti problemas ir balsuoti už poreikius.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href="/sports/map">
                <Button size="lg" className="h-14 w-full justify-between rounded-md px-5 text-base font-extrabold">
                  <span className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Tęsti į žemėlapį
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/forum">
                <Button size="lg" variant="outline" className="h-14 w-full justify-between rounded-md px-5 text-base font-extrabold">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Eiti į forumą
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/map">
                <Button variant="ghost" size="sm" className="rounded-md font-semibold">
                  <Compass className="mr-1.5 h-4 w-4" />
                  Miesto žemėlapis
                </Button>
              </Link>
              <Link href="/districts">
                <Button variant="ghost" size="sm" className="rounded-md font-semibold">
                  <Building2 className="mr-1.5 h-4 w-4" />
                  Vietovės
                </Button>
              </Link>
            </div>
          </div>

          <Card className="self-center">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vieša pradžia</p>
                  <h2 className="mt-1 text-xl font-extrabold text-foreground">Ką galima daryti?</h2>
                </div>
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>

              <div className="grid gap-3">
                <div className="rounded-md border border-border bg-muted/25 p-4">
                  <p className="text-sm font-extrabold text-foreground">Peržiūrėti objektus</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Žemėlapyje matomi sporto objektai, filtrai ir užimtumo spalvos.
                  </p>
                </div>
                <div className="rounded-md border border-border bg-muted/25 p-4">
                  <p className="text-sm font-extrabold text-foreground">Dalyvauti forume</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gyventojai gali kelti idėjas, problemas ir poreikius rajonuose.
                  </p>
                </div>
                <div className="rounded-md border border-border bg-muted/25 p-4">
                  <p className="text-sm font-extrabold text-foreground">Miesto kontekstas</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Miesto žemėlapis, sprendimo vedlys, vietos, vietovės ir palyginimai lieka vieši.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-card p-3">
                  <p className="text-lg font-extrabold">{formatInt(sports.data?.totalFacilities ?? 0)}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Objektai</p>
                </div>
                <div className="rounded-md bg-card p-3">
                  <p className="text-lg font-extrabold">{sports.data?.districtsCovered ?? 0}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Rajonai</p>
                </div>
                <div className="rounded-md bg-card p-3">
                  <p className="text-lg font-extrabold">{forum.data?.visiblePosts ?? 0}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Forumas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
