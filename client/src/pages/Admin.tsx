import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Link } from "wouter";
import type { Match, Comment, CommentFlag, Team } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: matches } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: flaggedComments } = useQuery<CommentFlag[]>({
    queryKey: ["/api/admin/flagged-comments"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const getTeam = (teamId: string) => teams?.find((t) => t.id === teamId);

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

    if (!isLoading && isAuthenticated && user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const liveMatches = matches?.filter((m) => m.status === "live").length || 0;
  const upcomingMatches = matches?.filter((m) => m.status === "upcoming").length || 0;
  const pendingFlags = flaggedComments?.filter((f) => !f.reviewed).length || 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage matches, content, and moderate the community
            </p>
          </div>
          <Badge variant="default" className="h-8">
            Admin
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Live Matches</div>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold" data-testid="stat-live-matches">{liveMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Upcoming</div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold" data-testid="stat-upcoming-matches">{upcomingMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Flagged Comments</div>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div className="text-3xl font-bold" data-testid="stat-flagged-comments">{pendingFlags}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Total Matches</div>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold" data-testid="stat-total-matches">{matches?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="matches" data-testid="tab-admin-matches">Matches</TabsTrigger>
            <TabsTrigger value="moderation" data-testid="tab-admin-moderation">Moderation</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-admin-content">Content</TabsTrigger>
          </TabsList>

          {/* Matches Management */}
          <TabsContent value="matches" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Match Management</CardTitle>
                  <CardDescription>Create and manage CS2 matches</CardDescription>
                </div>
                <Button data-testid="button-create-match">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Match
                </Button>
              </CardHeader>
              <CardContent>
                {matches && matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.slice(0, 5).map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                        data-testid={`admin-match-${match.id}`}
                      >
                        <div>
                          <div className="font-semibold mb-1">
                            {getTeam(match.team1Id)?.name || "Team 1"} vs {getTeam(match.team2Id)?.name || "Team 2"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.tournament} • {match.status}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No matches created yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation */}
          <TabsContent value="moderation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Comment Moderation</CardTitle>
                <CardDescription>Review and manage flagged comments</CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedComments && flaggedComments.length > 0 ? (
                  <div className="space-y-4">
                    {flaggedComments.filter((f) => !f.reviewed).map((flag) => (
                      <div
                        key={flag.id}
                        className="p-4 rounded-lg border"
                        data-testid={`flag-${flag.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="destructive">{flag.reason}</Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" data-testid={`button-dismiss-${flag.id}`}>
                              Dismiss
                            </Button>
                            <Button variant="destructive" size="sm" data-testid={`button-remove-${flag.id}`}>
                              Remove Comment
                            </Button>
                          </div>
                        </div>
                        {flag.additionalInfo && (
                          <p className="text-sm text-muted-foreground">
                            Details: {flag.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No flagged comments to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Teams</CardTitle>
                    <CardDescription>Manage teams and rosters</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-manage-teams">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team
                  </Button>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Players</CardTitle>
                    <CardDescription>Manage player profiles</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-manage-players">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>News Articles</CardTitle>
                    <CardDescription>Create and publish news</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild data-testid="button-create-news">
                    <Link href="/admin/news/create" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Article
                    </Link>
                  </Button>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage user accounts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-manage-users">
                    <Users className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
