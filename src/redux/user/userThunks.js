import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/api/apiClient";
import { resetAuthState } from "./userSlice";
import { disconnectSocket, getSocket, leaveRoom } from "../../utils/api/socket";

// ✅ User Login (Handles both agents & admins)
export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/users/login",
        credentials
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ✅ Logout User
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      // Get the current user and client list
      const { user } = getState().user;
      const { clients } = getState().clients;

      // Disconnect socket before logout
      const socket = getSocket();
      if (socket && user?.id) {
        // Leave individual rooms for each client before disconnecting
        if (clients && clients.length > 0) {
          clients.forEach((client) => {
            if (client._id) {
              const roomData = {
                userId: user.id,
                roomId: client._id,
              };
              leaveRoom(roomData);
            }
          });
        }

        // Leave agent's personal room
        leaveRoom({ userId: user.id });

        // Try leaveAllRooms as a fallback
        socket.emit("leaveAllRooms");

        // Finally disconnect
        disconnectSocket();
      }

      const response = await axiosInstance.post("/api/users/logout");
      dispatch(resetAuthState()); // Clear user data & token in Redux
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ✅ Update User Status (Agent updates their own status)
export const updateUserStatus = createAsyncThunk(
  "user/updateStatus",
  async ({ status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/api/users/status", {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ✅ Admin Updates Agent Status
export const updateAgentStatus = createAsyncThunk(
  "admin/updateAgentStatus",
  async ({ agentId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/users/status/${agentId}`,
        {
          status,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ✅ Fetch Agents Created by the Logged-in Admin
export const fetchAgents = createAsyncThunk(
  "admin/fetchAgents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/users/agents");
      return response.data.agents; // Returning only agents array
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const createAdmin = createAsyncThunk(
  "user/createAdmin",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/users/admin/create",
        adminData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error || "Failed to create admin");
    }
  }
);

export const fetchAdmins = createAsyncThunk(
  "user/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/users/admins");
      return response.data.admins;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admins"
      );
    }
  }
);

export const verifyAdmin = createAsyncThunk(
  "user/verifyAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/users/admin/verify/${adminId}`
      );
      return { adminId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify admin"
      );
    }
  }
);

export const createAgent = createAsyncThunk(
  "admin/createAgent",
  async (agentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/users/agent/create",
        agentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create agent");
    }
  }
);

export const deleteAgent = createAsyncThunk(
  "admin/deleteAgent",
  async (agentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/api/users/agent/${agentId}`
      );
      return { agentId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete agent");
    }
  }
);

// ✅ Fetch Team Details for Admin Dashboard
export const fetchTeamDetails = createAsyncThunk(
  "admin/fetchTeamDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/users/team");
      return {
        admin: response.data.admin,
        team: response.data.team,
        totalAgents: response.data.totalAgents,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch team details"
      );
    }
  }
);

// ✅ Fetch Agent Team Details
export const fetchAgentTeam = createAsyncThunk(
  "agent/fetchAgentTeam",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/users/myteam");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch agent team details"
      );
    }
  }
);

// ✅ Update Agent Profile
export const updateAgentProfile = createAsyncThunk(
  "agent/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/api/users/agent/profile",
        profileData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// ✅ Update Agent Status (using set-status endpoint)
export const setAgentStatus = createAsyncThunk(
  "agent/setStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/api/users/set-status", {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

// ✅ Update User Language Preference
export const updateLanguagePreference = createAsyncThunk(
  "user/updateLanguage",
  async (language, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/api/users/language", {
        language,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update language preference"
      );
    }
  }
);

// ✅ Update Admin Profile
export const updateAdminProfile = createAsyncThunk(
  "admin/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/api/users/admin/profile",
        profileData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// ✅ Update Superadmin Profile
export const updateSuperadminProfile = createAsyncThunk(
  "superadmin/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/api/users/superadmin/profile",
        profileData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);
