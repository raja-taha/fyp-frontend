import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice"; // Example slice
import clientReducer from "./client/clientSlice"; // Example slice
import chatbotReducer from "./chatbot/chatbotSlice"; // Example slice
import messageReducer from "./message/messageSlice"; // Example slice
import dashboardReducer from "./dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    user: userReducer, // Add reducers here
    clients: clientReducer,
    chatbot: chatbotReducer,
    messages: messageReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
