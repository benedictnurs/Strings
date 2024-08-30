import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: [],
  reducers: {
    setUsers(state, action) {
      return action.payload;
    },
    addUser(state, action) {
      state.push(action.payload);
    },
    updateUser(state, action) {
      const index = state.findIndex(user => user._id === action.payload._id);
      if (index >= 0) {
        state[index] = action.payload;
      }
    },
    deleteUser(state, action) {
      return state.filter(user => user._id !== action.payload);
    },
  },
});

export const { setUsers, addUser, updateUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
