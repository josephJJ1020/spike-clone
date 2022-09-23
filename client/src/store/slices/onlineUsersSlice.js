import { createSlice } from "@reduxjs/toolkit";

const onlineUsersSlice = createSlice({
  name: "onlineUsers",
  initialState: {
    onlineUsers: [],
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setOnlineUsers } = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;
