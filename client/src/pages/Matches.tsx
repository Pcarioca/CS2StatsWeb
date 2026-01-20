import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Match, Team } from "@shared/schema";

export default function Matches() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const getTeam = (teamId: string) => teams?.find((t) => t.id === teamId);

  const filteredMatches = matches?.filter((match) => {
    if (statusFilter !== "all" && match.status !== statusFilter) return false;
    if (searchQuery && !match.tournament?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Matches</h1>
          <p className="text-muted-foreground">
            Browse and filter all CS2 professional matches
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by tournament..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-matches"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matches</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Matches List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="hover-elevate" data-testid={`match-row-${match.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {match.status === "live" && (
                          <Badge variant="destructive" className="animate-pulse">
                            LIVE
                          </Badge>
                        )}
                        {match.status === "upcoming" && <Badge variant="secondary">UPCOMING</Badge>}
                        {match.status === "finished" && <Badge variant="outline">FINISHED</Badge>}
                        <span className="text-sm font-medium text-muted-foreground">
                          {match.tournament}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getTeam(match.team1Id)?.logoUrl || undefined} alt={getTeam(match.team1Id)?.name || "Team 1"} />
                            <AvatarFallback>
                              {getTeam(match.team1Id)?.acronym || "T1"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-lg font-semibold">{getTeam(match.team1Id)?.name || "Team 1"}</div>
                        </div>
                        <div className="text-2xl font-mono font-bold text-muted-foreground">
                          {match.status === "upcoming" ? "vs" : `${match.team1Score} - ${match.team2Score}`}
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getTeam(match.team2Id)?.logoUrl || undefined} alt={getTeam(match.team2Id)?.name || "Team 2"} />
                            <AvatarFallback>
                              {getTeam(match.team2Id)?.acronym || "T2"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-lg font-semibold">{getTeam(match.team2Id)?.name || "Team 2"}</div>
                        </div>
                      </div>

                      {match.currentMap && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Map: {match.currentMap}
                        </div>
                      )}

                      {match.scheduledAt && match.status === "upcoming" && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Starts {formatDistanceToNow(new Date(match.scheduledAt), { addSuffix: true })}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={match.status === "live" ? "default" : "outline"}
                        asChild
                        data-testid={`button-view-match-${match.id}`}
                      >
                        <Link href={`/matches/${match.id}`}>
                          {match.status === "live" ? "Watch Live" : "View Details"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
