import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            By using CS2Stats you agree to the terms below.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
            <p>
              CS2Stats provides match data, stats, and community features for educational and
              entertainment purposes. Content may change without notice.
            </p>
            <p>
              Users are responsible for their own comments and uploads. Abuse, spam, or harassment
              can result in moderation or account suspension.
            </p>
            <p>
              If you have questions about these terms, contact hello@cs2stats.example.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
