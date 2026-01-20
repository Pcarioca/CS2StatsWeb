import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import type { Team } from "@shared/schema";

export default function Teams() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isFavoriteTeam, toggleTeamFavorite } = useFavorites();

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const filteredTeams = teams?.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">
            Browse all CS2 professional teams
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teams..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-teams"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">No Teams Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No teams available yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => {
              const favorite = isFavoriteTeam(team.id);
              return (
                <Card key={team.id} className="hover-elevate" data-testid={`team-card-${team.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={team.logoUrl || undefined} alt={team.name} />
                        <AvatarFallback className="text-xl">
                          {team.acronym || team.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant={favorite ? "default" : "ghost"}
                        size="icon"
                        onClick={() => toggleTeamFavorite(team.id)}
                        aria-pressed={favorite}
                        data-testid={`button-favorite-team-${team.id}`}
                      >
                        <Star className={favorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                      </Button>
                    </div>

                    <h3 className="text-xl font-bold mb-1" data-testid={`team-name-${team.id}`}>
                      {team.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      {team.country && <span>{team.country}</span>}
                      {team.region && <span>- {team.region}</span>}
                      {team.rank && (
                        <span className="flex items-center gap-1">
                          - <TrendingUp className="h-3 w-3" /> #{team.rank}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div>
                        <div className="text-2xl font-bold font-mono">{team.wins}</div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-mono">{team.losses}</div>
                        <div className="text-xs text-muted-foreground">Losses</div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild data-testid={`button-view-team-${team.id}`}>
                      <Link href={`/teams/${team.id}`}>
                        View Team
                      </Link>
                    </Button>
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
