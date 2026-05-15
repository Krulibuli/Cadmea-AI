import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";
import NotFound from "@/pages/not-found";

// Import pages
import Home from "@/pages/home";
import MapPage from "@/pages/map";
import DistrictsPage from "@/pages/districts";
import DistrictDetailPage from "@/pages/district-detail";
import ComparePage from "@/pages/compare";
import TouristPage from "@/pages/tourist";
import WizardPage from "@/pages/wizard";
import SportsMapPage from "@/pages/sports-map";
import SportsDisciplinesPage from "@/pages/sports-disciplines";
import SportsFacilityDetailPage from "@/pages/sports-facility-detail";
import SportsOperatorPage from "@/pages/sports-operator";
import BusinessPage from "@/pages/business";
import AdminPage from "@/pages/admin";
import DemandRadarPage from "@/pages/demand-radar";
import RequestsPage from "@/pages/requests";
import ForumPage from "@/pages/forum";

const queryClient = new QueryClient();
const ADMIN_PASSWORD = "Vilnius321*";
const ADMIN_SESSION_KEY = "cadmea-admin-session";

interface AdminAuthProps {
  isAdmin: boolean;
  adminPassword: string;
  adminError: string;
  setAdminPassword: (value: string) => void;
  login: () => void;
  logout: () => void;
}

function Layout({ children, auth }: { children: React.ReactNode; auth: AdminAuthProps }) {
  const [location] = useLocation();
  const immersive = location === "/sports/map" || location === "/map" || location === "/tourist";
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar {...auth} />
      <main className="relative flex flex-1 flex-col pb-24 lg:pb-0">{children}</main>
      {!immersive && <Footer />}
    </div>
  );
}

function AdminGate({ auth, children }: { auth: AdminAuthProps; children: React.ReactNode }) {
  if (auth.isAdmin) return <>{children}</>;

  return (
    <div className="bg-grid">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
        <Card className="w-full">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-foreground">Administratoriaus zona</h1>
                <p className="text-sm text-muted-foreground">Paklausos radaras, apžvalga ir planavimo sprendimai skirti savivaldybei.</p>
              </div>
            </div>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                auth.login();
              }}
            >
              <Input
                type="password"
                value={auth.adminPassword}
                onChange={(event) => auth.setAdminPassword(event.target.value)}
                placeholder="Admin slaptažodis"
                autoComplete="current-password"
              />
              {auth.adminError && <p className="text-sm font-semibold text-destructive">{auth.adminError}</p>}
              <Button type="submit" className="w-full font-semibold">Prisijungti</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProtectedRoute({ auth, children }: { auth: AdminAuthProps; children: React.ReactNode }) {
  return <AdminGate auth={auth}>{children}</AdminGate>;
}

function Router({ auth }: { auth: AdminAuthProps }) {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sports/map" component={SportsMapPage} />
      <Route path="/sports/disciplines">{() => <ProtectedRoute auth={auth}><SportsDisciplinesPage /></ProtectedRoute>}</Route>
      <Route path="/sports/operator">{() => <ProtectedRoute auth={auth}><SportsOperatorPage /></ProtectedRoute>}</Route>
      <Route path="/sports/facility/:id" component={SportsFacilityDetailPage} />
      <Route path="/sports/demand">{() => <ProtectedRoute auth={auth}><DemandRadarPage /></ProtectedRoute>}</Route>
      <Route path="/sports/requests">{() => <ProtectedRoute auth={auth}><RequestsPage /></ProtectedRoute>}</Route>
      <Route path="/forum" component={ForumPage} />
      <Route path="/demand-radar">{() => <ProtectedRoute auth={auth}><DemandRadarPage /></ProtectedRoute>}</Route>
      <Route path="/requests">{() => <ProtectedRoute auth={auth}><RequestsPage /></ProtectedRoute>}</Route>
      <Route path="/business">{() => <ProtectedRoute auth={auth}><BusinessPage /></ProtectedRoute>}</Route>
      <Route path="/admin">{() => <ProtectedRoute auth={auth}><AdminPage /></ProtectedRoute>}</Route>
      <Route path="/map" component={MapPage} />
      <Route path="/districts" component={DistrictsPage} />
      <Route path="/districts/:id" component={DistrictDetailPage} />
      <Route path="/compare" component={ComparePage} />
      <Route path="/tourist" component={TouristPage} />
      <Route path="/wizard" component={WizardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    setIsAdmin(localStorage.getItem(ADMIN_SESSION_KEY) === "true");
  }, []);

  const auth: AdminAuthProps = {
    isAdmin,
    adminPassword,
    adminError,
    setAdminPassword: (value) => {
      setAdminPassword(value);
      setAdminError("");
    },
    login: () => {
      if (adminPassword === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
        setIsAdmin(true);
        setAdminPassword("");
        setAdminError("");
        return;
      }
      setAdminError("Neteisingas slaptažodis.");
    },
    logout: () => {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setIsAdmin(false);
      setAdminPassword("");
      setAdminError("");
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout auth={auth}>
            <Router auth={auth} />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
