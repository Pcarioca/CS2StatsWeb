import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, Target } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import type { Player } from "@shared/schema";

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isFavoritePlayer, togglePlayerFavorite } = useFavorites();

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const filteredPlayers = players?.filter((player) =>
    player.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.realName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Players</h1>
          <p className="text-muted-foreground">
            Browse all CS2 professional players
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search players..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-players"
              />
            </div>
          </CardContent>
        </Card>

        {/* Players Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlayers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">No Players Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No players available yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => {
              const favorite = isFavoritePlayer(player.id);
              return (
                <Card key={player.id} className="hover-elevate" data-testid={`player-card-${player.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-3">
                        <AvatarImage src={player.avatarUrl || undefined} alt={player.alias} />
                        <AvatarFallback className="text-xl">
                          {player.alias.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="text-lg font-bold mb-1" data-testid={`player-alias-${player.id}`}>
                        {player.alias}
                      </h3>

                      {player.realName && (
                        <p className="text-sm text-muted-foreground mb-2">{player.realName}</p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        {player.country && <span>{player.country}</span>}
                        {player.role && (
                          <>
                            <span>-</span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {player.role}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full text-center mb-4">
                        <div>
                          <div className="text-lg font-bold font-mono">
                            {(player.averageRating / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold font-mono">
                            {player.totalDeaths > 0
                              ? (player.totalKills / player.totalDeaths).toFixed(2)
                              : player.totalKills.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">K/D</div>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full">
                        <Button
                          variant={favorite ? "default" : "ghost"}
                          size="icon"
                          onClick={() => togglePlayerFavorite(player.id)}
                          aria-pressed={favorite}
                          data-testid={`button-favorite-player-${player.id}`}
                        >
                          <Star className={favorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                        </Button>
                        <Button variant="outline" className="flex-1" size="sm" asChild data-testid={`button-view-player-${player.id}`}>
                          <Link href={`/players/${player.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
