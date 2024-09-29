"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setPosts,
  addPost,
  deletePost,
  editPost,
  toggleLike,
} from "../lib/features/posts/postsSlice";
import { setUsers } from "../lib/features/users/usersSlice";
import Header from "@/components/Header";
import PostItem from "@/components/PostItem";
import { ObjectId } from "@/utils/objectId";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react"; // Import the useUser hook from Clerk

const initialPosts = [
  {
    _id: ObjectId("1"),
    content: "Wowah this thing works!",
    authorId: ObjectId("user1"),
    parentId: null,
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:00:00Z",
    likes: [],
  },
  {
    _id: ObjectId("2"),
    content: "Wow amazing.",
    authorId: ObjectId("user2"),
    parentId: ObjectId("1"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:05:00Z",
    likes: [],
  },
  {
    _id: ObjectId("3"),
    content: "Shut up.",
    authorId: ObjectId("user3"),
    parentId: ObjectId("2"),
    threadId: ObjectId("1"),
    createdAt: "2024-08-28T00:10:00Z",
    likes: [],
  },
  {
    _id: ObjectId("4"),
    content: "Urmmmm hello.",
    authorId: ObjectId("user4"),
    parentId: null,
    threadId: ObjectId("4"),
    createdAt: "2024-08-28T01:00:00Z",
    likes: ["user1"],
  },
  {
    _id: ObjectId("5"),
    content: "TO-DO add Login, add Database and add USERS!!!.",
    authorId: ObjectId("user5"),
    parentId: null,
    threadId: ObjectId("5"),
    createdAt: "2024-08-29T01:00:00Z",
    likes: ["user1", "user2", "user3"],
  },
];

const initialUsers = {
  [ObjectId("user1")]: {
    username: "peterg",
    name: "Peter Griffin",
    profilePicture: "https://via.placeholder.com/150?text=PG",
  },
  [ObjectId("user2")]: {
    username: "stewie0921",
    name: "Stewie",
    profilePicture: "https://via.placeholder.com/150?text=S",
  },
  [ObjectId("user3")]: {
    username: "cbrown",
    name: "Cleveland Brown",
    profilePicture: "https://via.placeholder.com/150?text=CB",
  },
  [ObjectId("user4")]: {
    username: "BrianG",
    name: "Brian G.",
    profilePicture: "https://via.placeholder.com/150?text=BG",
  },
  [ObjectId("user5")]: {
    username: "bn",
    name: "Ben N",
    profilePicture: "https://via.placeholder.com/150?text=BN",
  },
};

export default function HomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const posts = useSelector((state) => state.posts);
  const users = useSelector((state) => state.users);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [editingPost, setEditingPost] = useState(null);

  const { user, isSignedIn } = useUser(); // Get user data from Clerk

  useEffect(() => {
    dispatch(setPosts(initialPosts));
    dispatch(setUsers(initialUsers));
  }, [dispatch]);

  const handleSubmitNewPost = async (content) => {
    try {
      const userId = user?.id || "guest"; // Use 'guest' if user is not signed in

      const response = await fetch("/api/posts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, userId }), // Include userId
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (response.ok) {
        const newPost = JSON.parse(responseText);
        dispatch(addPost(newPost)); // Update Redux store
        setNewPostDialogOpen(false);
      } else {
        console.error("Failed to add post:", responseText);
      }
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleEditPost = (postId, newContent) => {
    dispatch(editPost({ postId, newContent })); // Dispatch action to update the post
  };
  
  const handleDeletePost = (postId) => {
    dispatch(deletePost(postId)); // Dispatch action to remove the post
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
          {posts
            .filter((post) => !post.parentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((post) => (
              <PostItem
                key={post._id}
                post={post}
                posts={posts}
                onViewReplies={handleViewReplies}
                users={users}
                isReply={false}
                deletePost={handleDeletePost} // Pass the function that updates the store
                editPost={handleEditPost} // Pass the function that updates the store
                setEditingPost={setEditingPost}
                editingPost={editingPost}
                toggleLike={handleToggleLike}
                currentUserId={user?.id || "guest"}
              />
            ))}
        </div>
      </main>
    </>
  );
}
