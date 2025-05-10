import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../../redux/message/messageSlice";
import { getSocket, joinRoom, connectSocket } from "../api/socket";

/**
 * Hook to handle socket events
 * @param {object} options - Configuration options
 * @param {string} options.userId - User ID
 * @param {string} options.roomId - Room ID
 * @param {boolean} options.listenForMessages - Whether to listen for message events
 * @param {boolean} options.listenForNewClients - Whether to listen for new client notifications
 * @param {function} options.onNewClient - Callback function for new client notification
 * @returns {Object} Socket instance
 */
const useSocketEvents = ({
  userId,
  roomId,
  listenForMessages = true,
  listenForNewClients = false,
  onNewClient = null,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    // Ensure socket is connected
    connectSocket();
    const socket = getSocket();

    // Join room if user ID and room ID are provided
    if (roomId) {
      joinRoom({ userId, roomId });
    }

    // Listen for new messages
    if (listenForMessages) {
      // Remove any existing listeners first to prevent duplicates
      socket.off("newMessage");
      socket.on("newMessage", (message) => {
        dispatch(addMessage(message));
      });
    }

    // Listen for new client notifications
    if (listenForNewClients && onNewClient) {
      // Remove any existing listeners first to prevent duplicates
      socket.off("newClientNotification");
      socket.on("newClientNotification", (data) => {
        if (onNewClient && typeof onNewClient === "function") {
          onNewClient(data);
        }
      });
    }

    // Cleanup event listeners
    return () => {
      if (listenForMessages) {
        socket.off("newMessage");
      }
      if (listenForNewClients) {
        socket.off("newClientNotification");
      }
    };
  }, [
    dispatch,
    userId,
    roomId,
    listenForMessages,
    listenForNewClients,
    onNewClient,
  ]);

  return getSocket();
};

export default useSocketEvents;
