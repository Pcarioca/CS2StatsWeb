import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Clock, User } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { NewsArticle } from "@shared/schema";

export default function News() {
  const { data: articles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news?published=true"],
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">News</h1>
          <p className="text-muted-foreground">
            Latest CS2 news, match recaps, and community updates
          </p>
        </div>

        {/* Articles */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !articles || articles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">No News Yet</h3>
              <p className="text-muted-foreground">
                Check back soon for the latest CS2 news and updates
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {articles?.map((article) => (
              <Card key={article.id} className="hover-elevate" data-testid={`article-card-${article.id}`}>
                <CardContent className="p-6">
                  {article.heroImageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden aspect-video bg-muted">
                      <img
                        src={article.heroImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold hover:text-primary transition-colors">
                      <Link href={`/news/${article.id}`} data-testid={`article-title-${article.id}`}>
                        {article.title}
                      </Link>
                    </h2>

                    {article.subtitle && (
                      <p className="text-muted-foreground">{article.subtitle}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Author</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>0 comments</span>
                      </div>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-muted rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" asChild data-testid={`button-read-article-${article.id}`}>
                      <Link href={`/news/${article.id}`}>
                        Read More
                      </Link>
                    </Button>
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
