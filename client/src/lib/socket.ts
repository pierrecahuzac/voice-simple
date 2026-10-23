import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const defaultUrl = `http://${window.location.hostname}:6666`;
    socket = io(import.meta.env.VITE_SERVER_URL ?? defaultUrl, {
      autoConnect: false,
    });
  }
  return socket;
}
