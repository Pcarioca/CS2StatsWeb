import { Link, useLocation } from "wouter";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const currentQuery = useMemo(() => {
    if (!location.startsWith("/search")) return "";
    const [, queryString] = location.split("?");
    const params = new URLSearchParams(queryString || "");
    return (params.get("q") || "").trim();
  }, [location]);
  const [searchQuery, setSearchQuery] = useState(currentQuery);

  useEffect(() => {
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    setLocation(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markNotificationRead = useMutation({
    mutationFn: async (notificationId: string) =>
      apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationRead.mutate(notification.id);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md" data-testid="link-home">
            <span className="font-bold text-xl tracking-tight">CS2Stats</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/matches" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover-elevate px-3 py-2 rounded-md" data-testid="link-matches">
              Matches
            </Link>
            <Link href="/teams" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover-elevate px-3 py-2 rounded-md" data-testid="link-teams">
              Teams
            </Link>
            <Link href="/players" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover-elevate px-3 py-2 rounded-md" data-testid="link-players">
              Players
            </Link>
            <Link href="/leaderboards" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover-elevate px-3 py-2 rounded-md" data-testid="link-leaderboards">
              Leaderboards
            </Link>
            <Link href="/news" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover-elevate px-3 py-2 rounded-md" data-testid="link-news">
              News
            </Link>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className={cn(
            "hidden sm:flex items-center transition-all",
            searchOpen ? "w-96" : "w-64"
          )}>
            <form className="relative w-full" onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search matches, teams, players..."
                className="pl-9 pr-4"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
                data-testid="input-search"
              />
            </form>
          </div>

          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setLocation("/search")}
            data-testid="button-search-mobile"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications (logged in only) */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const content = (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{notification.title}</span>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-[10px]">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{notification.message}</span>
                          {notification.createdAt && (
                            <span className="text-[11px] text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      );

                      return notification.link ? (
                        <DropdownMenuItem key={notification.id} asChild>
                          <Link
                            href={notification.link}
                            onClick={() => handleNotificationClick(notification)}
                            className="flex flex-col items-start gap-1"
                          >
                            {content}
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          key={notification.id}
                          onSelect={() => handleNotificationClick(notification)}
                          className="flex flex-col items-start gap-1"
                        >
                          {content}
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu or Sign In */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer" data-testid="link-profile">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer" data-testid="link-settings">
                    Settings
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer" data-testid="link-admin">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="cursor-pointer" data-testid="link-logout">
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild data-testid="button-signin">
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/matches" className="text-lg font-medium hover-elevate px-4 py-2 rounded-md" data-testid="mobile-link-matches">
                  Matches
                </Link>
                <Link href="/teams" className="text-lg font-medium hover-elevate px-4 py-2 rounded-md" data-testid="mobile-link-teams">
                  Teams
                </Link>
                <Link href="/players" className="text-lg font-medium hover-elevate px-4 py-2 rounded-md" data-testid="mobile-link-players">
                  Players
                </Link>
                <Link href="/leaderboards" className="text-lg font-medium hover-elevate px-4 py-2 rounded-md" data-testid="mobile-link-leaderboards">
                  Leaderboards
                </Link>
                <Link href="/news" className="text-lg font-medium hover-elevate px-4 py-2 rounded-md" data-testid="mobile-link-news">
                  News
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
