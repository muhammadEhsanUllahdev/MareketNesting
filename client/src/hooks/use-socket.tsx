import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { type Notification } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export function useSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Create socket connection
    const socket = io({
      path: "/socket.io",
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server");
      
      // Join user-specific room
      socket.emit("join-user-room", user.id);
      
      // Join admin room if user is admin
      if (user.role === "admin") {
        socket.emit("join-admin-room");
      }
    });

    socket.on("notification", (notification: Notification) => {
      console.log("Received notification:", notification);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
      
      // Invalidate notifications query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user, toast]);

  return socketRef.current;
}