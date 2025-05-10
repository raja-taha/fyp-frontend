import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchClients } from "../../redux/client/clientThunks";
import { Search, Star } from "lucide-react";
import { getSocket, connectSocket } from "../../utils/api/socket";
import useSocketEvents from "../../utils/hooks/useSocketEvents";

// Path to notification sound
const NOTIFICATION_SOUND_PATH = "/sounds/notification.mp3";
// Flag to track if audio has been initialized by user interaction
let audioInitialized = false;

const ClientSidebar = ({ agentId, onSelectClient, initialSelectedClient }) => {
  const dispatch = useDispatch();
  const { clients, loading } = useSelector((state) => state.clients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const { user } = useSelector((state) => state.user);
  const [localClients, setLocalClients] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const notificationSound = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  const [newClientIds, setNewClientIds] = useState(new Set());

  // Initialize audio on component mount
  useEffect(() => {
    // Initialize audio
    notificationSound.current = new Audio(NOTIFICATION_SOUND_PATH);

    // Set up event listeners for the audio element
    notificationSound.current.addEventListener("canplaythrough", () => {
      setAudioReady(true);
    });

    // Attempt to load the audio
    notificationSound.current.load();

    return () => {
      if (notificationSound.current) {
        notificationSound.current.removeEventListener("canplaythrough", () => {
          setAudioReady(false);
        });
      }
    };
  }, []);

  // Initialize audio on user interaction with the component
  useEffect(() => {
    const initializeAudio = () => {
      if (notificationSound.current && !audioInitialized) {
        // Try to play and immediately pause to initialize audio
        notificationSound.current.volume = 0;
        notificationSound.current
          .play()
          .then(() => {
            notificationSound.current.pause();
            notificationSound.current.currentTime = 0;
            notificationSound.current.volume = 1;
            audioInitialized = true;
          })
          .catch((err) => {
            console.log("Audio couldn't be initialized yet in sidebar:", err);
          });
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("click", initializeAudio);
    document.addEventListener("keydown", initializeAudio);

    return () => {
      document.removeEventListener("click", initializeAudio);
      document.removeEventListener("keydown", initializeAudio);
    };
  }, [audioReady]);

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Only try to play if we have the audio element and it's been initialized
      if (notificationSound.current && audioReady) {
        // Reset the audio to the beginning
        notificationSound.current.currentTime = 0;

        // Attempt to play with user gesture
        const playPromise = notificationSound.current.play();

        // Handle play promise
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Error playing notification sound in sidebar:", error);
            // Don't show this as an error since it's expected in some cases
          });
        }
      }
    } catch (error) {
      console.log("Failed to play notification sound in sidebar:", error);
    }
  }, [audioReady]);

  // Handle new client notification
  const handleNewClientNotification = useCallback(
    (data) => {
      const { clientId, message } = data;

      // Play notification sound
      playNotificationSound();

      // Show browser notification if permission is granted
      if (Notification.permission === "granted") {
        const notification = new Notification("New Client Message", {
          body: message,
          icon: "/robot-logo.svg",
        });

        // Add click handler to navigate to the chat
        notification.onclick = function () {
          window.focus();

          // Find the client in our list
          const client = localClients.find((c) => c._id === clientId);
          if (client) {
            handleClientSelect(client);
          } else {
            // If the client isn't in our list, refresh the client list
            dispatch(fetchClients(agentId));
          }
        };
      }

      // Add clientId to new clients set for visual indication
      setNewClientIds((prev) => new Set(prev).add(clientId));

      // Update the unread counts
      setUnreadCounts((prev) => ({
        ...prev,
        [clientId]: (prev[clientId] || 0) + 1,
      }));

      // Refresh client list to make sure we have this client
      dispatch(fetchClients(agentId));
    },
    [agentId, localClients, dispatch, playNotificationSound]
  );

  // Request notification permissions on component mount
  useEffect(() => {
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Use the socket events hook for new client notifications
  useSocketEvents({
    userId: user?.id,
    listenForMessages: false,
    listenForNewClients: true,
    onNewClient: handleNewClientNotification,
  });

  // Set initial selected client when provided
  useEffect(() => {
    if (initialSelectedClient && initialSelectedClient._id) {
      setSelectedClientId(initialSelectedClient._id);
      // Clear unread count for selected client
      setUnreadCounts((prev) => ({
        ...prev,
        [initialSelectedClient._id]: 0,
      }));
      // Remove from new clients set
      setNewClientIds((prev) => {
        const updated = new Set(prev);
        updated.delete(initialSelectedClient._id);
        return updated;
      });
    }
  }, [initialSelectedClient]);

  // Keep local clients updated with redux state after initial load
  useEffect(() => {
    if (clients.length > 0) {
      setLocalClients(clients);
      setInitialLoadComplete(true);
    }
  }, [clients]);

  // Ensure socket connection is established and setup listeners for client updates
  useEffect(() => {
    // Ensure socket is connected
    connectSocket();
    const socket = getSocket();

    // Listen for any new message
    const handleNewMessage = (message) => {
      if (initialLoadComplete) {
        // Immediately update the client's lastMessageTime in the local state
        setLocalClients((prevClients) => {
          return prevClients.map((client) => {
            if (client._id === message.clientId) {
              return {
                ...client,
                lastMessageTime: message.timestamp || new Date().toISOString(),

                lastMessage: message.translatedText
                  ? // Truncate message text for preview if needed
                    typeof message.translatedText === "string" &&
                    message.translatedText.length > 30
                    ? message.translatedText.substring(0, 30) + "..."
                    : message.translatedText
                  : "New message",
              };
            }
            return client;
          });
        });

        // Increment unread count if message is from client and not the currently selected client
        if (
          message.sender === "client" &&
          message.clientId !== selectedClientId
        ) {
          // Play notification sound when receiving messages from client
          // and the chat isn't already open for that client
          playNotificationSound();

          // Immediately update unread counts
          setUnreadCounts((prev) => ({
            ...prev,
            [message.clientId]: (prev[message.clientId] || 0) + 1,
          }));

          // Add to new clients visual indicator
          setNewClientIds((prev) => new Set(prev).add(message.clientId));
        }
      }
    };

    // Listen for client updates
    const handleClientUpdate = () => {
      // Silently fetch clients in the background without showing loading state
      dispatch(fetchClients(agentId));
    };

    // Remove any existing listeners to prevent duplicates
    socket.off("newMessage", handleNewMessage);
    socket.off("clientUpdate", handleClientUpdate);

    // Add listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("clientUpdate", handleClientUpdate);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("clientUpdate", handleClientUpdate);
    };
  }, [
    dispatch,
    agentId,
    initialLoadComplete,
    selectedClientId,
    playNotificationSound,
  ]);

  // Initial fetch of clients
  useEffect(() => {
    dispatch(fetchClients(agentId));
  }, [dispatch, agentId]);

  const filteredClients = localClients.filter((client) =>
    `${client?.firstName} ${client?.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Sort clients by lastMessageTime (most recent first)
  const sortedClients = [...filteredClients].sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
    return timeB - timeA; // Most recent first
  });

  const formatMessageTime = (timeString) => {
    if (!timeString) return "";

    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

    return `${displayHours}:${minutes} ${ampm}`;
  };

  const handleClientSelect = (client) => {
    setSelectedClientId(client._id);

    // Clear unread count when selecting a client
    setUnreadCounts((prev) => ({
      ...prev,
      [client._id]: 0,
    }));

    // Remove from new clients set
    setNewClientIds((prev) => {
      const updated = new Set(prev);
      updated.delete(client._id);
      return updated;
    });

    onSelectClient(client);
  };

  // Client count display
  const inboxCount = filteredClients.length || 0;

  return (
    <div className="w-72 h-full bg-white flex flex-col rounded-lg">
      <div className="p-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search clients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
          />
        </div>

        <div className="mt-2 pl-1 text-xs text-gray-500 flex items-center justify-between">
          <span>Inbox ({inboxCount})</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-2 client-list">
        {loading && !initialLoadComplete ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : sortedClients.length === 0 ? (
          <div className="text-center p-4 text-gray-500 text-sm">
            No clients found
          </div>
        ) : (
          <ul className="space-y-1 px-2">
            {sortedClients.map((client) => (
              <li
                key={client._id}
                data-client-id={client._id}
                className={`flex items-center py-2 px-2 rounded-lg cursor-pointer ${
                  selectedClientId === client._id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50"
                } ${
                  newClientIds.has(client._id)
                    ? "new-client ring-2 ring-blue-400"
                    : ""
                }`}
                onClick={() => handleClientSelect(client)}
              >
                <div
                  className={`h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 flex-shrink-0 ${
                    client.isStarred ? "ring-2 ring-amber-400" : ""
                  }`}
                >
                  <span className="font-semibold uppercase text-xs">
                    {client?.firstName?.charAt(0)}
                    {client?.lastName?.charAt(0)}
                  </span>
                  {client.isStarred && (
                    <Star
                      size={12}
                      className="absolute -top-1 -right-1 text-amber-400 fill-amber-400"
                    />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">
                      {client?.firstName} {client?.lastName}
                    </h3>
                    <span className="text-gray-400 text-xs">
                      {formatMessageTime(client?.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs truncate">
                      {client?.lastMessage || "No messages yet"}
                    </p>
                    {unreadCounts[client._id] ? (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCounts[client._id]}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientSidebar;
