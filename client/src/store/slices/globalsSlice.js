import { createSlice } from "@reduxjs/toolkit";

//
const globalSlice = createSlice({
  name: "global",
  initialState: {
    receiver: null,
    currentConvo: null,
    flashMsg: null,
  },
  reducers: {
    setReceiver: (state, action) => {
      state.receiver = action.payload;
    },
    setCurrentConvo: (state, action) => {
      state.currentConvo = action.payload;
    },
    setFlashMsg: (state, action) => {
      state.flashMsg = action.payload;
    },
  },
});

export const { setReceiver, setCurrentConvo, setFlashMsg } =
  globalSlice.actions;
export default globalSlice.reducer;
