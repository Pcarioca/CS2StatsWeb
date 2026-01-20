import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Contact</h1>
          <p className="text-muted-foreground">
            Questions, feedback, or partnerships? Reach us any time.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 p-4 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <div className="font-semibold">Email</div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Send us a message and we will get back within 24 hours.
                </p>
                <Button asChild variant="outline">
                  <a href="mailto:hello@cs2stats.example">hello@cs2stats.example</a>
                </Button>
              </div>

              <div className="flex-1 p-4 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4" />
                  <div className="font-semibold">Community</div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Join our community server for announcements and support.
                </p>
                <Button asChild variant="outline">
                  <a href="https://discord.com" target="_blank" rel="noreferrer">
                    Join Discord
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
