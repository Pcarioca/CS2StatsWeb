import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NewsArticle } from "@shared/schema";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: article, isLoading } = useQuery<NewsArticle>({
    queryKey: ["/api/news", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <Card>
          <CardContent className="p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Article not found</h2>
            <p className="text-muted-foreground mb-4">This story is no longer available.</p>
            <Button asChild>
              <Link href="/news">Back to news</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/news">
          <ArrowLeft className="h-4 w-4" />
          Back to news
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {article.createdAt
                ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
                : "Recently"}
            </span>
            {article.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{article.title}</h1>
            {article.subtitle && (
              <p className="text-lg text-muted-foreground">{article.subtitle}</p>
            )}
          </div>

          {article.heroImageUrl ? (
            <div className="rounded-lg overflow-hidden aspect-video">
              <img
                src={article.heroImageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-lg aspect-video bg-gradient-to-br from-primary/20 via-muted/40 to-background" />
          )}

          <div className="prose prose-invert max-w-none text-foreground">
            {article.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
