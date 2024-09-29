import { createSlice } from '@reduxjs/toolkit';

// Initial state for the posts
const initialState = [];

// Create the slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Set the list of posts
    setPosts(state, action) {
      return action.payload;
    },
    // Add a new post
    addPost(state, action) {
      state.push(action.payload);
    },
    // Add a reply to a post
    addReply(state, action) {
      state.push(action.payload); // Add the reply to the posts list
    },
    // Update the content of a post
    updatePost(state, action) {
      const { postId, newContent } = action.payload;
      const post = state.find(post => post._id === postId);
      if (post) {
        post.content = newContent;
      }
    },
    // Edit the content of a post
    editPost: (state, action) => {
      const { postId, newContent } = action.payload;
      const post = state.find((p) => p._id === postId);
      if (post) {
        post.content = newContent;
      }
    },
    deletePost: (state, action) => {
      const postId = action.payload;
      return state.filter((post) => post._id !== postId);
    },
    // Toggle the like status of a post
    toggleLike: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.find((p) => p._id === postId);
      if (post) {
        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex === -1) {
          // Add userId to likes
          post.likes.push(userId);
        } else {
          // Remove userId from likes
          post.likes.splice(likeIndex, 1);
        }

      }
    },
  },
});

// Export actions and reducer
export const { setPosts, addPost, addReply, updatePost, editPost, deletePost, toggleLike } = postsSlice.actions;
export default postsSlice.reducer;
