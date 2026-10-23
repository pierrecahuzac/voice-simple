import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL ?? "http://localhost:6666", {
      autoConnect: false,
    });
  }
  return socket;
}
