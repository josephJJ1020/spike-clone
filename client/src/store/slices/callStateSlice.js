import { createSlice } from "@reduxjs/toolkit";

const callStateSlice = createSlice({
  name: "callState",
  initialState: {
    isAvailable: false,
    isCalling: false,
    receivingOffer: false,
    onCall: false,
    remoteCaller: null,
    callee: null,
    errMsg: null,
    offer: null,
    callType: null,
    accepted: false,
  },
  reducers: {
    setAvailable: (state, action) => {
      state.isAvailable = action.payload;
    },
    setOnCall: (state, action) => {
      state.onCall = action.payload;
    },
    setIsCalling: (state, action) => {
      state.isCalling = action.payload;
    },
    setReceivingOffer: (state, action) => {
      state.receivingOffer = action.payload;
    },
    setCallee: (state, action) => {
      state.callee = action.payload;
    },
    setErrMsg: (state, action) => {
      state.errMsg = action.payload;
    },
    setRemoteCaller: (state, action) => {
      state.remoteCaller = action.payload;
    },
    setOffer: (state, action) => {
      state.offer = action.payload;
    },
    setCallType: (state, action) => {
      state.callType = action.payload;
    },
    setAccepted: (state, action) => {
      state.accepted = action.payload;
    },
  },
});

export const {
  setAvailable,
  setOnCall,
  setIsCalling,
  setReceivingOffer,
  setCallee,
  setErrMsg,
  setRemoteCaller,
  setOffer,
  setCallType,
  setAccepted,
} = callStateSlice.actions;
export default callStateSlice.reducer;
