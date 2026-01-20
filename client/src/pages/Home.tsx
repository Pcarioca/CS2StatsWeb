import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Users, Calendar, Star } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Match, MatchWithTeams, Team } from "@shared/schema";

function MatchCard({ match, team1, team2 }: { match: Match; team1?: Team; team2?: Team }) {
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";

  return (
    <Card className="hover-elevate" data-testid={`match-card-${match.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
            {isUpcoming && <Badge variant="secondary">UPCOMING</Badge>}
            {match.status === "finished" && <Badge variant="outline">FINISHED</Badge>}
            <span className="text-sm text-muted-foreground">{match.tournament}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center mb-4">
          {/* Team 1 */}
          <div className="text-center">
            <Avatar className="h-12 w-12 mx-auto mb-2">
              <AvatarImage src={team1?.logoUrl || undefined} alt={team1?.name || "Team 1"} />
              <AvatarFallback>
                {team1?.acronym || team1?.name?.slice(0, 2).toUpperCase() || "T1"}
              </AvatarFallback>
            </Avatar>
            <div className="text-lg font-semibold" data-testid={`match-team1-${match.id}`}>
              {team1?.name || "Team 1"}
            </div>
            {!isUpcoming && (
              <div className="text-2xl font-mono font-bold" data-testid={`match-score1-${match.id}`}>
                {match.team1Score}
              </div>
            )}
          </div>

          {/* VS / Score */}
          <div className="text-center">
            <div className="text-muted-foreground text-sm">VS</div>
          </div>

          {/* Team 2 */}
          <div className="text-center">
            <Avatar className="h-12 w-12 mx-auto mb-2">
              <AvatarImage src={team2?.logoUrl || undefined} alt={team2?.name || "Team 2"} />
              <AvatarFallback>
                {team2?.acronym || team2?.name?.slice(0, 2).toUpperCase() || "T2"}
              </AvatarFallback>
            </Avatar>
            <div className="text-lg font-semibold" data-testid={`match-team2-${match.id}`}>
              {team2?.name || "Team 2"}
            </div>
            {!isUpcoming && (
              <div className="text-2xl font-mono font-bold" data-testid={`match-score2-${match.id}`}>
                {match.team2Score}
              </div>
            )}
          </div>
        </div>

        {match.currentMap && (
          <div className="text-center text-sm text-muted-foreground mb-2">
            {match.currentMap}
          </div>
        )}

        {match.scheduledAt && isUpcoming && (
          <div className="text-center text-sm text-muted-foreground mb-2">
            Starts {formatDistanceToNow(new Date(match.scheduledAt), { addSuffix: true })}
          </div>
        )}

        <div className="flex gap-2">
          <Button className="flex-1" variant={isLive ? "default" : "outline"} asChild data-testid={`button-view-match-${match.id}`}>
            <Link href={`/matches/${match.id}`}>
              {isLive ? "Watch Live" : "View Details"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="grid grid-cols-3 gap-4 items-center mb-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const getTeam = (teamId: string) => teams?.find((t) => t.id === teamId);

  const liveMatches = matches?.filter((m) => m.status === "live") || [];
  const upcomingMatches = matches?.filter((m) => m.status === "upcoming") || [];
  const finishedMatches = matches?.filter((m) => m.status === "finished") || [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Hero Live Match */}
      {liveMatches.length > 0 && (
        <section className="mb-12">
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="destructive" className="animate-pulse">
                  LIVE NOW
                </Badge>
                <span className="font-semibold">{liveMatches[0].tournament}</span>
              </div>
              <div className="grid grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-3">
                    <AvatarImage src={getTeam(liveMatches[0].team1Id)?.logoUrl || undefined} alt={getTeam(liveMatches[0].team1Id)?.name || "Team 1"} />
                    <AvatarFallback className="text-2xl">
                      {getTeam(liveMatches[0].team1Id)?.acronym || "T1"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-3xl font-bold mb-2">{getTeam(liveMatches[0].team1Id)?.name || "Team 1"}</h3>
                  <div className="text-5xl font-mono font-bold">{liveMatches[0].team1Score}</div>
                </div>
                <div className="text-center text-muted-foreground">
                  <Trophy className="h-16 w-16 mx-auto mb-2 text-primary" />
                  <div className="text-lg">{liveMatches[0].currentMap}</div>
                </div>
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-3">
                    <AvatarImage src={getTeam(liveMatches[0].team2Id)?.logoUrl || undefined} alt={getTeam(liveMatches[0].team2Id)?.name || "Team 2"} />
                    <AvatarFallback className="text-2xl">
                      {getTeam(liveMatches[0].team2Id)?.acronym || "T2"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-3xl font-bold mb-2">{getTeam(liveMatches[0].team2Id)?.name || "Team 2"}</h3>
                  <div className="text-5xl font-mono font-bold">{liveMatches[0].team2Score}</div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button size="lg" asChild data-testid="button-watch-live-hero">
                  <Link href={`/matches/${liveMatches[0].id}`}>
                    Watch Live
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Matches Tabs */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Matches</h2>
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="live" data-testid="tab-live">
              Live ({liveMatches.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingMatches.length})
            </TabsTrigger>
            <TabsTrigger value="finished" data-testid="tab-finished">
              Finished ({finishedMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            {isLoading ? (
              <MatchesSkeleton />
            ) : liveMatches.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
                  <p className="text-muted-foreground mb-6">
                    Check back soon or browse upcoming matches and set reminders.
                  </p>
                  <Button asChild data-testid="button-view-upcoming">
                    <Link href="/matches?status=upcoming">
                      View Upcoming Matches
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {liveMatches.map((match) => (
                  <MatchCard key={match.id} match={match} team1={getTeam(match.team1Id)} team2={getTeam(match.team2Id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <MatchesSkeleton />
            ) : upcomingMatches.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Upcoming Matches</h3>
                  <p className="text-muted-foreground">Check back later for new scheduled matches.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.id} match={match} team1={getTeam(match.team1Id)} team2={getTeam(match.team2Id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="finished" className="mt-6">
            {isLoading ? (
              <MatchesSkeleton />
            ) : finishedMatches.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Finished Matches</h3>
                  <p className="text-muted-foreground">Completed matches will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {finishedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} team1={getTeam(match.team1Id)} team2={getTeam(match.team2Id)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Quick Links */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teams
            </CardTitle>
            <CardDescription>Browse all CS2 teams and rosters</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild data-testid="button-browse-teams">
              <Link href="/teams">
                Browse Teams
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboards
            </CardTitle>
            <CardDescription>Top players by stats and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild data-testid="button-view-leaderboards">
              <Link href="/leaderboards">
                View Leaderboards
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              News
            </CardTitle>
            <CardDescription>Latest CS2 news and match recaps</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild data-testid="button-read-news">
              <Link href="/news">
                Read News
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
