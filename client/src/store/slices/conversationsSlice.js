import { createSlice } from "@reduxjs/toolkit";

const conversationsSlice = createSlice({
  name: "conversations",
  initialState: {
    conversations: [],
    gettingConversations: false,
  },
  reducers: {
    setGettingConversations: (state, action) => {
      state.gettingConversations = action.payload;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    replaceConvo: (state, action) => {
      if (
        !state.conversations.find((convo) => convo._id === action.payload._id)
      ) {
        state.conversations.push(action.payload);
      } else {
        state.conversations = [
          ...state.conversations.map((convo) => {
            if (convo._id === action.payload._id) {
              return action.payload;
            } else {
              return convo;
            }
          }),
        ];
      }
    },
  },
});

export const { setConversations, replaceConvo, setGettingConversations } =
  conversationsSlice.actions;
export default conversationsSlice.reducer;
