import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import type { Server as HttpServer } from "http";

export let io: SocketServer;

export async function setupSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: { origin: "*" }, // fine for now, we'll tighten before deploying
  });

  // Two separate Redis connections: one only for publishing, one only for
  // subscribing. Redis requires this split for pub/sub to work correctly.
  const pubClient = new Redis(process.env.REDIS_URL as string);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // A "room" is a named group of connected clients. Everyone viewing the
    // same board joins the same room, so we can broadcast only to them —
    // not to every connected user across the whole app.
    socket.on("join-board", (boardId: number) => {
      socket.join(`board-${boardId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}