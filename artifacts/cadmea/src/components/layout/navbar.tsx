import { Link, useLocation } from "wouter";
import {
  Activity, Map as MapIcon, BarChart3, Settings2, ChevronDown,
  Building2, GitCompare, Compass, Wand2, Moon, Sun, Languages, Sparkles,
  Wallet, Shield, Radar, MessageSquare, LogOut, Lock, MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/hooks/use-theme";

interface NavbarProps {
  isAdmin: boolean;
  adminPassword: string;
  adminError: string;
  setAdminPassword: (value: string) => void;
  login: () => void;
  logout: () => void;
}

export function Navbar({ isAdmin, adminPassword, adminError, setAdminPassword, login, logout }: NavbarProps) {
  const [location] = useLocation();
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => setLanguage(language === "en" ? "lt" : "en");

  const sportsItems = [
    { href: "/sports/map", label: t("nav.sports.facilities"), icon: MapPinned },
    { href: "/forum", label: t("nav.forum"), icon: MessageSquare },
  ];

  const adminItems = [
    { href: "/admin", label: t("nav.admin"), icon: Shield },
    { href: "/sports/demand", label: t("nav.sports.demand"), icon: Radar },
    { href: "/sports/requests", label: t("nav.sports.requests"), icon: MessageSquare },
    { href: "/sports/disciplines", label: t("nav.sports.disciplines"), icon: BarChart3 },
    { href: "/sports/operator", label: t("nav.sports.operator"), icon: Settings2 },
    { href: "/business", label: t("nav.business"), icon: Wallet },
  ];

  const urbanItems = [
    { href: "/map", label: t("nav.map"), icon: MapIcon },
    { href: "/wizard", label: t("nav.wizard"), icon: Wand2 },
    { href: "/tourist", label: t("nav.tourist"), icon: Compass },
    { href: "/districts", label: t("nav.districts"), icon: Building2 },
    { href: "/compare", label: t("nav.compare"), icon: GitCompare },
  ];

  const isUrbanRoute = urbanItems.some((i) => location.startsWith(i.href));
  const isAdminRoute = adminItems.some((i) => location.startsWith(i.href)) || isUrbanRoute;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-primary p-2 rounded-md shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="block text-base sm:text-lg font-extrabold tracking-tight text-foreground">
                {t("brand.title")}
              </span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("brand.subtitle")}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            {sportsItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isUrbanRoute ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("nav.urban")}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("nav.urban")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {urbanItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                      isAdminRoute && !isUrbanRoute ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Administratoriams
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Planavimas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href="/forum" className="hidden sm:block">
              <Button size="sm" className="rounded-md font-semibold">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Forumas
              </Button>
            </Link>
            <form
              className="hidden xl:flex items-center gap-1"
              onSubmit={(event) => {
                event.preventDefault();
                isAdmin ? logout() : login();
              }}
            >
              {!isAdmin && (
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="Admin slaptažodis"
                  className={`h-9 w-40 ${adminError ? "border-destructive" : ""}`}
                  autoComplete="current-password"
                />
              )}
              <Button type="submit" variant={isAdmin ? "outline" : "secondary"} size="sm" className="rounded-md font-semibold">
                {isAdmin ? <LogOut className="mr-1.5 h-4 w-4" /> : <Lock className="mr-1.5 h-4 w-4" />}
                {isAdmin ? "Atsijungti" : "Admin"}
              </Button>
            </form>
            <Link href="/admin" className="xl:hidden">
              <Button variant="ghost" size="icon" title="Admin">
                <Shield className="w-4 h-4" />
                <span className="sr-only">Admin</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleLanguage} title="Toggle Language">
              <Languages className="w-4 h-4" />
              <span className="sr-only">Language</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="sr-only">Theme</span>
            </Button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
        <div className={`grid gap-1 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
          {[...sportsItems, { href: "/map", label: t("nav.map"), icon: MapIcon }, ...(isAdmin ? [{ href: "/admin", label: t("nav.admin"), icon: Shield }] : [])].map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-bold transition ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
