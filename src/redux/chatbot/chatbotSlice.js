import { createSlice } from "@reduxjs/toolkit";
import {
  createChatbot,
  fetchChatbotByAdmin,
  fetchChatbots,
  fetchChatbotScript,
} from "./chatbotThunks";

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState: {
    chatbots: [],
    chatbot: null,
    script: "",
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chatbots
      .addCase(fetchChatbots.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatbots.fulfilled, (state, action) => {
        state.loading = false;
        state.chatbots = action.payload;
      })
      .addCase(fetchChatbots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchChatbotByAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatbotByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.chatbot = action.payload;
      })
      .addCase(fetchChatbotByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.chatbot = null;
      })
      .addCase(createChatbot.pending, (state) => {
        state.loading = true;
      })
      .addCase(createChatbot.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Chatbot created successfully!";
        state.chatbot = action.payload;
      })
      .addCase(createChatbot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchChatbotScript.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatbotScript.fulfilled, (state, action) => {
        state.loading = false;
        state.script = action.payload;
      })
      .addCase(fetchChatbotScript.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = chatbotSlice.actions;
export default chatbotSlice.reducer;
