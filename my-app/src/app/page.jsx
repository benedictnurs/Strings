'use client';

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setPosts,
  addPost,
  deletePost,
  editPost,
  toggleLike,
} from "../lib/features/posts/postsSlice";
import { setUsers } from "../lib/features/users/usersSlice"; // Import setUsers action
import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react"; // Import the useUser hook from Clerk

export default function HomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const posts = useSelector((state) => state.posts);
  const users = useSelector((state) => state.users);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const { user } = useUser(); // Get user data from Clerk

  useEffect(() => {
    const fetchPostsAndUsers = async () => {
      try {
        // 1. Fetch posts from the backend API
        const postsResponse = await fetch("/api/posts/fetch");
        if (!postsResponse.ok) {
          console.error("Failed to fetch posts:", postsResponse.statusText);
          return;
        }
        const postsData = await postsResponse.json();
        dispatch(setPosts(postsData));

        // 2. Extract unique authorIds from posts
        const uniqueAuthorIds = [...new Set(postsData.map(post => post.authorId))];
        if (uniqueAuthorIds.length === 0) {
          console.log("No authors found in posts.");
          return;
        }

        // 3. Fetch user data for these authorIds via the batch API
        const usersResponse = await fetch("/api/users/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorIds: uniqueAuthorIds })
        });
        if (!usersResponse.ok) {
          console.error("Failed to fetch users:", usersResponse.statusText);
          return;
        }
        const usersData = await usersResponse.json();

        // 4. Validate that usersData is an array
        if (!Array.isArray(usersData)) {
          console.error("Expected an array of users, received:", usersData);
          return;
        }

        // 5. Reduce the array to a map of users by authorId
        const usersByAuthorId = usersData.reduce((acc, user) => {
          acc[user.authorId] = user;
          return acc;
        }, {});

        // 6. Dispatch the users to the Redux store
        dispatch(setUsers(usersByAuthorId));
      } catch (error) {
        console.error("Error fetching posts and users:", error);
      }
    };

    fetchPostsAndUsers();
  }, [dispatch]);

  const handleSubmitNewPost = async (content) => {
    const userId = user?.id || "guest";
    if (userId === "guest") {
      const newPost = {
        _id: String(Date.now()),
        content,
        authorId: userId,
        parentId: null,
        threadId: String(Date.now()),
        createdAt: new Date().toISOString(),
        likes: []
      };
      dispatch(addPost(newPost));
      setNewPostDialogOpen(false);
      return;
    }

    try {
      const response = await fetch("/api/posts/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ content, userId })
      });
      if (!response.ok) {
        console.error("Failed to add post:", await response.text());
        return;
      }
      const newPost = await response.json();
      dispatch(addPost(newPost));
      setNewPostDialogOpen(false);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleEditPost = (postId, newContent) => {
    dispatch(editPost({ postId, newContent }));
  };

  const handleDeletePost = (postId) => {
    dispatch(deletePost(postId));
  };

  const handleToggleLike = (postId, userId) => {
    dispatch(toggleLike({ postId, userId }));
  };

  const handleViewReplies = (postId) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <>
      <Header
        open={newPostDialogOpen}
        onOpenChange={setNewPostDialogOpen}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        addNewPost={handleSubmitNewPost}
      />
      <main>
        <div className="container max-w-xl py-6">
          {posts.filter(post => !post.parentId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(post => (
            <PostItem
              key={post._id}
              post={post}
              posts={posts}
              comment={handleViewReplies}
              onViewReplies={handleViewReplies}
              users={users} // Pass the users object
              isReply={false}
              deletePost={handleDeletePost}
              editPost={handleEditPost}
              setEditingPost={setEditingPost}
              editingPost={editingPost}
              toggleLike={handleToggleLike}
              currentUserId={user?.id || "guest"}
              isMainPage={true}
            />
          ))}
        </div>
      </main>
    </>
  );
}
