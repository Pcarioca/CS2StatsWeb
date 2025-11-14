import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, TrendingUp, Bell } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Track Counter-Strike 2 Matches in Real-Time
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Follow live CS2 matches, inspect detailed team and player stats, join the community discussion, and never miss a moment of the action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-get-started">
              <a href="/api/login">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-explore-matches">
              <Link href="/matches">Explore Matches</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Follow CS2
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <Trophy className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Live Match Tracking</h3>
                <p className="text-muted-foreground">
                  Real-time updates with detailed scoreboard, round-by-round events, and player statistics.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Team & Player Stats</h3>
                <p className="text-muted-foreground">
                  Deep dive into team rosters, player careers, match history, and performance analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Leaderboards</h3>
                <p className="text-muted-foreground">
                  Track top players by rating, K/D, ADR, and more across daily, weekly, and seasonal rankings.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <Bell className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Notifications</h3>
                <p className="text-muted-foreground">
                  Get notified when your favorite teams play, matches go live, or important events happen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the CS2Stats Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Sign in to favorite your teams, comment on matches, and personalize your experience.
          </p>
          <Button size="lg" asChild data-testid="button-signin-cta">
            <a href="/api/login">Sign In Now</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
