import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { UserFavorite } from "@shared/schema";

type FavoriteType = "team" | "player";

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: favorites = [], isLoading } = useQuery<UserFavorite[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const addFavorite = useMutation({
    mutationFn: async (payload: { teamId?: string; playerId?: string }) => {
      return await apiRequest("POST", "/api/favorites", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (favoriteId: string) => {
      return await apiRequest("DELETE", `/api/favorites/${favoriteId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to manage favorites.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const getFavoriteByType = (type: FavoriteType, id: string) =>
    favorites.find((fav) => (type === "team" ? fav.teamId === id : fav.playerId === id));

  const toggleTeamFavorite = async (teamId: string) => {
    if (!requireAuth()) return;
    const existing = getFavoriteByType("team", teamId);
    if (existing) {
      removeFavorite.mutate(existing.id);
      return;
    }
    addFavorite.mutate({ teamId });
  };

  const togglePlayerFavorite = async (playerId: string) => {
    if (!requireAuth()) return;
    const existing = getFavoriteByType("player", playerId);
    if (existing) {
      removeFavorite.mutate(existing.id);
      return;
    }
    addFavorite.mutate({ playerId });
  };

  return {
    favorites,
    isLoading,
    isAuthenticated,
    isFavoriteTeam: (teamId: string) => Boolean(getFavoriteByType("team", teamId)),
    isFavoritePlayer: (playerId: string) => Boolean(getFavoriteByType("player", playerId)),
    toggleTeamFavorite,
    togglePlayerFavorite,
  };
}
