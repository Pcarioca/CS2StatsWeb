import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sun, Moon, Monitor } from "lucide-react";
import type { UserSettings } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [matchStartAlerts, setMatchStartAlerts] = useState(true);
  const [commentReplyAlerts, setCommentReplyAlerts] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications);
      setMatchStartAlerts(settings.matchStartAlerts);
      setCommentReplyAlerts(settings.commentReplyAlerts);
      setNewsletter(settings.newsletter);
      setPublicProfile(settings.publicProfile);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      return await apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleEmailNotifications = (checked: boolean) => {
    setEmailNotifications(checked);
    updateSettingsMutation.mutate({ emailNotifications: checked });
  };

  const handleToggleMatchAlerts = (checked: boolean) => {
    setMatchStartAlerts(checked);
    updateSettingsMutation.mutate({ matchStartAlerts: checked });
  };

  const handleToggleCommentReplies = (checked: boolean) => {
    setCommentReplyAlerts(checked);
    updateSettingsMutation.mutate({ commentReplyAlerts: checked });
  };

  const handleToggleNewsletter = (checked: boolean) => {
    setNewsletter(checked);
    updateSettingsMutation.mutate({ newsletter: checked });
  };

  const handleTogglePublicProfile = (checked: boolean) => {
    setPublicProfile(checked);
    updateSettingsMutation.mutate({ publicProfile: checked });
  };

  const handleExportData = async () => {
    try {
      const res = await fetch("/api/account/export", { credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cs2stats-export.json";
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Export ready", description: "Downloaded your data as JSON." });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => apiRequest("DELETE", "/api/account"),
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been removed.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm your new password.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate();
  };

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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and notifications
          </p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how CS2Stats looks for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-3 block">Theme</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2"
                  data-testid="theme-button-light"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2"
                  data-testid="theme-button-dark"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2"
                  data-testid="theme-button-system"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Control how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={handleToggleEmailNotifications}
                data-testid="switch-email-notifications"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="match-start-alerts">Match Start Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when favorite teams play
                </p>
              </div>
              <Switch
                id="match-start-alerts"
                checked={matchStartAlerts}
                onCheckedChange={handleToggleMatchAlerts}
                data-testid="switch-match-alerts"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comment-replies">Comment Replies</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for replies to your comments
                </p>
              </div>
              <Switch
                id="comment-replies"
                checked={commentReplyAlerts}
                onCheckedChange={handleToggleCommentReplies}
                data-testid="switch-comment-replies"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly digest of CS2 news and highlights
                </p>
              </div>
              <Switch
                id="newsletter"
                checked={newsletter}
                onCheckedChange={handleToggleNewsletter}
                data-testid="switch-newsletter"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Update your password for email & password login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                data-testid="input-current-password"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={
                changePasswordMutation.isPending ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              data-testid="button-change-password"
            >
              {changePasswordMutation.isPending ? "Updating..." : "Change password"}
            </Button>
            <p className="text-xs text-muted-foreground">
              If you signed in with Google and don’t have a password yet, use “Forgot password” on the login page to set one.
            </p>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Manage your privacy and data preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-visibility">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Make your profile visible to others
                </p>
              </div>
              <Switch
                id="profile-visibility"
                checked={publicProfile}
                onCheckedChange={handleTogglePublicProfile}
                data-testid="switch-profile-visibility"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Data Management</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportData} data-testid="button-export-data">
                  Export My Data
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const ok = window.confirm("Delete your account permanently? This cannot be undone.");
                    if (ok) deleteAccountMutation.mutate();
                  }}
                  disabled={deleteAccountMutation.isPending}
                  data-testid="button-delete-account"
                >
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild data-testid="button-logout">
              <a href="/api/logout">Log Out</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
