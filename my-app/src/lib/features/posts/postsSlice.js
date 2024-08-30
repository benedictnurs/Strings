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
      const { postId, newContent } = action.payload;
      const post = state.find(post => post._id === postId);
      if (post) {
        post.content = newContent;
      }
    },
    deletePost(state, action) {
      return state.filter(post => post._id !== action.payload);
    },
    addReply(state, action) {
      state.push(action.payload); // Add the reply to the posts list
    },
    editPost(state, action) {
      const { postId, newContent } = action.payload;
      const post = state.find(post => post._id === postId);
      if (post) {
        post.content = newContent;
      }
    }
  },
});

export const { setPosts, addPost, updatePost, deletePost, addReply, editPost } = postsSlice.actions;
export default postsSlice.reducer;
