import { useEffect } from "react";
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
import type { UserFavorite } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: favorites, isLoading: loadingFavorites } = useQuery<UserFavorite[]>({
    queryKey: ["/api/favorites"],
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
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const teamFavorites = favorites?.filter((f) => f.teamId) || [];
  const playerFavorites = favorites?.filter((f) => f.playerId) || [];

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
                  {teamFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center justify-between p-3 rounded-lg hover-elevate border"
                      data-testid={`favorite-team-${fav.id}`}
                    >
                      <span className="font-medium">Team {fav.teamId?.slice(0, 8)}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/teams/${fav.teamId}`}>
                          View
                        </Link>
                      </Button>
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
                  {playerFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center justify-between p-3 rounded-lg hover-elevate border"
                      data-testid={`favorite-player-${fav.id}`}
                    >
                      <span className="font-medium">Player {fav.playerId?.slice(0, 8)}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/players/${fav.playerId}`}>
                          View
                        </Link>
                      </Button>
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
            <div className="text-center py-12 text-muted-foreground">
              <p>Your recent activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
