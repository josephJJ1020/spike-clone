import { createSlice } from "@reduxjs/toolkit";

const peerConnectionSlice = createSlice({
  name: "peerConnection",
  initialState: {
    localStream: null,
    remoteStream: null,
  },
  reducers: {
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
  },
});

export const { setLocalStream, setRemoteStream } = peerConnectionSlice.actions;
export default peerConnectionSlice.reducer;
