import { Link } from "wouter";
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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

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
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search matches, teams, players..."
                className="pl-9 pr-4"
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="sm:hidden" data-testid="button-search-mobile">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications (logged in only) */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" variant="destructive">
                    3
                  </Badge>
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    No new notifications
                  </div>
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
