import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDashboardStats,
  fetchClientData,
  fetchAdminDashboardStats,
  fetchAdminClientData,
  fetchAgentDashboardStats,
  fetchAgentClientData,
} from "./dashboardThunks";

const initialState = {
  // Superadmin stats
  totalAdmins: 0,
  totalChatbots: 0,
  totalAgents: 0,
  totalClients: 0,

  // Admin stats
  adminTotalAgents: 0,
  adminTotalClients: 0,

  // Agent stats
  totalClientsHandled: 0,

  // Graph data
  clientGraphData: [],
  adminClientGraphData: [],
  agentClientGraphData: [],
  selectedPeriod: "month",

  // Status flags
  status: "idle",
  adminStatus: "idle",
  agentStatus: "idle",
  clientDataStatus: "idle",
  adminClientDataStatus: "idle",
  agentClientDataStatus: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Superadmin dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.totalAdmins = action.payload.totalAdmins;
        state.totalChatbots = action.payload.totalChatbots;
        state.totalAgents = action.payload.totalAgents;
        state.totalClients = action.payload.totalClients;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Admin dashboard stats
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.adminStatus = "loading";
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminTotalAgents = action.payload.totalAgents;
        state.adminTotalClients = action.payload.totalClients;
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.adminStatus = "failed";
        state.error = action.error.message;
      })

      // Agent dashboard stats
      .addCase(fetchAgentDashboardStats.pending, (state) => {
        state.agentStatus = "loading";
      })
      .addCase(fetchAgentDashboardStats.fulfilled, (state, action) => {
        state.agentStatus = "succeeded";
        state.totalClientsHandled = action.payload.totalClientsHandled;
      })
      .addCase(fetchAgentDashboardStats.rejected, (state, action) => {
        state.agentStatus = "failed";
        state.error = action.error.message;
      })

      // Superadmin client data
      .addCase(fetchClientData.pending, (state) => {
        state.clientDataStatus = "loading";
      })
      .addCase(fetchClientData.fulfilled, (state, action) => {
        state.clientDataStatus = "succeeded";
        state.clientGraphData = action.payload;
      })
      .addCase(fetchClientData.rejected, (state, action) => {
        state.clientDataStatus = "failed";
        state.error = action.error.message;
      })

      // Admin client data
      .addCase(fetchAdminClientData.pending, (state) => {
        state.adminClientDataStatus = "loading";
      })
      .addCase(fetchAdminClientData.fulfilled, (state, action) => {
        state.adminClientDataStatus = "succeeded";
        state.adminClientGraphData = action.payload;
      })
      .addCase(fetchAdminClientData.rejected, (state, action) => {
        state.adminClientDataStatus = "failed";
        state.error = action.error.message;
      })

      // Agent client data
      .addCase(fetchAgentClientData.pending, (state) => {
        state.agentClientDataStatus = "loading";
      })
      .addCase(fetchAgentClientData.fulfilled, (state, action) => {
        state.agentClientDataStatus = "succeeded";
        state.agentClientGraphData = action.payload;
      })
      .addCase(fetchAgentClientData.rejected, (state, action) => {
        state.agentClientDataStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setSelectedPeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;
