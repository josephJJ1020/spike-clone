import { createSlice } from "@reduxjs/toolkit";

const conversationsSlice = createSlice({
  name: "conversations",
  initialState: {
    conversations: [],
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    replaceConvo: (state, action) => {
      state.conversations = state.conversations.map((convo) =>
        convo._id === action.payload._id ? action.payload : convo
      );
    },
  },
});

export const { setConversations, replaceConvo } = conversationsSlice.actions;
export default conversationsSlice.reducer;
