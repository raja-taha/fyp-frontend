import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/api/apiClient";

// Thunk to fetch messages between agent and client
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ clientId, agentId, silent = false }, { rejectWithValue }) => {
    try {
      // For admin view, we'll fetch messages based on client ID only
      // For agent view, we'll include the agent ID
      const params = { clientId };
      if (agentId) {
        params.agentId = agentId;
      }

      const response = await axiosInstance.get(`/api/chats/messages`, {
        params,
      });

      // Check if response.data is an array (direct messages array)
      // or an object (wrapped messages with metadata)
      if (Array.isArray(response.data)) {
        return { messages: response.data, silent };
      } else {
        return { ...response.data, silent };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch messages"
      );
    }
  }
);

// Thunk to send a message
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (
    { clientId, agentId, sender, text, timestamp },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/api/chats/message", {
        clientId,
        agentId,
        sender,
        text,
        timestamp,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to send message");
    }
  }
);
