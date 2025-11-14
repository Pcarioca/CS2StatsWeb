import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import type { Player } from "@shared/schema";

export default function Leaderboards() {
  const [timeframe, setTimeframe] = useState("weekly");
  const [metric, setMetric] = useState("rating");

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/leaderboards"],
  });

  const sortedPlayers = [...(players || [])];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Leaderboards</h1>
          <p className="text-muted-foreground">
            Top performing CS2 players ranked by stats and performance
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger data-testid="select-timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="alltime">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Metric</label>
                <Select value={metric} onValueChange={setMetric}>
                  <SelectTrigger data-testid="select-metric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="kd">K/D Ratio</SelectItem>
                    <SelectItem value="kills">Total Kills</SelectItem>
                    <SelectItem value="hs">Headshot %</SelectItem>
                    <SelectItem value="clutch">Clutch Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top Players - {metric.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sortedPlayers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-16 w-16 mx-auto mb-4" />
                <p>No player data available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedPlayers.slice(0, 50).map((player, index) => {
                  const kd = player.totalDeaths > 0
                    ? (player.totalKills / player.totalDeaths).toFixed(2)
                    : player.totalKills.toFixed(2);
                  
                  const rating = (player.averageRating / 100).toFixed(2);

                  return (
                    <Link 
                      key={player.id} 
                      href={`/players/${player.id}`}
                      className="flex items-center gap-4 p-4 rounded-lg hover-elevate border border-transparent hover:border-border"
                      data-testid={`leaderboard-row-${index + 1}`}
                    >
                        {/* Rank */}
                        <div className="w-12 text-center">
                          {index === 0 && (
                            <Trophy className="h-6 w-6 mx-auto text-yellow-500" />
                          )}
                          {index === 1 && (
                            <Trophy className="h-6 w-6 mx-auto text-gray-400" />
                          )}
                          {index === 2 && (
                            <Trophy className="h-6 w-6 mx-auto text-amber-700" />
                          )}
                          {index > 2 && (
                            <span className="text-lg font-bold text-muted-foreground">
                              #{index + 1}
                            </span>
                          )}
                        </div>

                        {/* Player Info */}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={player.avatarUrl || undefined} alt={player.alias} />
                          <AvatarFallback>
                            {player.alias.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="font-semibold">{player.alias}</div>
                          {player.realName && (
                            <div className="text-sm text-muted-foreground">{player.realName}</div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Rating</div>
                            <div className="text-lg font-mono font-bold">{rating}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">K/D</div>
                            <div className="text-lg font-mono font-bold">{kd}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Matches</div>
                            <div className="text-lg font-mono font-bold">{player.totalMatches}</div>
                          </div>
                        </div>

                        {/* Trend (placeholder) */}
                        <div className="w-16 text-right">
                          {index % 2 === 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-500 ml-auto" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500 ml-auto" />
                          )}
                        </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
