import { useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getTokenFromLocation(location: string) {
  const [, queryString] = location.split("?");
  const params = new URLSearchParams(queryString || "");
  return (params.get("token") || "").trim();
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export default function ResetPassword() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const token = useMemo(() => getTokenFromLocation(location), [location]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = token && password.length >= 8 && password === confirm;

  const onSubmit = async () => {
    if (!token) {
      toast({
        title: "Missing token",
        description: "Open the reset link from your email again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm your new password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await postJson("/api/auth/reset-password", { token, password });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Password updated",
        description: "You are now signed in.",
      });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Missing reset token. Open the link from your email, or request a new one.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              data-testid="input-reset-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm">Confirm password</Label>
            <Input
              id="reset-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              data-testid="input-reset-confirm"
            />
          </div>

          <Button className="w-full" onClick={onSubmit} disabled={!canSubmit || loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

