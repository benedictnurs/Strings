// src/lib/features/users/usersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {}, // Change initial state from array to object
  reducers: {
    setUsers(state, action) {
      // Assuming action.payload is an object keyed by authorId
      return { ...state, ...action.payload };
    },
    addUser(state, action) {
      const user = action.payload;
      state[user.authorId] = user;
    },
    updateUser(state, action) {
      const user = action.payload;
      if (state[user.authorId]) {
        state[user.authorId] = user;
      }
    },
    deleteUser(state, action) {
      const authorId = action.payload;
      if (state[authorId]) {
        delete state[authorId];
      }
    },
  },
});

export const { setUsers, addUser, updateUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
