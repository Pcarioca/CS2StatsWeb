import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@shared/schema";

export default function AdminNewsCreate() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    content: "",
    heroImageUrl: "",
    tags: "",
    published: true,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        content: form.content.trim(),
        heroImageUrl: form.heroImageUrl.trim() || undefined,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        published: form.published,
      };
      const res = await apiRequest("POST", "/api/news", payload);
      return (await res.json()) as NewsArticle;
    },
    onSuccess: (article) => {
      toast({
        title: "Article created",
        description: "Your news post is now saved.",
      });
      setLocation(`/news/${article.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Access denied",
        description: "Admin access is required.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/");
      }, 500);
    }
  }, [isAuthenticated, isLoading, setLocation, toast, user?.role]);

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Missing required fields",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Create News Article</h1>
            <p className="text-muted-foreground">
              Publish official updates, match recaps, or community announcements.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to Admin</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Headline for the article"
                  data-testid="input-news-title"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subtitle</label>
                <Input
                  value={form.subtitle}
                  onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                  placeholder="Optional short summary"
                  data-testid="input-news-subtitle"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Hero image URL</label>
                <Input
                  value={form.heroImageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, heroImageUrl: event.target.value }))}
                  placeholder="https://..."
                  data-testid="input-news-hero"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="BLAST, NAVI, Playoffs"
                  data-testid="input-news-tags"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  rows={8}
                  value={form.content}
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                  placeholder="Write the story here..."
                  data-testid="input-news-content"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">Publish immediately</div>
                  <div className="text-xs text-muted-foreground">
                    Toggle off to save as draft.
                  </div>
                </div>
                <Switch
                  checked={form.published}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, published: checked }))
                  }
                  data-testid="switch-news-published"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" asChild>
                  <Link href="/admin">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-news">
                  {createMutation.isPending ? "Publishing..." : "Publish Article"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
