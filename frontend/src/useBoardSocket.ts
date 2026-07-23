import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useBoardSocket(boardId: number | null, onCardMoved: () => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-board", boardId);
    });

    socket.on("card-moved", () => {
      onCardMoved(); // just re-fetch the board when anything changes
    });

    return () => {
      socket.disconnect(); // cleanup when leaving the board or unmounting
    };
  }, [boardId]);
}