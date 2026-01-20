import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">About CS2Stats</h1>
          <p className="text-muted-foreground">
            CS2Stats is a real-time Counter-Strike 2 match tracker built for fans, teams, and analysts.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <p>
              We combine live match data, team and player statistics, and community discussion in one place.
              The goal is to make CS2 viewing faster, smarter, and more enjoyable.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/40">
                <div className="text-sm text-muted-foreground">Live data</div>
                <div className="text-lg font-semibold">Match updates + timeline</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/40">
                <div className="text-sm text-muted-foreground">Deep stats</div>
                <div className="text-lg font-semibold">Team + player insights</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/40">
                <div className="text-sm text-muted-foreground">Community</div>
                <div className="text-lg font-semibold">Comments + favorites</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
