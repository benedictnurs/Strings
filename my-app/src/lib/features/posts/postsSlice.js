// src/lib/features/posts/postsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    setPosts(state, action) {
      return action.payload;
    },
    addPost(state, action) {
      state.push(action.payload);
    },
    updatePost(state, action) {
      const index = state.findIndex(post => post._id === action.payload._id);
      if (index >= 0) {
        state[index] = action.payload;
      }
    },
    deletePost(state, action) {
      return state.filter(post => post._id !== action.payload);
    },
    addReply(state, action) {
      state.push(action.payload); // Add the reply to the posts list
    },
  },
});

export const { setPosts, addPost, updatePost, deletePost, addReply } = postsSlice.actions;
export default postsSlice.reducer;
