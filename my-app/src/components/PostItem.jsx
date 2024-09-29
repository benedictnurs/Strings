import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Trash,
  Edit,
} from "lucide-react";
import { getRelativeTime } from "@/utils/getRelativeTime";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/clerk-react";

export default function PostItem({
  post,
  posts,
  onViewReplies,
  users,
  isReply = false,
  deletePost,
  editPost,
  setEditingPost,
  editingPost,
  toggleLike,
}) {
  const replies = posts.filter((p) => p.parentId === post._id);
  const user = users[post.authorId];

  const { user, isSignedIn } = useUser(); // From Clerk
  const isGuest = !isSignedIn; // If not signed in, treat as a guest
  

  const getTotalReplies = (postId) => {
    const directReplies = posts.filter((p) => p.parentId === postId);
    return directReplies.reduce(
      (total, reply) => total + getTotalReplies(reply._id),
      directReplies.length
    );
  };

  const totalReplies = getTotalReplies(post._id);
  const currentUserId = currentUser?.id || "tester"; // Default to "tester" if no user ID found
  const isLikedByCurrentUser = post.likes.includes(currentUserId);
  const isAuthor = currentUserId === (post.authorId || "tester");

  const handleEditPost = async (postId, newContent) => {
    try {
      const response = await fetch("/api/posts/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, content: newContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setEditingPost(null);

        // Update the Redux store
        editPost(postId, newContent); // Call the prop function to update the post in the store
      } else {
        console.error("Failed to update post:", await response.text());
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (postId) => {
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
        deletePost(postId); // Call the prop function to remove the post from the store
      } else {
        console.error("Failed to delete post:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleToggleLike = async (postId) => {
    const userId = currentUserId; // Use the current user ID

    try {
      const response = await fetch("/api/posts/like", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, userId }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        // Update the Redux store
        toggleLike(postId, userId);
      } else {
        console.error("Failed to toggle like:", await response.text());
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className={`mb-8 ${!isReply && "border-b pb-8"}`}>
      <div className="flex items-start space-x-4">
        <Avatar>
          {(user && user.profilePicture) || currentUser?.profileImageUrl ? (
            <AvatarImage
              src={user?.profilePicture || currentUser?.profileImageUrl}
              alt={user?.name || currentUser?.fullName || "Guest"}
            />
          ) : (
            <AvatarFallback>
              {(user
                ? user.username.slice(0, 2).toUpperCase()
                : currentUser?.username?.slice(0, 2).toUpperCase()) || "NA"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium leading-none">
              {user?.name || currentUser?.fullName || "Guest"}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                {getRelativeTime(post.createdAt)}
              </p>
              <div className="flex items-center space-x-2">
                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingPost(post)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePost(post._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {user
              ? `@${user.username.toLowerCase()}`
              : `@${currentUser?.username || "Guest"}`}
          </p>
          {editingPost && editingPost._id === post._id ? (
            <div className="space-y-2">
              <textarea
                value={editingPost.content}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, content: e.target.value })
                }
                className="mt-2 min-h-[100px] w-full border p-2 bg-zinc-950"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEditPost(post._id, editingPost.content)}
                  className="text-primary-foreground hover:bg-primary/90 bg-primary"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{post.content}</p>
          )}
          <div className="flex items-center space-x-3 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleLike(post._id)}
              className={isLikedByCurrentUser ? "text-red-500" : ""}
            >
              <Heart
                className="h-4 w-4"
                fill={isLikedByCurrentUser ? "currentColor" : "none"}
              />
              <span className="sr-only">Like</span>
            </Button>

            {post.likes.length >= 0 && (
              <span className="text-sm text-muted-foreground">
                {post.likes.length}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewReplies(post._id)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="sr-only">Comment</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
          {totalReplies > 0 && (
            <Button
              variant="link"
              className="mt-2 p-0 h-auto text-sm text-muted-foreground"
              onClick={() => onViewReplies(post._id)}
            >
              {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
