import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server as SocketIOServer } from "socket.io";
import { SOCKET_EVENTS } from "@voice-simple/shared";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const io = new SocketIOServer(app.server, { cors: { origin: "*" } });

type RoomMembers = Map<string, Set<string>>;
const rooms: RoomMembers = new Map();

io.on("connection", (socket) => {
  let currentRoom: string | null = null;
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload: { roomId: string }) => {
    const { roomId } = payload;
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.delete(socket.id);
      io.to(currentRoom).emit(SOCKET_EVENTS.PEER_LEFT, { peerId: socket.id });
    }
    currentRoom = roomId;
    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    const existing = [...(rooms.get(roomId) ?? [])];
    rooms.get(roomId)!.add(socket.id);
    socket.emit("room-peers", existing);
    socket.to(roomId).emit(SOCKET_EVENTS.PEER_JOINED, { peerId: socket.id, username: socket.id });
  });
  socket.on(SOCKET_EVENTS.SIGNAL, (payload: { to: string; data: unknown }) => {
    io.to(payload.to).emit(SOCKET_EVENTS.SIGNAL, { from: socket.id, data: payload.data });
  });
  socket.on(SOCKET_EVENTS.MUTE_STATE, (payload: { muted: boolean }) => {
    if (currentRoom) socket.to(currentRoom).emit(SOCKET_EVENTS.MUTE_STATE, { peerId: socket.id, muted: payload.muted });
  });
  socket.on("disconnect", () => {
    if (currentRoom) {
      rooms.get(currentRoom)?.delete(socket.id);
      io.to(currentRoom).emit(SOCKET_EVENTS.PEER_LEFT, { peerId: socket.id });
    }
  });
});

const port = Number(process.env.PORT ?? 6666);
await app.listen({ port, host: "0.0.0.0" });
console.log(`server listening on ${port}`);
