import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { connectSocket, getSocket } from "../../utils/api/socket";
import { fetchAllClients } from "../../redux/client/clientThunks";
import AdminClientSidebar from "../../components/chat/AdminClientSidebar";
import AdminChatInterface from "../../components/chat/AdminChatInterface";

const AdminChats = () => {
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

      // Join admin's room to receive all updates
      socket.emit("joinRoom", { userId: user.id });

      setSocketInitialized(true);

      // Fetch all clients
      dispatch(fetchAllClients());
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
          dispatch(fetchAllClients());
        }
      };

      socket.on("clientUpdate", handleClientUpdate);

      return () => {
        socket.off("clientUpdate", handleClientUpdate);
      };
    }
  }, [socketInitialized, user, dispatch]);

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

  const adminId = user?.id;

  return (
    <div className="flex h-[calc(100%-30px)] overflow-hidden mt-2">
      {adminId ? (
        <div className="flex-1 flex h-full gap-4 pb-3">
          <AdminClientSidebar
            adminId={adminId}
            onSelectClient={setSelectedClient}
            initialSelectedClient={selectedClient}
          />
          <AdminChatInterface client={selectedClient} />
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

export default AdminChats;
