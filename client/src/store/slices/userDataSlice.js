import { createSlice } from "@reduxjs/toolkit";

const userDataSlice = createSlice({
  name: "userData",
  initialState: {
    userData:
      sessionStorage.getItem("userDetails") === "null"
        ? null
        : JSON.parse(sessionStorage.getItem("userDetails")),
    userId:
      sessionStorage.getItem("userId") === "null" //
        ? null
        : sessionStorage.getItem("userId"),
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
  },
});

export const { setUserData, setUserId } = userDataSlice.actions;
export default userDataSlice.reducer;
