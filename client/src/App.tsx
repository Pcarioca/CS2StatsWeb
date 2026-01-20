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
import TeamDetail from "@/pages/TeamDetail";
import Teams from "@/pages/Teams";
import PlayerDetail from "@/pages/PlayerDetail";
import Players from "@/pages/Players";
import Leaderboards from "@/pages/Leaderboards";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import AdminNewsCreate from "@/pages/AdminNewsCreate";
import Login from "@/pages/Login";
import Search from "@/pages/Search";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import ApiDocs from "@/pages/ApiDocs";

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
          <Route path="/admin/news/create" component={AdminNewsCreate} />
            </>
          )}
          
          {/* Public Routes */}
          <Route path="/login" component={Login} />
          <Route path="/matches" component={Matches} />
          <Route path="/matches/:id" component={MatchDetail} />
          <Route path="/teams" component={Teams} />
          <Route path="/teams/:id" component={TeamDetail} />
          <Route path="/players" component={Players} />
          <Route path="/players/:id" component={PlayerDetail} />
          <Route path="/leaderboards" component={Leaderboards} />
          <Route path="/news" component={News} />
          <Route path="/news/:id" component={NewsDetail} />
          <Route path="/search" component={Search} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/api-docs" component={ApiDocs} />
          
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
