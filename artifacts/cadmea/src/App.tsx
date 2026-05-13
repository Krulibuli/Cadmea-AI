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

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const immersive = location === "/" || location === "/map" || location === "/tourist";
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="relative flex flex-1 flex-col pb-24 md:pb-0">{children}</main>
      {!immersive && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
