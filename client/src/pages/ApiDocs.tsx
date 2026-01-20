import { Card, CardContent } from "@/components/ui/card";

const endpoints = [
  { label: "Auth (current user)", path: "GET /api/auth/user" },
  { label: "Teams", path: "GET /api/teams" },
  { label: "Players", path: "GET /api/players" },
  { label: "Matches", path: "GET /api/matches" },
  { label: "Match detail", path: "GET /api/matches/:id" },
  { label: "Match events", path: "GET /api/matches/:id/events" },
  { label: "Match stats", path: "GET /api/matches/:id/stats" },
  { label: "News", path: "GET /api/news" },
  { label: "Comments", path: "GET /api/comments" },
  { label: "Favorites", path: "GET /api/favorites" },
  { label: "Notifications", path: "GET /api/notifications" },
  { label: "Settings", path: "GET /api/settings" },
];

export default function ApiDocs() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">API Reference</h1>
          <p className="text-muted-foreground">
            A quick overview of the main endpoints used by the CS2Stats client.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid gap-3">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm"
                >
                  <div className="font-medium">{endpoint.label}</div>
                  <code className="text-muted-foreground">{endpoint.path}</code>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              WebSocket endpoint: <code>/ws</code> (match updates and events)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
