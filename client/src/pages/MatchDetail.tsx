import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, ArrowLeft, Star, Share2, MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Match, MatchEvent, MatchPlayerStats, Team, Comment, MatchWithTeams } from "@shared/schema";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [commentContent, setCommentContent] = useState("");

  const { data: match, isLoading } = useQuery<MatchWithTeams>({
    queryKey: ["/api/matches", id],
    enabled: !!id,
  });

  const { data: events } = useQuery<MatchEvent[]>({
    queryKey: ["/api/matches", id, "events"],
    enabled: !!id,
  });

  const { data: playerStats } = useQuery<MatchPlayerStats[]>({
    queryKey: ["/api/matches", id, "stats"],
    enabled: !!id,
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/comments?matchId=" + id],
    enabled: !!id,
  });

  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/comments", { matchId: id, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments?matchId=" + id] });
      setCommentContent("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePostComment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to post comments",
        variant: "destructive",
      });
      return;
    }
    
    if (!commentContent.trim()) return;
    postCommentMutation.mutate(commentContent);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-12 w-48 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The match you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/matches">
                Back to Matches
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
        <Link href="/matches" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Matches
        </Link>
      </Button>

      {/* Match Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
              {isUpcoming && <Badge variant="secondary">UPCOMING</Badge>}
              {match.status === "finished" && <Badge variant="outline">FINISHED</Badge>}
              <span className="font-semibold text-lg">{match.tournament}</span>
              {match.stage && <span className="text-muted-foreground">• {match.stage}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-favorite">
                <Star className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-share">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="grid grid-cols-3 gap-8 items-center mb-6">
            {/* Team 1 */}
            <div className="text-center">
              <div className="mb-4">
                <Avatar className="h-20 w-20 mx-auto mb-2">
                  <AvatarImage src={match.team1?.logoUrl || undefined} alt={match.team1?.name || "Team 1"} />
                  <AvatarFallback className="text-2xl">
                    {match.team1?.acronym || "T1"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold" data-testid="match-team1-name">{match.team1?.name || "Team 1"}</h2>
              </div>
              {!isUpcoming && (
                <div className="text-6xl font-mono font-bold" data-testid="match-team1-score">
                  {match.team1Score}
                </div>
              )}
            </div>

            {/* Center */}
            <div className="text-center">
              <Trophy className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
              {match.currentMap && (
                <div className="text-lg font-medium text-muted-foreground">
                  {match.currentMap}
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="text-center">
              <div className="mb-4">
                <Avatar className="h-20 w-20 mx-auto mb-2">
                  <AvatarImage src={match.team2?.logoUrl || undefined} alt={match.team2?.name || "Team 2"} />
                  <AvatarFallback className="text-2xl">
                    {match.team2?.acronym || "T2"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold" data-testid="match-team2-name">{match.team2?.name || "Team 2"}</h2>
              </div>
              {!isUpcoming && (
                <div className="text-6xl font-mono font-bold" data-testid="match-team2-score">
                  {match.team2Score}
                </div>
              )}
            </div>
          </div>

          {/* Stream Links */}
          {match.streamLinks && match.streamLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {match.streamLinks.map((stream, idx) => (
                <Button key={idx} variant="outline" asChild data-testid={`button-stream-${idx}`}>
                  <a href={stream.url} target="_blank" rel="noopener noreferrer">
                    Watch on {stream.platform}
                  </a>
                </Button>
              ))}
            </div>
          )}

          {isUpcoming && match.scheduledAt && (
            <div className="text-center text-muted-foreground mt-4">
              Starts {formatDistanceToNow(new Date(match.scheduledAt), { addSuffix: true })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Timeline, Stats, Comments */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">Player Stats</TabsTrigger>
          <TabsTrigger value="comments" data-testid="tab-comments">Comments</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-4 rounded-md hover-elevate"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="text-xs font-mono text-muted-foreground w-16 flex-shrink-0">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-1">
                          {event.eventType}
                        </Badge>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>No events yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {playerStats && playerStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">Player</th>
                        <th className="text-center p-2 font-semibold">K</th>
                        <th className="text-center p-2 font-semibold">D</th>
                        <th className="text-center p-2 font-semibold">A</th>
                        <th className="text-center p-2 font-semibold">K/D</th>
                        <th className="text-center p-2 font-semibold">ADR</th>
                        <th className="text-center p-2 font-semibold">HS%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.map((stat) => (
                        <tr key={stat.id} className="border-b hover-elevate" data-testid={`stat-row-${stat.id}`}>
                          <td className="p-2">Player {stat.playerId.slice(0, 8)}</td>
                          <td className="text-center p-2 font-mono">{stat.kills}</td>
                          <td className="text-center p-2 font-mono">{stat.deaths}</td>
                          <td className="text-center p-2 font-mono">{stat.assists}</td>
                          <td className="text-center p-2 font-mono">
                            {stat.deaths > 0 ? (stat.kills / stat.deaths).toFixed(2) : stat.kills.toFixed(2)}
                          </td>
                          <td className="text-center p-2 font-mono">{stat.adr}</td>
                          <td className="text-center p-2 font-mono">{stat.headshotPercent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4" />
                  <p>No player stats available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments */}
        <TabsContent value="comments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="mb-6 p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Log in to join the discussion and share your thoughts about this match
                  </p>
                  <Button variant="outline" asChild data-testid="button-login-prompt">
                    <Link href="/">
                      Log In to Comment
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="mb-6 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts about this match..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    data-testid="input-comment"
                  />
                  <Button
                    onClick={handlePostComment}
                    disabled={!commentContent.trim() || postCommentMutation.isPending}
                    data-testid="button-post-comment"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {postCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              )}

              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-md bg-muted/30" data-testid={`comment-${comment.id}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">User {comment.userId.slice(0, 8)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt!), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>No comments yet{!isAuthenticated && ". Log in to start the discussion!"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
