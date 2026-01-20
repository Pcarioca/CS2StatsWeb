import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Trophy,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Match, CommentFlag, Team } from "@shared/schema";

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

  const [createOpen, setCreateOpen] = useState(false);
  const [matchForm, setMatchForm] = useState({
    team1Id: "",
    team2Id: "",
    status: "upcoming",
    tournament: "",
    stage: "",
    scheduledAt: "",
    currentMap: "",
    streamPlatform: "Twitch",
    streamUrl: "",
  });

  const createMatchMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        team1Id: matchForm.team1Id,
        team2Id: matchForm.team2Id,
        status: matchForm.status as "live" | "upcoming" | "finished",
        tournament: matchForm.tournament.trim() || undefined,
        stage: matchForm.stage.trim() || undefined,
        scheduledAt: matchForm.scheduledAt ? new Date(matchForm.scheduledAt) : undefined,
        currentMap: matchForm.currentMap.trim() || undefined,
        team1Score: 0,
        team2Score: 0,
        streamLinks: matchForm.streamUrl.trim()
          ? [{ platform: matchForm.streamPlatform, url: matchForm.streamUrl.trim() }]
          : undefined,
      };
      return apiRequest("POST", "/api/matches", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setMatchForm({
        team1Id: "",
        team2Id: "",
        status: "upcoming",
        tournament: "",
        stage: "",
        scheduledAt: "",
        currentMap: "",
        streamPlatform: "Twitch",
        streamUrl: "",
      });
      setCreateOpen(false);
      toast({
        title: "Match created",
        description: "The match has been added to the schedule.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async (matchId: string) => apiRequest("DELETE", `/api/matches/${matchId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "Match deleted",
        description: "The match has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const dismissFlagMutation = useMutation({
    mutationFn: async (flagId: string) => apiRequest("PATCH", `/api/admin/flags/${flagId}`, {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/flagged-comments"] });
      toast({
        title: "Flag dismissed",
        description: "The report has been marked as reviewed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update flag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeCommentMutation = useMutation({
    mutationFn: async (payload: { commentId: string; reason: string }) =>
      apiRequest("PATCH", `/api/admin/comments/${payload.commentId}`, {
        removed: true,
        removalReason: payload.reason,
      }),
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
        window.location.href = "/login";
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

  const hasTeams = (teams?.length ?? 0) >= 2;
  const isMatchFormValid =
    hasTeams &&
    matchForm.team1Id &&
    matchForm.team2Id &&
    matchForm.team1Id !== matchForm.team2Id &&
    matchForm.tournament.trim().length > 0;

  const handleCreateMatch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isMatchFormValid) {
      toast({
        title: "Missing match details",
        description: "Select two teams and add a tournament name.",
        variant: "destructive",
      });
      return;
    }
    createMatchMutation.mutate();
  };

  const handleDeleteMatch = (matchId: string) => {
    deleteMatchMutation.mutate(matchId);
  };

  const handleDismissFlag = (flagId: string) => {
    dismissFlagMutation.mutate(flagId);
  };

  const handleRemoveComment = async (flag: CommentFlag) => {
    try {
      await removeCommentMutation.mutateAsync({
        commentId: flag.commentId,
        reason: "Removed by an admin review.",
      });
      await dismissFlagMutation.mutateAsync(flag.id);
      toast({
        title: "Comment removed",
        description: "The comment was removed and the flag was resolved.",
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

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
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-match">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Match
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Schedule a new match</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateMatch} className="space-y-4">
                    {!hasTeams && (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        Add at least two teams before creating a match.
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Team 1</label>
                        <Select
                          value={matchForm.team1Id}
                          onValueChange={(value) =>
                            setMatchForm((prev) => ({ ...prev, team1Id: value }))
                          }
                        >
                          <SelectTrigger data-testid="select-team1">
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams?.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Team 2</label>
                        <Select
                          value={matchForm.team2Id}
                          onValueChange={(value) =>
                            setMatchForm((prev) => ({ ...prev, team2Id: value }))
                          }
                        >
                          <SelectTrigger data-testid="select-team2">
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams?.map((team) => (
                              <SelectItem key={team.id} value={team.id} disabled={team.id === matchForm.team1Id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={matchForm.status}
                          onValueChange={(value) =>
                            setMatchForm((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="finished">Finished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Scheduled time</label>
                        <Input
                          type="datetime-local"
                          value={matchForm.scheduledAt}
                          onChange={(event) =>
                            setMatchForm((prev) => ({ ...prev, scheduledAt: event.target.value }))
                          }
                          data-testid="input-scheduled-at"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tournament</label>
                      <Input
                        placeholder="e.g. ESL Pro League Season 19"
                        value={matchForm.tournament}
                        onChange={(event) =>
                          setMatchForm((prev) => ({ ...prev, tournament: event.target.value }))
                        }
                        data-testid="input-tournament"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Stage</label>
                        <Input
                          placeholder="Group Stage"
                          value={matchForm.stage}
                          onChange={(event) =>
                            setMatchForm((prev) => ({ ...prev, stage: event.target.value }))
                          }
                          data-testid="input-stage"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Current map</label>
                        <Input
                          placeholder="Inferno"
                          value={matchForm.currentMap}
                          onChange={(event) =>
                            setMatchForm((prev) => ({ ...prev, currentMap: event.target.value }))
                          }
                          data-testid="input-current-map"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Stream platform</label>
                        <Select
                          value={matchForm.streamPlatform}
                          onValueChange={(value) =>
                            setMatchForm((prev) => ({ ...prev, streamPlatform: value }))
                          }
                        >
                          <SelectTrigger data-testid="select-stream-platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Twitch">Twitch</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Kick">Kick</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Stream URL</label>
                        <Input
                          placeholder="https://twitch.tv/..."
                          value={matchForm.streamUrl}
                          onChange={(event) =>
                            setMatchForm((prev) => ({ ...prev, streamUrl: event.target.value }))
                          }
                          data-testid="input-stream-url"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isMatchFormValid || createMatchMutation.isPending}
                        data-testid="button-submit-create-match"
                      >
                        {createMatchMutation.isPending ? "Creating..." : "Create Match"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
                            {match.tournament} - {match.status}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/matches/${match.id}`}>Open</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteMatch(match.id)}
                            disabled={deleteMatchMutation.isPending}
                          >
                            Delete
                          </Button>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissFlag(flag.id)}
                              disabled={dismissFlagMutation.isPending}
                              data-testid={`button-dismiss-${flag.id}`}
                            >
                              Dismiss
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveComment(flag)}
                              disabled={removeCommentMutation.isPending || dismissFlagMutation.isPending}
                              data-testid={`button-remove-${flag.id}`}
                            >
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
                    <CardDescription>Browse teams and rosters</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild data-testid="button-manage-teams">
                    <Link href="/teams" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      View Teams
                    </Link>
                  </Button>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Players</CardTitle>
                    <CardDescription>Review player profiles</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild data-testid="button-manage-players">
                    <Link href="/players" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      View Players
                    </Link>
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
                <CardHeader>
                  <CardTitle>User Access</CardTitle>
                  <CardDescription>Accounts and roles</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  User access is managed by the authentication provider. Use moderation tools to
                  keep community content safe.
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
