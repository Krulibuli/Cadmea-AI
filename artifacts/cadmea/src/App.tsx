import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const immersive = location === "/map" || location === "/tourist";
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="relative flex flex-1 flex-col pb-24 lg:pb-0">{children}</main>
      {!immersive && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sports/map" component={SportsMapPage} />
      <Route path="/sports/disciplines" component={SportsDisciplinesPage} />
      <Route path="/sports/operator" component={SportsOperatorPage} />
      <Route path="/sports/facility/:id" component={SportsFacilityDetailPage} />
      <Route path="/business" component={BusinessPage} />
      <Route path="/admin" component={AdminPage} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
