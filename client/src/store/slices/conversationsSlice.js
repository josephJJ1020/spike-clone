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
  },
});

export const { setConversations } = conversationsSlice.actions;
export default conversationsSlice.reducer;
