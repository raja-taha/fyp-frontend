import { io } from "socket.io-client";

// Create socket instance
const socket = io(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  {
    transports: ["websocket"],
    autoConnect: true, // Connect automatically
    reconnection: true, // Enable reconnection
    reconnectionAttempts: Infinity, // Keep trying to reconnect indefinitely
    reconnectionDelay: 1000, // Start with 1 second delay between reconnection attempts
    reconnectionDelayMax: 5000, // Maximum delay between reconnections
    timeout: 20000, // Connection timeout in ms
    pingTimeout: 30000, // Ping timeout
    pingInterval: 25000, // How often to ping the server
    forceNew: false, // Reuse existing connection
    multiplex: true, // Use a single connection for multiple namespaces
  }
);

// Set up a ping interval to keep connection alive
let pingInterval = null;
// Flag to track if socket is connected
let isConnected = false;

// Connect to socket - now just ensures socket connection and returns it
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }

  // Add event listeners if they haven't been added yet
  if (!isConnected) {
    socket.on("connect", () => {
      isConnected = true;

      // Clear any existing ping interval
      if (pingInterval) clearInterval(pingInterval);

      // Setup ping to keep connection alive
      pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit("ping");
        }
      }, 25000); // Ping every 25 seconds
    });

    socket.on("connect_error", (error) => {
      isConnected = false;
    });

    socket.on("disconnect", (reason) => {
      isConnected = false;
    });
  }

  return socket;
};

// Disconnect from socket - should ONLY be called during logout
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    isConnected = false;
  }

  // Clear ping interval on disconnect
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};

// Check connection and reconnect if needed - now just ensures socket is connected
export const ensureSocketConnected = async () => {
  if (!socket.connected) {
    socket.connect();
  }
  return Promise.resolve(true);
};

// Join a room
export const joinRoom = (roomData) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit("joinRoom", roomData);
};

// Leave a room
export const leaveRoom = (roomData) => {
  socket.emit("leaveRoom", roomData);
};

// Leave all rooms
export const leaveAllRooms = () => {
  socket.emit("leaveAllRooms");
};

// Send a message
export const sendSocketMessage = (messageData) => {
  socket.emit("sendMessage", messageData);
};

// Check if socket is connected
export const isSocketConnected = () => {
  return socket.connected;
};

// Get the socket instance
export const getSocket = () => socket;

export default {
  socket,
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  leaveAllRooms,
  sendSocketMessage,
  getSocket,
  ensureSocketConnected,
  isSocketConnected,
};
