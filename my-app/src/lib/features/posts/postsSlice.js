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
    editPost(state, action) {
      const { postId, newContent } = action.payload;
      const post = state.find(post => post._id === postId);
      if (post) {
        post.content = newContent;
      }
    },
    // Delete a post by its ID
    deletePost(state, action) {
      return state.filter(post => post._id !== action.payload);
    },
    // Toggle the like status of a post
    toggleLike(state, action) {
      const { postId, userId } = action.payload;
      const post = state.find(post => post._id === postId);
      if (post) {
        const userIndex = post.likes.indexOf(userId || "tester");
        if (userIndex >= 0) {
          // If the user has already liked the post, unlike it
          post.likes.splice(userIndex, 1);
        } else {
          // If the user has not liked the post, like it
          post.likes.push(userId || "tester");
        }
      }
    },
  },
});

// Export actions and reducer
export const { setPosts, addPost, addReply, updatePost, editPost, deletePost, toggleLike } = postsSlice.actions;
export default postsSlice.reducer;
