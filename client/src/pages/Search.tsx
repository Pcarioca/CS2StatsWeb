import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import type { Match, Team, Player, NewsArticle } from "@shared/schema";

function getQueryFromLocation(location: string) {
  const [, queryString] = location.split("?");
  const params = new URLSearchParams(queryString || "");
  return (params.get("q") || "").trim();
}

export default function Search() {
  const [location, setLocation] = useLocation();
  const queryParam = useMemo(() => getQueryFromLocation(location), [location]);
  const [query, setQuery] = useState(queryParam);

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: news = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news?published=true"],
  });

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const normalized = queryParam.toLowerCase();
  const teamLookup = useMemo(() => {
    return new Map(teams.map((team) => [team.id, team]));
  }, [teams]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(normalized)
  );

  const filteredPlayers = players.filter((player) => {
    return (
      player.alias.toLowerCase().includes(normalized) ||
      player.realName?.toLowerCase().includes(normalized)
    );
  });

  const filteredMatches = matches.filter((match) => {
    if (!normalized) return false;
    const team1 = teamLookup.get(match.team1Id);
    const team2 = teamLookup.get(match.team2Id);
    const matchText = `${team1?.name || ""} ${team2?.name || ""} ${match.tournament || ""}`.toLowerCase();
    return matchText.includes(normalized);
  });

  const filteredNews = news.filter((article) => {
    return (
      article.title.toLowerCase().includes(normalized) ||
      article.subtitle?.toLowerCase().includes(normalized) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(normalized))
    );
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextQuery = query.trim();
    setLocation(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground">
            Find matches, teams, players, and news in one place.
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search matches, teams, players, news..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {!queryParam ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              Start typing to see results across the platform.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-semibold">Teams</h2>
                <Badge variant="secondary">{filteredTeams.length}</Badge>
              </div>
              {filteredTeams.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-muted-foreground">No teams found.</CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTeams.map((team) => (
                    <Card key={team.id} className="hover-elevate">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.region} {team.rank ? `- Rank #${team.rank}` : ""}
                          </div>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/teams/${team.id}`}>View</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-semibold">Players</h2>
                <Badge variant="secondary">{filteredPlayers.length}</Badge>
              </div>
              {filteredPlayers.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-muted-foreground">No players found.</CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlayers.map((player) => (
                    <Card key={player.id} className="hover-elevate">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{player.alias}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.realName || "Pro player"} {player.role ? `- ${player.role}` : ""}
                          </div>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/players/${player.id}`}>View</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-semibold">Matches</h2>
                <Badge variant="secondary">{filteredMatches.length}</Badge>
              </div>
              {filteredMatches.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-muted-foreground">No matches found.</CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredMatches.map((match) => {
                    const team1 = teamLookup.get(match.team1Id);
                    const team2 = teamLookup.get(match.team2Id);
                    return (
                      <Card key={match.id} className="hover-elevate">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <div className="font-semibold">
                              {team1?.name || "Team 1"} vs {team2?.name || "Team 2"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {match.tournament || "Match"} {match.status ? `- ${match.status}` : ""}
                            </div>
                          </div>
                          <Button variant="outline" asChild>
                            <Link href={`/matches/${match.id}`}>View</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-semibold">News</h2>
                <Badge variant="secondary">{filteredNews.length}</Badge>
              </div>
              {filteredNews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-muted-foreground">No articles found.</CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNews.map((article) => (
                    <Card key={article.id} className="hover-elevate">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{article.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {article.subtitle || "CS2 news"}
                          </div>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/news/${article.id}`}>Read</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
