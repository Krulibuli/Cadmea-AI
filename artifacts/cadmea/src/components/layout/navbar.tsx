import { Link, useLocation } from "wouter";
import { Radar, Map as MapIcon, Building2, GitCompare, Compass, Wand2, Moon, Sun, Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/hooks/use-theme";

export function Navbar() {
  const [location] = useLocation();
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "lt" : "en");
  };

  const navItems = [
    { href: "/wizard", label: t("nav.wizard"), icon: Wand2 },
    { href: "/map", label: t("nav.map"), icon: MapIcon },
    { href: "/tourist", label: t("nav.tourist"), icon: Compass },
    { href: "/districts", label: t("nav.districts"), icon: Building2 },
    { href: "/compare", label: t("nav.compare"), icon: GitCompare },
  ];
  const exploreLabel = language === "lt" ? "Rasti vietą" : "Find my area";
  const subtitle = language === "lt" ? "Lietuvos AI žemėlapis" : "Lithuania AI map";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/88 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-slate-950 p-2 rounded-lg shadow-lg shadow-cyan-500/15 transition-colors group-hover:bg-cyan-600 dark:bg-white">
              <Radar className="w-5 h-5 text-cyan-300 dark:text-slate-950" />
            </div>
            <div className="leading-tight">
              <span className="block text-xl font-black tracking-tight text-foreground">Cadmea</span>
              <span className="hidden text-[10px] font-bold uppercase text-muted-foreground sm:block">{subtitle}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (location === "/" && item.href === "/wizard");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                    isActive ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/wizard" className="hidden sm:block">
              <Button size="sm" className="rounded-md">
                <Sparkles className="mr-2 h-4 w-4" />
                {exploreLabel}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleLanguage} data-testid="btn-toggle-lang" title="Toggle Language">
              <Languages className="w-4 h-4" />
              <span className="sr-only">Language</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="btn-toggle-theme" title="Toggle Theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="sr-only">Theme</span>
            </Button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-slate-200/80 bg-white/94 p-1.5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/94 md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location === "/" && item.href === "/wizard");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-black transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
