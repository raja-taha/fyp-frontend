import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import {
  loginUser,
  logoutUser,
  updateUserStatus,
  updateAgentStatus,
  createAdmin,
  fetchAgents,
  createAgent, // Import the createAgent thunk
  fetchAdmins,
  verifyAdmin,
  deleteAgent,
  fetchTeamDetails,
  fetchAgentTeam,
  updateAgentProfile, // Import the updateAgentProfile thunk
  setAgentStatus, // Import the setAgentStatus thunk
  updateLanguagePreference, // Import the updateLanguagePreference thunk
  updateAdminProfile, // Import the updateAdminProfile thunk
  updateSuperadminProfile, // Import the updateSuperadminProfile thunk
} from "./userThunks";

// Initialize state from cookies if available
const initialState = {
  user: JSON.parse(Cookies.get("user") || "null"),
  token: Cookies.get("token") || null,
  role: Cookies.get("role") || null,
  isLoading: false,
  error: null,
  successMessage: null,
  agents: [],
  admins: [],
  team: [],
  teamAdmin: null,
  totalAgents: 0,
  agent: null,
  admin: null,
  teammates: [],
  totalTeammates: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.error = null;
      state.token = null;
      state.role = null;

      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
        state.error = null;

        // Store in cookies
        Cookies.set("user", JSON.stringify(action.payload.user));
        Cookies.set("token", action.payload.token);
        Cookies.set("role", action.payload.user.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })

      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null;
        state.token = null;
        state.role = null;

        Cookies.remove("token");
        Cookies.remove("role");
        Cookies.remove("user");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        if (state.user) {
          state.user.status = action.payload.status;
          Cookies.set("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateAgentStatus.fulfilled, (state, action) => {
        if (state.user) {
          state.user.status = action.payload.status;
          Cookies.set("user", JSON.stringify(state.user));
        }
      })

      // ✅ Fetch Agents
      .addCase(fetchAgents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Create Agent
      .addCase(createAgent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Agent created successfully";
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to create agent";
      })

      .addCase(createAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Fetch Admins
      .addCase(fetchAdmins.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Verify Admin
      .addCase(verifyAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        state.admins = state.admins.map((admin) =>
          admin._id === action.payload.adminId
            ? { ...admin, verified: true }
            : admin
        );
      })
      .addCase(verifyAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteAgent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to delete agent";
      })

      // ✅ Fetch Team Details
      .addCase(fetchTeamDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeamDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.team = action.payload.team;
        state.teamAdmin = action.payload.admin;
        state.totalAgents = action.payload.totalAgents;
      })
      .addCase(fetchTeamDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Fetch Agent Team Details
      .addCase(fetchAgentTeam.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAgentTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agent = action.payload.agent;
        state.admin = action.payload.admin;
        state.teammates = action.payload.teammates;
        state.totalTeammates = action.payload.totalTeammates;
      })
      .addCase(fetchAgentTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Update Agent Profile
      .addCase(updateAgentProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAgentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Profile updated successfully";
        state.user = { ...state.user, ...action.payload.agent };

        // Update user in cookies
        Cookies.set("user", JSON.stringify(state.user));
      })
      .addCase(updateAgentProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Set Agent Status
      .addCase(setAgentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setAgentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload.message || "Status updated successfully";
        if (state.user && action.payload.user) {
          // Update the user with all returned properties from the API
          state.user = { ...state.user, ...action.payload.user };
          // Update user in cookies
          Cookies.set("user", JSON.stringify(state.user));
        }
      })
      .addCase(setAgentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Update Language Preference
      .addCase(updateLanguagePreference.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLanguagePreference.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload.message || "Language preference updated successfully";
        if (state.user && action.payload.user) {
          // Update the user with all returned properties from the API
          state.user = { ...state.user, ...action.payload.user };
          // Update user in cookies
          Cookies.set("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateLanguagePreference.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Update Admin Profile
      .addCase(updateAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload.message || "Profile updated successfully";
        if (state.user && action.payload.admin) {
          // Update the user with all returned properties from the API
          state.user = { ...state.user, ...action.payload.admin };
          // Update user in cookies
          Cookies.set("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ Update Superadmin Profile
      .addCase(updateSuperadminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSuperadminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload.message || "Profile updated successfully";
        if (state.user && action.payload.superadmin) {
          // Update the user with all returned properties from the API
          state.user = { ...state.user, ...action.payload.superadmin };
          // Update user in cookies
          Cookies.set("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateSuperadminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetSuccessMessage, resetAuthState } =
  userSlice.actions;
export default userSlice.reducer;
