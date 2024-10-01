"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addReply as addReplyAction,
  deletePost as deletePostAction,
  editPost as editPostAction,
  toggleLike,
  setPosts,
} from "@/lib/features/posts/postsSlice";
import { setUsers } from "@/lib/features/users/usersSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PostItem from "@/components/PostItem";
import Header from "@/components/Header";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading states

export default function ThreadPage({ params }) {
  const { postId } = params;
  const posts = useSelector((state) => state.posts);
  const users = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const router = useRouter();
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Get the current user using Clerk
  const { user } = useUser();
  const currentUserId = user?.id || "guest"; // Use 'guest' if not signed in
  const isGuest = !user; // Determine if the user is a guest

  // Include current user in users if not present
  useEffect(() => {
    if (currentUserId && !users[currentUserId]) {
      const updatedUsers = {
        ...users,
        [currentUserId]: {
          username: user?.username || "guest",
          fullName: user?.fullName || "Guest User",
          profilePicture: user?.profileImageUrl || "",
        },
      };
      dispatch(setUsers(updatedUsers));
    }
  }, [currentUserId, users, dispatch, user]);

  // Fetch all posts and set them in the Redux store (if not already fetched)
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
        const uniqueAuthorIds = [
          ...new Set(postsData.map((post) => post.authorId)),
        ];
        if (uniqueAuthorIds.length === 0) {
          console.log("No authors found in posts.");
          return;
        }

        // 3. Fetch user data for these authorIds via the batch API
        const usersResponse = await fetch("/api/users/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorIds: uniqueAuthorIds }),
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

    // Fetch posts and users if posts are not already loaded
    if (posts.length === 0) {
      fetchPostsAndUsers();
    }
  }, [dispatch, posts.length]);

  // Find the root post
  const rootPost = posts.find((post) => post._id === postId);

  // Handle Replies
  const handleViewReplies = (postId) => {
    router.push(`/posts/${postId}`);
  };

  if (!rootPost) {
    return (
      <div className="h-screen overflow-hidden">
        <Header />
        <div className="flex justify-center items-center h-screen">
          {/* Optionally, add a button to return to home */}
          {/* <Button
            onClick={() => router.push("/")}
            className="text-primary-foreground hover:bg-primary/90 bg-primary"
          >
            Return to Home
          </Button> */}
          <h1 className="text-6xl">Loading...</h1>
        </div>
      </div>
    );
  }

  // Handle editing a post
  const handleEditPost = async (postId, newContent) => {
    if (isGuest) {
      // Handle edit locally
      dispatch(editPostAction({ postId, newContent }));
      setEditingPost(null);
    } else {
      try {
        const response = await fetch("/api/posts/edit", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId, content: newContent }),
        });

        if (response.ok) {
          setEditingPost(null); // Close the editing UI
          // Update the Redux store with the updated post
          dispatch(editPostAction({ postId, newContent }));
        } else {
          console.error("Failed to update post:", await response.text());
        }
      } catch (error) {
        console.error("Error updating post:", error);
      }
    }
  };

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    if (isGuest) {
      // Handle delete locally
      dispatch(deletePostAction(postId));
    } else {
      try {
        const response = await fetch("/api/posts/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId }),
        });

        if (response.ok) {
          // Update the Redux store
          dispatch(deletePostAction(postId));
          // Optionally redirect to home if root post is deleted
          if (postId === rootPost._id) {
            router.push("/");
          }
        } else {
          console.error("Failed to delete post:", await response.text());
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  // Handle adding a reply
  const handleAddReply = async () => {
    if (replyContent.trim()) {
      // Use the original post's threadId for all replies
      const originalThreadId = rootPost.threadId || rootPost._id;

      if (isGuest) {
        // Handle reply locally
        const newReply = {
          _id: String(Date.now()), // Temporary unique ID for guests
          content: replyContent,
          authorId: "guest",
          parentId: replyingTo || rootPost._id,
          threadId: originalThreadId, // Use original post's threadId
          createdAt: new Date().toISOString(),
          likes: [],
        };
        dispatch(addReplyAction(newReply));
        setReplyContent("");
        setReplyingTo(null);
      } else {
        // Proceed with API call
        const replyData = {
          content: replyContent,
          userId: currentUserId,
          parentId: replyingTo || rootPost._id,
          threadId: originalThreadId, // Use original post's threadId
        };

        try {
          const response = await fetch("/api/posts/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(replyData),
          });

          if (response.ok) {
            const newReply = await response.json();
            dispatch(addReplyAction(newReply)); // Update the Redux store
            setReplyContent(""); // Clear the input
            setReplyingTo(null); // Reset replyingTo
          } else {
            const errorData = await response.json();
            alert(`Failed to add reply: ${errorData.error}`);
            console.error("Failed to add reply:", await response.text());
          }
        } catch (error) {
          alert("An unexpected error occurred while adding the reply.");
          console.error("Error adding reply:", error);
        }
      }
    }
  };

  // Handle Liking the Post
  const handleToggleLike = (postId, userId) => {
    dispatch(toggleLike({ postId, userId }));
  };

  // Handle Replying to a Specific Post
  const handleReplyClick = (postId) => {
    setReplyingTo(postId);
  };

  // Handle Replying the Post (for the root post)
  const handleRootPostClick = () => {
    setReplyingTo(null); // Set to null when replying to the root post
  };

  // Function to get username by authorId
  const getUsernameById = (authorId) => {
    if (users[authorId]) {
      return users[authorId].username;
    } else if (authorId === currentUserId) {
      return user?.username || "Guest";
    } else {
      return "Unknown User";
    }
  };

  // Render replies recursively
  const renderReplies = (parentId) => {
    const replies = posts.filter((post) => post.parentId === parentId);
    if (replies.length === 0) return null;

    return replies.map((reply) => (
      <div key={reply._id} className="relative mt-4">
        {/* Vertical line centered under the profile picture */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="flex-1">
          <PostItem
            post={reply}
            posts={posts}
            comment={() => handleReplyClick(reply._id)} // Set replyingTo to nested reply's ID
            onViewReplies={handleViewReplies}
            users={users}
            deletePost={handleDeletePost}
            editPost={handleEditPost}
            setEditingPost={setEditingPost}
            editingPost={editingPost}
            isReply
            toggleLike={handleToggleLike}
            currentUserId={currentUserId}
          />
          {/* Render nested replies */}
          {renderReplies(reply._id)}
        </div>
      </div>
    ));
  };

  const replyingToPost = posts.find((post) => post._id === replyingTo);
  const replyingToUsername = replyingToPost
    ? getUsernameById(replyingToPost.authorId)
    : "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        showBackButton={true}
        showComposeButton={false}
        open={newPostDialogOpen}
        onOpenChange={setNewPostDialogOpen}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        addNewPost={() => {}}
      />

      <main className="flex-1">
        <div className="container max-w-xl py-6">
          <PostItem
            post={rootPost}
            posts={posts}
            comment={handleRootPostClick} // Updated to handleRootPostClick (sets replyingTo to null)
            onViewReplies={handleRootPostClick}
            users={users}
            deletePost={handleDeletePost}
            editPost={handleEditPost}
            setEditingPost={setEditingPost}
            editingPost={editingPost}
            toggleLike={handleToggleLike}
            currentUserId={currentUserId}
          />

          {/* Render replies to the root post */}
          <div className="relative mt-4">{renderReplies(rootPost._id)}</div>
        </div>
      </main>

      {/* Reply Input Section */}
      <div className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center space-x-2 py-2">
          <Input
            className="flex-1"
            placeholder={
              replyingTo
                ? `Replying to @${replyingToUsername}`
                : "Add a reply..."
            }
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          {replyingTo && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleAddReply}
            className="text-primary-foreground hover:bg-primary/90 bg-primary"
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
