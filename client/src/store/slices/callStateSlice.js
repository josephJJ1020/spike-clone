import { createSlice } from "@reduxjs/toolkit";

const callStateSlice = createSlice({
  name: "callState",
  initialState: {
    isAvailable: false,
    onCall: false,
  },
  reducers: {
    setAvailable: (state, action) => {
      state.isAvailable = action.payload;
    },
    setOnCall: (state, action) => {
      state.onCall = action.payload;
    },
  },
});

export const { setAvailable, setOnCall } = callStateSlice.actions;
export default callStateSlice.reducer;
