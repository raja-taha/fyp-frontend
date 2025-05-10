import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/api/apiClient";

// Fetch all chatbots
export const fetchChatbots = createAsyncThunk(
  "chatbot/fetchChatbots",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/chatbots");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chatbots"
      );
    }
  }
);

export const fetchChatbotByAdmin = createAsyncThunk(
  "chatbot/fetchChatbotByAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/chatbots/admin-chatbot");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "No chatbot found"
      );
    }
  }
);

export const createChatbot = createAsyncThunk(
  "chatbot/createChatbot",
  async (chatbotData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/chatbots/create",
        chatbotData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create chatbot"
      );
    }
  }
);

export const fetchChatbotScript = createAsyncThunk(
  "chatbot/fetchScript",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/chatbots/script`, {
        responseType: "text", // Ensure response is handled as text
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching script:", error);
      return rejectWithValue(
        error.response?.data?.error || "Error fetching script"
      );
    }
  }
);
