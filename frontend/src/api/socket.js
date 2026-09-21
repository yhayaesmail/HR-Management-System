import { io } from "socket.io-client";
import { getAccessToken } from "./client.js";

let socket = null;

export function getSocket(fresh = false) {
  if (socket?.connected && !fresh) return socket;
  if (socket) socket.disconnect();
  const token = getAccessToken();
  const base = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : window.location.origin.replace(":5173", ":4500");
  socket = io(base, {
    auth: { token },
    withCredentials: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
