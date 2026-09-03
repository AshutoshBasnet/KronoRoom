import { io } from 'socket.io-client';

// Connect to backend via proxy in dev or current origin in prod
export const socket = io(import.meta.env.VITE_API_BASE_URL || "https://api.ashutoshcodes.me/socket.io", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000
});

export default socket;
