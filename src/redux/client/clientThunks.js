import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/api/apiClient";

// ✅ Fetch all clients assigned to admin's agents
export const fetchAllClients = createAsyncThunk(
  "clients/fetchAllClients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/clients/getAllClients");
      return response.data.clients; // Return clients data
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch clients");
    }
  }
);

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (agentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/clients/assigned/${agentId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch clients");
    }
  }
);
