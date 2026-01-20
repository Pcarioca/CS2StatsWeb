import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Star, Trophy, Users, Swords, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFavorites } from "@/hooks/useFavorites";
import type { Match, Player, Team } from "@shared/schema";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const { isFavoriteTeam, toggleTeamFavorite } = useFavorites();

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: ["/api/teams", id],
    enabled: !!id,
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players?teamId=" + id],
    enabled: !!id,
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const teamMatches = useMemo(
    () => matches.filter((match) => match.team1Id === id || match.team2Id === id),
    [matches, id],
  );

  const winLossData = useMemo(() => {
    const wins = team?.wins ?? 0;
    const losses = team?.losses ?? 0;
    return [
      { name: "Wins", value: wins },
      { name: "Losses", value: losses },
    ];
  }, [team]);

  const winRate = useMemo(() => {
    const wins = team?.wins ?? 0;
    const losses = team?.losses ?? 0;
    const total = wins + losses;
    return total === 0 ? 0 : Math.round((wins / total) * 100);
  }, [team]);

  const avgRating = useMemo(() => {
    if (!players.length) return 0;
    const total = players.reduce((sum, player) => sum + (player.averageRating ?? 0), 0);
    return Number((total / players.length / 100).toFixed(2));
  }, [players]);

  const recentMatches = useMemo(
    () => teamMatches.slice(0, 4),
    [teamMatches],
  );

  if (teamLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-56 w-full mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Card>
          <CardContent className="p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Team not found</h2>
            <p className="text-muted-foreground mb-4">This team does not exist.</p>
            <Button asChild>
              <Link href="/teams">Back to teams</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const favorite = isFavoriteTeam(team.id);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
      <Card className="overflow-hidden border-primary/20">
        <div
          className="h-40 md:h-52 bg-gradient-to-r from-primary/20 via-muted/50 to-background"
          style={team.bannerUrl ? { backgroundImage: `url(${team.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <Avatar className="h-20 w-20 md:h-24 md:w-24">
            <AvatarImage src={team.logoUrl || undefined} alt={team.name} />
            <AvatarFallback className="text-2xl">{team.acronym || team.name.slice(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{team.name}</h1>
              {team.rank && <Badge variant="secondary">Rank #{team.rank}</Badge>}
              {team.region && <Badge variant="outline">{team.region}</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              {team.country} {team.acronym ? `- ${team.acronym}` : ""}
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => toggleTeamFavorite(team.id)} variant={favorite ? "default" : "outline"}>
                <Star className={favorite ? "h-4 w-4 mr-2 fill-current" : "h-4 w-4 mr-2"} />
                {favorite ? "Following" : "Follow team"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/matches">View matches</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Season performance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Win rate</span>
                  <span className="font-semibold">{winRate}%</span>
                </div>
                <Progress value={winRate} className="mt-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Wins</div>
                  <div className="text-2xl font-bold">{team.wins}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Losses</div>
                  <div className="text-2xl font-bold">{team.losses}</div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Average player rating</div>
                <div className="text-2xl font-bold">{avgRating || "0.00"}</div>
              </div>
            </div>

            <ChartContainer
              className="min-h-[220px]"
              config={{
                wins: { label: "Wins", color: "hsl(var(--chart-1))" },
                losses: { label: "Losses", color: "hsl(var(--chart-3))" },
              }}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={winLossData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} stroke="transparent">
                  {winLossData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.name === "Wins" ? "var(--color-wins)" : "var(--color-losses)"}
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent matches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMatches.length === 0 ? (
              <div className="text-sm text-muted-foreground">No matches yet.</div>
            ) : (
              recentMatches.map((match) => (
                <div key={match.id} className="rounded-lg border p-3">
                  <div className="text-sm font-semibold">{match.tournament || "Match"}</div>
                  <div className="text-xs text-muted-foreground">
                    {match.status} {match.scheduledAt ? `- ${formatDistanceToNow(new Date(match.scheduledAt), { addSuffix: true })}` : ""}
                  </div>
                  <Button className="mt-2" size="sm" variant="outline" asChild>
                    <Link href={`/matches/${match.id}`}>Open</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Current roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-sm text-muted-foreground">No players listed for this team.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {players.map((player) => {
                const kd = player.totalDeaths
                  ? (player.totalKills / player.totalDeaths).toFixed(2)
                  : player.totalKills.toFixed(2);
                return (
                  <Card key={player.id} className="hover-elevate">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={player.avatarUrl || undefined} alt={player.alias} />
                          <AvatarFallback>{player.alias.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{player.alias}</div>
                          <div className="text-xs text-muted-foreground">{player.role || "Player"}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-md bg-muted/40 p-2">
                          <div className="text-xs text-muted-foreground">Rating</div>
                          <div className="font-semibold">{(player.averageRating / 100).toFixed(2)}</div>
                        </div>
                        <div className="rounded-md bg-muted/40 p-2">
                          <div className="text-xs text-muted-foreground">K/D</div>
                          <div className="font-semibold">{kd}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/players/${player.id}`}>View profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Team stats snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="min-h-[260px]"
            config={{
              kills: { label: "Total kills", color: "hsl(var(--chart-2))" },
              assists: { label: "Total assists", color: "hsl(var(--chart-4))" },
              deaths: { label: "Total deaths", color: "hsl(var(--chart-5))" },
            }}
          >
            <BarChart data={[
              {
                label: "Roster totals",
                kills: players.reduce((sum, player) => sum + (player.totalKills ?? 0), 0),
                assists: players.reduce((sum, player) => sum + (player.totalAssists ?? 0), 0),
                deaths: players.reduce((sum, player) => sum + (player.totalDeaths ?? 0), 0),
              },
            ]}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="kills" fill="var(--color-kills)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="assists" fill="var(--color-assists)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="deaths" fill="var(--color-deaths)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
