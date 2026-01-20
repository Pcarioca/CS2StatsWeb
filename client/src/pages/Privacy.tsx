import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            We keep data collection minimal and only use it to provide core features.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
            <p>
              CS2Stats stores user accounts, preferences, and favorites. We do not sell personal data.
              Social logins only share the profile information required to create an account.
            </p>
            <p>
              Media uploads are stored securely and access is controlled through authenticated requests.
              You can request account deletion at any time.
            </p>
            <p>
              For more details, contact us at hello@cs2stats.example.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
