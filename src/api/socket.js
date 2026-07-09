import { io } from "socket.io-client";
import { ASSET_BASE_URL } from "./axios";

let socket;
let currentToken = null;

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};

export const getSocket = () => {
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    ASSET_BASE_URL;

  if (!socketUrl) {
    return null;
  }

  const token = localStorage.getItem("token");

  if (socket && currentToken !== token) {
    disconnectSocket();
  }

  if (!socket) {
    currentToken = token;
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: token ? { token } : {},
    });
  }

  return socket;
};

export const resetSocket = () => {
  disconnectSocket();
};
