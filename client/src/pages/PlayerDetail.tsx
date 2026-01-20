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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Crosshair, Star, Swords, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFavorites } from "@/hooks/useFavorites";
import type { Match, Player, Team } from "@shared/schema";

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const { isFavoritePlayer, togglePlayerFavorite } = useFavorites();

  const { data: player, isLoading: playerLoading } = useQuery<Player>({
    queryKey: ["/api/players", id],
    enabled: !!id,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const team = useMemo(
    () => teams.find((item) => item.id === player?.teamId),
    [teams, player?.teamId],
  );

  const teamMatches = useMemo(() => {
    if (!player?.teamId) return [];
    return matches.filter((match) => match.team1Id === player.teamId || match.team2Id === player.teamId);
  }, [matches, player?.teamId]);

  const kd = useMemo(() => {
    if (!player) return "0.00";
    return player.totalDeaths > 0
      ? (player.totalKills / player.totalDeaths).toFixed(2)
      : player.totalKills.toFixed(2);
  }, [player]);

  const rating = useMemo(() => {
    if (!player) return "0.00";
    return (player.averageRating / 100).toFixed(2);
  }, [player]);

  const performanceBars = useMemo(() => {
    if (!player) return [];
    const impact = Math.min(100, Math.round((player.totalKills / Math.max(player.totalMatches, 1)) / 3));
    const support = Math.min(100, Math.round((player.totalAssists / Math.max(player.totalMatches, 1)) / 2));
    const survivability = Math.max(0, 100 - Math.round((player.totalDeaths / Math.max(player.totalMatches, 1)) / 3));
    return [
      { label: "Impact", value: impact },
      { label: "Support", value: support },
      { label: "Survivability", value: survivability },
    ];
  }, [player]);

  if (playerLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-56 w-full mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Card>
          <CardContent className="p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Player not found</h2>
            <p className="text-muted-foreground mb-4">This player does not exist.</p>
            <Button asChild>
              <Link href="/players">Back to players</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const favorite = isFavoritePlayer(player.id);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
      <Card className="border-primary/20">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <Avatar className="h-24 w-24 md:h-28 md:w-28">
            <AvatarImage src={player.avatarUrl || undefined} alt={player.alias} />
            <AvatarFallback className="text-2xl">{player.alias.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{player.alias}</h1>
              {player.role && <Badge variant="secondary">{player.role}</Badge>}
              {player.country && <Badge variant="outline">{player.country}</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              {player.realName || "Pro player"} {team?.name ? `- ${team.name}` : ""}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => togglePlayerFavorite(player.id)} variant={favorite ? "default" : "outline"}>
                <Star className={favorite ? "h-4 w-4 mr-2 fill-current" : "h-4 w-4 mr-2"} />
                {favorite ? "Favorited" : "Favorite player"}
              </Button>
              {team?.id && (
                <Button variant="outline" asChild>
                  <Link href={`/teams/${team.id}`}>View team</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Key stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Rating</div>
                <div className="text-2xl font-bold">{rating}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">K/D</div>
                <div className="text-2xl font-bold">{kd}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Matches</div>
                <div className="text-2xl font-bold">{player.totalMatches}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Total kills</div>
                <div className="text-2xl font-bold">{player.totalKills}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crosshair className="h-5 w-5 text-primary" />
              Performance profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{bar.label}</span>
                  <span className="font-semibold">{bar.value}%</span>
                </div>
                <Progress value={bar.value} className="mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Career totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="min-h-[240px]"
            config={{
              kills: { label: "Kills", color: "hsl(var(--chart-2))" },
              assists: { label: "Assists", color: "hsl(var(--chart-4))" },
              deaths: { label: "Deaths", color: "hsl(var(--chart-5))" },
            }}
          >
            <BarChart data={[{
              label: player.alias,
              kills: player.totalKills,
              assists: player.totalAssists,
              deaths: player.totalDeaths,
            }]}>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Recent team matches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamMatches.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent matches available.</div>
          ) : (
            teamMatches.slice(0, 4).map((match) => (
              <div key={match.id} className="rounded-lg border p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{match.tournament || "Match"}</div>
                  <div className="text-xs text-muted-foreground">
                    {match.status} {match.scheduledAt ? `- ${formatDistanceToNow(new Date(match.scheduledAt), { addSuffix: true })}` : ""}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/matches/${match.id}`}>Open</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
