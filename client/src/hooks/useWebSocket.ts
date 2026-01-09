import { useEffect, useRef, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import type { Match, MatchEvent } from "@shared/schema";

type WebSocketMessage = 
  | { type: "connected"; message: string }
  | { type: "match_update"; data: Match }
  | { type: "match_event"; data: MatchEvent };

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case "connected":
              console.log("WebSocket:", message.message);
              break;
              
            case "match_update": {
              console.log("Match updated:", message.data);
              const matchId = message.data.id;
              
              queryClient.setQueryData(
                ["/api/matches", matchId],
                (oldData: any) => {
                  if (!oldData) return oldData;
                  
                  return {
                    ...oldData,
                    team1Score: message.data.team1Score,
                    team2Score: message.data.team2Score,
                    status: message.data.status,
                    currentMap: message.data.currentMap,
                    startedAt: message.data.startedAt,
                    finishedAt: message.data.finishedAt,
                  };
                }
              );
              queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
              break;
            }
              
            case "match_event": {
              console.log("Match event:", message.data);
              const matchId = message.data.matchId;
              queryClient.invalidateQueries({ 
                queryKey: ["/api/matches", matchId, "events"] 
              });
              break;
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        
        reconnectTimeout.current = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return { isConnected };
}
