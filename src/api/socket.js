import { io } from "socket.io-client";
import { ASSET_BASE_URL } from "./axios";

let socket;

export const getSocket = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || ASSET_BASE_URL;

  if (!socketUrl) {
    return null;
  }

  if (!socket) {
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};
