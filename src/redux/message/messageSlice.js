import { createSlice } from "@reduxjs/toolkit";
import { fetchMessages, sendMessage } from "./messageThunks";

// Helper function to create a unique ID based on timestamp and random string
const createUniqueId = (prefix, timestamp) => {
  const time = timestamp ? new Date(timestamp).getTime() : Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${time}-${random}`;
};

// Helper function to check if a message is a duplicate - SIMPLIFIED
const isDuplicateMessage = (messages, newMessage) => {
  // Skip duplicate checking since we're getting incomplete message objects
  // This will allow all messages through
  return false;
};

// Create message slice
const messageSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const newMessage = action.payload;

      // Skip if the message is completely invalid
      if (!newMessage || !newMessage.text) {
        console.warn("Attempted to add invalid message:", newMessage);
        return;
      }

      // Ensure the message has a unique ID - use timestamp if available
      if (!newMessage._id) {
        newMessage._id = createUniqueId("temp", newMessage.timestamp);
      }

      // Add the timestamp if missing
      if (!newMessage.timestamp) {
        newMessage.timestamp = new Date().toISOString();
      }

      // Just add the message - no duplicate checking since our messages are incomplete
      state.messages.push(newMessage);

      // Sort messages by timestamp if possible
      if (state.messages.length > 1) {
        state.messages.sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeA - timeB;
        });
      }
    },

    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        // Check if this is a silent request by looking at the meta argument
        const isSilent = action.meta?.arg?.silent;
        if (!isSilent) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        // Don't affect loading state if the request was silent
        const isSilent = action.payload.silent;
        if (!isSilent) {
          state.loading = false;
        }

        // Make sure we're getting an array of messages
        const receivedMessages = Array.isArray(action.payload)
          ? action.payload
          : action.payload.messages || [];

        // Clear current messages and replace with fetched ones
        state.messages = receivedMessages;

        // Sort messages by timestamp if possible
        if (state.messages.length > 1) {
          state.messages.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeA - timeB;
          });
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        // Check if this was a silent request
        const isSilent = action.meta?.arg?.silent;
        if (!isSilent) {
          state.loading = false;
        }
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new message to the messages array
        const newMessage = action.payload.message || action.payload;

        if (newMessage && newMessage.text) {
          // Ensure the message has an ID - use timestamp if available
          if (!newMessage._id) {
            newMessage._id = createUniqueId("server", newMessage.timestamp);
          }

          // Add timestamp if missing
          if (!newMessage.timestamp) {
            newMessage.timestamp = new Date().toISOString();
          }

          // Add the message
          state.messages.push(newMessage);

          // Sort messages by timestamp if possible
          if (state.messages.length > 1) {
            state.messages.sort((a, b) => {
              const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
              const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
              return timeA - timeB;
            });
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
