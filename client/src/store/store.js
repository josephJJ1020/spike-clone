import { configureStore } from "@reduxjs/toolkit";

import conversationsReducer from "./slices/conversationsSlice";
import globalReducer from "./slices/globalsSlice";
import onlineUsersReducer from "./slices/onlineUsersSlice";
import userDataReducer from "./slices/userDataSlice";
import peerConnectionReducer from "./slices/peerConnectionSlice";

export const store = configureStore({
  reducer: {
    conversations: conversationsReducer,
    global: globalReducer,
    onlineUsers: onlineUsersReducer,
    userData: userDataReducer,
    peerConnection: peerConnectionReducer,
  },
});
