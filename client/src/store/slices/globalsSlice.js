import { createSlice } from "@reduxjs/toolkit";

//
const globalSlice = createSlice({
  name: "global",
  initialState: {
    receiver: null,
    currentConvoId: null,
    currentConvo: null,
    flashMsg: null,
    creatingConversation: false,
    showSidebar: true,
  },
  reducers: {
    setReceiver: (state, action) => {
      state.receiver = action.payload;
    },

    setCurrentConvoId: (state, action) => {
      state.currentConvoId = action.payload;
    },
    setFlashMsg: (state, action) => {
      state.flashMsg = action.payload;
    },
    setCreatingConversation: (state, action) => {
      state.creatingConversation = action.payload;
    },
    setShowSidebar: (state, action) => {
      state.showSidebar = action.payload;
    },
  },
});

export const {
  setReceiver,
  setCurrentConvo,
  setFlashMsg,
  setCurrentConvoId,
  setCreatingConversation,
  setShowSidebar
} = globalSlice.actions;

export default globalSlice.reducer;
