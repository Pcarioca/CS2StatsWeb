import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Users, Trophy, Settings as SettingsIcon } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useFavorites } from "@/hooks/useFavorites";
import type { Notification, Player, Team } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { favorites, isLoading: loadingFavorites, toggleTeamFavorite, togglePlayerFavorite } = useFavorites();

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: isAuthenticated,
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    enabled: isAuthenticated,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const playerMap = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  const teamFavorites = useMemo(
    () =>
      (favorites || [])
        .filter((favorite) => favorite.teamId)
        .map((favorite) => ({
          favorite,
          team: favorite.teamId ? teamMap.get(favorite.teamId) : undefined,
        })),
    [favorites, teamMap],
  );

  const playerFavorites = useMemo(
    () =>
      (favorites || [])
        .filter((favorite) => favorite.playerId)
        .map((favorite) => ({
          favorite,
          player: favorite.playerId ? playerMap.get(favorite.playerId) : undefined,
        })),
    [favorites, playerMap],
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const activityItems = useMemo(() => {
    const favoriteItems = (favorites || []).map((favorite) => {
      const team = favorite.teamId ? teamMap.get(favorite.teamId) : undefined;
      const player = favorite.playerId ? playerMap.get(favorite.playerId) : undefined;
      return {
        id: favorite.id,
        kind: "favorite",
        title: team ? `Followed ${team.name}` : player ? `Favorited ${player.alias}` : "Updated favorites",
        description: team
          ? `${team.region || "Global"} team`
          : player
          ? `${player.role || "Pro"} player`
          : "Favorites updated",
        link: team ? `/teams/${team.id}` : player ? `/players/${player.id}` : undefined,
        createdAt: favorite.createdAt ? new Date(favorite.createdAt) : null,
      };
    });

    const notificationItems = notifications.map((notification) => ({
      id: notification.id,
      kind: "notification",
      title: notification.title,
      description: notification.message,
      link: notification.link || undefined,
      createdAt: notification.createdAt ? new Date(notification.createdAt) : null,
    }));

    return [...favoriteItems, ...notificationItems]
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(0, 6);
  }, [favorites, notifications, playerMap, teamMap]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                <AvatarFallback className="text-4xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2" data-testid="profile-name">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-muted-foreground mb-4" data-testid="profile-email">
                  {user?.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {user?.role === "admin" && (
                    <Badge variant="default" data-testid="badge-admin">Admin</Badge>
                  )}
                  {user?.role === "moderator" && (
                    <Badge variant="secondary" data-testid="badge-moderator">Moderator</Badge>
                  )}
                  <Badge variant="outline" data-testid="badge-member">Member</Badge>
                </div>
              </div>

              <Button variant="outline" asChild data-testid="button-edit-profile">
                <Link href="/settings" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Teams followed</div>
              <div className="text-3xl font-bold">{teamFavorites.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Players favorited</div>
              <div className="text-3xl font-bold">{playerFavorites.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Unread alerts</div>
              <div className="text-3xl font-bold">{unreadCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Favorites Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Favorite Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Favorite Teams ({teamFavorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFavorites ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : teamFavorites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">No favorite teams yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/teams">
                      Browse Teams
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamFavorites.map(({ favorite, team }) => (
                    <div
                      key={favorite.id}
                      className="flex items-center justify-between p-3 rounded-lg hover-elevate border"
                      data-testid={`favorite-team-${favorite.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={team?.logoUrl || undefined} alt={team?.name || "Team"} />
                          <AvatarFallback>{team?.acronym || team?.name?.slice(0, 2).toUpperCase() || "TM"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{team?.name || "Team"}</div>
                          <div className="text-xs text-muted-foreground">
                            {team?.region || "Global"} {team?.rank ? `- Rank #${team.rank}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => favorite.teamId && toggleTeamFavorite(favorite.teamId)}
                        >
                          Unfollow
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/teams/${favorite.teamId}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorite Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Favorite Players ({playerFavorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFavorites ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : playerFavorites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">No favorite players yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/players">
                      Browse Players
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {playerFavorites.map(({ favorite, player }) => (
                    <div
                      key={favorite.id}
                      className="flex items-center justify-between p-3 rounded-lg hover-elevate border"
                      data-testid={`favorite-player-${favorite.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={player?.avatarUrl || undefined} alt={player?.alias || "Player"} />
                          <AvatarFallback>{player?.alias?.slice(0, 2).toUpperCase() || "PL"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{player?.alias || "Player"}</div>
                          <div className="text-xs text-muted-foreground">
                            {player?.role || "Pro player"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => favorite.playerId && togglePlayerFavorite(favorite.playerId)}
                        >
                          Unfavorite
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/players/${favorite.playerId}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Your recent activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityItems.map((item) => (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                      {item.createdAt && (
                        <div className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                        </div>
                      )}
                    </div>
                    {item.link && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={item.link}>Open</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
