import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllClients } from "../../redux/client/clientThunks";
import { Search, Star, ChevronDown, ChevronRight } from "lucide-react";
import { getSocket, connectSocket } from "../../utils/api/socket";
import useSocketEvents from "../../utils/hooks/useSocketEvents";

// Path to notification sound
const NOTIFICATION_SOUND_PATH = "/sounds/notification.mp3";
// Flag to track if audio has been initialized by user interaction
let audioInitialized = false;

const AdminClientSidebar = ({
  adminId,
  onSelectClient,
  initialSelectedClient,
}) => {
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
  const [expandedAgents, setExpandedAgents] = useState({});

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
            dispatch(fetchAllClients());
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
      dispatch(fetchAllClients());
    },
    [localClients, dispatch, playNotificationSound]
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
                lastMessage: message.text
                  ? // Truncate message text for preview if needed
                    typeof message.text === "string" && message.text.length > 30
                    ? message.text.substring(0, 30) + "..."
                    : message.text
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
      dispatch(fetchAllClients());
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
  }, [dispatch, initialLoadComplete, selectedClientId, playNotificationSound]);

  // Initial fetch of clients
  useEffect(() => {
    dispatch(fetchAllClients());
  }, [dispatch]);

  const filteredClients = localClients.filter((client) =>
    `${client?.firstName} ${client?.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Group clients by agent
  const clientsByAgent = filteredClients.reduce((acc, client) => {
    const agentName = client.assignedAgent?.username || "Unassigned";
    const agentId = client.assignedAgent?._id || "unassigned";

    if (!acc[agentId]) {
      acc[agentId] = {
        id: agentId,
        name: agentName,
        clients: [],
      };
    }

    acc[agentId].clients.push(client);
    return acc;
  }, {});

  // Sort each agent's clients by lastMessageTime
  Object.values(clientsByAgent).forEach((agentGroup) => {
    agentGroup.clients.sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime)
        : new Date(0);
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime)
        : new Date(0);
      return timeB - timeA; // Most recent first
    });
  });

  // Format time for message display
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

  const toggleAgentExpand = (agentId) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  // Default: expand all agent groups on initial load
  useEffect(() => {
    if (
      Object.keys(clientsByAgent).length > 0 &&
      Object.keys(expandedAgents).length === 0
    ) {
      const initialExpandState = {};
      Object.keys(clientsByAgent).forEach((agentId) => {
        initialExpandState[agentId] = true;
      });
      setExpandedAgents(initialExpandState);
    }
  }, [clientsByAgent]);

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
      </div>

      <div className="border-t border-gray-100 px-3 py-2">
        <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
          Inbox ({inboxCount})
        </h3>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading clients...</div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {!loading && Object.values(clientsByAgent).length === 0 && (
          <div className="p-4 text-center text-gray-500">No clients found</div>
        )}

        {!loading &&
          Object.values(clientsByAgent).map((agentGroup) => (
            <div key={agentGroup.id} className="mb-2">
              <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleAgentExpand(agentGroup.id)}
              >
                <div className="flex items-center">
                  {expandedAgents[agentGroup.id] ? (
                    <ChevronDown size={16} className="text-gray-500 mr-1" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500 mr-1" />
                  )}
                  <h3 className="text-sm font-medium text-gray-700">
                    {agentGroup.name} ({agentGroup.clients.length})
                  </h3>
                </div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-500">
                    {agentGroup.language}
                  </div>
                </div>
              </div>

              {expandedAgents[agentGroup.id] &&
                agentGroup.clients.map((client) => {
                  const isNew = newClientIds.has(client._id);
                  const unreadCount = unreadCounts[client._id] || 0;
                  const isSelected = selectedClientId === client._id;

                  return (
                    <div
                      key={client._id}
                      className={`flex items-center px-6 py-3 cursor-pointer transition-colors border-l-2 ${
                        isSelected
                          ? "border-l-primary bg-gray-100/70 border-l-3"
                          : isNew
                          ? "border-l-yellow-500"
                          : "border-l-transparent"
                      } ${
                        isSelected
                          ? "hover:bg-gray-100/90"
                          : "hover:bg-gray-100/50"
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="flex-1 ml-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div
                            className={`font-medium truncate ${
                              isNew || unreadCount > 0
                                ? "text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {client.firstName} {client.lastName}
                          </div>
                          <div
                            className={`text-xs ${
                              isNew || unreadCount > 0
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {client.lastMessageTime
                              ? formatMessageTime(client.lastMessageTime)
                              : ""}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <div className="text-xs text-gray-500">
                            {client.language?.toUpperCase()}
                          </div>
                          {unreadCount > 0 && (
                            <div className="bg-primary text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                              {unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminClientSidebar;
