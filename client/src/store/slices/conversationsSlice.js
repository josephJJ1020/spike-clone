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
      console.log(action.payload._id);
      if (
        !state.conversations.find((convo) => convo._id === action.payload._id)
      ) {
        console.log("can't find convo");
        state.conversations.push(action.payload);
      } else {
        console.log("updating convo");
        state.conversations = [
          ...state.conversations.map((convo) => {
            if (convo._id === action.payload._id) {
              console.log("returning updated convo");
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

export const { setConversations, replaceConvo } = conversationsSlice.actions;
export default conversationsSlice.reducer;
