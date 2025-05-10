import React, { useState, useEffect, useRef } from "react";
import ClientSidebar from "../../components/chat/ClientSidebar";
import ChatInterface from "../../components/chat/ChatInterface";
import { useSelector, useDispatch } from "react-redux";
import { connectSocket, getSocket, joinRoom } from "../../utils/api/socket";
import { fetchClients } from "../../redux/client/clientThunks";

const AgentChats = () => {
  const { user } = useSelector((state) => state.user);
  const { clients } = useSelector((state) => state.clients);
  const [selectedClient, setSelectedClient] = useState(null);
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [socketInitialized, setSocketInitialized] = useState(false);

  // Initialize and connect to socket server
  useEffect(() => {
    if (user?.id && !socketInitialized) {
      // Connect to socket
      const socket = connectSocket();
      socketRef.current = socket;

      // Join agent's room to receive all updates
      socket.emit("joinRoom", { userId: user.id });

      setSocketInitialized(true);

      // Fetch clients
      dispatch(fetchClients(user.id));
    }
  }, [user, dispatch, socketInitialized]);

  // Join all client rooms when clients are loaded
  useEffect(() => {
    if (socketInitialized && clients.length > 0 && socketRef.current) {
      // Join all client rooms
      clients.forEach((client) => {
        const roomData = {
          userId: user.id,
          roomId: client._id,
        };
        socketRef.current.emit("joinRoom", roomData);
      });
    }
  }, [clients, user?.id, socketInitialized]);

  // Listen for client updates
  useEffect(() => {
    if (socketInitialized && socketRef.current) {
      const socket = socketRef.current;

      const handleClientUpdate = () => {
        if (user?.id) {
          dispatch(fetchClients(user.id)).then((result) => {
            // Join rooms for any new clients
            if (result.payload && result.payload.length > 0) {
              result.payload.forEach((client) => {
                // Check if this is a new client we weren't connected to before
                const isNewClient = !clients.some((c) => c._id === client._id);
                if (isNewClient) {
                  const roomData = {
                    userId: user.id,
                    roomId: client._id,
                  };
                  socket.emit("joinRoom", roomData);
                }
              });
            }
          });
        }
      };

      socket.on("clientUpdate", handleClientUpdate);

      // Clean up function will NOT disconnect the socket
      // Socket will be disconnected when user logs out via the logout action
      return () => {
        // Only clean up event listeners
        socket.off("clientUpdate", handleClientUpdate);
      };
    }
  }, [socketInitialized, user, dispatch, clients]);

  // Automatically select the first client when clients are loaded
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      // Sort clients by lastMessageTime (most recent first)
      const sortedClients = [...clients].sort((a, b) => {
        const timeA = a.lastMessageTime
          ? new Date(a.lastMessageTime)
          : new Date(0);
        const timeB = b.lastMessageTime
          ? new Date(b.lastMessageTime)
          : new Date(0);
        return timeB - timeA; // Most recent first
      });

      // Select the first client (most recent)
      setSelectedClient(sortedClients[0]);
    }
  }, [clients, selectedClient]);

  const agentId = user?.id;

  return (
    <div className="flex h-[calc(100%-30px)] overflow-hidden mt-2">
      {agentId ? (
        <div className="flex-1 flex h-full gap-4 pb-3">
          <ClientSidebar
            agentId={agentId}
            onSelectClient={setSelectedClient}
            initialSelectedClient={selectedClient}
          />
          <ChatInterface client={selectedClient} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading your inbox
            </h2>
            <p className="text-gray-600">
              Please wait while we prepare your inbox...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentChats;
