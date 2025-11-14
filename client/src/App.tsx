import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Matches from "@/pages/Matches";
import MatchDetail from "@/pages/MatchDetail";
import Teams from "@/pages/Teams";
import Players from "@/pages/Players";
import Leaderboards from "@/pages/Leaderboards";
import News from "@/pages/News";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  useWebSocket();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={Settings} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          
          {/* Public Routes */}
          <Route path="/matches" component={Matches} />
          <Route path="/matches/:id" component={MatchDetail} />
          <Route path="/teams" component={Teams} />
          <Route path="/players" component={Players} />
          <Route path="/leaderboards" component={Leaderboards} />
          <Route path="/news" component={News} />
          
          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
