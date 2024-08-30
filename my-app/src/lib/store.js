import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './features/posts/postsSlice';
import usersReducer from './features/users/usersSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      posts: postsReducer,
      users: usersReducer,
    },
  });
};

// Export typed hooks if needed
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
